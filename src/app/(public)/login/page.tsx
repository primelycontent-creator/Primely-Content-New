"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

type Role = "BRAND" | "CREATOR" | "STAFF";

type MeResponse =
  | {
      ok: true;
      user: {
        id: string;
        email: string;
        role: Role;
      };
    }
  | {
      error: string;
    };

function dashboardFor(role: Role) {
  if (role === "BRAND") return "/brand/dashboard";
  if (role === "CREATOR") return "/creator/dashboard";
  return "/staff/dashboard";
}

function isAllowedNext(next: string | null, role: Role) {
  if (!next) return false;
  if (!next.startsWith("/")) return false;

  if (role === "BRAND") return next.startsWith("/brand");
  if (role === "CREATOR") return next.startsWith("/creator");
  if (role === "STAFF") return next.startsWith("/staff");

  return false;
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return null;
    }

    return createClient(url, anonKey);
  }, []);

  async function handleLogin() {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error("Supabase environment variables are missing.");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      const session = data.session;
      if (!session?.access_token) {
        throw new Error("No session returned");
      }

      const meRes = await fetch("/api/me", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      const meJson = (await meRes.json()) as MeResponse;

      if (!meRes.ok || !("ok" in meJson) || !meJson.ok) {
        throw new Error("Could not load your account role.");
      }

      const finalRole = meJson.user.role;
      const defaultTarget = dashboardFor(finalRole);

      let target: string = defaultTarget;
      if (next && isAllowedNext(next, finalRole)) {
        target = next;
      }

      window.location.href = target;
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-neutral-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-2 text-center text-3xl font-semibold">Log in</h1>
        <p className="mb-6 text-center text-sm text-gray-600">
          Access your dashboard and continue your workflow.
        </p>

        <input
          type="email"
          placeholder="Email"
          className="mb-4 w-full rounded-lg border p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <input
          type="password"
          placeholder="Password"
          className="mb-4 w-full rounded-lg border p-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <div className="mb-6 flex items-center justify-between text-sm">
          <Link href="/forgot-password" className="text-gray-700 underline">
            Forgot password?
          </Link>
          <Link href="/register" className="text-gray-700 underline">
            Create account
          </Link>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-lg bg-black py-3 text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </div>
    </div>
  );
}