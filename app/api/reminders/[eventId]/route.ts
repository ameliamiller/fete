import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCustomMessage } from "@/lib/sms";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const { body } = await req.json();

  if (!body?.trim()) {
    return NextResponse.json({ error: "Message body is required." }, { status: 400 });
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      rsvps: {
        where: { status: "GOING" },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const results = await Promise.allSettled(
    event.rsvps.map((rsvp) =>
      sendCustomMessage(eventId, rsvp.phone, rsvp.name, body.trim())
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ sent, failed });
}
