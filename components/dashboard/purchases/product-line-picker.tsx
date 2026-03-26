"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

import type { Product } from "@/lib/types/product";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

type ProductLinePickerProps = {
  products: Product[];
  value: string;
  onChange: (productId: string) => void;
  excludeProductIds: string[];
  disabled?: boolean;
};

export function ProductLinePicker({
  products,
  value,
  onChange,
  excludeProductIds,
  disabled,
}: ProductLinePickerProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = products.find((p) => p.id === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
      setQuery("");
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const candidateProducts = useMemo(() => {
    return products.filter(
      (p) => !excludeProductIds.includes(p.id) || p.id === value
    );
  }, [products, excludeProductIds, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidateProducts;
    return candidateProducts.filter((p) =>
      p.name.toLowerCase().includes(q)
    );
  }, [candidateProducts, query]);

  const label = selected
    ? `${selected.name} (${t("purchases.priceTag", { price: selected.price })})`
    : t("purchases.selectProduct");

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          if (disabled) return;
          setOpen((o) => !o);
          setQuery("");
        }}
        className={cn(
          "flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-left text-sm text-foreground",
          "outline-none transition-colors dark:bg-input/30",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:opacity-50",
          !selected && "text-muted-foreground"
        )}
      >
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronDown
          className={cn("size-4 shrink-0 opacity-60", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open ? (
        <div
          className="absolute top-full right-0 left-0 z-[60] mt-1 flex max-h-72 flex-col overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
          role="listbox"
        >
          <div className="flex items-center gap-2 border-b border-border/80 px-1 pb-1">
            <Search className="size-4 shrink-0 opacity-50" aria-hidden />
            <Input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("purchases.searchProductPlaceholder")}
              className="h-8 border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            <button
              type="button"
              role="option"
              aria-selected={value === ""}
              className="flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                onChange("");
                setOpen(false);
                setQuery("");
              }}
            >
              {t("purchases.selectProduct")}
            </button>
            {filtered.length === 0 ? (
              <p className="px-2 py-2 text-sm text-muted-foreground">
                {t("purchases.noProductMatch")}
              </p>
            ) : (
              filtered.map((pr) => (
                <button
                  key={pr.id}
                  type="button"
                  role="option"
                  aria-selected={value === pr.id}
                  className={cn(
                    "flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                    value === pr.id && "bg-accent/50"
                  )}
                  onClick={() => {
                    onChange(pr.id);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {pr.name}{" "}
                    <span className="text-muted-foreground">
                      ({t("purchases.priceTag", { price: pr.price })})
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
