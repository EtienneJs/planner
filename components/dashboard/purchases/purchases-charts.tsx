"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { Purchase } from "@/lib/types/purchase";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  aggregatePurchasesForChart,
  type ChartPeriod,
} from "@/lib/purchases/chart-aggregate";

type ApiEnvelope<T> = { message: string; data?: T };

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {};
  }
}

const periods: ChartPeriod[] = ["day", "week", "month", "year"];

export function PurchasesCharts() {
  const { t, locale } = useLanguage();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<ChartPeriod>("month");

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/purchases");
      const json = (await parseJson(res)) as ApiEnvelope<Purchase[]>;
      if (!res.ok) {
        setError(json.message ?? t("purchases.loadFailed"));
        setPurchases([]);
        return;
      }
      setPurchases(Array.isArray(json.data) ? json.data : []);
    } catch {
      setError(t("purchases.loadFailed"));
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const chartData = useMemo(
    () => aggregatePurchasesForChart(purchases, period, locale),
    [purchases, period, locale]
  );

  const periodLabel = (p: ChartPeriod) => {
    switch (p) {
      case "day":
        return t("purchases.periodDay");
      case "week":
        return t("purchases.periodWeek");
      case "month":
        return t("purchases.periodMonth");
      case "year":
        return t("purchases.periodYear");
      default:
        return p;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-[0.04em] md:text-3xl">
          {t("purchases.chartsTitle")}
        </h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
          {t("purchases.chartsIntro")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {periods.map((p) => (
          <Button
            key={p}
            type="button"
            variant={period === p ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(p)}
          >
            {periodLabel(p)}
          </Button>
        ))}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="rounded-xl border border-border/80 bg-card/50 p-4 md:p-6">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </div>
        ) : chartData.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {t("purchases.chartEmpty")}
          </p>
        ) : (
          <div className="h-[min(420px,60vh)] w-full min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 8,
                  right: 8,
                  left: 4,
                  bottom: chartData.length > 12 ? 48 : 28,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  interval={chartData.length > 18 ? "preserveStartEnd" : 0}
                  angle={chartData.length > 12 ? -32 : 0}
                  textAnchor={chartData.length > 12 ? "end" : "middle"}
                  height={chartData.length > 12 ? 52 : 28}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => String(v)}
                  width={48}
                />
                <Tooltip
                  cursor={{ fill: "color-mix(in oklch, var(--muted) 45%, transparent)" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--foreground)",
                  }}
                  formatter={(value) => [
                    value ?? "—",
                    t("purchases.chartTotal"),
                  ]}
                  labelFormatter={(label) => String(label)}
                />
                <Bar
                  dataKey="total"
                  name={t("purchases.chartTotal")}
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={56}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
