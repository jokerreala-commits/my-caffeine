import { OrderStatus } from "@/backend";

export interface StatusMeta {
  value: OrderStatus;
  label: string;
  /** Badge classes: soft tinted chip with a matching hairline. */
  badge: string;
  /** Solid rail colour used for the status dot. */
  dot: string;
}

/** Canonical pipeline order: 待采购 → 已采购 → 国际运输中 → 已签收 → 已结款. */
export const STATUS_FLOW: OrderStatus[] = [
  OrderStatus.pendingPurchase,
  OrderStatus.purchased,
  OrderStatus.inTransit,
  OrderStatus.delivered,
  OrderStatus.settled,
];

export const STATUS_META: Record<OrderStatus, StatusMeta> = {
  [OrderStatus.pendingPurchase]: {
    value: OrderStatus.pendingPurchase,
    label: "待采购",
    badge: "border-border bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  [OrderStatus.purchased]: {
    value: OrderStatus.purchased,
    label: "已采购",
    badge: "border-info/25 bg-info/10 text-info",
    dot: "bg-info",
  },
  [OrderStatus.inTransit]: {
    value: OrderStatus.inTransit,
    label: "国际运输中",
    badge: "border-warning/30 bg-warning/15 text-warning-foreground",
    dot: "bg-warning",
  },
  [OrderStatus.delivered]: {
    value: OrderStatus.delivered,
    label: "已签收",
    badge: "border-success/25 bg-success/10 text-success",
    dot: "bg-success",
  },
  [OrderStatus.settled]: {
    value: OrderStatus.settled,
    label: "已结款",
    badge: "border-primary/20 bg-primary/10 text-primary",
    dot: "bg-primary",
  },
};

export function statusLabel(status: OrderStatus): string {
  return STATUS_META[status]?.label ?? "未知状态";
}

/** Next status in the pipeline, or null when the order is already settled. */
export function nextStatus(status: OrderStatus): OrderStatus | null {
  const index = STATUS_FLOW.indexOf(status);
  if (index < 0 || index >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[index + 1];
}

/** Cost basis for an order: settled orders lock the rate captured at settlement. */
export function effectiveRate(
  order: { settledRate?: number },
  currentRate: number,
): number {
  return order.settledRate ?? currentRate;
}
