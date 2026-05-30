"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Megaphone,
  PlusCircle,
  Search,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Campaign = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  deadline: string | null;
  licenseTerm: string | null;
  nicheGroup: string | null;
  niches: string[];
  deliverableCount: number;
  consultationBooked?: boolean | null;
  consultationBookedAt?: string | null;
  _count?: {
    assets: number;
    deliverables: number;
    supportTickets?: number;
    calendarBookings?: number;
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

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("de-DE");
}

function statusLabel(status: string) {
  const s = String(status).toUpperCase();
  if (s === "DRAFT") return "Entwurf";
  if (s === "SUBMITTED") return "Eingereicht";
  if (s === "REVIEW") return "In Prüfung";
  if (s === "IN_PROGRESS") return "In Bearbeitung";
  if (s === "DONE") return "Abgeschlossen";
  if (s === "DECLINED") return "Abgelehnt";
  return status.replaceAll("_", " ");
}

function statusClass(status: string) {
  const s = String(status).toUpperCase();
  if (s === "DONE") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (s === "DECLINED") return "border-rose-200 bg-rose-50 text-rose-900";
  if (s === "SUBMITTED" || s === "REVIEW") return "border-amber-200 bg-amber-50 text-amber-900";
  if (s === "IN_PROGRESS") return "border-blue-200 bg-blue-50 text-blue-900";
  return "border-gray-200 bg-gray-50 text-gray-700";
}

