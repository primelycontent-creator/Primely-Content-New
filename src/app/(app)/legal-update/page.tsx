"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type LegalRole = "BRAND" | "CREATOR";

type LegalStatusResponse = {
  ok: true;
  legal: {
    role: LegalRole;
    requiresAcceptance: boolean;
    current: {
      termsVersion: string;
      privacyVersion: string;
      agbVersion: string;
    };
    accepted: {
      termsVersion: string | null;
      privacyVersion: string | null;
      agbVersion: string | null;
      termsAcceptedAt: string | null;
      privacyAcceptedAt: string | null;
      agbAcceptedAt: string | null;
    };
    missing: {
      terms: boolean;
      privacy: boolean;
      agb: boolean;
    };
  };
};

async function readSafeJson(res: Response) {
  const text = await res.text();
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

function dashboardFor(role: LegalRole) {
  return role === "BRAND" ? "/brand/dashboard" : "/creator/dashboard";
}

export default function LegalUpdatePage() {
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<LegalStatusResponse["legal"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptAgb, setAcceptAgb] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
    });
  }, []);

  useEffect(() => {
    (async () => {
      if (!token) return;

      setLoading(true);
      setError(null);

      const res = await fetch("/api/me/legal-status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const { json, text } = await readSafeJson(res);

      if (!res.ok) {
        setError((json as any)?.error ?? text.slice(0, 200));
        setLoading(false);
        return;
      }

      setData((json as LegalStatusResponse).legal);
      setLoading(false);
    })();
  }, [token]);

  const role = data?.role ?? "BRAND";
  const canSubmit = useMemo(() => {
    return acceptTerms && acceptPrivacy && acceptAgb;
  }, [acceptTerms, acceptPrivacy, acceptAgb]);

  async function onAccept() {
    if (!token || !canSubmit) return;

    setBusy(true);
    setError(null);

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

    const { json, text } = await readSafeJson(res);

    if (!res.ok) {
      setError((json as any)?.error ?? text.slice(0, 200));
      setBusy(false);
      return;
    }

    window.location.href = dashboardFor(role);
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-4xl rounded-3xl border bg-white/80 p-10 shadow-sm">
          Loading legal update…
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-4xl rounded-3xl border bg-white/80 p-10 shadow-sm">
          <div className="text-sm text-red-700">{error ?? "Could not load legal status."}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl rounded-3xl border bg-white/80 p-10 shadow-sm">
        <div className="text-xs font-semibold tracking-[0.18em] text-gray-500">
          LEGAL UPDATE REQUIRED
        </div>

        <h1 className="mt-3 font-serif text-5xl leading-[0.95] tracking-tight text-gray-900">
          Please review and accept the latest legal documents
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600">
          We updated legal documents for your {role.toLowerCase()} account.
          You need to review and accept the latest versions before continuing.
        </p>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link
            href={`/terms/${role.toLowerCase()}`}
            target="_blank"
            className="rounded-3xl border bg-white p-6 hover:bg-gray-50"
          >
            <div className="text-sm font-semibold text-gray-900">Terms of Service</div>
            <div className="mt-2 text-xs text-gray-500">
              {data.current.termsVersion}
            </div>
          </Link>

          <Link
            href={`/privacy/${role.toLowerCase()}`}
            target="_blank"
            className="rounded-3xl border bg-white p-6 hover:bg-gray-50"
          >
            <div className="text-sm font-semibold text-gray-900">Privacy Policy</div>
            <div className="mt-2 text-xs text-gray-500">
              {data.current.privacyVersion}
            </div>
          </Link>

          <Link
            href={`/agb/${role.toLowerCase()}`}
            target="_blank"
            className="rounded-3xl border bg-white p-6 hover:bg-gray-50"
          >
            <div className="text-sm font-semibold text-gray-900">AGB</div>
            <div className="mt-2 text-xs text-gray-500">
              {data.current.agbVersion}
            </div>
          </Link>
        </div>

        <div className="mt-8 space-y-4 rounded-3xl border bg-white p-6">
          <label className="flex items-start gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
            />
            <span>
              I have read and accept the latest Terms of Service for my account.
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300"
              checked={acceptPrivacy}
              onChange={(e) => setAcceptPrivacy(e.target.checked)}
            />
            <span>
              I have read and accept the latest Privacy Policy for my account.
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300"
              checked={acceptAgb}
              onChange={(e) => setAcceptAgb(e.target.checked)}
            />
            <span>
              I have read and accept the latest AGB for my account.
            </span>
          </label>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!canSubmit || busy}
            onClick={onAccept}
            className="rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Accept and continue"}
          </button>
        </div>
      </div>
    </div>
  );
}