import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  price: z.number().int().nonnegative("El precio debe ser mayor o igual a 0"),
  value: z.number().int().nonnegative("El valor debe ser mayor o igual a 0"),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;