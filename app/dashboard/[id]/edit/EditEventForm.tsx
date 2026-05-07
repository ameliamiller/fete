"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { EmojiPicker } from "@/components/EmojiPicker";
import { CohostInput } from "@/components/CohostInput";
import Link from "next/link";

interface Props {
  id: string;
  initial: {
    title: string;
    emoji: string;
    date: string;
    location: string;
    description: string;
    hostName: string;
    cohostPhones: string[];
  };
}

/** Convert a UTC ISO string to the local "YYYY-MM-DDTHH:MM" format for datetime-local inputs */
function utcIsoToLocalInput(utcIso: string): string {
  const d = new Date(utcIso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EditEventForm({ id, initial }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emojis, setEmojis] = useState<string[]>(
    initial.emoji ? Array.from(initial.emoji) : []
  );
  const [cohosts, setCohosts] = useState<string[]>(initial.cohostPhones);
  const [form, setForm] = useState({
    title: initial.title,
    date: utcIsoToLocalInput(initial.date),
    location: initial.location,
    description: initial.description,
    hostName: initial.hostName,
  });

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          // Convert local datetime string back to UTC ISO
          date: new Date(form.date).toISOString(),
          emoji: emojis.join("") || initial.emoji,
          cohostPhones: cohosts,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      router.push(`/dashboard/${id}`);
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="px-5 pb-12">
      <div className="py-8 flex items-center justify-between border-b border-black mb-6">
        <h1 className="text-2xl font-black">Edit event</h1>
        <Link href={`/dashboard/${id}`} className="text-sm text-gray-400 hover:text-black">
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <EmojiPicker selected={emojis} onChange={setEmojis} />

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">
            Event name
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
            maxLength={80}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">
            Date & time
          </label>
          <input
            type="datetime-local"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">
            Location
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            required
            maxLength={120}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">
            Description{" "}
            <span className="normal-case font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full border border-black px-3 py-3 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black text-base resize-none"
          />
        </div>

        <CohostInput cohosts={cohosts} onChange={setCohosts} />

        <hr className="border-black" />

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">
            Your name
          </label>
          <input
            type="text"
            value={form.hostName}
            onChange={(e) => set("hostName", e.target.value)}
            required
            maxLength={60}
          />
        </div>

        {error && (
          <p className="text-sm font-medium border border-black px-3 py-2 bg-gray-50">
            ⚠️ {error}
          </p>
        )}

        <Button type="submit" loading={loading}>
          Save changes
        </Button>
      </form>
    </main>
  );
}
