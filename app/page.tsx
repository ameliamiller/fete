import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center gap-10">
      <h1 className="text-5xl font-black tracking-tight">fete</h1>

      <Link
        href="/create"
        className="w-full max-w-[300px] bg-black text-white text-center py-4 font-bold text-base tracking-wide hover:bg-gray-900 active:bg-gray-800 transition-colors"
      >
        Create an event ✨
      </Link>
    </main>
  );
}
