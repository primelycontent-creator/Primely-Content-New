"use client";

import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) return null;
    return createClient(url, anonKey);
  }, []);

  const inputClassName =
    "mt-6 w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10";

  async function handleReset() {
    try {
      setBusy(true);
      setError(null);
      setDone(false);

      if (!supabase) {
        throw new Error("Supabase-Umgebungsvariablen fehlen.");
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setDone(true);
    } catch (e: any) {
      setError(e?.message ?? "Die E-Mail zum Zurücksetzen konnte nicht gesendet werden.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-neutral-100 px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-md rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
          Passwort zurücksetzen
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Gib deine E-Mail-Adresse ein und wir senden dir einen sicheren Link zum Zurücksetzen deines Passworts.
        </p>

        <input
          className={inputClassName}
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          inputMode="email"
        />

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {error}
          </div>
        ) : null}

        {done ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
            Bitte prüfe dein E-Mail-Postfach. Wir haben dir einen Link zum Zurücksetzen geschickt.
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleReset}
          disabled={busy || !email.trim()}
          className="mt-6 w-full rounded-xl bg-emerald-950 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
        >
          {busy ? "Wird gesendet..." : "Link zum Zurücksetzen senden"}
        </button>
      </div>
    </div>
  );
}