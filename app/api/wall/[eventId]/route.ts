import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const { name, message, x, y } = await req.json();

  if (!name?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name and message required." }, { status: 400 });
  }
  if (message.length > 280) {
    return NextResponse.json({ error: "Message too long." }, { status: 400 });
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const post = await prisma.wallPost.create({
    data: {
      eventId,
      name: name.trim(),
      message: message.trim(),
      x: Math.min(100, Math.max(0, Number(x) || 10)),
      y: Math.min(100, Math.max(0, Number(y) || 10)),
    },
  });

  return NextResponse.json(post);
}
