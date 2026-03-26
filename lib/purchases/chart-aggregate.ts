import type { Purchase } from "@/lib/types/purchase";

export type ChartPeriod = "day" | "week" | "month" | "year";

export type ChartPoint = { label: string; total: number; key: string };

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Lunes 00:00 hora local. */
export function startOfWeekMonday(d: Date): Date {
  const c = new Date(d);
  const day = c.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  c.setDate(c.getDate() + diff);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function bucketKeyForPurchase(date: Date, period: ChartPeriod): string {
  const d = new Date(date);
  switch (period) {
    case "day":
      return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    case "week": {
      const s = startOfWeekMonday(d);
      return `${s.getFullYear()}-${pad2(s.getMonth() + 1)}-${pad2(s.getDate())}`;
    }
    case "month":
      return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
    case "year":
      return String(d.getFullYear());
    default:
      return "";
  }
}

export function formatBucketLabel(
  key: string,
  period: ChartPeriod,
  locale: "en" | "es"
): string {
  const loc = locale === "es" ? "es" : "en-US";
  if (period === "year") return key;
  if (period === "month") {
    const [y, m] = key.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString(loc, {
      month: "short",
      year: "numeric",
    });
  }
  if (period === "day") {
    const [y, mo, da] = key.split("-").map(Number);
    return new Date(y, mo - 1, da).toLocaleDateString(loc, {
      day: "numeric",
      month: "short",
    });
  }
  const [y, mo, da] = key.split("-").map(Number);
  const start = new Date(y, mo - 1, da);
  return start.toLocaleDateString(loc, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function aggregatePurchasesForChart(
  purchases: Pick<Purchase, "date" | "total">[],
  period: ChartPeriod,
  locale: "en" | "es"
): ChartPoint[] {
  const map = new Map<string, number>();
  for (const p of purchases) {
    const k = bucketKeyForPurchase(new Date(p.date), period);
    map.set(k, (map.get(k) ?? 0) + p.total);
  }
  const sorted = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  return sorted.map(([key, total]) => ({
    key,
    total,
    label: formatBucketLabel(key, period, locale),
  }));
}
