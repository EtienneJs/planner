import { db } from "@/lib/db";

export async function GET() {
  const events = await db.event.findMany();
  return Response.json(events);
}

export async function POST(req: Request) {
  const body = await req.json();

  const event = await db.event.create({
    data: {
      title: body.title,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      userId: body.userId,
      description: body.description,
      value: body.value
    },
  });

  return Response.json(event);
}