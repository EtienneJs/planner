import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { api } from "@/lib/api/response";
import { db } from "@/lib/db";
import { createPurchaseSchema } from "@/lib/validations/purchase";
import z from "zod";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function GET() {
  const purchases = await db.purchase.findMany();
  return api.ok("OK", purchases);
}


export async function POST(req: NextRequest) {

   const token = await getToken({ 
        req,
        secret: process.env.NEXTAUTH_SECRET
    });
    console.log({ 
        req,
        secret: process.env.NEXTAUTH_SECRET,
        token
    })

    if (!token) {
        return api.unauthorized("Debes iniciar sesión");
    }

  try {
    const body = await req.json();
    const data = createPurchaseSchema.parse(body);

    const purchase = await db.purchase.create({
      data: {
        description: data.description,
        price: data.price,
        userId: token.id as string,  // ← desde la sesión, no del body
        detailProducts: {
          create: data.detailProducts.map((d) => ({
            productId: d.productId,
            cantidad: d.cantidad,
            total: d.total,
          })),
        },
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