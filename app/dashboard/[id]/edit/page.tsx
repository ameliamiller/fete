import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditEventForm } from "./EditEventForm";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();

  // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
  const localDate = new Date(event.date.getTime() - event.date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <EditEventForm
      id={event.id}
      initial={{
        title: event.title,
        emoji: event.emoji,
        date: localDate,
        location: event.location,
        description: event.description,
        hostName: event.hostName,
        cohostPhones: event.cohostPhones,
      }}
    />
  );
}
