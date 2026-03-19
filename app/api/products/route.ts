import { api } from "@/lib/api/response";
import { db } from "@/lib/db";
import z from "zod";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { createProductSchema } from "@/lib/validations/products";

export async function GET() {
  const purchases = await db.product.findMany();
  return api.ok("OK", purchases);
}


export async function POST(req: NextRequest) {

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = token?.sub; 
  if (!userId) return api.unauthorized("Sesión inválida");
  try {
    const body = await req.json();
    const data = createProductSchema.parse(body);

    const purchase = await db.product.create({
      data: {
        name: data.name,
        price: data.price,
        value: data.value
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