import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing", req.url));
  }

  const link = await prisma.magicLink.findUnique({ where: { token } });

  if (!link || link.usedAt || link.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/login?error=expired", req.url));
  }

  await prisma.magicLink.update({
    where: { token },
    data: { usedAt: new Date() },
  });

  const response = NextResponse.redirect(new URL("/my-events", req.url));
  response.cookies.set("fete_host", link.phone, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return response;
}
