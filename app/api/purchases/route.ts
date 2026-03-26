import { requireAuth } from "@/lib/auth";
import { api } from "@/lib/api/response";
import { db } from "@/lib/db";
import { createPurchaseSchema } from "@/lib/validations/purchase";
import z from "zod";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof Response) return user;
  const purchases = await db.purchase.findMany({ where: { userId: user.id } });
  return api.ok("OK", purchases);
}


export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof Response) return user;

  try {
    const body = await req.json();
    const data = createPurchaseSchema.parse(body);

    const productIds = data.detailProducts.map((d) => d.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds }, userId:user.id },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    if (products.length !== productIds.length) {
      return api.badRequest("Some products do not exist");
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
        userId:user.id,
        detailProducts: {
          create: detailProductsWithTotal,
        },
      },
    });

    return api.created("Created successfully", purchase);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return api.badRequest("Invalid data", error.issues);
    }
    throw error;
  }
}

