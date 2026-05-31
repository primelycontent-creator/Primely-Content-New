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
  createdAt: string;
  updatedAt: string;
  deadline: string | null;
  companyName?: string | null;
  brand: {
    id: string;
    email: string;
    brandProfile?: { companyName: string | null } | null;
  };
  assignedCreator?: {
    id: string;
    email: string;
    creatorProfile?: { fullName: string | null; nicheGroup: string | null } | null;
  } | null;
  _count?: { assets: number; deliverables: number };
};

type CreatorRow = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  profileImageUrl: string | null;
  emailConfirmed: boolean;
  isVerified: boolean;
  creatorProfile: {
    fullName: string | null;
    city: string | null;
    country: string | null;
    nicheGroup: string | null;
    niches: string[];
    approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
    price30sCents: number | null;
  } | null;
  _count?: {
    assignedBriefs: number;
    deliverables: number;
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
  if (s === "SUBMITTED") return "Neu";
  if (s === "REVIEW") return "In Review";
  if (s === "IN_PROGRESS") return "Laufend";
  if (s === "DONE") return "Abgeschlossen";
  if (s === "DECLINED") return "Abgelehnt";
  return status.replaceAll("_", " ");
}

function statusBadge(status: string) {
  const s = String(status).toUpperCase();
  const base = "rounded-full border px-3 py-1 text-xs font-semibold";

  if (s === "SUBMITTED") return `${base} border-amber-200 bg-amber-50 text-amber-900`;
  if (s === "REVIEW") return `${base} border-blue-200 bg-blue-50 text-blue-900`;
  if (s === "IN_PROGRESS") return `${base} border-violet-200 bg-violet-50 text-violet-900`;
  if (s === "DONE") return `${base} border-emerald-200 bg-emerald-50 text-emerald-900`;
  if (s === "DECLINED") return `${base} border-rose-200 bg-rose-50 text-rose-900`;

  return `${base} border-gray-200 bg-white text-gray-800`;
}

function initials(name: string) {
  const clean = name.trim();
  if (!clean) return "S";
  return clean
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
}

function Icon(props: {
  name:
    | "brief"
    | "creator"
    | "eye"
    | "check"
    | "support"
    | "chevron"
    | "calendar"
    | "grid";
}) {
  const common = "h-5 w-5";

  if (props.name === "brief") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 17h6" />
      </svg>
    );
  }

  if (props.name === "creator") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="10" cy="8" r="4" />
        <path d="M3 21c1.4-4 12.6-4 14 0" />
        <path d="M19 8v6M16 11h6" />
      </svg>
    );
  }

  if (props.name === "eye") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  if (props.name === "check") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }

  if (props.name === "support") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
        <path d="M4 13h3v6H4zM17 13h3v6h-3z" />
        <path d="M17 19c0 2-2 2-5 2" />
      </svg>
    );
  }

  if (props.name === "calendar") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="5" width="16" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </svg>
    );
  }

  if (props.name === "grid") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  }

  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function StatCard(props: {
  label: string;
  value: number;
  hint: string;
  icon: "brief" | "creator" | "eye" | "check";
}) {
  return (
    <div className="rounded-[28px] border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-5">
        <div>
          <div className="text-sm font-medium text-gray-600">{props.label}</div>
          <div className="mt-5 text-4xl font-semibold tracking-tight text-gray-950">{props.value}</div>
          <div className="mt-3 text-sm text-gray-500">{props.hint}</div>
        </div>

        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f3eee7] text-gray-950">
          <Icon name={props.icon} />
        </div>
      </div>
    </div>
  );
}

