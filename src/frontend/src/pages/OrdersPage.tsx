import type { Order, OrderStatus } from "@/backend";
import { ExchangeRateBar } from "@/components/ExchangeRateBar";
import { OrderForm } from "@/components/OrderForm";
import { OrderTable } from "@/components/OrderTable";
import { StatsCards } from "@/components/StatsCards";
import { STATUS_FLOW, STATUS_META } from "@/components/order-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExchangeRate, useOrders } from "@/hooks/use-orders";
import { cn } from "@/lib/utils";
import { Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_RATE = 0.048;

type StatusFilter = OrderStatus | "all";

const statusFilters: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "全部" },
  ...STATUS_FLOW.map((status) => ({
    value: status as StatusFilter,
    label: STATUS_META[status].label,
  })),
];

export default function OrdersPage() {
  const { data: orders, isLoading, isError } = useOrders();
  const { data: rate } = useExchangeRate();
  const currentRate = rate ?? DEFAULT_RATE;

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);

  const allOrders = orders ?? [];
  const keyword = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    return allOrders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      const matchesKeyword =
        keyword === "" ||
        order.customerNickname.toLowerCase().includes(keyword);
      return matchesStatus && matchesKeyword;
    });
  }, [allOrders, statusFilter, keyword]);

  const hasFilters = statusFilter !== "all" || keyword !== "";

  function clearFilters() {
    setStatusFilter("all");
    setSearch("");
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(order: Order) {
    setEditing(order);
    setFormOpen(true);
  }

  return (
    <div data-ocid="orders.page" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            跨境代购订单管理
          </h1>
          <p className="text-sm text-muted-foreground">
            追踪采购、运输与结算全流程，实时掌握垫付成本与利润。
          </p>
        </div>
        <Button
          type="button"
          data-ocid="orders.add_button"
          onClick={openCreate}
          className="h-10 shrink-0 rounded-lg bg-primary px-4 text-primary-foreground shadow-subtle transition-smooth hover:bg-primary/90"
        >
          <Plus aria-hidden="true" className="size-4" />
          新增订单
        </Button>
      </div>

      <StatsCards />

      <ExchangeRateBar />

      <section
        aria-labelledby="orders-list-heading"
        className="overflow-hidden rounded-lg border border-border bg-card shadow-subtle"
      >
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 id="orders-list-heading" className="sr-only">
            订单列表
          </h2>
          <fieldset className="flex flex-wrap items-center gap-1">
            <legend className="sr-only">按订单状态筛选</legend>
            {statusFilters.map((filter) => {
              const active = statusFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  data-ocid={`orders.filter.${filter.value}`}
                  aria-pressed={active}
                  onClick={() => setStatusFilter(filter.value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    active
                      ? "bg-primary text-primary-foreground shadow-subtle"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {filter.label}
                </button>
              );
            })}
          </fieldset>

          <div className="relative w-full lg:w-64">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              data-ocid="orders.search_input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索客户昵称"
              aria-label="搜索客户昵称"
              className="h-9 rounded-lg pl-9 pr-9"
            />
            {search !== "" ? (
              <button
                type="button"
                data-ocid="orders.search_clear_button"
                onClick={() => setSearch("")}
                aria-label="清除搜索"
                className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        <OrderTable
          orders={filtered}
          rate={currentRate}
          isLoading={isLoading}
          isError={isError}
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          onEdit={openEdit}
        />

        {!isLoading && !isError && filtered.length > 0 ? (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
            <span data-ocid="orders.result_count">
              共 {filtered.length} 笔订单
              {hasFilters ? `（已筛选，全部 ${allOrders.length} 笔）` : ""}
            </span>
            {hasFilters ? (
              <button
                type="button"
                data-ocid="orders.clear_filters_link"
                onClick={clearFilters}
                className="font-medium text-primary underline-offset-4 transition-smooth hover:underline"
              >
                清除筛选
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      <OrderForm
        open={formOpen}
        onOpenChange={setFormOpen}
        order={editing}
        rate={currentRate}
      />
    </div>
  );
}
