"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Minus } from "lucide-react";

import type { Product } from "@/lib/types/product";
import type { Purchase } from "@/lib/types/purchase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/language-provider";
import { ProductLinePicker } from "@/components/dashboard/purchases/product-line-picker";

type ApiEnvelope<T> = { message: string; data?: T; details?: unknown };

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {};
  }
}

type FormLine = { productId: string; cantidad: string };

function emptyLine(): FormLine {
  return { productId: "", cantidad: "1" };
}

function formatDate(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleString(locale === "es" ? "es" : "en", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function linesSummary(p: Purchase) {
  if (!p.detailProducts?.length) return "—";
  return p.detailProducts
    .map((d) => `${d.product.name} ×${d.cantidad}`)
    .join(", ");
}

export function PurchasesManager() {
  const { t, locale } = useLanguage();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Purchase | null>(null);
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<FormLine[]>([emptyLine()]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Purchase | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch("/api/purchases"),
        fetch("/api/products"),
      ]);
      const pJson = (await parseJson(pRes)) as ApiEnvelope<Purchase[]>;
      const cJson = (await parseJson(cRes)) as ApiEnvelope<Product[]>;

      if (!pRes.ok) {
        setError(pJson.message ?? t("purchases.loadFailed"));
        setPurchases([]);
      } else {
        setPurchases(Array.isArray(pJson.data) ? pJson.data : []);
      }

      if (cRes.ok) {
        setCatalog(Array.isArray(cJson.data) ? cJson.data : []);
      } else {
        setCatalog([]);
      }
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

  function openCreate() {
    setEditing(null);
    setDescription("");
    setLines(catalog.length ? [{ productId: catalog[0].id, cantidad: "1" }] : [emptyLine()]);
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(p: Purchase) {
    setEditing(p);
    setDescription(p.description);
    setLines(
      p.detailProducts.length
        ? p.detailProducts.map((d) => ({
            productId: d.productId,
            cantidad: String(d.cantidad),
          }))
        : [emptyLine()]
    );
    setFormError(null);
    setDialogOpen(true);
  }

  function addLine() {
    setLines((prev) => [...prev, catalog.length ? { productId: catalog[0].id, cantidad: "1" } : emptyLine()]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  function updateLine(index: number, patch: Partial<FormLine>) {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, ...patch } : line))
    );
  }

  function validateLines(): { productId: string; cantidad: number }[] | null {
    const seen = new Set<string>();
    const out: { productId: string; cantidad: number }[] = [];
    for (const line of lines) {
      if (!line.productId.trim()) {
        setFormError(t("purchases.selectProductLine"));
        return null;
      }
      const q = Number.parseInt(line.cantidad, 10);
      if (Number.isNaN(q) || q < 1) {
        setFormError(t("purchases.quantityInvalid"));
        return null;
      }
      if (seen.has(line.productId)) {
        setFormError(t("purchases.duplicateProduct"));
        return null;
      }
      seen.add(line.productId);
      out.push({ productId: line.productId, cantidad: q });
    }
    if (out.length === 0) {
      setFormError(t("purchases.atLeastOneLine"));
      return null;
    }
    return out;
  }

  async function handleSave() {
    setFormError(null);
    const desc = description.trim();
    if (!desc) {
      setFormError(t("purchases.descriptionRequired"));
      return;
    }
    const detailProducts = validateLines();
    if (!detailProducts) return;

    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/purchases/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: desc,
            detailProducts,
          }),
        });
        const json = (await parseJson(res)) as ApiEnvelope<Purchase>;
        if (!res.ok) {
          setFormError(json.message ?? t("purchases.updateFailed"));
          return;
        }
      } else {
        const res = await fetch("/api/purchases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: desc,
            detailProducts,
          }),
        });
        const json = (await parseJson(res)) as ApiEnvelope<Purchase>;
        if (!res.ok) {
          setFormError(json.message ?? t("purchases.createFailed"));
          return;
        }
      }
      setDialogOpen(false);
      await load();
    } catch {
      setFormError(t("purchases.genericError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/purchases/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = (await parseJson(res)) as ApiEnvelope<unknown>;
        setError(json.message ?? t("purchases.deleteFailed"));
        return;
      }
      setDeleteTarget(null);
      await load();
    } catch {
      setError(t("purchases.deleteFailed"));
    } finally {
      setDeleting(false);
    }
  }

  const noProducts = catalog.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {t("purchases.title")}
          </h1>
          <p className="text-muted-foreground">{t("purchases.intro")}</p>
        </div>
        <Button onClick={openCreate} size="lg" disabled={noProducts}>
          <Plus className="size-4" />
          {t("purchases.addPurchase")}
        </Button>
      </div>

      {noProducts ? (
        <p className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
          {t("purchases.needProducts", {
            products: t("purchases.productsWord"),
          })}
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="rounded-xl border bg-card">
        {loading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-2/3" />
          </div>
        ) : purchases.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {t("purchases.empty")}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("purchases.colDescription")}</TableHead>
                <TableHead className="hidden lg:table-cell">
                  {t("purchases.colLines")}
                </TableHead>
                <TableHead className="text-right">{t("purchases.colTotal")}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("purchases.colDate")}
                </TableHead>
                <TableHead className="w-[120px] text-right">
                  {t("purchases.colActions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="max-w-[200px] font-medium">
                    <div className="truncate">{p.description}</div>
                    <div className="mt-1 text-xs text-muted-foreground lg:hidden">
                      {linesSummary(p)}
                    </div>
                  </TableCell>
                  <TableCell className="hidden max-w-xs text-muted-foreground lg:table-cell">
                    <span className="line-clamp-2 text-sm">{linesSummary(p)}</span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{p.total}</TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {formatDate(p.date, locale)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(p)}
                        aria-label={t("purchases.editAria", { id: p.id })}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(p)}
                        aria-label={t("purchases.deleteAria")}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? t("purchases.editPurchase") : t("purchases.newPurchase")}
            </DialogTitle>
            <DialogDescription>{t("purchases.dialogDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {formError ? (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="purchase-desc">{t("purchases.labelDescription")}</Label>
              <Textarea
                id="purchase-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-y"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t("purchases.lineItems")}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLine}
                  disabled={noProducts}
                >
                  <Plus className="size-3.5" />
                  {t("purchases.addLine")}
                </Button>
              </div>
              <div className="space-y-3">
                {lines.map((line, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3 sm:flex-row sm:items-end"
                  >
                    <div className="grid flex-1 gap-2">
                      <Label className="text-xs text-muted-foreground">
                        {t("purchases.product")}
                      </Label>
                      <ProductLinePicker
                        products={catalog}
                        value={line.productId}
                        onChange={(productId) =>
                          updateLine(index, { productId })
                        }
                        excludeProductIds={lines
                          .map((l, i) =>
                            i !== index && l.productId ? l.productId : null
                          )
                          .filter((id): id is string => id !== null)}
                        disabled={noProducts}
                      />
                    </div>
                    <div className="grid w-full gap-2 sm:w-28">
                      <Label className="text-xs text-muted-foreground">
                        {t("purchases.qty")}
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        value={line.cantidad}
                        onChange={(e) =>
                          updateLine(index, { cantidad: e.target.value })
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 text-muted-foreground"
                      onClick={() => removeLine(index)}
                      disabled={lines.length <= 1}
                      aria-label={t("purchases.removeLine")}
                    >
                      <Minus className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("purchases.cancel")}
            </Button>
            <Button onClick={() => void handleSave()} disabled={saving || noProducts}>
              {saving
                ? t("purchases.saving")
                : editing
                  ? t("purchases.saveChanges")
                  : t("purchases.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("purchases.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? t("purchases.deleteDescription", {
                    desc: `${deleteTarget.description.slice(0, 80)}${deleteTarget.description.length > 80 ? "…" : ""}`,
                  })
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("purchases.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void handleDelete()}
              disabled={deleting}
            >
              {deleting ? t("purchases.deleting") : t("purchases.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
