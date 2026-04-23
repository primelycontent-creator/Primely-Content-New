"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import ProfileCompletionBanner from "@/components/ProfileCompletionBanner";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type BriefListItem = {
  id: string;
  title: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "DECLINED";
  createdAt: string;
  updatedAt: string;
  deadline: string | null;
  licenseTerm: "M1" | "M3" | "M6" | "M12" | "UNLIMITED" | null;
  nicheGroup: string | null;
  niches: string[];
  _count?: { assets: number; deliverables: number };
};

type MeUser = {
  id: string;
  email: string;
  role: "BRAND" | "CREATOR" | "STAFF";
  brandProfile?: {
    companyName?: string | null;
  } | null;
};

async function readSafeJson(res: Response) {
  const text = await res.text();
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("de-DE");
}

function licenseLabel(v: BriefListItem["licenseTerm"]) {
  if (!v) return "—";
  if (v === "M1") return "1 Monat";
  if (v === "M3") return "3 Monate";
  if (v === "M6") return "6 Monate";
  if (v === "M12") return "12 Monate";
  if (v === "UNLIMITED") return "Unbegrenzt";
  return String(v);
}

function statusLabel(status: BriefListItem["status"]) {
  if (status === "DRAFT") return "Entwurf";
  if (status === "SUBMITTED") return "Eingereicht";
  if (status === "APPROVED") return "Freigegeben";
  if (status === "DECLINED") return "Abgelehnt";
  return status;
}

function statusBadge(status: BriefListItem["status"]) {
  const base = "rounded-full px-3 py-1 text-xs font-semibold border";
  if (status === "DRAFT") return `${base} bg-white text-gray-900`;
  if (status === "SUBMITTED") return `${base} bg-amber-50 text-amber-900 border-amber-200`;
  if (status === "APPROVED") return `${base} bg-emerald-50 text-emerald-900 border-emerald-200`;
  return `${base} bg-rose-50 text-rose-900 border-rose-200`;
}

function getBrandWelcomeName(user: MeUser | null) {
  if (!user) return "";
  return user.brandProfile?.companyName?.trim() || user.email || "";
}

