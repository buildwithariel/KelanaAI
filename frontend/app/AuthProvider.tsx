"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authFetch, clearToken, setToken } from "./lib/auth";
import type { User } from "./lib/types";

type Status = "loading" | "ready";

type AuthContextValue = {
  user: User | null;
  status: Status;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

async function fetchMe(): Promise<User | null> {
  const response = await authFetch("/api/v1/auth/me");
  if (!response.ok) return null;
  return response.json();
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    fetchMe()
      .then((me) => {
        if (!me) clearToken();
        setUser(me);
      })
      .finally(() => setStatus("ready"));
  }, []);

  async function login(email: string, password: string) {
    const response = await authFetch("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error("Invalid email or password");
    const { access_token } = await response.json();
    setToken(access_token);
    setUser(await fetchMe());
  }

  async function register(name: string, email: string, password: string) {
    const response = await authFetch("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.detail ?? "Couldn't create your account");
    }
    await login(email, password);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
