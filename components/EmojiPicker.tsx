"use client";

import { useMemo, useState } from "react";
interface EmojiEntry {
  id: string;
  name: string;
  keywords: string[];
  skins: { native: string }[];
}

interface EmojiData {
  emojis: Record<string, EmojiEntry>;
}

import rawData from "@emoji-mart/data";
const data = rawData as unknown as EmojiData;

// Build a flat array once at module level so it never re-runs
const ALL: { native: string; keywords: string }[] = Object.values(
  data.emojis
).map((e) => ({
  native: e.skins[0].native,
  keywords: [e.name, ...(e.keywords ?? [])].join(" ").toLowerCase(),
}));

interface Props {
  selected: string[];
  onChange: (emojis: string[]) => void;
}

export function EmojiPicker({ selected, onChange }: Props) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL;
    return ALL.filter((e) => e.keywords.includes(q));
  }, [query]);

  function toggle(native: string) {
    if (selected.includes(native)) {
      onChange(selected.filter((e) => e !== native));
    } else {
      onChange([...selected, native]);
    }
  }

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest mb-2">
        Emoji
      </label>

      {/* Selected row */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2 min-h-[2rem]">
          {selected.map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => toggle(em)}
              className="text-xl border border-black px-1.5 py-0.5 bg-black hover:bg-gray-800 transition-colors"
              title="Remove"
            >
              {em}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-gray-400 underline self-center ml-1"
          >
            clear
          </button>
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Search every emoji: party, food, fire…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-2"
      />

      {/* Grid */}
      <div className="grid grid-cols-8 gap-0.5 max-h-40 overflow-y-auto border border-gray-200 p-1">
        {visible.length === 0 ? (
          <p className="col-span-8 text-xs text-gray-400 py-3 text-center">
            No results.
          </p>
        ) : (
          visible.map(({ native }) => (
            <button
              key={native}
              type="button"
              onClick={() => toggle(native)}
              className={`text-2xl p-1 transition-colors leading-none ${
                selected.includes(native)
                  ? "bg-black"
                  : "hover:bg-gray-100"
              }`}
              aria-label={native}
            >
              {native}
            </button>
          ))
        )}
      </div>

      <p className="text-xs text-gray-400 mt-1">
        Tap to select · tap again to remove
      </p>
    </div>
  );
}
