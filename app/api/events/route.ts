import { requireAuth } from "@/lib/auth";
import { api } from "@/lib/api/response";
import { db } from "@/lib/db";
import { createEventSchema } from "@/lib/validations/events";
import z from "zod";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof Response) return user;
  const events = await db.event.findMany({ where: { userId: user.id } });
  return api.ok("OK", events);
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof Response) return user;

  try {
    const body = await req.json();
    const data = createEventSchema.parse(body);

    const event = await db.event.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        userId: user.id,
        description: data.description,
        value: data.value,
      },
    });

    return api.created("Created successfully", event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return api.badRequest("Invalid data", error.issues);
    }
    throw error;
  }
}
