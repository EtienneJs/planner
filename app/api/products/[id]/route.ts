// app/api/products/[id]/route.ts
import { api } from "@/lib/api/response";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { updateProductSchema } from "@/lib/validations/products";
import { NextRequest } from "next/server";
import z from "zod";

/** Tras un update/delete con `where: { id, userId }` sin filas, distingue 404 vs 403. */
async function notFoundOrForbiddenProduct(id: string) {
  const product = await db.product.findUnique({ where: { id } });
  if (!product) {
    return api.notFound("Product not found");
  }
  return api.forbidden("You do not have permission for this product");
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(req);
  if (user instanceof Response) return user;

  const { id } = await params;

  try {
    const body = await req.json();
    const data = updateProductSchema.parse(body);

    const dataFields = {
      ...(data.name && { name: data.name }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.value !== undefined && { value: data.value }),
    };

    const result = await db.product.updateMany({
      where: { id, userId: user.id },
      data: dataFields,
    });

    if (result.count === 0) {
      return notFoundOrForbiddenProduct(id);
    }

    const product = await db.product.findUnique({ where: { id } });
    if (!product) {
      return api.serverError("Could not load updated product");
    }
    return api.ok("Updated", product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return api.badRequest("Invalid data", error.issues);
    }
    throw error;
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(req);
  if (user instanceof Response) return user;

  const { id } = await params;

  try {
    const result = await db.product.deleteMany({
      where: { id, userId: user.id },
    });
    if (result.count === 0) {
      return notFoundOrForbiddenProduct(id);
    }
    return api.ok("Product deleted");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return api.badRequest("Invalid data", error.issues);
    }
    throw error;
  }
}