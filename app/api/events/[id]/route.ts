import { requireAuth } from "@/lib/auth";
import { api } from "@/lib/api/response";
import { db } from "@/lib/db";
import { updateEventSchema } from "@/lib/validations/events";
import z from "zod";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(req);
  if (user instanceof Response) return user;

  const { id } = await params;

  const event = await db.event.findFirst({
    where: { id, userId: user.id },
  });

  if (!event) {
    return api.notFound("Evento no encontrado");
  }

  return api.ok("OK", event);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth(req);
  if (user instanceof Response) return user;

  const { id } = await params;

  const existing = await db.event.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return api.notFound("Evento no encontrado");
  }

  try {
    const body = await req.json();
    const data = updateEventSchema.parse(body);

    const startTime = data.startTime ?? existing.startTime;
    const endTime = data.endTime ?? existing.endTime;

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      return api.badRequest("Fechas inválidas");
    }
    if (endTime <= startTime) {
      return api.badRequest("La fecha de fin debe ser posterior a la de inicio");
    }

    const event = await db.event.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.startTime !== undefined && { startTime: data.startTime }),
        ...(data.endTime !== undefined && { endTime: data.endTime }),
      },
    });

    return api.ok("Actualizado", event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return api.badRequest("Datos inválidos", error.issues);
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

  const deleted = await db.event.deleteMany({
    where: { id, userId: user.id },
  });

  if (deleted.count === 0) {
    return api.notFound("Evento no encontrado");
  }

  return api.ok("Evento eliminado");
}
