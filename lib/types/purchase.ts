import type { Product } from "@/lib/types/product";

export type PurchaseDetail = {
  id: string;
  purchaseId: string;
  productId: string;
  cantidad: number;
  total: number;
  product: Product;
};

export type Purchase = {
  id: string;
  description: string;
  total: number;
  date: string;
  userId: string;
  detailProducts: PurchaseDetail[];
};
