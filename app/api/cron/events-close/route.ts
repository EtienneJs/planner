import { NextRequest } from "next/server";

import { EventStatus } from "@/app/generated/prisma/client";
import { api } from "@/lib/api/response";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Solo Vercel Cron (Authorization: Bearer CRON_SECRET) o desarrollo local sin secret. */
function authorizeCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return process.env.NODE_ENV === "development";
  }
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Marca como NOT_COMPLETED los eventos que siguen PENDING y ya pasó su endTime.
 * Invocado por Vercel Cron (ver `vercel.json`).
 */
export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) {
    return api.unauthorized();
  }

  try {
    const now = new Date();
    const result = await db.event.updateMany({
      where: {
        status: EventStatus.PENDING,
        endTime: { lt: now },
      },
      data: { status: EventStatus.NOT_COMPLETED },
    });

    return api.ok("Events updated", { updated: result.count });
  } catch (e) {
    console.error("[cron/events-close]", e);
    return api.serverError();
  }
}
