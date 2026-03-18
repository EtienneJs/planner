import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { api } from "@/lib/api/response";

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = registerSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
        return api.badRequest("El email ya está registrado");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: { email, password: hashedPassword },
    });

    return api.created("Usuario registrado", { id: user.id, email: user.email })
  } catch (error) {
    if (error instanceof z.ZodError) {
        return api.badRequest("Datos inválidos", error.issues);
    }
    throw error;
  }
}