import { OrderStatus } from "@/backend";
import type { Order, OrderInput } from "@/backend";
import { STATUS_FLOW, STATUS_META } from "@/components/order-status";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateOrder, useUpdateOrder } from "@/hooks/use-orders";
import { formatCny, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface OrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Order being edited; omit for a new order. */
  order?: Order | null;
  /** Current USD → CNY rate used for the live cost preview. */
  rate: number;
}

interface FormState {
  productName: string;
  customerNickname: string;
  foreignPrice: string;
  shippingFeeCny: string;
  quoteCny: string;
  status: OrderStatus;
}

type FieldKey = keyof FormState;
type Errors = Partial<Record<FieldKey, string>>;

function initialState(order?: Order | null): FormState {
  if (!order) {
    return {
      productName: "",
      customerNickname: "",
      foreignPrice: "",
      shippingFeeCny: "",
      quoteCny: "",
      status: OrderStatus.pendingPurchase,
    };
  }
  return {
    productName: order.productName,
    customerNickname: order.customerNickname,
    foreignPrice: String(order.foreignPrice),
    shippingFeeCny: String(order.shippingFeeCny),
    quoteCny: String(order.quoteCny),
    status: order.status,
  };
}

function parseAmount(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return null;
  return value;
}

function validate(state: FormState): Errors {
  const errors: Errors = {};
  if (state.productName.trim() === "") errors.productName = "请填写商品名称";
  if (state.customerNickname.trim() === "")
    errors.customerNickname = "请填写客户昵称";

  const numericFields: Array<[FieldKey, string]> = [
    ["foreignPrice", "外币采购原价"],
    ["shippingFeeCny", "国际运费"],
    ["quoteCny", "国内报价"],
  ];
  for (const [key, label] of numericFields) {
    const raw = state[key] as string;
    if (raw.trim() === "") {
      errors[key] = `请填写${label}`;
      continue;
    }
    const value = parseAmount(raw);
    if (value === null) errors[key] = `${label}必须是数字`;
    else if (value < 0) errors[key] = `${label}不能为负数`;
  }
  return errors;
}

const fieldIds: Record<FieldKey, string> = {
  productName: "order-product-name",
  customerNickname: "order-customer-nickname",
  foreignPrice: "order-foreign-price",
  shippingFeeCny: "order-shipping-fee",
  quoteCny: "order-quote",
  status: "order-status",
};

const textFields: Array<{
  key: "productName" | "customerNickname";
  label: string;
  placeholder: string;
}> = [
  {
    key: "productName",
    label: "商品名称",
    placeholder: "例如：日本限定护肤套装",
  },
  {
    key: "customerNickname",
    label: "客户昵称",
    placeholder: "例如：阿狸123",
  },
];

const amountFields: Array<{
  key: "foreignPrice" | "shippingFeeCny" | "quoteCny";
  label: string;
  placeholder: string;
  suffix: string;
}> = [
  {
    key: "foreignPrice",
    label: "外币采购原价",
    placeholder: "0.00",
    suffix: "外币",
  },
  {
    key: "shippingFeeCny",
    label: "国际运费",
    placeholder: "0.00",
    suffix: "CNY",
  },
  {
    key: "quoteCny",
    label: "国内报价",
    placeholder: "0.00",
    suffix: "CNY",
  },
];

