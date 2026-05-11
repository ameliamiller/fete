import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function SlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) notFound();
  redirect(`/event/${event.id}`);
}
