// lib/validations/purchase.ts
import { z } from "zod";

export const createPurchaseSchema = z.object({
  description: z.string().min(1),
  detailProducts: z
    .array(
      z.object({
        productId: z.cuid(),
        cantidad: z.number().int().positive(),
      })
    )
    .min(1, "Include at least one product line"),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;

export const updatePurchaseSchema = z
  .object({
    description: z.string().min(1).optional(),
    detailProducts: z
      .array(
        z.object({
          productId: z.cuid(),
          cantidad: z.number().int().positive(),
        })
      )
      .min(1, "Include at least one product")
      .optional(),
  })
  .refine(
    (d) => d.description !== undefined || d.detailProducts !== undefined,
    { message: "Send at least description or detailProducts" }
  );

export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;