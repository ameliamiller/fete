"use client";

import { useState } from "react";
import { isValidPhone, formatPhone, displayPhone } from "@/lib/phone";

interface Props {
  cohosts: string[];
  onChange: (cohosts: string[]) => void;
}

export function CohostInput({ cohosts, onChange }: Props) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  function add() {
    setError("");
    if (!isValidPhone(input)) {
      setError("Enter a valid phone number.");
      return;
    }
    const formatted = formatPhone(input);
    if (cohosts.includes(formatted)) {
      setError("Already added.");
      return;
    }
    onChange([...cohosts, formatted]);
    setInput("");
  }

  function remove(phone: string) {
    onChange(cohosts.filter((p) => p !== phone));
  }

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest mb-2">
        Co-hosts
      </label>
      <p className="text-xs text-gray-400 mb-3">
        Co-hosts can see and manage this event from their own dashboard.
      </p>

      {cohosts.length > 0 && (
        <div className="flex flex-col gap-1 mb-3">
          {cohosts.map((phone) => (
            <div
              key={phone}
              className="flex items-center justify-between border border-gray-200 px-3 py-2"
            >
              <span className="text-sm">{displayPhone(phone)}</span>
              <button
                type="button"
                onClick={() => remove(phone)}
                className="text-xs text-gray-400 hover:text-black transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="tel"
          placeholder="(555) 867-5309"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          className="flex-1"
        />
        <button
          type="button"
          onClick={add}
          className="border border-black px-4 py-3 text-sm font-bold hover:bg-black hover:text-white transition-colors whitespace-nowrap"
        >
          Add
        </button>
      </div>
      {error && <p className="text-xs text-gray-500 mt-1">⚠️ {error}</p>}
    </div>
  );
}
