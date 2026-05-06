import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { displayPhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function MyEventsPage() {
  const cookieStore = await cookies();
  const phone = cookieStore.get("fete_host")?.value;

  if (!phone) redirect("/login");

  const events = await prisma.event.findMany({
    where: {
      OR: [
        { hostPhone: phone },
        { cohostPhones: { has: phone } },
      ],
    },
    include: { rsvps: true },
    orderBy: { date: "desc" },
  });

  return (
    <main className="px-5 pb-12">
      <div className="py-8 border-b border-black">
        <h1 className="text-2xl font-black">Your events</h1>
        <p className="text-sm text-gray-500 mt-1">{displayPhone(phone)}</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-4">
          <p className="text-gray-400 text-sm">No events yet.</p>
          <Link
            href="/create"
            className="bg-black text-white px-6 py-3 font-bold text-sm hover:bg-gray-900 transition-colors"
          >
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-gray-200">
          {events.map((event) => {
            const going = event.rsvps.filter((r) => r.status === "GOING").length;
            const maybe = event.rsvps.filter((r) => r.status === "MAYBE").length;
            const isPast = event.date < new Date();
            return (
              <Link
                key={event.id}
                href={`/dashboard/${event.id}`}
                className="py-4 flex items-center justify-between gap-3 hover:bg-gray-50 -mx-5 px-5 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0">{event.emoji}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{event.title}</p>
                    <p className={`text-xs mt-0.5 ${isPast ? "text-gray-400" : "text-gray-600"}`}>
                      {formatDate(event.date)}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 shrink-0 text-right">
                  {going > 0 && <div>✅ {going}</div>}
                  {maybe > 0 && <div>🤔 {maybe}</div>}
                  {going === 0 && maybe === 0 && <div className="text-gray-300">—</div>}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/create"
          className="w-full bg-black text-white text-center py-4 font-bold text-base hover:bg-gray-900 transition-colors"
        >
          Create new event
        </Link>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full text-xs text-gray-400 py-2 hover:text-black transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
