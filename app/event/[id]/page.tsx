import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EventRsvpView } from "./EventRsvpView";

export const dynamic = "force-dynamic";

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