export default function BrandCampaignsPage() {
  const router = useRouter();

  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "DRAFT" | "DONE">("ALL");

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        router.push("/login?next=/brand/briefs");
        return;
      }

      const res = await fetch("/api/brand/briefs", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const { json, text } = await readSafeJson(res);
      if (!res.ok) throw new Error(json?.error ?? text.slice(0, 200));

      setItems((json?.briefs ?? []) as Campaign[]);
    } catch (e: any) {
      setError(e?.message ?? "Kampagnen konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const active = items.filter((x) =>
      ["SUBMITTED", "REVIEW", "IN_PROGRESS"].includes(String(x.status).toUpperCase())
    ).length;
    const drafts = items.filter((x) => String(x.status).toUpperCase() === "DRAFT").length;
    const done = items.filter((x) => String(x.status).toUpperCase() === "DONE").length;
    const waitingCall = items.filter(
      (x) => !x.consultationBooked && String(x.status).toUpperCase() !== "DRAFT"
    ).length;

    return { total: items.length, active, drafts, done, waitingCall };
  }, [items]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return items
      .filter((x) => {
        const s = String(x.status).toUpperCase();

        if (filter === "DRAFT") return s === "DRAFT";
        if (filter === "DONE") return s === "DONE";
        if (filter === "ACTIVE") return ["SUBMITTED", "REVIEW", "IN_PROGRESS"].includes(s);
        return true;
      })
      .filter((x) => {
        if (!query) return true;
        return (
          x.title.toLowerCase().includes(query) ||
          String(x.nicheGroup ?? "").toLowerCase().includes(query) ||
          (x.niches ?? []).join(" ").toLowerCase().includes(query)
        );
      });
  }, [items, q, filter]);

  return (
    <div className="min-h-screen bg-[#fbfaf7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/brand/dashboard"
            className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-50"
          >
            ← Zurück
          </Link>

          <Link
            href="/brand/briefs/new"
            className="inline-flex items-center gap-2 rounded-full bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
          >
            <PlusCircle className="h-4 w-4" />
            Neue Kampagne
          </Link>
        </div>

        <div className="rounded-[36px] border bg-white/70 p-5 shadow-sm sm:p-8 lg:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Kampagnen
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
                Alle Kampagnen
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500">
                Verwalte deine Kampagnen, prüfe den aktuellen Status und öffne die Detailansicht für weitere Schritte.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-4">
            <div className="rounded-[28px] border bg-white p-6 shadow-sm">
              <Megaphone className="h-6 w-6 text-gray-950" />
              <div className="mt-5 text-3xl font-semibold text-gray-950">{stats.total}</div>
              <div className="mt-1 text-sm text-gray-500">Gesamt</div>
            </div>

            <div className="rounded-[28px] border bg-white p-6 shadow-sm">
              <Clock className="h-6 w-6 text-gray-950" />
              <div className="mt-5 text-3xl font-semibold text-gray-950">{stats.active}</div>
              <div className="mt-1 text-sm text-gray-500">Aktiv</div>
            </div>

            <div className="rounded-[28px] border bg-white p-6 shadow-sm">
              <FileText className="h-6 w-6 text-gray-950" />
              <div className="mt-5 text-3xl font-semibold text-gray-950">{stats.drafts}</div>
              <div className="mt-1 text-sm text-gray-500">Entwürfe</div>
            </div>

            <div className="rounded-[28px] border bg-white p-6 shadow-sm">
              <CheckCircle className="h-6 w-6 text-gray-950" />
              <div className="mt-5 text-3xl font-semibold text-gray-950">{stats.done}</div>
              <div className="mt-1 text-sm text-gray-500">Abgeschlossen</div>
            </div>
          </div>

          <div className="mt-8 rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Kampagne oder Nische suchen..."
                  className="w-full rounded-2xl border bg-white py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  ["ALL", "Alle"],
                  ["ACTIVE", "Aktiv"],
                  ["DRAFT", "Entwürfe"],
                  ["DONE", "Abgeschlossen"],
                ].map(([value, label]) => {
                  const active = filter === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFilter(value as any)}
                      className={
                        active
                          ? "rounded-full bg-gray-950 px-4 py-2 text-xs font-semibold text-white"
                          : "rounded-full border bg-white px-4 py-2 text-xs font-semibold text-gray-950 hover:bg-gray-50"
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              {loading ? (
                <div className="rounded-3xl border bg-[#fbfaf7] p-8 text-sm text-gray-500">
                  Kampagnen werden geladen...
                </div>
              ) : error ? (
                <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-800">
                  {error}
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-3xl border border-dashed bg-[#fbfaf7] p-10 text-center">
                  <div className="text-lg font-semibold text-gray-950">
                    Keine Kampagnen gefunden
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Erstelle eine neue Kampagne oder ändere den Filter.
                  </p>
                  <Link
                    href="/brand/briefs/new"
                    className="mt-6 inline-flex rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white"
                  >
                    Neue Kampagne starten
                  </Link>
                </div>
              ) : (
                <div className="divide-y">
                  {filtered.map((campaign) => (
                    <Link
                      key={campaign.id}
                      href={`/brand/briefs/${campaign.id}`}
                      className="group flex flex-col gap-4 py-6 transition hover:bg-gray-50/70 sm:-mx-4 sm:rounded-3xl sm:px-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="truncate text-lg font-semibold text-gray-950">
                            {campaign.title}
                          </div>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                              campaign.status
                            )}`}
                          >
                            {statusLabel(campaign.status)}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                          <span className="rounded-full border bg-white px-3 py-1">
                            Erstellt: <b>{formatDate(campaign.createdAt)}</b>
                          </span>

                          <span className="rounded-full border bg-white px-3 py-1">
                            Deadline: <b>{formatDate(campaign.deadline)}</b>
                          </span>

                          <span className="rounded-full border bg-white px-3 py-1">
                            Videos: <b>{campaign.deliverableCount}</b>
                          </span>

                          <span className="rounded-full border bg-white px-3 py-1">
                            Dateien: <b>{campaign._count?.assets ?? 0}</b>
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {campaign.nicheGroup ? (
                            <span className="rounded-full bg-[#f3eee7] px-3 py-1 text-xs font-semibold text-gray-950">
                              {campaign.nicheGroup}
                            </span>
                          ) : null}

                          {(campaign.niches ?? []).slice(0, 4).map((n) => (
                            <span
                              key={n}
                              className="rounded-full border bg-white px-3 py-1 text-xs text-gray-600"
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <div
                          className={
                            campaign.consultationBooked
                              ? "inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900"
                              : "inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900"
                          }
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          {campaign.consultationBooked
                            ? "Termin gebucht"
                            : "Termin ausstehend"}
                        </div>

                        <span className="text-sm font-semibold text-gray-950 transition group-hover:translate-x-1">
                          Öffnen →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}