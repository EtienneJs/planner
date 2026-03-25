import { api } from "@/lib/api/response";
import { db } from "@/lib/db";
import z from "zod";
import { NextRequest } from "next/server";
import { createProductSchema } from "@/lib/validations/products";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof Response) return user;
  const products = await db.product.findMany({ where: { userId: user.id } });
  return api.ok("OK", products);
}


export async function POST(req: NextRequest) {

  const user = await requireAuth(req);
  if (user instanceof Response) return user;

  try {
    const body = await req.json();
    const data = createProductSchema.parse(body);

    const purchase = await db.product.create({
      data: {
        name: data.name,
        price: data.price,
        value: data.value,
        userId: user.id
      },
    });
    return api.created("Creado correctamente", purchase);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return api.badRequest("Datos inválidos", error.issues);
    }
    throw error;
  }
}