"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
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

async function readSafeJson(res: Response) {
  const text = await res.text();
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

function LoginPageContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) return null;
    return createClient(url, anonKey);
  }, []);

  async function handleLogin() {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error("Supabase-Umgebungsvariablen fehlen.");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      const session = data.session;
      if (!session?.access_token) {
        throw new Error("Keine Sitzung zurückgegeben.");
      }

      const meRes = await fetch("/api/me", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      const { json, text } = await readSafeJson(meRes);
      const meJson = json as MeResponse | null;

      if (!meRes.ok) {
        const backendError =
          meJson && "error" in meJson
            ? meJson.error
            : text || `Anfrage fehlgeschlagen mit Status ${meRes.status}`;
        throw new Error(backendError);
      }

      if (!meJson || !("ok" in meJson) || !meJson.ok) {
        throw new Error("Ungültige Antwort von /api/me");
      }

      const finalRole = meJson.user.role;
      const defaultTarget = dashboardFor(finalRole);

      let target = defaultTarget;
      if (next && isAllowedNext(next, finalRole)) {
        target = next;
      }

      window.location.href = target;
    } catch (err: any) {
      setError(err?.message ?? "Anmeldung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }

  const inputClassName =
    "w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10";

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-neutral-100 px-4 py-8 sm:py-10">
      <div className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-8">
        <h1 className="mb-2 text-center text-2xl font-semibold text-gray-900 sm:text-3xl">
          Anmelden
        </h1>

        <p className="mb-6 text-center text-sm leading-6 text-gray-600">
          Greife auf dein Dashboard zu und setze deine Arbeit fort.
        </p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="E-Mail"
            className={inputClassName}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
          />

          <input
            type="password"
            placeholder="Passwort"
            className={inputClassName}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <div className="mt-5 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <Link href="/forgot-password" className="text-gray-700 underline underline-offset-2">
            Passwort vergessen?
          </Link>

          <Link href="/register" className="text-gray-700 underline underline-offset-2">
            Konto erstellen
          </Link>
        </div>

        {error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Anmeldung läuft..." : "Anmelden"}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-neutral-100 px-4 py-8 sm:py-10">
          <div className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-8">
            <h1 className="mb-2 text-center text-2xl font-semibold text-gray-900 sm:text-3xl">
              Anmelden
            </h1>
            <p className="text-center text-sm text-gray-600">Lädt...</p>
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}