export default function StaffDashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [briefs, setBriefs] = useState<BriefRow[]>([]);
  const [creators, setCreators] = useState<CreatorRow[]>([]);
  const [loading, setLoading] = useState(true);
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

    const [briefsRes, creatorsRes] = await Promise.all([
      fetch("/api/staff/briefs?status=ALL", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch("/api/staff/creators?sort=newest", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
    ]);

    const briefsData = await readSafeJson(briefsRes);
    const creatorsData = await readSafeJson(creatorsRes);

    if (!briefsRes.ok) {
      setError(briefsData.json?.error ?? briefsData.text.slice(0, 200));
      setLoading(false);
      return;
    }

    if (!creatorsRes.ok) {
      setError(creatorsData.json?.error ?? creatorsData.text.slice(0, 200));
      setLoading(false);
      return;
    }

    setBriefs(briefsData.json?.briefs ?? []);
    setCreators(creatorsData.json?.creators ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const stats = useMemo(() => {
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    return {
      newBriefs: briefs.filter((b) => String(b.status).toUpperCase() === "SUBMITTED").length,
      newCreators: creators.filter((c) => {
        const created = new Date(c.createdAt).getTime();
        return Number.isFinite(created) && now - created <= sevenDays;
      }).length,
      inReview: briefs.filter((b) => String(b.status).toUpperCase() === "REVIEW").length,
      doneThisMonth: briefs.filter((b) => {
        const d = new Date(b.updatedAt);
        return (
          String(b.status).toUpperCase() === "DONE" &&
          d.getMonth() === thisMonth &&
          d.getFullYear() === thisYear
        );
      }).length,
    };
  }, [briefs, creators]);

  const newestBriefs = useMemo(() => {
    return [...briefs]
      .filter((b) => ["SUBMITTED", "REVIEW", "IN_PROGRESS"].includes(String(b.status).toUpperCase()))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 3);
  }, [briefs]);

  const newestCreators = useMemo(() => {
    return [...creators]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 3);
  }, [creators]);

  return (
    <div className="min-h-screen bg-[#fbfaf7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-[36px] border bg-white/70 p-5 shadow-sm sm:p-8 lg:p-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Mitarbeiter Dashboard
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
              Willkommen zurück 👋
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500">
              Hier findest du den aktuellen Überblick über neue Kampagnen, Creator, Reviews und Support.
            </p>
          </div>

          <Link
            href="/staff/creators"
            className="w-fit rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
          >
            Creator prüfen
          </Link>
        </div>

        {error ? (
          <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Neue Kampagnen"
            value={loading ? 0 : stats.newBriefs}
            hint="wartet auf Prüfung"
            icon="brief"
          />

          <StatCard
            label="Neue Creator"
            value={loading ? 0 : stats.newCreators}
            hint="in den letzten 7 Tagen"
            icon="creator"
          />

          <StatCard
            label="In Review"
            value={loading ? 0 : stats.inReview}
            hint="Kampagnen in Prüfung"
            icon="eye"
          />

          <StatCard
            label="Abgeschlossen"
            value={loading ? 0 : stats.doneThisMonth}
            hint="diesen Monat"
            icon="check"
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          <section className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-tight text-gray-950">
                Neue Kampagnen
              </h2>

              <Link href="/staff/briefs" className="text-xs font-semibold text-gray-950 hover:underline">
                Alle anzeigen
              </Link>
            </div>

            {loading ? (
              <div className="mt-8 text-sm text-gray-500">Kampagnen werden geladen...</div>
            ) : newestBriefs.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-dashed bg-[#fbfaf7] p-8 text-center text-sm text-gray-500">
                Keine neuen Kampagnen.
              </div>
            ) : (
              <div className="mt-6 divide-y">
                {newestBriefs.map((b) => (
                  <Link
                    key={b.id}
                    href={`/staff/briefs/${b.id}`}
                    className="group flex items-center gap-4 py-5"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f3eee7] text-gray-950">
                      <Icon name="brief" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-gray-950">{b.title}</div>
                      <div className="mt-1 text-xs text-gray-500">
                        Brand: {b.brand?.brandProfile?.companyName ?? b.companyName ?? b.brand?.email ?? "—"}
                      </div>
                      <div className="mt-2">
                        <span className={statusBadge(b.status)}>{statusLabel(b.status)}</span>
                      </div>
                    </div>

                    <div className="text-gray-950 transition group-hover:translate-x-1">
                      <Icon name="chevron" />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <Link
              href="/staff/briefs"
              className="mt-5 flex items-center justify-center gap-2 rounded-2xl border bg-white px-5 py-4 text-sm font-semibold text-gray-950 hover:bg-gray-50"
            >
              Alle Kampagnen anzeigen
              <Icon name="chevron" />
            </Link>
          </section>

          <section className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-tight text-gray-950">
                Neue Creator
              </h2>

              <Link href="/staff/creators" className="text-xs font-semibold text-gray-950 hover:underline">
                Alle anzeigen
              </Link>
            </div>

            {loading ? (
              <div className="mt-8 text-sm text-gray-500">Creator werden geladen...</div>
            ) : newestCreators.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-dashed bg-[#fbfaf7] p-8 text-center text-sm text-gray-500">
                Keine neuen Creator.
              </div>
            ) : (
              <div className="mt-6 divide-y">
                {newestCreators.map((c) => {
                  const p = c.creatorProfile;
                  const name = p?.fullName || c.email;
                  const pending = p?.approvalStatus === "PENDING";

                  return (
                    <Link
                      key={c.id}
                      href={`/staff/creators/${c.id}`}
                      className="group flex items-center gap-4 py-5"
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f3eee7] text-sm font-semibold text-gray-950">
                        {c.profileImageUrl ? (
                          <img src={c.profileImageUrl} alt={name} className="h-full w-full object-cover" />
                        ) : (
                          initials(name)
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-gray-950">{name}</div>
                        <div className="mt-1 text-xs text-gray-500">
                          {[p?.city, p?.country].filter(Boolean).join(", ") || "Standort offen"}
                        </div>

                        <div className="mt-2">
                          <span
                            className={
                              pending
                                ? "rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900"
                                : p?.approvalStatus === "APPROVED"
                                ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900"
                                : "rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-900"
                            }
                          >
                            {pending ? "Zu prüfen" : p?.approvalStatus === "APPROVED" ? "Freigegeben" : "Abgelehnt"}
                          </span>
                        </div>
                      </div>

                      <div className="text-gray-950 transition group-hover:translate-x-1">
                        <Icon name="chevron" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            <Link
              href="/staff/creators"
              className="mt-5 flex items-center justify-center gap-2 rounded-2xl border bg-white px-5 py-4 text-sm font-semibold text-gray-950 hover:bg-gray-50"
            >
              Alle Creator anzeigen
              <Icon name="chevron" />
            </Link>
          </section>

          <section className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-tight text-gray-950">
                Supportnachrichten
              </h2>

              <Link href="/staff/support" className="text-xs font-semibold text-gray-950 hover:underline">
                Alle anzeigen
              </Link>
            </div>

            <div className="mt-6 rounded-3xl border border-dashed bg-[#fbfaf7] p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-950">
                <Icon name="support" />
              </div>

              <div className="mt-4 text-sm font-semibold text-gray-950">
                Support wird als Nächstes verbunden
              </div>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Sobald die Staff-Support-API steht, erscheinen hier neue Tickets und Antworten.
              </p>
            </div>

            <Link
              href="/staff/support"
              className="mt-5 flex items-center justify-center gap-2 rounded-2xl border bg-white px-5 py-4 text-sm font-semibold text-gray-950 hover:bg-gray-50"
            >
              Support öffnen
              <Icon name="chevron" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}