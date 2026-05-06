"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { EmojiPicker } from "@/components/EmojiPicker";

export default function CreateEvent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emojis, setEmojis] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
    hostName: "",
    hostPhone: "",
  });

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, emoji: emojis.join("") || "🎉" }),
      });
      let data: { id?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        setError(
          `Server error (${res.status}). Make sure the database is set up: run npm run db:push.`
        );
        return;
      }
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      router.push(`/dashboard/${data.id}?created=1`);
    } catch {
      setError("Could not reach the server. Is npm run dev running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="px-5 pb-12">
      <PageHeader
        emoji=""
        title="New event"
        subtitle="Fill in the details and share the link."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <EmojiPicker selected={emojis} onChange={setEmojis} />

        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">
            Event name
          </label>
          <input
            type="text"
            placeholder="Summer rooftop party"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
            maxLength={80}
          />
        </div>

        {/* Date */}
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

        {/* Location */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">
            Location
          </label>
          <input
            type="text"
            placeholder="123 Anywhere St, Brooklyn NY"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            required
            maxLength={120}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">
            Description{" "}
            <span className="normal-case font-normal text-gray-400">
              (optional)
            </span>
          </label>
          <textarea
            placeholder="BYOB, dress code: all white, bring a snack to share…"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full border border-black px-3 py-3 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black text-base resize-none"
          />
        </div>

        <hr className="border-black" />

        {/* Host name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">
            Your name
          </label>
          <input
            type="text"
            placeholder="Alex"
            value={form.hostName}
            onChange={(e) => set("hostName", e.target.value)}
            required
            maxLength={60}
          />
        </div>

        {/* Host phone */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">
            Your phone number
          </label>
          <input
            type="tel"
            placeholder="(555) 867-5309"
            value={form.hostPhone}
            onChange={(e) => set("hostPhone", e.target.value)}
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            So you can access your host dashboard.
          </p>
        </div>

        {error && (
          <p className="text-sm font-medium border border-black px-3 py-2 bg-gray-50">
            ⚠️ {error}
          </p>
        )}

        <Button type="submit" loading={loading}>
          Create event
        </Button>
      </form>
    </main>
  );
}
