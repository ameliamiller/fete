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

  return (
    <EditEventForm
      id={event.id}
      initial={{
        title: event.title,
        emoji: event.emoji,
        date: event.date.toISOString(),
        location: event.location,
        description: event.description,
        hostName: event.hostName,
        cohostPhones: event.cohostPhones,
        slug: event.slug,
      }}
    />
  );
}
