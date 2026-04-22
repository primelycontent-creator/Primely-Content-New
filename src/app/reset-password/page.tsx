"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpdate() {
    try {
      setBusy(true);
      setError(null);

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      if (password !== confirm) {
        throw new Error("Passwords do not match.");
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      router.push("/login");
    } catch (e: any) {
      setError(e?.message ?? "Password update failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-gray-900">New password</h1>
        <p className="mt-3 text-sm text-gray-600">
          Set a new password for your account.
        </p>

        <input
          type="password"
          className="mt-6 w-full rounded-xl border p-3"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          className="mt-4 w-full rounded-xl border p-3"
          placeholder="Repeat new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          onClick={handleUpdate}
          disabled={busy}
          className="mt-6 w-full rounded-xl bg-emerald-950 p-3 text-white disabled:opacity-60"
        >
          {busy ? "Updating..." : "Update password"}
        </button>
      </div>
    </div>
  );
}