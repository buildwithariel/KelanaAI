"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../app/AuthProvider";

const LOGGED_IN_LINKS = [
  { href: "/", label: "Home" },
  { href: "/trips", label: "Trip history" },
  { href: "/profile", label: "Profile" },
];

const LOGGED_OUT_LINKS = [{ href: "/", label: "Home" }];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const links = user ? LOGGED_IN_LINKS : LOGGED_OUT_LINKS;

  function onLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="fixed inset-x-0 top-4 z-20 mx-auto w-full max-w-6xl px-4 sm:top-6 sm:px-6">
      <nav className="flex items-center justify-between gap-4 rounded-full border border-line bg-panel/90 px-4 py-3 shadow-lg shadow-black/30 backdrop-blur sm:px-6">
        <Link href="/" className="font-display text-base font-extrabold tracking-tight text-paper">
          Kelana<span className="text-signal">AI</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {links.map(({ href, label }) => {
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

        {user ? (
          <button
            type="button"
            onClick={onLogout}
            className="hidden rounded-full border border-line px-4 py-2 font-board text-xs font-semibold uppercase tracking-[0.1em] text-paper/75 transition hover:border-signal/40 hover:text-signal sm:inline-block"
          >
            Log out
          </button>
        ) : (
          <div className="hidden items-center gap-2 sm:flex">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 font-board text-xs font-semibold uppercase tracking-[0.1em] text-paper/75 transition hover:text-signal"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-signal px-4 py-2 font-board text-xs font-semibold uppercase tracking-[0.1em] text-ink transition hover:bg-signal/85"
            >
              Register
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
}
