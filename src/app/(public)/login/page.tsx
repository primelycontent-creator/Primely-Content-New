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

async function readSafeJson(res: Response) {
  const text = await res.text();
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

function LoginPageContent() {
  useSearchParams();

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

      const role = meJson.user.role;

      window.location.href = dashboardFor(role);
    } catch (err: any) {
      setError(err?.message ?? "Anmeldung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }

  const inputClassName =
    "w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-black focus:ring-2 focus:ring-black/10";

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-center text-2xl font-semibold">
          Anmelden
        </h1>

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

        {error ? <div className="mt-4 text-sm text-red-600">{error}</div> : null}

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-black py-3 text-white disabled:opacity-60"
        >
          {loading ? "Lädt..." : "Anmelden"}
        </button>

        <div className="mt-4 text-center text-sm">
          <Link href="/register" className="underline">
            Konto erstellen
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}