export default function BrandDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<BriefListItem[]>([]);
  const [user, setUser] = useState<MeUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | BriefListItem["status"]>("ALL");

  async function load() {
    setLoading(true);
    setError(null);

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      router.push("/login?next=/brand/dashboard");
      return;
    }

    const [briefsRes, meRes] = await Promise.all([
      fetch("/api/brand/briefs", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
    ]);

    const briefsData = await readSafeJson(briefsRes);
    const meData = await readSafeJson(meRes);

    if (!briefsRes.ok) {
      setError((briefsData.json as any)?.error ?? briefsData.text.slice(0, 200));
      setLoading(false);
      return;
    }

    setItems(((briefsData.json as any)?.briefs ?? []) as BriefListItem[]);

    if (meRes.ok) {
      setUser(((meData.json as any)?.user ?? null) as MeUser | null);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items
      .filter((b) => (filterStatus === "ALL" ? true : b.status === filterStatus))
      .filter((b) => {
        if (!query) return true;
        return (
          b.title.toLowerCase().includes(query) ||
          (b.nicheGroup ?? "").toLowerCase().includes(query) ||
          (b.niches ?? []).join(" ").toLowerCase().includes(query)
        );
      });
  }, [items, q, filterStatus]);

  const stats = useMemo(() => {
    const all = items.length;
    const draft = items.filter((x) => x.status === "DRAFT").length;
    const submitted = items.filter((x) => x.status === "SUBMITTED").length;
    const approved = items.filter((x) => x.status === "APPROVED").length;
    return { all, draft, submitted, approved };
  }, [items]);

  const welcomeName = getBrandWelcomeName(user);

  const filterLabels: Record<"ALL" | BriefListItem["status"], string> = {
    ALL: "Alle",
    DRAFT: "Entwürfe",
    SUBMITTED: "Eingereicht",
    APPROVED: "Freigegeben",
    DECLINED: "Abgelehnt",
  };

  return (
    <div className="px-4 py-6 sm:p-8">
      <div className="rounded-3xl border bg-white/70 p-5 shadow-sm sm:p-8 lg:p-10">
        {user ? <ProfileCompletionBanner role="BRAND" user={user} /> : null}

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="font-serif text-4xl leading-[0.95] tracking-tight text-gray-900 sm:text-5xl">
              Willkommen{welcomeName ? `, ${welcomeName}` : ""}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
              Verwalte deine Briefings, halte Kampagnen organisiert und verfolge den Fortschritt vom Entwurf bis zur Freigabe.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border bg-white px-3 py-1">
                Alle: <b>{stats.all}</b>
              </span>
              <span className="rounded-full border bg-white px-3 py-1">
                Entwürfe: <b>{stats.draft}</b>
              </span>
              <span className="rounded-full border bg-white px-3 py-1">
                Eingereicht: <b>{stats.submitted}</b>
              </span>
              <span className="rounded-full border bg-white px-3 py-1">
                Freigegeben: <b>{stats.approved}</b>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap md:justify-end">
            <Link
              href="/brand/profile"
              className="rounded-full border bg-white px-6 py-3 text-center text-sm font-semibold hover:bg-gray-50"
            >
              Brand-Profil
            </Link>

            <Link
              href="/brand/briefs/new"
              className="rounded-full bg-emerald-950 px-6 py-3 text-center text-sm font-semibold text-white shadow hover:opacity-95"
            >
              + Neues Briefing
            </Link>

            <button
              type="button"
              onClick={load}
              className="rounded-full border bg-white px-6 py-3 text-sm font-semibold hover:bg-gray-50"
            >
              Aktualisieren
            </button>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full gap-3 md:max-w-[560px]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Titel oder Nische suchen..."
              className="w-full appearance-none rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-emerald-950/20"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(["ALL", "DRAFT", "SUBMITTED", "APPROVED", "DECLINED"] as const).map((s) => {
              const active = filterStatus === (s as any);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterStatus(s as any)}
                  className={
                    active
                      ? "rounded-full bg-emerald-950 px-4 py-2 text-xs font-semibold text-white"
                      : "rounded-full border bg-white px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50"
                  }
                >
                  {filterLabels[s]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="rounded-3xl border bg-white p-8 text-sm text-gray-600">
              Wird geladen...
            </div>
          ) : error ? (
            <div className="rounded-3xl border bg-white p-8">
              <div className="text-sm font-semibold text-rose-700">Fehler</div>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-700">{error}</pre>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border bg-white p-8 text-center sm:p-10">
              <div className="text-lg font-semibold text-gray-900">
                Noch keine Briefings vorhanden
              </div>
              <div className="mt-2 text-sm leading-6 text-gray-600">
                Erstelle dein erstes Briefing, um deine erste Kampagne zu starten.
              </div>
              <Link
                href="/brand/briefs/new"
                className="mt-6 inline-flex rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-white shadow hover:opacity-95"
              >
                + Neues Briefing
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((b) => (
                <Link
                  key={b.id}
                  href={`/brand/briefs/${b.id}`}
                  className="group rounded-3xl border bg-white p-5 transition hover:bg-gray-50 sm:p-6"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="truncate text-lg font-semibold text-gray-900">
                          {b.title}
                        </div>
                        <span className={statusBadge(b.status)}>{statusLabel(b.status)}</span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                        <span className="rounded-full border bg-white px-3 py-1">
                          Deadline: <b>{formatDate(b.deadline)}</b>
                        </span>
                        <span className="rounded-full border bg-white px-3 py-1">
                          Lizenz: <b>{licenseLabel(b.licenseTerm)}</b>
                        </span>
                        <span className="rounded-full border bg-white px-3 py-1">
                          Dateien: <b>{b._count?.assets ?? 0}</b>
                        </span>
                        <span className="rounded-full border bg-white px-3 py-1">
                          Aktualisiert: <b>{formatDate(b.updatedAt)}</b>
                        </span>
                      </div>

                      {(b.nicheGroup || (b.niches?.length ?? 0) > 0) && (
                        <div className="mt-3 text-xs text-gray-700">
                          <span className="font-semibold">{b.nicheGroup ?? "Nischen"}:</span>{" "}
                          {(b.niches ?? []).join(", ") || "—"}
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-950 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                        Öffnen →
                      </span>
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