"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  CalendarRange,
  Crown,
  Gem,
  PieChart,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";

import type { Purchase } from "@/lib/types/purchase";
import { useLanguage } from "@/components/language-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  aggregateUnitsByProduct,
  filterPurchasesByDateRange,
  getPresetRange,
  priciestPurchase,
  summarizePurchases,
  topProductByUnits,
  type DatePreset,
} from "@/lib/purchases/insights";

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

function formatIsoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseIsoDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const presets: DatePreset[] = ["all", "7d", "30d", "month", "ytd"];

export function PurchasesInsights() {
  const { t, locale } = useLanguage();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [preset, setPreset] = useState<DatePreset | "custom">("30d");
  const [rangeFrom, setRangeFrom] = useState<Date | null>(
    () => getPresetRange("30d").from
  );
  const [rangeTo, setRangeTo] = useState<Date | null>(
    () => getPresetRange("30d").to
  );

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

  const applyPreset = (p: DatePreset) => {
    setPreset(p);
    const r = getPresetRange(p);
    setRangeFrom(r.from);
    setRangeTo(r.to);
  };

  const filtered = useMemo(() => {
    let from = rangeFrom;
    let to = rangeTo;
    if (from && to && from > to) {
      [from, to] = [to, from];
    }
    return filterPurchasesByDateRange(purchases, from, to);
  }, [purchases, rangeFrom, rangeTo]);

  const summary = useMemo(
    () => summarizePurchases(filtered),
    [filtered]
  );
  const topProduct = useMemo(
    () => topProductByUnits(filtered),
    [filtered]
  );
  const priciest = useMemo(
    () => priciestPurchase(filtered),
    [filtered]
  );
  const ranked = useMemo(
    () => aggregateUnitsByProduct(filtered).slice(0, 5),
    [filtered]
  );
  const maxUnits = ranked[0]?.units ?? 1;

  const nf = useMemo(
    () => new Intl.NumberFormat(locale === "es" ? "es" : "en"),
    [locale]
  );

  const formatDate = (
    iso: string,
    opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }
  ) => {
    try {
      return new Date(iso).toLocaleString(locale === "es" ? "es" : "en", opts);
    } catch {
      return iso;
    }
  };

  const presetLabel = (p: DatePreset) => {
    switch (p) {
      case "all":
        return t("purchases.filterPresetAll");
      case "7d":
        return t("purchases.filterPreset7d");
      case "30d":
        return t("purchases.filterPreset30d");
      case "month":
        return t("purchases.filterPresetMonth");
      case "ytd":
        return t("purchases.filterPresetYtd");
      default:
        return p;
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/[0.07] via-card to-violet-500/[0.06] p-6 shadow-sm md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              {t("nav.purchasesInsights")}
            </div>
            <h1 className="font-heading text-2xl font-semibold tracking-[0.04em] md:text-3xl">
              {t("purchases.insightsTitle")}
            </h1>
            <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
              {t("purchases.insightsIntro")}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <CalendarRange className="h-4 w-4" />
            {t("purchases.insightsFilterLabel")}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <Button
              key={p}
              type="button"
              variant={preset === p ? "default" : "outline"}
              size="sm"
              className={cn(
                "rounded-full transition-all",
                preset === p && "shadow-md shadow-primary/20"
              )}
              onClick={() => applyPreset(p)}
            >
              {presetLabel(p)}
            </Button>
          ))}
        </div>
        <div className="grid gap-4 rounded-xl border border-border/60 bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="ins-from" className="text-xs text-muted-foreground">
              {t("purchases.filterFrom")}
            </Label>
            <Input
              id="ins-from"
              type="date"
              value={rangeFrom ? formatIsoDate(rangeFrom) : ""}
              onChange={(e) => {
                setPreset("custom");
                const v = e.target.value;
                setRangeFrom(v ? parseIsoDate(v) : null);
              }}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ins-to" className="text-xs text-muted-foreground">
              {t("purchases.filterTo")}
            </Label>
            <Input
              id="ins-to"
              type="date"
              value={rangeTo ? formatIsoDate(rangeTo) : ""}
              onChange={(e) => {
                setPreset("custom");
                const v = e.target.value;
                setRangeTo(v ? parseIsoDate(v) : null);
              }}
              className="bg-background"
            />
          </div>
          <div className="flex items-end sm:col-span-2 lg:col-span-2">
            <p className="text-xs text-muted-foreground">
              {t("purchases.filterCustomHint")}
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-64 rounded-xl md:col-span-2" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile
              icon={<Wallet className="h-5 w-5" />}
              label={t("purchases.insightsTotalSpent")}
              value={nf.format(summary.totalSpent)}
              accent="from-emerald-500/15 to-emerald-500/5"
            />
            <StatTile
              icon={<PieChart className="h-5 w-5" />}
              label={t("purchases.insightsPurchaseCount")}
              value={nf.format(summary.purchaseCount)}
              accent="from-sky-500/15 to-sky-500/5"
            />
            <StatTile
              icon={<TrendingUp className="h-5 w-5" />}
              label={t("purchases.insightsAvgTicket")}
              value={nf.format(summary.avgTicket)}
              accent="from-amber-500/15 to-amber-500/5"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-violet-500/[0.04] ring-1 ring-border/40">
              <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-4 rounded-full bg-violet-500/10 blur-2xl" />
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
                    <Crown className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {t("purchases.topProductTitle")}
                    </CardTitle>
                    <CardDescription>
                      {t("purchases.topProductSubtitle")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {topProduct ? (
                  <div className="space-y-3">
                    <p className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
                      {topProduct.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium tabular-nums">
                        {nf.format(topProduct.units)} {t("purchases.insightsUnits")}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium tabular-nums">
                        {nf.format(topProduct.revenue)} ·{" "}
                        {t("purchases.insightsLineRevenue")}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("purchases.topProductNone")}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-amber-500/[0.05] ring-1 ring-border/40">
              <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-4 rounded-full bg-amber-500/10 blur-2xl" />
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <Gem className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {t("purchases.priciestTitle")}
                    </CardTitle>
                    <CardDescription>
                      {t("purchases.priciestSubtitle")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {priciest ? (
                  <div className="space-y-3">
                    <p className="font-heading text-2xl font-semibold tabular-nums tracking-tight md:text-3xl">
                      {nf.format(priciest.total)}
                    </p>
                    <p className="font-medium leading-snug">
                      {priciest.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(priciest.date)}
                    </p>
                    <Link
                      href="/dashboard/purchases"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "mt-2 inline-flex"
                      )}
                    >
                      {t("nav.purchasesList")} →
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("purchases.priciestNone")}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60 bg-card/80 ring-1 ring-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t("purchases.insightsRankTitle")}
              </CardTitle>
              <CardDescription>
                {t("purchases.topProductSubtitle")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ranked.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {filtered.length === 0
                    ? t("purchases.insightsEmptyHint")
                    : t("purchases.insightsRankEmpty")}
                </p>
              ) : (
                <ul className="space-y-4">
                  {ranked.map((row, i) => (
                    <li key={row.productId}>
                      <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums">
                            {i + 1}
                          </span>
                          <span className="truncate font-medium">{row.name}</span>
                        </span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">
                          {nf.format(row.units)} {t("purchases.insightsUnits")}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary/80 to-violet-500/90 transition-all"
                          style={{
                            width: `${Math.max(8, (row.units / maxUnits) * 100)}%`,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br p-4 shadow-sm ring-1 ring-border/30",
        accent
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="font-heading text-2xl font-semibold tabular-nums tracking-tight md:text-3xl">
        {value}
      </p>
    </div>
  );
}
