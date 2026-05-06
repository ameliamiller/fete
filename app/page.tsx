import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center gap-6">
      <h1 className="text-5xl font-black tracking-tight">fete</h1>

      <div className="flex flex-col gap-3 w-full max-w-[300px]">
        <Link
          href="/create"
          className="w-full bg-black text-white text-center py-4 font-bold text-base tracking-wide hover:bg-gray-900 active:bg-gray-800 transition-colors"
        >
          Create an event ✨
        </Link>
        <Link
          href="/login"
          className="w-full border border-black text-black text-center py-4 font-bold text-base tracking-wide hover:bg-black hover:text-white transition-colors"
        >
          View my events
        </Link>
      </div>
    </main>
  );
}
