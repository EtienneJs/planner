import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(6, "At least 6 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
