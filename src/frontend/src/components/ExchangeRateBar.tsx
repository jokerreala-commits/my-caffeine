import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useExchangeRate, useSetExchangeRate } from "@/hooks/use-orders";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

const DEFAULT_RATE = 0.048;

function parseRate(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

export function ExchangeRateBar() {
  const { data: rate, isLoading } = useExchangeRate();
  const setRate = useSetExchangeRate();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const currentRate = rate ?? DEFAULT_RATE;
  const draftValue = draft === "" ? null : parseRate(draft);
  const previewRate = draftValue ?? currentRate;
  const dirty =
    draftValue !== null && Math.abs(draftValue - currentRate) > 1e-9;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseRate(draft);
    if (parsed === null) {
      setError("请输入大于 0 的有效汇率数字，例如 0.048");
      setSaved(false);
      return;
    }
    setError(null);
    setSaved(false);
    setRate.mutate(parsed, {
      onSuccess: () => {
        setDraft("");
        setSaved(true);
      },
      onError: () => {
        setError("汇率保存失败，请稍后重试");
      },
    });
  }

  return (
    <section
      data-ocid="exchange.panel"
      aria-labelledby="exchange-rate-heading"
      className="rounded-lg border border-border bg-card p-4 shadow-subtle sm:p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-1">
          <h2
            id="exchange-rate-heading"
            className="flex items-center gap-2 font-display text-sm font-semibold text-foreground"
          >
            <RefreshCw
              aria-hidden="true"
              className="size-4 text-muted-foreground"
              strokeWidth={1.75}
            />
            汇率设置
          </h2>
          <p className="text-xs leading-relaxed text-muted-foreground">
            当前外币对人民币汇率{" "}
            <span
              data-ocid="exchange.current_rate"
              className="text-numeric font-mono font-semibold text-foreground"
            >
              1 USD = {currentRate.toFixed(4)} CNY
            </span>
            。保存后所有未结清订单按新汇率重算成本，已结款订单沿用结款时汇率。
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="exchange-rate-input" className="text-xs">
              新汇率（1 USD 兑 CNY）
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="exchange-rate-input"
                data-ocid="exchange.rate_input"
                inputMode="decimal"
                autoComplete="off"
                placeholder={currentRate.toFixed(4)}
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setError(null);
                  setSaved(false);
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "exchange-rate-error" : undefined}
                className={cn(
                  "text-numeric h-9 w-full font-mono sm:w-32",
                  error && "border-destructive",
                )}
              />
              <Button
                type="submit"
                data-ocid="exchange.save_button"
                disabled={setRate.isPending}
                className="h-9 rounded-lg bg-primary px-4 text-primary-foreground transition-smooth hover:bg-primary/90"
              >
                {setRate.isPending ? (
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <Check aria-hidden="true" className="size-4" />
                )}
                保存
              </Button>
            </div>
          </div>

          <div
            aria-live="polite"
            className="flex min-h-5 items-center gap-1.5 text-xs sm:pb-2"
          >
            {error ? (
              <span
                id="exchange-rate-error"
                data-ocid="exchange.error_state"
                className="font-medium text-destructive"
              >
                {error}
              </span>
            ) : saved ? (
              <span
                data-ocid="exchange.success_state"
                className="font-medium text-success"
              >
                汇率已更新，订单成本已重算
              </span>
            ) : dirty ? (
              <span className="flex items-center gap-1 text-muted-foreground">
                <span className="text-numeric font-mono">
                  {currentRate.toFixed(4)}
                </span>
                <ArrowRight aria-hidden="true" className="size-3" />
                <span className="text-numeric font-mono font-semibold text-foreground">
                  {previewRate.toFixed(4)}
                </span>
              </span>
            ) : isLoading ? (
              <span className="text-muted-foreground">汇率加载中…</span>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}
