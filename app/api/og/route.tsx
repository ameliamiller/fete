import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { formatDateShortET } from "@/lib/dates";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  let title = "You're invited";
  let emoji = "🎉";
  let date = "";
  let location = "";
  let host = "";

  if (id) {
    try {
      const event = await prisma.event.findUnique({ where: { id } });
      if (event) {
        title = event.title;
        emoji = event.emoji;
        date = formatDateShortET(event.date);
        location = event.location;
        host = event.hostName;
      }
    } catch {
      // fall through to defaults
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#000",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: fete wordmark */}
        <div style={{ color: "#555", fontSize: "28px", fontWeight: 900, letterSpacing: "4px", textTransform: "uppercase" }}>
          fete
        </div>

        {/* Middle: emoji + title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ fontSize: "96px", lineHeight: 1 }}>{emoji}</div>
          <div
            style={{
              color: "#fff",
              fontSize: title.length > 30 ? "52px" : "68px",
              fontWeight: 900,
              lineHeight: 1.1,
              maxWidth: "900px",
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom: date, location, host */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {date && (
            <div style={{ color: "#ccc", fontSize: "28px", fontWeight: 600 }}>
              {date}
            </div>
          )}
          {location && (
            <div style={{ color: "#888", fontSize: "24px" }}>{location}</div>
          )}
          {host && (
            <div style={{ color: "#555", fontSize: "20px", marginTop: "8px" }}>
              hosted by {host}
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
