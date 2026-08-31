"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "./AuthProvider";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "ready" && !user) router.replace("/login");
  }, [status, user, router]);

  if (!user) {
    return (
      <main className="flex-1">
        <p className="mx-auto mt-32 max-w-6xl px-6 text-center font-board text-[12px] uppercase tracking-[0.2em] text-mist">
          {status === "loading" ? "Checking your session" : "Redirecting to login"}
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
