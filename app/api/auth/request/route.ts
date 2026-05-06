import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatPhone, isValidPhone } from "@/lib/phone";
import { sendMagicLink } from "@/lib/sms";

const LINK_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone || !isValidPhone(phone)) {
      return NextResponse.json({ error: "Invalid phone number." }, { status: 400 });
    }

    const formatted = formatPhone(phone);

    const eventCount = await prisma.event.count({
      where: { hostPhone: formatted },
    });

    if (eventCount === 0) {
      return NextResponse.json(
        { error: "No events found for that number. Did you use a different phone when creating?" },
        { status: 404 }
      );
    }

    const link = await prisma.magicLink.create({
      data: {
        phone: formatted,
        expiresAt: new Date(Date.now() + LINK_TTL_MS),
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const url = `${baseUrl}/verify?token=${link.token}`;

    const isMock = !process.env.TWILIO_ACCOUNT_SID;
    await sendMagicLink(formatted, url, isMock).catch(() => {});

    // Always return the URL so the user can click it directly if SMS fails
    return NextResponse.json({ ok: true, url });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
