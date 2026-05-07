"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export interface WallPost {
  id: string;
  name: string;
  message: string;
  x: number;
  y: number;
}

interface Draft {
  x: number;
  y: number;
}

interface Props {
  eventId: string;
  userName: string;
  initialPosts: WallPost[];
}

export function BathroomWall({ eventId, userName, initialPosts }: Props) {
  const [posts, setPosts] = useState<WallPost[]>(initialPosts);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [draftText, setDraftText] = useState("");
  const [saving, setSaving] = useState(false);
  const wallRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (draft && inputRef.current) {
      inputRef.current.focus();
    }
  }, [draft]);

  const handleWallClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Ignore clicks on existing posts or the active input
      if ((e.target as HTMLElement).closest("[data-wall-post]")) return;
      if ((e.target as HTMLElement).closest("[data-wall-input]")) return;

      const rect = wallRef.current!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // If there's already a draft with empty text, just move it
      setDraft({ x, y });
      setDraftText("");
    },
    []
  );

  async function submitDraft() {
    if (!draft || !draftText.trim() || saving) return;
    setSaving(true);
    const optimisticId = `temp-${Date.now()}`;
    const optimistic: WallPost = {
      id: optimisticId,
      name: userName,
      message: draftText.trim(),
      x: draft.x,
      y: draft.y,
    };
    setPosts((p) => [...p, optimistic]);
    setDraft(null);
    setDraftText("");

    try {
      const res = await fetch(`/api/wall/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          message: draftText.trim(),
          x: draft.x,
          y: draft.y,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setPosts((p) => p.map((post) => (post.id === optimisticId ? saved : post)));
      }
    } catch {
      // keep optimistic post visible even on error
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitDraft();
    }
    if (e.key === "Escape") {
      setDraft(null);
      setDraftText("");
    }
  }

  return (
    <div className="mt-8">
      <p className="text-xs font-bold uppercase tracking-widest mb-3">
        Wall
      </p>
      <div
        ref={wallRef}
        onClick={handleWallClick}
        className="relative w-full border border-black bg-white overflow-hidden cursor-crosshair select-none"
        style={{ height: 380 }}
      >
        {/* hint */}
        {posts.length === 0 && !draft && (
          <p className="absolute inset-0 flex items-center justify-center text-xs text-gray-300 pointer-events-none">
            tap anywhere to leave a note
          </p>
        )}

        {/* existing posts */}
        {posts.map((post) => (
          <div
            key={post.id}
            data-wall-post
            className="absolute max-w-[140px] pointer-events-none"
            style={{
              left: `${post.x}%`,
              top: `${post.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <p className="text-sm leading-snug break-words whitespace-pre-wrap">
              {post.message}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">— {post.name}</p>
          </div>
        ))}

        {/* active draft input */}
        {draft && (
          <div
            data-wall-input
            className="absolute"
            style={{
              left: `${draft.x}%`,
              top: `${draft.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <textarea
              ref={inputRef}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="write something…"
              maxLength={280}
              rows={2}
              className="w-36 text-sm bg-transparent border-0 border-b border-black resize-none focus:outline-none placeholder-gray-300 leading-snug"
            />
          </div>
        )}
      </div>
      <p className="text-[10px] text-gray-300 mt-1">
        tap anywhere · enter to post · esc to cancel
      </p>
    </div>
  );
}
