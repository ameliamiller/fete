import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatPhone, isValidPhone } from "@/lib/phone";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, name, phone, status, smsOptIn } = body;

    if (!eventId || !name || !phone || !status) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const validStatuses = ["GOING", "MAYBE", "NOT_GOING"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number." },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const formattedPhone = formatPhone(phone);

    const rsvp = await prisma.rsvp.upsert({
      where: { eventId_phone: { eventId, phone: formattedPhone } },
      update: { name: name.trim(), status, smsOptIn: !!smsOptIn },
      create: {
        eventId,
        name: name.trim(),
        phone: formattedPhone,
        status,
        smsOptIn: !!smsOptIn,
      },
    });

    return NextResponse.json(rsvp, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
