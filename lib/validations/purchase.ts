// lib/validations/purchase.ts
import { z } from "zod";

export const createPurchaseSchema = z.object({
  description: z.string().min(1),
  price: z.number().positive(),
  detailProducts: z.array(z.object({
    productId: z.cuid(),
    cantidad: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  })),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;