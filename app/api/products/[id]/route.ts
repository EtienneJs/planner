// app/api/products/[id]/route.ts
import { api } from "@/lib/api/response";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { updateProductSchema } from "@/lib/validations/products";
import { NextRequest } from "next/server";
import z from "zod";

const getOneProduct = async({id,userId}:{id:string; userId:string}) => {
  const producto = await db.product.findFirst({
    where: { id, userId},
  });

  if (!producto) {
    return api.notFound("Producto no encontrado");
  }
  return producto;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(req);
  if (user instanceof Response) return user;

  const { id } = await params;

  const found = await getOneProduct({ id, userId: user.id });
  if (found instanceof Response) return found;

  try {
    const body = await req.json();
    const data = updateProductSchema.parse(body);

    const product = await db.product.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.value !== undefined && { value: data.value }),
      },
    });

    return api.ok("Actualizado", product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return api.badRequest("Datos inválidos", error.issues);
    }
    throw error;
  }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ){
    const user = await requireAuth(req);
    if (user instanceof Response) return user;

    const { id } = await params;

    const found = await getOneProduct({ id, userId: user.id });
    if (found instanceof Response) return found;

    try {
        await db.product.delete({where:{id}})
        return api.ok("Producto Eliminado");
      } catch (error) {
        if (error instanceof z.ZodError) {
          return api.badRequest("Datos inválidos", error.issues);
        }
        throw error;
      }
}