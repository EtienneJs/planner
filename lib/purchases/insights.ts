import type { Purchase } from "@/lib/types/purchase";

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function filterPurchasesByDateRange(
  purchases: Purchase[],
  from: Date | null,
  to: Date | null
): Purchase[] {
  return purchases.filter((p) => {
    const d = new Date(p.date);
    if (from && d < startOfDay(from)) return false;
    if (to && d > endOfDay(to)) return false;
    return true;
  });
}

export type ProductUnitsAgg = {
  productId: string;
  name: string;
  units: number;
  revenue: number;
};

export function aggregateUnitsByProduct(
  purchases: Purchase[]
): ProductUnitsAgg[] {
  const map = new Map<
    string,
    { name: string; units: number; revenue: number }
  >();
  for (const p of purchases) {
    for (const line of p.detailProducts ?? []) {
      const id = line.productId;
      const prev = map.get(id) ?? {
        name: line.product.name,
        units: 0,
        revenue: 0,
      };
      prev.units += line.cantidad;
      prev.revenue += line.total;
      map.set(id, prev);
    }
  }
  return [...map.entries()]
    .map(([productId, v]) => ({
      productId,
      name: v.name,
      units: v.units,
      revenue: v.revenue,
    }))
    .sort((a, b) => b.units - a.units);
}

export function topProductByUnits(
  purchases: Purchase[]
): ProductUnitsAgg | null {
  const list = aggregateUnitsByProduct(purchases);
  return list[0] ?? null;
}

export function priciestPurchase(purchases: Purchase[]): Purchase | null {
  if (!purchases.length) return null;
  return purchases.reduce((best, p) => (p.total > best.total ? p : best));
}

export function summarizePurchases(purchases: Purchase[]): {
  totalSpent: number;
  purchaseCount: number;
  avgTicket: number;
} {
  const purchaseCount = purchases.length;
  const totalSpent = purchases.reduce((s, p) => s + p.total, 0);
  const avgTicket =
    purchaseCount === 0 ? 0 : Math.round(totalSpent / purchaseCount);
  return { totalSpent, purchaseCount, avgTicket };
}

export type DatePreset = "all" | "7d" | "30d" | "month" | "ytd";

export function getPresetRange(
  preset: DatePreset,
  now = new Date()
): { from: Date | null; to: Date | null } {
  const end = endOfDay(now);
  switch (preset) {
    case "all":
      return { from: null, to: null };
    case "7d": {
      const from = new Date(now);
      from.setDate(from.getDate() - 6);
      return { from: startOfDay(from), to: end };
    }
    case "30d": {
      const from = new Date(now);
      from.setDate(from.getDate() - 29);
      return { from: startOfDay(from), to: end };
    }
    case "month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: startOfDay(from), to: end };
    }
    case "ytd": {
      const from = new Date(now.getFullYear(), 0, 1);
      return { from: startOfDay(from), to: end };
    }
  }
}
