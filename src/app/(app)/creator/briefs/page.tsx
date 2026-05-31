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

function statusLabel(status: string) {
  const s = String(status).toUpperCase();
  if (s === "IN_PROGRESS") return "In Bearbeitung";
  if (s === "DONE") return "Abgeschlossen";
  if (s === "REVIEW") return "In Prüfung";
  if (s === "DECLINED") return "Abgelehnt";
  if (s === "SUBMITTED") return "Eingereicht";
  return status.replaceAll("_", " ");
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

export default function CreatorBriefsPage() {
  const [briefs, setBriefs] = useState<BriefRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      window.location.href = "/login?next=/creator/briefs";
      return;
    }

    const res = await fetch("/api/creator/briefs", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const { json, text } = await readSafeJson(res);

    if (!res.ok) {
      setError(json?.error ?? text.slice(0, 200));
      setLoading(false);
      return;
    }

    setBriefs(json?.briefs ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    return {
      total: briefs.length,
      active: briefs.filter((b) =>
        ["IN_PROGRESS", "REVIEW", "SUBMITTED"].includes(String(b.status).toUpperCase())
      ).length,
      done: briefs.filter((b) => String(b.status).toUpperCase() === "DONE").length,
    };
  }, [briefs]);

  return (
    <div className="min-h-screen bg-[#fbfaf7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-[36px] border bg-white/70 p-5 shadow-sm sm:p-8 lg:p-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Kampagnen
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
              Zugewiesene Kampagnen
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500">
              Hier findest du alle Kampagnen, die dir von unserem Team zugewiesen wurden.
              Öffne eine Kampagne, um Details, Briefing-Dateien und Uploads zu verwalten.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-[28px] border bg-white p-4 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-950">{stats.total}</div>
              <div className="mt-1 text-xs text-gray-500">Gesamt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-950">{stats.active}</div>
              <div className="mt-1 text-xs text-gray-500">Aktiv</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-950">{stats.done}</div>
              <div className="mt-1 text-xs text-gray-500">Fertig</div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        <div className="mt-10 rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-gray-950">
                Deine Kampagnen
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Alle aktuell zugewiesenen Kampagnen auf einen Blick.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 text-sm text-gray-500">Kampagnen werden geladen...</div>
          ) : briefs.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed bg-[#fbfaf7] p-8 text-center">
              <div className="text-base font-semibold text-gray-950">
                Noch keine Kampagnen zugewiesen
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Sobald unser Team dir eine passende Kampagne zuweist, erscheint sie hier.
              </p>
            </div>
          ) : (
            <div className="mt-6 divide-y">
              {briefs.map((b) => (
                <Link
                  key={b.id}
                  href={`/creator/briefs/${b.id}`}
                  className="group flex flex-col gap-4 py-5 transition hover:bg-gray-50/60 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="truncate text-sm font-semibold text-gray-950">
                        {b.title}
                      </div>
                      <span className={statusBadge(b.status)}>
                        {statusLabel(b.status)}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Brand: {b.brand?.brandProfile?.companyName ?? b.brand?.email ?? "—"}
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      {b.nicheGroup ?? "Keine Hauptnische"} •{" "}
                      {(b.niches ?? []).slice(0, 5).join(", ") || "Keine Nischen"}
                    </div>
                  </div>

                  <div className="shrink-0 text-left sm:text-right">
                    <div className="text-[11px] text-gray-500">
                      Aktualisiert: {new Date(b.updatedAt).toLocaleString("de-DE")}
                    </div>

                    <div className="mt-2 text-xs font-semibold text-gray-950 transition group-hover:translate-x-1">
                      Kampagne öffnen →
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