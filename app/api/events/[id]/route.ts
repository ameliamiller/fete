import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      rsvps: { orderBy: { createdAt: "asc" } },
      messages: { orderBy: { sentAt: "desc" } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, emoji, date, location, description, hostName, cohostPhones = [] } = body;

    if (!title || !emoji || !date || !location || !hostName) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const { formatPhone, isValidPhone } = await import("@/lib/phone");

    const event = await prisma.event.update({
      where: { id },
      data: {
        title: title.trim(),
        emoji: emoji.trim(),
        date: new Date(date),
        location: location.trim(),
        description: (description ?? "").trim(),
        hostName: hostName.trim(),
        cohostPhones: (cohostPhones as string[]).filter(isValidPhone).map(formatPhone),
      },
    });

    return NextResponse.json(event);
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
