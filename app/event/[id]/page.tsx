import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EventRsvpView } from "./EventRsvpView";
import type { Metadata } from "next";
import { formatDateShortET } from "@/lib/dates";

export const dynamic = "force-dynamic";

function formatDateShort(date: Date) {
  return formatDateShortET(date);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return { title: "fete" };

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://fete-xi.vercel.app";
  const title = `${event.emoji} ${event.title}`;
  const description = `${formatDateShort(event.date)} · ${event.location} · hosted by ${event.hostName}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`${base}/api/og?id=${id}`],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${base}/api/og?id=${id}`],
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { rsvps: true, wallPosts: { orderBy: { createdAt: "asc" } } },
  });

  if (!event) notFound();

  const going = event.rsvps.filter((r) => r.status === "GOING").length;

  return (
    <EventRsvpView
      event={{
        id: event.id,
        title: event.title,
        emoji: event.emoji,
        date: event.date.toISOString(),
        location: event.location,
        description: event.description,
        hostName: event.hostName,
      }}
      going={going}
      wallPosts={event.wallPosts.map((p) => ({
        id: p.id,
        name: p.name,
        message: p.message,
        x: p.x,
        y: p.y,
      }))}
    />
  );
}
