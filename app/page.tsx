import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center gap-6">
      <h1 className="text-6xl" style={{ fontFamily: "Garamond, 'EB Garamond', Georgia, serif", fontWeight: 400 }}>
        fete
      </h1>

      <div className="flex flex-col gap-3 w-full max-w-[280px]">
        <Link
          href="/create"
          className="w-full border border-black text-black text-center py-4 font-bold text-sm tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
        >
          Create an event
        </Link>
        <Link
          href="/login"
          className="w-full border border-black text-black text-center py-4 font-bold text-sm tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
        >
          View my events
        </Link>
      </div>
    </main>
  );
}
