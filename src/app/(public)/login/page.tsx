"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

type Role = "BRAND" | "CREATOR" | "STAFF";

function dashboardFor(role: Role) {
  if (role === "BRAND") return "/brand/dashboard";
  if (role === "CREATOR") return "/creator/dashboard";
  return "/staff/dashboard";
}

function LoginPageContent() {
  const searchParams = useSearchParams();

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

      const user = data.user;
      const metadata = user.user_metadata ?? {};
      const role = String(metadata.role ?? "").toUpperCase() as Role;

      if (!user?.id || !user.email || !role) {
        throw new Error("Ungültiger Benutzer.");
      }

      // 🔥 Sync IMMER beim Login ausführen
      await fetch("/api/auth/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          role,
          companyName: metadata.companyName ?? null,
          contactPerson: metadata.contactPerson ?? null,
          phone: metadata.phone ?? null,
          displayName: metadata.fullName ?? null,
          acceptedTerms: metadata.acceptedTerms === true,
          acceptedPrivacy: metadata.acceptedPrivacy === true,
        }),
      });

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
        <h1 className="text-center text-2xl font-semibold mb-4">
          Anmelden
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="E-Mail"
            className={inputClassName}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Passwort"
            className={inputClassName}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-600">{error}</div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-black py-3 text-white"
        >
          {loading ? "Lädt..." : "Anmelden"}
        </button>

        <div className="mt-4 text-sm text-center">
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