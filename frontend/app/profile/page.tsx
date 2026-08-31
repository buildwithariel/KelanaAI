"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Board from "../../components/Board";
import Nav from "../../components/Nav";
import { authFetch } from "../lib/auth";
import { useAuth } from "../AuthProvider";
import RequireAuth from "../RequireAuth";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [tripCount, setTripCount] = useState<number | null>(null);

  useEffect(() => {
    authFetch("/api/v1/trips")
      .then((response) => (response.ok ? response.json() : []))
      .then((trips: unknown[]) => setTripCount(trips.length))
      .catch(() => setTripCount(0));
  }, []);

  function onLogout() {
    logout();
    router.push("/login");
  }

  return (
    <RequireAuth>
      <main className="flex-1">
        <Nav />

        <section className="mx-auto max-w-md px-6 pb-20 pt-40">
          <p className="font-board text-[10px] font-semibold uppercase tracking-[0.28em] text-signal">
            Your account
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold uppercase tracking-tight">
            Profile
          </h1>

          <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
            <Board label="Name" value={user?.name ?? "—"} />
            <Board label="Email" value={user?.email ?? "—"} />
            <Board label="Total trips generated" value={tripCount === null ? "…" : String(tripCount)} />
          </dl>

          <button
            type="button"
            onClick={onLogout}
            className="mt-8 rounded-full border border-signal/50 px-5 py-2.5 font-board text-[12px] font-semibold uppercase tracking-[0.16em] text-signal transition hover:bg-signal hover:text-ink"
          >
            Log out
          </button>
        </section>
      </main>
    </RequireAuth>
  );
}
