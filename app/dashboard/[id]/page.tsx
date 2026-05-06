import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HostDashboard } from "./HostDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      rsvps: { orderBy: { createdAt: "asc" } },
      messages: { orderBy: { sentAt: "desc" } },
    },
  });

  if (!event) notFound();

  return (
    <HostDashboard
      event={{
        id: event.id,
        title: event.title,
        emoji: event.emoji,
        date: event.date.toISOString(),
        location: event.location,
        description: event.description,
        hostName: event.hostName,
      }}
      rsvps={event.rsvps.map((r) => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        status: r.status,
        smsOptIn: r.smsOptIn,
        createdAt: r.createdAt.toISOString(),
      }))}
      messages={event.messages.map((m) => ({
        id: m.id,
        toName: m.toName,
        toPhone: m.toPhone,
        body: m.body,
        sentAt: m.sentAt.toISOString(),
      }))}
      justCreated={created === "1"}
    />
  );
}
