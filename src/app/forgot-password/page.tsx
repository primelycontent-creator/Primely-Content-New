"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleReset() {
    try {
      setBusy(true);
      setError(null);
      setDone(false);

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setDone(true);
    } catch (e: any) {
      setError(e?.message ?? "Could not send reset email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-gray-900">Reset password</h1>
        <p className="mt-3 text-sm text-gray-600">
          Enter your email and we will send you a secure reset link.
        </p>

        <input
          className="mt-6 w-full rounded-xl border p-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
        />

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {done ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Check your email inbox for the reset link.
          </div>
        ) : null}

        <button
          onClick={handleReset}
          disabled={busy || !email.trim()}
          className="mt-6 w-full rounded-xl bg-emerald-950 p-3 text-white disabled:opacity-60"
        >
          {busy ? "Sending..." : "Send reset link"}
        </button>
      </div>
    </div>
  );
}