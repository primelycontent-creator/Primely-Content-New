"use client";

import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type Role = "brand" | "creator";

function dashboardFor(role: Role) {
  if (role === "brand") return "/brand/dashboard";
  return "/creator/dashboard";
}

export default function LegalAcceptBar({ role }: { role: Role }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) return null;
    return createClient(url, anonKey);
  }, []);

  async function handleAccept() {
    try {
      setLoading(true);
      setError(null);

      if (!checked) {
        throw new Error("Please confirm that you have read and accept all legal documents.");
      }

      if (!supabase) {
        throw new Error("Supabase environment variables are missing.");
      }

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const res = await fetch("/api/legal/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          acceptTerms: true,
          acceptPrivacy: true,
          acceptAgb: true,
        }),
      });

      const text = await res.text();
      let json: any = null;

      try {
        json = JSON.parse(text);
      } catch {}

      if (!res.ok) {
        throw new Error(json?.error ?? text ?? "Could not accept legal documents.");
      }

      router.push(dashboardFor(role));
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Could not accept legal documents.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-10 rounded-3xl border bg-white p-6 shadow-sm">
      <label className="flex items-start gap-3 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-1"
        />
        <span>
          I have read and accept the current Terms of Service, Privacy Policy and AGB.
        </span>
      </label>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-5">
        <button
          type="button"
          onClick={handleAccept}
          disabled={loading || !checked}
          className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Accept and continue"}
        </button>
      </div>
    </div>
  );
}