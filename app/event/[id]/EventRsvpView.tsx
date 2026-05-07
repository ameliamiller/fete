"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/Button";
import { formatDateET } from "@/lib/dates";

type RsvpStatus = "GOING" | "NOT_GOING";

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
  going: number;
}

const STATUS_OPTIONS: { value: RsvpStatus; label: string }[] = [
  { value: "GOING", label: "yes :)" },
  { value: "NOT_GOING", label: "no :(" },
];

function formatDate(iso: string) {
  return formatDateET(iso);
}

export function EventRsvpView({ event, going }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<RsvpStatus | null>(null);
  const smsOptIn = true;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [doneStatus, setDoneStatus] = useState<RsvpStatus | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!status) {
      setError("Please pick your RSVP status.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          name,
          phone,
          status,
          smsOptIn,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setDone(true);
      setDoneStatus(status);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    const isGoing = doneStatus === "GOING";
    return (
      <main className="px-5 pb-12">
        <div className="flex flex-col items-center gap-6 py-12 text-center">
          <p className="text-lg font-normal">
            {isGoing ? "see you there :)" : "Maybe next time!"}
          </p>
          <div className="border border-black px-5 py-4 text-left w-full">
            <p className="font-black text-lg">{event.emoji} {event.title}</p>
            <p className="text-sm text-gray-600 mt-2">{formatDate(event.date)}</p>
            <p className="text-sm text-gray-600 mt-1">{event.location}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="px-5 pb-12">
      {/* Event card */}
      <div className="py-8 border-b border-black">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl">{event.emoji}</span>
          <div>
            <h1 className="text-2xl font-black leading-tight">{event.title}</h1>
            <p className="text-sm text-gray-500">hosted by {event.hostName}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-4 text-sm">
          <div className="flex gap-2">
            <span>📅</span>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex gap-2">
            <span>📍</span>
            <span>{event.location}</span>
          </div>
        </div>

        {event.description && (
          <p className="mt-4 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
            {event.description}
          </p>
        )}

        {going > 0 && (
          <div className="flex gap-4 mt-4 text-xs font-bold uppercase tracking-widest">
            <span>✅ {going} going</span>
          </div>
        )}
      </div>

      {/* RSVP form */}
      <div className="pt-6">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4">
          Your RSVP
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1">
              Your name
            </label>
            <input
              type="text"
              placeholder="Jordan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={60}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1">
              Your phone number
            </label>
            <input
              type="tel"
              placeholder="(555) 867-5309"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          {/* Status picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">
              Are you going?
            </label>
            <div className="flex gap-3">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={`flex-1 py-3 text-sm font-bold border transition-colors ${
                    status === opt.value
                      ? "border-black bg-black text-white"
                      : "border-black bg-white text-black hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm font-medium border border-black px-3 py-2 bg-gray-50">
              ⚠️ {error}
            </p>
          )}

          <Button type="submit" loading={loading}>
            RSVP
          </Button>
        </form>
      </div>
    </main>
  );
}
