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
  deadline: string | null;
  nicheGroup: string | null;
  niches: string[];
  updatedAt: string;
  brand: { id: string; email: string };
  assignedCreator: { id: string; email: string } | null;
};

const FILTERS = ["ALL", "SUBMITTED", "REVIEW", "IN_PROGRESS", "DONE", "DECLINED"] as const;

export default function StaffDashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<(typeof FILTERS)[number]>("SUBMITTED");
  const [loading, setLoading] = useState(false);
  const [briefs, setBriefs] = useState<BriefRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
    });
  }, []);

  async function load() {
    if (!token) return;
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/staff/briefs?status=${encodeURIComponent(status)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      setError(text.slice(0, 200));
      setLoading(false);
      return;
    }

    if (!res.ok) {
      setError(json?.error ?? "Failed to load");
      setLoading(false);
      return;
    }

    setBriefs(json.briefs ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [token, status]);

  const countText = useMemo(() => `${briefs.length} brief(s)`, [briefs.length]);

  return (
    <div className="p-8">
      <div className="rounded-3xl border bg-white/70 p-10 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="font-serif text-5xl leading-[0.95] tracking-tight text-gray-900">
              Staff Dashboard
            </h1>
            <p className="mt-3 text-sm text-gray-600">
              Review submissions, assign creators, and move briefs through the pipeline.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/staff/support"
              className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              Support Inbox
            </Link>
            <div className="text-sm text-gray-600">{loading ? "Loading…" : countText}</div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = f === status;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setStatus(f)}
                className={
                  active
                    ? "rounded-full bg-emerald-950 px-4 py-2 text-xs font-semibold text-white"
                    : "rounded-full border bg-white px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50"
                }
              >
                {f.replace("_", " ")}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-3">
          {briefs.map((b) => (
            <Link
              key={b.id}
              href={`/staff/briefs/${b.id}`}
              className="block rounded-2xl border bg-white p-5 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-gray-900">{b.title}</div>
                  <div className="mt-1 text-xs text-gray-600">
                    Brand: {b.brand?.email}
                    {b.assignedCreator ? ` • Creator: ${b.assignedCreator.email}` : ""}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {b.nicheGroup ? `${b.nicheGroup} • ` : ""}
                    {(b.niches ?? []).slice(0, 4).join(", ")}
                    {b.deadline ? ` • Deadline: ${new Date(b.deadline).toLocaleDateString()}` : ""}
                  </div>
                </div>

                <span className="shrink-0 rounded-full border bg-white px-3 py-1 text-xs font-semibold text-gray-800">
                  {b.status.replace("_", " ")}
                </span>
              </div>
            </Link>
          ))}

          {!loading && briefs.length === 0 && (
            <div className="rounded-2xl border bg-white p-8 text-sm text-gray-600">
              No briefs in this status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}