export function OrderForm({ open, onOpenChange, order, rate }: OrderFormProps) {
  const isEdit = Boolean(order);
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const pending = createOrder.isPending || updateOrder.isPending;

  const [state, setState] = useState<FormState>(() => initialState(order));
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Re-seed the draft whenever the dialog opens for a different record.
  const currentKey = open ? (order ? `edit-${order.id}` : "create") : null;
  const [seedKey, setSeedKey] = useState<string | null>(currentKey);
  if (currentKey !== seedKey) {
    setSeedKey(currentKey);
    if (currentKey !== null) {
      setState(initialState(order));
      setErrors({});
      setSubmitError(null);
    }
  }

  function update<K extends FieldKey>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  const foreignPrice = parseAmount(state.foreignPrice) ?? 0;
  const shippingFee = parseAmount(state.shippingFeeCny) ?? 0;
  const quote = parseAmount(state.quoteCny) ?? 0;
  const costCny = foreignPrice * rate + shippingFee;
  const profit = quote - costCny;
  const margin = quote > 0 ? (profit / quote) * 100 : 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(state);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSubmitError("请先修正表单中的错误项");
      return;
    }
    setSubmitError(null);

    const input: OrderInput = {
      productName: state.productName.trim(),
      customerNickname: state.customerNickname.trim(),
      foreignPrice: parseAmount(state.foreignPrice) ?? 0,
      shippingFeeCny: parseAmount(state.shippingFeeCny) ?? 0,
      quoteCny: parseAmount(state.quoteCny) ?? 0,
      status: state.status,
    };

    const onError = () => setSubmitError("保存失败，请稍后重试");

    if (order) {
      updateOrder.mutate(
        { id: order.id, input },
        { onSuccess: () => onOpenChange(false), onError },
      );
    } else {
      createOrder.mutate(input, {
        onSuccess: () => onOpenChange(false),
        onError,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="order.form.dialog"
        className="max-h-[90dvh] overflow-y-auto rounded-lg border-border bg-card sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-semibold">
            {isEdit ? "编辑订单" : "新增订单"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "修改订单信息，保存后列表与概览将同步更新。"
              : "填写代购订单信息，成本与利润会按当前汇率实时计算。"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {textFields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <Label htmlFor={fieldIds[field.key]}>
                  {field.label}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={fieldIds[field.key]}
                  data-ocid={`order.form.${field.key}_input`}
                  value={state[field.key]}
                  placeholder={field.placeholder}
                  autoComplete="off"
                  aria-invalid={errors[field.key] ? true : undefined}
                  aria-describedby={
                    errors[field.key]
                      ? `${fieldIds[field.key]}-error`
                      : undefined
                  }
                  onChange={(event) => update(field.key, event.target.value)}
                  className={cn(errors[field.key] && "border-destructive")}
                />
                {errors[field.key] ? (
                  <p
                    id={`${fieldIds[field.key]}-error`}
                    data-ocid={`order.form.${field.key}_error`}
                    className="text-xs font-medium text-destructive"
                  >
                    {errors[field.key]}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {amountFields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <Label htmlFor={fieldIds[field.key]}>
                  {field.label}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id={fieldIds[field.key]}
                    data-ocid={`order.form.${field.key}_input`}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder={field.placeholder}
                    value={state[field.key]}
                    aria-invalid={errors[field.key] ? true : undefined}
                    aria-describedby={
                      errors[field.key]
                        ? `${fieldIds[field.key]}-error`
                        : undefined
                    }
                    onChange={(event) => update(field.key, event.target.value)}
                    className={cn(
                      "text-numeric pr-12 font-mono",
                      errors[field.key] && "border-destructive",
                    )}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[11px] font-medium text-muted-foreground">
                    {field.suffix}
                  </span>
                </div>
                {errors[field.key] ? (
                  <p
                    id={`${fieldIds[field.key]}-error`}
                    data-ocid={`order.form.${field.key}_error`}
                    className="text-xs font-medium text-destructive"
                  >
                    {errors[field.key]}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 sm:max-w-xs">
            <Label htmlFor={fieldIds.status}>订单状态</Label>
            <Select
              value={state.status}
              onValueChange={(value) => update("status", value as OrderStatus)}
            >
              <SelectTrigger
                id={fieldIds.status}
                data-ocid="order.form.status_select"
                className="w-full"
              >
                <SelectValue placeholder="选择订单状态" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FLOW.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_META[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div
            data-ocid="order.form.preview"
            className="rounded-lg border border-border bg-muted/50 p-4"
          >
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              实时测算 · 汇率 1 USD = {rate.toFixed(4)} CNY
            </p>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <dt className="text-xs text-muted-foreground">
                  人民币采购成本
                </dt>
                <dd className="text-numeric font-display text-base font-semibold text-foreground">
                  {formatCny(costCny)}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs text-muted-foreground">单笔净利润</dt>
                <dd
                  className={cn(
                    "text-numeric font-display text-base font-semibold",
                    profit >= 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {formatCny(profit)}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs text-muted-foreground">利润率</dt>
                <dd
                  className={cn(
                    "text-numeric font-display text-base font-semibold",
                    profit >= 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {formatPercent(margin)}
                </dd>
              </div>
            </dl>
          </div>

          {submitError ? (
            <p
              data-ocid="order.form.error_state"
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive"
            >
              {submitError}
            </p>
          ) : null}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="order.form.cancel_button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg"
            >
              取消
            </Button>
            <Button
              type="submit"
              data-ocid="order.form.submit_button"
              disabled={pending}
              className="rounded-lg bg-primary text-primary-foreground transition-smooth hover:bg-primary/90"
            >
              {pending ? (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              ) : null}
              {isEdit ? "保存修改" : "创建订单"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
