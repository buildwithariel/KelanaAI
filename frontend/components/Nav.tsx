"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/trips", label: "Trip history" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 top-4 z-20 mx-auto w-full max-w-6xl px-4 sm:top-6 sm:px-6">
      <nav className="flex items-center justify-between gap-4 rounded-full border border-line bg-panel/90 px-4 py-3 shadow-lg shadow-black/30 backdrop-blur sm:px-6">
        <Link href="/" className="font-display text-base font-extrabold tracking-tight text-paper">
          Kelana<span className="text-signal">AI</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-2 font-board text-xs font-semibold uppercase tracking-[0.1em] transition sm:px-4 ${
                  active
                    ? "bg-signal/15 text-signal"
                    : "text-paper/75 hover:bg-white/5 hover:text-paper"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <Link
          href="/#plan"
          className="hidden rounded-full bg-signal px-4 py-2 font-board text-xs font-semibold uppercase tracking-[0.1em] text-ink transition hover:bg-signal/85 sm:inline-block"
        >
          Plan a trip
        </Link>
      </nav>
    </div>
  );
}
