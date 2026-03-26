import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { api } from "@/lib/api/response";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = registerSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
        return api.badRequest("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: { email, password: hashedPassword },
    });

    return api.created("User registered", { id: user.id, email: user.email })
  } catch (error) {
    if (error instanceof z.ZodError) {
        return api.badRequest("Invalid data", error.issues);
    }
    throw error;
  }
}