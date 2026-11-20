/** Format a CNY amount: ¥ prefix, two decimals, thousands separators. */
export function formatCny(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `¥${safe.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Format a signed CNY delta, e.g. +¥285.00 / -¥120.00. */
export function formatCnySigned(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  const sign = safe > 0 ? "+" : safe < 0 ? "-" : "";
  return `${sign}${formatCny(Math.abs(safe))}`;
}

/** Format a plain number with thousands separators and two decimals (no currency symbol). */
export function formatNumber(value: number, fractionDigits = 2): string {
  const safe = Number.isFinite(value) ? value : 0;
  return safe.toLocaleString("zh-CN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

/** Format a percentage value already expressed in percent units, e.g. 24.1 -> "24.1%". */
export function formatPercent(value: number, fractionDigits = 1): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `${safe.toFixed(fractionDigits)}%`;
}

/** Convert a Motoko nanosecond timestamp into a Date, or null when invalid. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a backend timestamp as YYYY-MM-DD, falling back to a dash. */
export function formatDate(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}
