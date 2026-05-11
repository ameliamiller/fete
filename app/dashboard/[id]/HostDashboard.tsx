"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { displayPhone } from "@/lib/phone";
import Link from "next/link";

type RsvpStatus = "GOING" | "NOT_GOING";

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
  shortUrl: string | null;
}

interface Props {
  event: EventData;
  rsvps: Rsvp[];
  messages: Message[];
  justCreated: boolean;
}

const STATUS_LABEL: Record<RsvpStatus, string> = {
  GOING: "✅ Going",
  NOT_GOING: "😭 Can't make it",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
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
  const [composing, setComposing] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sendingLoading, setSendingLoading] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [messages, setMessages] = useState(initialMessages);

  async function copyLink() {
    await navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function sendMessage() {
    if (!messageText.trim()) return;
    setSendingLoading(true);
    setSendResult(null);
    try {
      const res = await fetch(`/api/reminders/${event.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: messageText.trim() }),
      });
      const data = await res.json();

      const eventRes = await fetch(`/api/events/${event.id}`);
      const eventData = await eventRes.json();
      setMessages(
        eventData.messages.map((m: { id: string; toName: string; toPhone: string; body: string; sentAt: string }) => ({
          ...m,
        }))
      );

      setSendResult(
        `${data.sent} text${data.sent !== 1 ? "s" : ""} sent${data.failed > 0 ? `, ${data.failed} failed` : ""}.`
      );
      setMessageText("");
      setComposing(false);
      setTab("messages");
    } catch {
      setSendResult("⚠️ Failed to send.");
    } finally {
      setSendingLoading(false);
    }
  }

  const going = rsvps.filter((r) => r.status === "GOING").length;
  const notGoing = rsvps.filter((r) => r.status === "NOT_GOING").length;
  const smsEligible = rsvps.filter((r) => r.status === "GOING").length;

  return (
    <main className="px-5 pb-12">
      <Link href="/my-events" className="inline-flex items-center text-gray-400 hover:text-black transition-colors text-sm pt-5 pb-1">
        ←
      </Link>
      {/* Header */}
      <div className="py-4 border-b border-black">
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
        {event.description && (
          <p className="text-sm text-gray-600 mt-3 leading-relaxed whitespace-pre-wrap">
            {event.description}
          </p>
        )}
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
        {event.shortUrl && (
          <div className="border-2 border-black px-4 py-3 mb-2 flex items-center justify-between gap-3">
            <span className="font-mono text-base font-bold tracking-tight">{event.shortUrl}</span>
            <button
              onClick={() => { navigator.clipboard.writeText(event.shortUrl!); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="text-xs font-bold border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors shrink-0"
            >
              {copied ? "✅" : "Copy"}
            </button>
          </div>
        )}
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
      <div className="flex gap-4 mt-4">
        <span className="text-sm font-bold">✅ {going}</span>
        <span className="text-sm font-bold">😭 {notGoing}</span>
      </div>

      {/* Text guests */}
      {smsEligible > 0 && (
        <div className="mt-5">
          {!composing ? (
            <button
              onClick={() => setComposing(true)}
              className="w-full border border-black text-black text-sm font-bold px-5 py-1.5 hover:bg-black hover:text-white transition-colors"
            >
              Text guests
            </button>
          ) : (
            <div className="border border-black p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest">
                  To: {smsEligible} guest{smsEligible !== 1 ? "s" : ""} going
                </p>
                <button
                  onClick={() => { setComposing(false); setSendResult(null); }}
                  className="text-xs text-gray-400 hover:text-black"
                >
                  Cancel
                </button>
              </div>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Hey! Just a reminder about ${event.title}…`}
                rows={4}
                maxLength={320}
                className="w-full border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:border-black"
                autoFocus
              />
              <p className="text-xs text-gray-400 text-right -mt-1">{messageText.length}/320</p>
              <Button loading={sendingLoading} onClick={sendMessage} disabled={!messageText.trim()}>
                Send
              </Button>
            </div>
          )}
          {sendResult && (
            <p className="text-xs text-gray-600 text-center mt-2">{sendResult}</p>
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
