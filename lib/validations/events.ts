import { z } from "zod";

export const createEventSchema = z
  .object({
    title: z.string().min(1, "El título es requerido"),
    description: z.string().min(1, "La descripción es requerida"),
    value: z.number().int(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
  })
  .refine((data) => !Number.isNaN(data.startTime.getTime()), {
    message: "Fecha de inicio inválida",
    path: ["startTime"],
  })
  .refine((data) => !Number.isNaN(data.endTime.getTime()), {
    message: "Fecha de fin inválida",
    path: ["endTime"],
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "La fecha de fin debe ser posterior a la de inicio",
    path: ["endTime"],
  });

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = z
  .object({
    title: z.string().min(1, "El título no puede estar vacío").optional(),
    description: z.string().min(1, "La descripción no puede estar vacía").optional(),
    value: z.number().int().optional(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
  })
  .refine(
    (d) =>
      d.title !== undefined ||
      d.description !== undefined ||
      d.value !== undefined ||
      d.startTime !== undefined ||
      d.endTime !== undefined,
    { message: "Envía al menos un campo para actualizar", path: ["title"] }
  );

export type UpdateEventInput = z.infer<typeof updateEventSchema>;
