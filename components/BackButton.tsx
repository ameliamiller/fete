import Link from "next/link";

export function BackButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-gray-400 hover:text-black transition-colors text-sm pt-5 pb-1"
    >
      ←
    </Link>
  );
}
