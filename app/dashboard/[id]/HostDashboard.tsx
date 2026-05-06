"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { displayPhone } from "@/lib/phone";

type RsvpStatus = "GOING" | "MAYBE" | "NOT_GOING";

interface Rsvp {
  id: string;
  name: string;
  phone: string;
  status: string;
  smsOptIn: boolean;
  createdAt: string;
}

interface Message {
  id: string;
  toName: string;
  toPhone: string;
  body: string;
  sentAt: string;
}

interface EventData {
  id: string;
  title: string;
  emoji: string;
  date: string;
  location: string;
  description: string;
  hostName: string;
}

interface Props {
  event: EventData;
  rsvps: Rsvp[];
  messages: Message[];
  justCreated: boolean;
}

const STATUS_LABEL: Record<RsvpStatus, string> = {
  GOING: "✅ Going",
  MAYBE: "🤔 Maybe",
  NOT_GOING: "😢 Can't make it",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function HostDashboard({
  event,
  rsvps,
  messages: initialMessages,
  justCreated,
}: Props) {
  const eventUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/event/${event.id}`
      : `/event/${event.id}`;

  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"rsvps" | "messages">("rsvps");
  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderResult, setReminderResult] = useState<string | null>(null);
  const [messages, setMessages] = useState(initialMessages);

  async function copyLink() {
    await navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function sendReminders() {
    setReminderLoading(true);
    setReminderResult(null);
    try {
      const res = await fetch(`/api/reminders/${event.id}`, {
        method: "POST",
      });
      const data = await res.json();

      // Refresh messages
      const eventRes = await fetch(`/api/events/${event.id}`);
      const eventData = await eventRes.json();
      setMessages(
        eventData.messages.map((m: { id: string; toName: string; toPhone: string; body: string; sentAt: string }) => ({
          ...m,
          sentAt: m.sentAt,
        }))
      );

      setReminderResult(
        `📤 ${data.sent} reminder${data.sent !== 1 ? "s" : ""} sent${
          data.failed > 0 ? `, ${data.failed} failed` : ""
        }.`
      );
      setTab("messages");
    } catch {
      setReminderResult("⚠️ Failed to send reminders.");
    } finally {
      setReminderLoading(false);
    }
  }

  const going = rsvps.filter((r) => r.status === "GOING").length;
  const maybe = rsvps.filter((r) => r.status === "MAYBE").length;
  const notGoing = rsvps.filter((r) => r.status === "NOT_GOING").length;
  const smsEligible = rsvps.filter(
    (r) => r.status === "GOING" || r.status === "MAYBE"
  ).length;

  return (
    <main className="px-5 pb-12">
      {/* Header */}
      <div className="py-8 border-b border-black">
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{event.emoji}</span>
            <div>
              <h1 className="text-xl font-black leading-tight">{event.title}</h1>
              <p className="text-xs text-gray-500">{formatDate(event.date)} · {event.location}</p>
            </div>
          </div>
          <a
            href={`/dashboard/${event.id}/edit`}
            className="text-xs font-bold border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors shrink-0"
          >
            Edit
          </a>
        </div>
      </div>

      {/* Just created banner */}
      {justCreated && (
        <div className="mt-4 border-2 border-black px-4 py-3 bg-black text-white">
          <p className="font-bold text-sm">Your event is live!</p>
          <p className="text-xs mt-0.5 text-gray-300">
            Copy the link below and text it to your friends.
          </p>
        </div>
      )}

      {/* Share link */}
      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-widest mb-2">
          Invite link
        </p>
        <div className="flex gap-2">
          <div className="flex-1 border border-black px-3 py-3 text-sm truncate text-gray-500 bg-gray-50 select-all">
            {eventUrl}
          </div>
          <button
            onClick={copyLink}
            className="border border-black px-4 py-3 text-sm font-bold whitespace-nowrap hover:bg-black hover:text-white transition-colors"
          >
            {copied ? "✅ Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mt-5">
        {[
          { label: "Going", value: going, emoji: "✅" },
          { label: "Maybe", value: maybe, emoji: "🤔" },
          { label: "No", value: notGoing, emoji: "😢" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border border-black p-3 text-center"
          >
            <div className="text-xl font-black">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {stat.emoji} {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Reminder button */}
      {smsEligible > 0 && (
        <div className="mt-5">
          <Button
            variant="outline"
            loading={reminderLoading}
            onClick={sendReminders}
          >
            📤 Send reminders ({smsEligible} opted in)
          </Button>
          {reminderResult && (
            <p className="text-xs text-gray-600 text-center mt-2">
              {reminderResult}
            </p>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 mt-6 border border-black">
        {(["rsvps", "messages"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
              tab === t ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"
            }`}
          >
            {t === "rsvps" ? `RSVPs (${rsvps.length})` : `Messages (${messages.length})`}
          </button>
        ))}
      </div>

      {/* RSVP list */}
      {tab === "rsvps" && (
        <div className="mt-2">
          {rsvps.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-400">
              <p>No RSVPs yet.</p>
              <p className="text-xs mt-1">Share the link above to get started.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-200">
              {rsvps.map((rsvp) => (
                <div key={rsvp.id} className="py-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm">{rsvp.name}</p>
                    <p className="text-xs text-gray-400">
                      {displayPhone(rsvp.phone)}
                    </p>
                  </div>
                  <span className="text-xs font-bold whitespace-nowrap">
                    {STATUS_LABEL[rsvp.status as RsvpStatus] ?? rsvp.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Message log */}
      {tab === "messages" && (
        <div className="mt-2">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-400">
              <p>No mock messages yet.</p>
              <p className="text-xs mt-1">
                Send reminders above to see them here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-200">
              {messages.map((msg) => (
                <div key={msg.id} className="py-3">
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="font-bold text-sm">
                      {msg.toName}{" "}
                      <span className="font-normal text-gray-400">
                        {displayPhone(msg.toPhone)}
                      </span>
                    </p>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(msg.sentAt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 border border-gray-200 px-3 py-2">
                    {msg.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
