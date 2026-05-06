import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EventRsvpView } from "./EventRsvpView";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

function formatDateShort(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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
    include: { rsvps: true },
  });

  if (!event) notFound();

  const going = event.rsvps.filter((r) => r.status === "GOING").length;
  const maybe = event.rsvps.filter((r) => r.status === "MAYBE").length;

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
      maybe={maybe}
    />
  );
}
