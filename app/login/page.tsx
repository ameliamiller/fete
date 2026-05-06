"use client";

import { useState, FormEvent } from "react";
import { isValidPhone } from "@/lib/phone";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [mockUrl, setMockUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValidPhone(phone)) {
      setError("Enter a valid phone number.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setSent(true);
      if (data.mockUrl) setMockUrl(data.mockUrl);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center gap-6">
        <h1 className="text-2xl font-black">Check your texts 📱</h1>
        <p className="text-sm text-gray-500 max-w-[260px] leading-relaxed">
          We sent a login link to your phone. It expires in 15 minutes.
        </p>
        {mockUrl && (
          <div className="border border-black p-4 text-left w-full max-w-[360px]">
            <p className="text-xs font-bold uppercase tracking-widest mb-2 text-gray-400">
              Dev mode — no SMS sent
            </p>
            <a
              href={mockUrl}
              className="text-sm break-all underline"
            >
              {mockUrl}
            </a>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 gap-8">
      <div className="text-center">
        <h1 className="text-2xl font-black">View your events</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter the phone number you used to create events.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-[320px] flex flex-col gap-4">
        <input
          type="tel"
          placeholder="(555) 867-5309"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          autoFocus
        />
        {error && (
          <p className="text-sm font-medium border border-black px-3 py-2">
            ⚠️ {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-4 font-bold text-base disabled:opacity-40 hover:bg-gray-900 transition-colors"
        >
          {loading ? "Sending…" : "Text me a link"}
        </button>
      </form>
    </main>
  );
}
