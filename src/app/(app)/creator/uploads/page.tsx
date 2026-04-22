"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type BriefRow = {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
  nicheGroup: string | null;
  niches: string[];
  deliverableCount: number;
  brand: {
    email: string;
    brandProfile: { companyName: string | null } | null;
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

function statusBadge(status: string) {
  const s = String(status).toUpperCase();
  const base = "rounded-full border px-3 py-1 text-xs font-semibold";

  if (s === "IN_PROGRESS") return `${base} border-amber-200 bg-amber-50 text-amber-900`;
  if (s === "DONE") return `${base} border-emerald-200 bg-emerald-50 text-emerald-900`;
  if (s === "REVIEW") return `${base} border-blue-200 bg-blue-50 text-blue-900`;
  if (s === "DECLINED") return `${base} border-rose-200 bg-rose-50 text-rose-900`;

  return `${base} border-gray-200 bg-white text-gray-800`;
}

export default function CreatorUploadsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [briefs, setBriefs] = useState<BriefRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      const res = await fetch("/api/creator/briefs", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const { json, text } = await readSafeJson(res);

      if (!res.ok) {
        setError((json as any)?.error ?? text.slice(0, 200));
        setLoading(false);
        return;
      }

      const nextBriefs = (((json as any)?.briefs ?? []) as BriefRow[]).filter(
        (b) => String(b.status).toUpperCase() !== "DONE"
      );

      setBriefs(nextBriefs);
      setLoading(false);
    })();
  }, [token]);

  const stats = useMemo(() => {
    return {
      total: briefs.length,
      totalRequired: briefs.reduce((acc, b) => acc + Number(b.deliverableCount || 0), 0),
    };
  }, [briefs]);

  return (
    <div className="p-8">
      <div className="rounded-3xl border bg-white/70 p-10 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-serif text-5xl leading-[0.95] tracking-tight text-gray-900">
              Uploads
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-gray-600">
              Select a campaign and continue to its dedicated upload workspace with structured video slots and previews.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border bg-white px-3 py-1">
                Active briefings: <b>{stats.total}</b>
              </span>
              <span className="rounded-full border bg-white px-3 py-1">
                Total required uploads: <b>{stats.totalRequired}</b>
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 rounded-3xl border bg-white p-6">
          <div className="text-sm font-semibold text-gray-900">Upload-ready briefings</div>
          <p className="mt-1 text-xs text-gray-500">
            Open a briefing upload workspace to place your files into the requested slots.
          </p>

          {loading ? (
            <p className="mt-4 text-sm text-gray-600">Loading…</p>
          ) : briefs.length === 0 ? (
            <div className="mt-4 rounded-2xl border bg-white p-8 text-center">
              <div className="text-base font-semibold text-gray-900">No active uploads right now</div>
              <p className="mt-2 text-sm text-gray-600">
                Once a campaign is assigned and active, it will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4">
              {briefs.map((b) => (
                <Link
                  key={b.id}
                  href={`/creator/uploads/${b.id}`}
                  className="group rounded-2xl border bg-white p-5 transition hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate text-base font-semibold text-gray-900">{b.title}</div>
                        <span className={statusBadge(b.status)}>{b.status.replace("_", " ")}</span>
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        Brand: {b.brand.brandProfile?.companyName ?? b.brand.email}
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        {b.nicheGroup ?? "—"} • {(b.niches ?? []).slice(0, 5).join(", ") || "—"}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-gray-800">
                        {b.deliverableCount} slot{b.deliverableCount > 1 ? "s" : ""}
                      </div>
                      <div className="mt-2 text-[11px] text-gray-500">
                        Updated: {new Date(b.updatedAt).toLocaleString()}
                      </div>
                      <div className="mt-2 text-xs font-semibold text-emerald-950 opacity-0 transition group-hover:opacity-100">
                        Open upload workspace →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}