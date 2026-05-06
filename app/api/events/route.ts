import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatPhone, isValidPhone } from "@/lib/phone";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, emoji, date, location, description, hostName, hostPhone, cohostPhones = [] } =
      body;

    if (!title || !emoji || !date || !location || !hostName || !hostPhone) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    if (!isValidPhone(hostPhone)) {
      return NextResponse.json(
        { error: "Invalid host phone number." },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        emoji: emoji.trim(),
        date: new Date(date),
        location: location.trim(),
        description: (description ?? "").trim(),
        hostName: hostName.trim(),
        hostPhone: formatPhone(hostPhone),
        cohostPhones: (cohostPhones as string[]).filter(isValidPhone).map(formatPhone),
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
