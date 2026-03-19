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

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = token?.sub; 
  if (!userId) return api.unauthorized("Sesión inválida");
  try {
    const body = await req.json();
    const data = createPurchaseSchema.parse(body);

    const productIds = data.detailProducts.map((d) => d.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    if (products.length !== productIds.length) {
      return api.badRequest("Algunos productos no existen");
    }

    const detailProductsWithTotal = data.detailProducts.map((d) => {
      const product = productMap.get(d.productId)!;
      return {
        productId: d.productId,
        cantidad: d.cantidad,
        total: product.price * d.cantidad,
      };
    });

    const purchase = await db.purchase.create({
      data: {
        description: data.description,
        total: detailProductsWithTotal.reduce((acc, totalprod) => acc + totalprod.total,0),
        userId,
        detailProducts: {
          create: detailProductsWithTotal,
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