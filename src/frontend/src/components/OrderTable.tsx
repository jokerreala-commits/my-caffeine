import type { Order } from "@/backend";
import {
  STATUS_META,
  effectiveRate,
  nextStatus,
} from "@/components/order-status";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdvanceOrderStatus, useDeleteOrder } from "@/hooks/use-orders";
import {
  formatCny,
  formatCnySigned,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader2, Pencil, SearchX, Trash2 } from "lucide-react";
import { useState } from "react";

interface OrderTableProps {
  orders: Order[];
  rate: number;
  isLoading: boolean;
  isError: boolean;
  hasFilters: boolean;
  onClearFilters: () => void;
  onEdit: (order: Order) => void;
}

const skeletonRows = Array.from({ length: 5 }, (_, i) => `order-skeleton-${i}`);

const columns: Array<{ key: string; label: string; numeric?: boolean }> = [
  { key: "product", label: "商品名称" },
  { key: "customer", label: "客户昵称" },
  { key: "foreign", label: "外币原价", numeric: true },
  { key: "cost", label: "人民币成本", numeric: true },
  { key: "shipping", label: "国际运费", numeric: true },
  { key: "quote", label: "国内报价", numeric: true },
  { key: "profit", label: "净利润", numeric: true },
  { key: "margin", label: "利润率", numeric: true },
  { key: "status", label: "状态" },
  { key: "actions", label: "操作", numeric: true },
];

function StatusBadge({ order }: { order: Order }) {
  const meta = STATUS_META[order.status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        meta.badge,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", meta.dot)}
      />
      {meta.label}
    </span>
  );
}

function EmptyState({
  hasFilters,
  onClearFilters,
}: {
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div
      data-ocid="orders.empty_state"
      className="flex flex-col items-center gap-3 px-6 py-16 text-center"
    >
      <span
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground"
      >
        <SearchX className="size-6" strokeWidth={1.5} />
      </span>
      <div className="space-y-1">
        <p className="font-display text-base font-semibold text-foreground">
          {hasFilters ? "没有匹配的订单" : "还没有订单"}
        </p>
        <p className="text-sm text-muted-foreground">
          {hasFilters
            ? "尝试调整状态或客户昵称筛选条件。"
            : "点击右上角「新增订单」开始记录第一笔代购。"}
        </p>
      </div>
      {hasFilters ? (
        <Button
          type="button"
          variant="outline"
          data-ocid="orders.clear_filters_button"
          onClick={onClearFilters}
          className="rounded-lg"
        >
          清除筛选
        </Button>
      ) : null}
    </div>
  );
}

export function OrderTable({
  orders,
  rate,
  isLoading,
  isError,
  hasFilters,
  onClearFilters,
  onEdit,
}: OrderTableProps) {
  const advance = useAdvanceOrderStatus();
  const remove = useDeleteOrder();
  const [pendingDelete, setPendingDelete] = useState<Order | null>(null);

  if (isLoading) {
    return (
      <div data-ocid="orders.loading_state" className="space-y-3 p-4">
        {skeletonRows.map((id) => (
          <Skeleton key={id} className="h-11 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        data-ocid="orders.error_state"
        className="flex flex-col items-center gap-2 px-6 py-16 text-center"
      >
        <p className="font-display text-base font-semibold text-foreground">
          订单加载失败
        </p>
        <p className="text-sm text-muted-foreground">
          请检查网络连接后刷新页面重试。
        </p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table data-ocid="orders.table" className="min-w-[1040px]">
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    "text-xs font-medium text-muted-foreground",
                    column.numeric && "text-right",
                    column.key === "product" && "pl-4",
                    column.key === "actions" && "pr-4",
                  )}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, index) => {
              const rowRate = effectiveRate(order, rate);
              const costCny =
                order.foreignPrice * rowRate + order.shippingFeeCny;
              const profit = order.quoteCny - costCny;
              const margin =
                order.quoteCny > 0 ? (profit / order.quoteCny) * 100 : 0;
              const next = nextStatus(order.status);
              const advancing =
                advance.isPending && advance.variables === order.id;
              const profitTone =
                profit >= 0 ? "text-success" : "text-destructive";

              return (
                <TableRow
                  key={order.id.toString()}
                  data-ocid={`orders.row.${index + 1}`}
                  className="border-border transition-colors hover:bg-muted/50"
                >
                  <TableCell className="max-w-[220px] pl-4">
                    <span className="block truncate font-medium text-foreground">
                      {order.productName}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[140px]">
                    <span className="block truncate text-muted-foreground">
                      {order.customerNickname}
                    </span>
                  </TableCell>
                  <TableCell className="text-numeric text-right font-mono text-sm text-foreground">
                    {formatNumber(order.foreignPrice)}
                  </TableCell>
                  <TableCell className="text-numeric text-right font-mono text-sm text-foreground">
                    {formatCny(costCny)}
                  </TableCell>
                  <TableCell className="text-numeric text-right font-mono text-sm text-muted-foreground">
                    {formatCny(order.shippingFeeCny)}
                  </TableCell>
                  <TableCell className="text-numeric text-right font-mono text-sm text-foreground">
                    {formatCny(order.quoteCny)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-numeric text-right font-mono text-sm font-semibold",
                      profitTone,
                    )}
                  >
                    {formatCnySigned(profit)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-numeric text-right font-mono text-sm",
                      profitTone,
                    )}
                  >
                    {formatPercent(margin)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge order={order} />
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        data-ocid={`orders.advance_button.${index + 1}`}
                        disabled={!next || advancing}
                        onClick={() => advance.mutate(order.id)}
                        title={
                          next
                            ? `推进到「${STATUS_META[next].label}」`
                            : "订单已结款，无法继续推进"
                        }
                        className="h-8 gap-1 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {advancing ? (
                          <Loader2
                            aria-hidden="true"
                            className="size-3.5 animate-spin"
                          />
                        ) : (
                          <ArrowRight aria-hidden="true" className="size-3.5" />
                        )}
                        <span className="hidden xl:inline">
                          {next ? STATUS_META[next].label : "已结款"}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        data-ocid={`orders.edit_button.${index + 1}`}
                        onClick={() => onEdit(order)}
                        aria-label={`编辑订单 ${order.productName}`}
                        className="size-8 rounded-md text-muted-foreground hover:text-foreground"
                      >
                        <Pencil aria-hidden="true" className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        data-ocid={`orders.delete_button.${index + 1}`}
                        onClick={() => setPendingDelete(order)}
                        aria-label={`删除订单 ${order.productName}`}
                        className="size-8 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent
          data-ocid="orders.delete.dialog"
          className="rounded-lg border-border bg-card"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              确认删除该订单？
            </AlertDialogTitle>
            <AlertDialogDescription>
              「{pendingDelete?.productName}」将被永久删除，此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="orders.delete.cancel_button"
              className="rounded-lg"
            >
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="orders.delete.confirm_button"
              disabled={remove.isPending}
              onClick={() => {
                if (!pendingDelete) return;
                const target = pendingDelete;
                setPendingDelete(null);
                remove.mutate(target.id);
              }}
              className="rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
