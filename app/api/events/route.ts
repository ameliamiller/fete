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

    // Generate a short URL via TinyURL (best-effort, don't fail event creation)
    try {
      const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://fete-xi.vercel.app";
      const longUrl = `${base}/event/${event.id}`;
      const res = await fetch(
        `https://is.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`
      );
      if (res.ok) {
        const shortUrl = (await res.text()).trim();
        await prisma.event.update({ where: { id: event.id }, data: { shortUrl } });
        return NextResponse.json({ ...event, shortUrl }, { status: 201 });
      }
    } catch {
      // TinyURL failed — not a blocker
    }

    return NextResponse.json(event, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
