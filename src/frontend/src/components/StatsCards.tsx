import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOverviewStats } from "@/hooks/use-orders";
import { formatCny, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CircleDollarSign, Package, TrendingUp, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  ocid: string;
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  emphasis?: boolean;
}

function KpiCard({
  ocid,
  label,
  value,
  hint,
  icon: Icon,
  emphasis = false,
}: KpiCardProps) {
  return (
    <Card
      data-ocid={ocid}
      className={cn(
        "relative overflow-hidden rounded-lg border-border py-0 shadow-subtle transition-smooth hover:shadow-elevated",
        emphasis && "border-primary/25",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          emphasis ? "bg-primary" : "bg-border",
        )}
      />
      <CardContent className="flex flex-col gap-3 p-5 pl-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium tracking-wide text-muted-foreground">
            {label}
          </span>
          <span
            aria-hidden="true"
            className={cn(
              "flex size-8 items-center justify-center rounded-md",
              emphasis
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Icon className="size-4" strokeWidth={1.75} />
          </span>
        </div>
        <p className="text-numeric font-display text-2xl font-bold tracking-tight text-foreground tabular-nums">
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

const skeletonIds = Array.from({ length: 4 }, (_, i) => `kpi-skeleton-${i}`);

export function StatsCards() {
  const { data, isLoading, isError } = useOverviewStats();

  if (isLoading) {
    return (
      <div
        data-ocid="stats.loading_state"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {skeletonIds.map((id) => (
          <Card
            key={id}
            className="rounded-lg border-border py-0 shadow-subtle"
          >
            <CardContent className="space-y-3 p-5 pl-6">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card
        data-ocid="stats.error_state"
        className="rounded-lg border-destructive/30 bg-destructive/5 py-0 shadow-subtle"
      >
        <CardContent className="p-5 text-sm text-destructive">
          概览数据加载失败，请稍后刷新页面重试。
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        ocid="stats.card.total_orders"
        label="总订单数"
        value={formatNumber(Number(data.totalOrders), 0)}
        hint="全部代购订单"
        icon={Package}
      />
      <KpiCard
        ocid="stats.card.total_cost"
        label="总垫付成本"
        value={formatCny(data.totalCostCny)}
        hint="含采购成本与国际运费"
        icon={Wallet}
      />
      <KpiCard
        ocid="stats.card.total_profit"
        label="预计总利润"
        value={formatCny(data.totalProfitCny)}
        hint="国内报价减去总成本"
        icon={TrendingUp}
        emphasis
      />
      <KpiCard
        ocid="stats.card.unsettled"
        label="未结清订单金额"
        value={formatCny(data.unsettledAmountCny)}
        hint="尚未结款的订单报价合计"
        icon={CircleDollarSign}
      />
    </div>
  );
}
