import { z } from "zod";

export const createEventSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    value: z.number().int(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
  })
  .refine((data) => !Number.isNaN(data.startTime.getTime()), {
    message: "Invalid start date",
    path: ["startTime"],
  })
  .refine((data) => !Number.isNaN(data.endTime.getTime()), {
    message: "Invalid end date",
    path: ["endTime"],
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End date must be after start date",
    path: ["endTime"],
  });

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = z
  .object({
    title: z.string().min(1, "Title cannot be empty").optional(),
    description: z.string().min(1, "Description cannot be empty").optional(),
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
    { message: "Send at least one field to update", path: ["title"] }
  );

export type UpdateEventInput = z.infer<typeof updateEventSchema>;
