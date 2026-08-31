"use client";

import { useRouter } from "next/navigation";
import Nav from "../../components/Nav";
import { useAuth } from "../AuthProvider";
import RequireAuth from "../RequireAuth";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

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

          <div className="mt-8 rounded-xl border border-line bg-panel/50 p-7">
            <p className="font-board text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">
              Email
            </p>
            <p className="mt-2 font-display text-xl font-semibold">{user?.email}</p>
          </div>

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
