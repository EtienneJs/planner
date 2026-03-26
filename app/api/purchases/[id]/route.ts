import { requireAuth } from "@/lib/auth";
import { api } from "@/lib/api/response";
import { db } from "@/lib/db";
import { updatePurchaseSchema } from "@/lib/validations/purchase";
import z from "zod";
import { NextRequest } from "next/server";

const purchaseInclude = {
  detailProducts: {
    include: { product: true },
  },
} as const;

async function getOwnedPurchase(id: string, userId: string) {
  return db.purchase.findFirst({
    where: { id, userId },
    include: purchaseInclude,
  });
}

async function notFoundOrForbiddenPurchase(id: string) {
  const purchase = await db.purchase.findUnique({ where: { id } });
  if (!purchase) {
    return api.notFound("Purchase not found");
  }
  return api.forbidden("You do not have permission for this purchase");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(req);
  if (user instanceof Response) return user;

  const { id } = await params;

  const purchase = await getOwnedPurchase(id, user.id);

  if (!purchase) {
    return api.notFound("Purchase not found");
  }

  return api.ok("OK", purchase);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(req);
  if (user instanceof Response) return user;

  const { id } = await params;

  try {
    const body = await req.json();
    const data = updatePurchaseSchema.parse(body);

    if (data.detailProducts !== undefined) {
      const productIds = data.detailProducts.map((d) => d.productId);
      const products = await db.product.findMany({
        where: { id: { in: productIds }, userId: user.id },
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

      const total = detailProductsWithTotal.reduce((acc, row) => acc + row.total, 0);

      await db.$transaction(async (tx) => {
        const existing = await tx.purchase.findFirst({
          where: { id, userId: user.id },
        });
        if (!existing) {
          throw new Error("PURCHASE_ACCESS");
        }
        const description = data.description ?? existing.description;

        await tx.purchaseDetailProduct.deleteMany({
          where: {
            purchase: {
              id,
              userId: user.id,
            },
          },
        });

        const upd = await tx.purchase.updateMany({
          where: { id, userId: user.id },
          data: { description, total },
        });
        if (upd.count === 0) {
          throw new Error("PURCHASE_ACCESS");
        }

        await tx.purchaseDetailProduct.createMany({
          data: detailProductsWithTotal.map((d) => ({
            purchaseId: id,
            productId: d.productId,
            cantidad: d.cantidad,
            total: d.total,
          })),
        });
      });
    } else {
      if (data.description === undefined) {
        return api.badRequest("Invalid data");
      }
      const result = await db.purchase.updateMany({
        where: { id, userId: user.id },
        data: { description: data.description },
      });
      if (result.count === 0) {
        return notFoundOrForbiddenPurchase(id);
      }
    }

    const updated = await getOwnedPurchase(id, user.id);
    return api.ok("Updated", updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return api.badRequest("Invalid data", error.issues);
    }
    if (error instanceof Error && error.message === "PURCHASE_ACCESS") {
      return notFoundOrForbiddenPurchase(id);
    }
    throw error;
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(_req);
  if (user instanceof Response) return user;

  const { id } = await params;

  const result = await db.$transaction(async (tx) => {
    await tx.purchaseDetailProduct.deleteMany({
      where: {
        purchase: {
          id,
          userId: user.id,
        },
      },
    });
    return tx.purchase.deleteMany({
      where: { id, userId: user.id },
    });
  });

  if (result.count === 0) {
    return notFoundOrForbiddenPurchase(id);
  }

  return api.ok("Purchase deleted");
}
