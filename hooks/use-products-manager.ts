"use client";

import { useCallback, useEffect, useState } from "react";

import type { Product } from "@/lib/types/product";
import { useLanguage } from "@/components/language-provider";

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

export function useProductsManager() {
  const { t } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const json = (await parseJson(res)) as ApiEnvelope<Product[]>;
      if (!res.ok) {
        setError(
          (json as ApiEnvelope<unknown>).message ?? t("products.loadFailed")
        );
        setProducts([]);
        return;
      }
      setProducts(Array.isArray(json.data) ? json.data : []);
    } catch {
      setError(t("products.loadFailed"));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setName("");
    setPrice("");
    setValue("");
    setFormError(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((p: Product) => {
    setEditing(p);
    setName(p.name);
    setPrice(String(p.price));
    setValue(String(p.value));
    setFormError(null);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    setFormError(null);
    const priceNum = Number.parseInt(price, 10);
    const valueNum = Number.parseInt(value, 10);
    if (!name.trim()) {
      setFormError(t("products.nameRequired"));
      return;
    }
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setFormError(t("products.priceInvalid"));
      return;
    }
    if (Number.isNaN(valueNum) || valueNum < 0) {
      setFormError(t("products.valueInvalid"));
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/products/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            price: priceNum,
            value: valueNum,
          }),
        });
        const json = (await parseJson(res)) as ApiEnvelope<Product>;
        if (!res.ok) {
          setFormError(json.message ?? t("products.updateFailed"));
          return;
        }
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            price: priceNum,
            value: valueNum,
          }),
        });
        const json = (await parseJson(res)) as ApiEnvelope<Product>;
        if (!res.ok) {
          setFormError(json.message ?? t("products.createFailed"));
          return;
        }
      }
      setDialogOpen(false);
      await load();
    } catch {
      setFormError(t("products.genericError"));
    } finally {
      setSaving(false);
    }
  }, [editing, load, name, price, t, value]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = (await parseJson(res)) as ApiEnvelope<unknown>;
        setError(json.message ?? t("products.deleteFailed"));
        return;
      }
      setDeleteTarget(null);
      await load();
    } catch {
      setError(t("products.deleteFailed"));
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, load, t]);

  return {
    t,
    products,
    loading,
    error,
    dialogOpen,
    setDialogOpen,
    editing,
    name,
    setName,
    price,
    setPrice,
    value,
    setValue,
    saving,
    formError,
    deleteTarget,
    setDeleteTarget,
    deleting,
    openCreate,
    openEdit,
    handleSave,
    handleDelete,
  };
}
