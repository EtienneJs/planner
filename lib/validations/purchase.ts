// lib/validations/purchase.ts
import { z } from "zod";

export const createPurchaseSchema = z.object({
  description: z.string().min(1),
  detailProducts: z.array(z.object({
    productId: z.cuid(),
    cantidad: z.number().int().positive(),
  })),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;