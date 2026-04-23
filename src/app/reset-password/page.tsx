"use client";

import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) return null;
    return createClient(url, anonKey);
  }, []);

  const inputClassName =
    "w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10";

  async function handleUpdate() {
    try {
      setBusy(true);
      setError(null);

      if (!supabase) {
        throw new Error("Supabase-Umgebungsvariablen fehlen.");
      }

      if (password.length < 6) {
        throw new Error("Das Passwort muss mindestens 6 Zeichen lang sein.");
      }

      if (password !== confirm) {
        throw new Error("Die Passwörter stimmen nicht überein.");
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      router.push("/login");
    } catch (e: any) {
      setError(e?.message ?? "Das Passwort konnte nicht aktualisiert werden.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-neutral-100 px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-md rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
          Neues Passwort
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Vergib ein neues Passwort für dein Konto.
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="password"
            className={inputClassName}
            placeholder="Neues Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />

          <input
            type="password"
            className={inputClassName}
            placeholder="Neues Passwort wiederholen"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleUpdate}
          disabled={busy}
          className="mt-6 w-full rounded-xl bg-emerald-950 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
        >
          {busy ? "Wird aktualisiert..." : "Passwort aktualisieren"}
        </button>
      </div>
    </div>
  );
}