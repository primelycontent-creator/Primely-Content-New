"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import ProfileCompletionBanner from "@/components/ProfileCompletionBanner";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function readSafeJson(res: Response) {
  const text = await res.text();
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

type BriefRow = {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
  nicheGroup: string | null;
  niches: string[];
  brand: { email: string; brandProfile: { companyName: string | null } | null };
};

type MeUser = {
  id: string;
  email: string;
  role: "BRAND" | "CREATOR" | "STAFF";
  emailConfirmed?: boolean;
  creatorProfile?: {
    fullName?: string | null;
    approvalStatus?: "PENDING" | "APPROVED" | "REJECTED" | null;
    rejectionReason?: string | null;
  } | null;
};

function statusLabel(status: string) {
  const s = String(status).toUpperCase();
  if (s === "IN_PROGRESS") return "In Bearbeitung";
  if (s === "DONE") return "Abgeschlossen";
  if (s === "REVIEW") return "In Prüfung";
  if (s === "DECLINED") return "Abgelehnt";
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

function getCreatorWelcomeName(user: MeUser | null) {
  if (!user) return "";
  return user.creatorProfile?.fullName?.trim() || user.email || "";
}

function CreatorVerificationBanner({ user }: { user: MeUser }) {
  const emailConfirmed = !!user.emailConfirmed;
  const approvalStatus = user.creatorProfile?.approvalStatus ?? "PENDING";
  const rejectionReason = user.creatorProfile?.rejectionReason ?? null;

  if (emailConfirmed && approvalStatus === "APPROVED") return null;

  if (!emailConfirmed) {
    return (
      <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
        <div className="text-sm font-semibold">Bitte bestätige deine E-Mail-Adresse</div>
        <p className="mt-2 text-sm leading-6">
          Dein Creator-Konto ist noch nicht vollständig verifiziert. Bitte bestätige zuerst deine E-Mail-Adresse.
          Danach prüft unser Team dein Profil, bevor du Kampagnen zugewiesen bekommen kannst.
        </p>
      </div>
    );
  }

  if (approvalStatus === "REJECTED") {
    return (
      <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-900">
        <div className="text-sm font-semibold">Dein Creator-Profil wurde noch nicht freigegeben</div>
        <p className="mt-2 text-sm leading-6">
          Bitte prüfe deine Profildaten und ergänze fehlende Informationen.
        </p>

        {rejectionReason ? (
          <div className="mt-3 rounded-2xl border border-rose-200 bg-white/70 p-4 text-sm">
            <div className="font-semibold">Hinweis vom Team</div>
            <div className="mt-1 whitespace-pre-wrap">{rejectionReason}</div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-3xl border border-blue-200 bg-blue-50 p-5 text-blue-900">
      <div className="text-sm font-semibold">Dein Konto wird geprüft</div>
      <p className="mt-2 text-sm leading-6">
        Deine E-Mail-Adresse ist bestätigt. Unser Team prüft aktuell dein Creator-Profil.
        Du kannst dein Profil bereits vervollständigen. Kampagnen-Zuweisungen starten nach der Freigabe.
      </p>
    </div>
  );
}

export default function CreatorDashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [briefs, setBriefs] = useState<BriefRow[]>([]);
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setToken(data.session?.access_token ?? null));
  }, []);

  useEffect(() => {
    (async () => {
      if (!token) return;
      setLoading(true);
      setErr(null);

      const [briefsRes, meRes] = await Promise.all([
        fetch("/api/creator/briefs", {
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
        setErr((briefsData.json as any)?.error ?? briefsData.text.slice(0, 200));
        setLoading(false);
        return;
      }

      setBriefs((briefsData.json as any)?.briefs ?? []);

      if (meRes.ok) setUser((meData.json as any)?.user ?? null);

      setLoading(false);
    })();
  }, [token]);

  const stats = useMemo(() => {
    return {
      total: briefs.length,
      inProgress: briefs.filter((b) => String(b.status).toUpperCase() === "IN_PROGRESS").length,
      review: briefs.filter((b) => String(b.status).toUpperCase() === "REVIEW").length,
      done: briefs.filter((b) => String(b.status).toUpperCase() === "DONE").length,
    };
  }, [briefs]);

  const welcomeName = getCreatorWelcomeName(user);

  return (
    <div className="px-4 py-6 sm:p-8">
      <div className="rounded-3xl border bg-white/70 p-5 shadow-sm sm:p-8 lg:p-10">
        {user ? <ProfileCompletionBanner role="CREATOR" user={user} /> : null}
        {user ? <CreatorVerificationBanner user={user} /> : null}

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-serif text-4xl leading-[0.95] tracking-tight text-gray-900 sm:text-5xl">
              Willkommen{welcomeName ? `, ${welcomeName}` : ""}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
              Verfolge deine zugewiesenen Briefings, verwalte Deliverables und halte dein Creator-Profil bereit für neue Kampagnen.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border bg-white px-3 py-1">
                Zugewiesen: <b>{stats.total}</b>
              </span>
              <span className="rounded-full border bg-white px-3 py-1">
                In Bearbeitung: <b>{stats.inProgress}</b>
              </span>
              <span className="rounded-full border bg-white px-3 py-1">
                Prüfung: <b>{stats.review}</b>
              </span>
              <span className="rounded-full border bg-white px-3 py-1">
                Abgeschlossen: <b>{stats.done}</b>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/creator/profile"
              className="rounded-full border bg-white px-5 py-2.5 text-center text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              Profil
            </Link>
            <Link
              href="/creator/support"
              className="rounded-full border bg-white px-5 py-2.5 text-center text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              Support
            </Link>
          </div>
        </div>

        {err ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            {err}
          </div>
        ) : null}

        <div className="mt-8 rounded-3xl border bg-white p-5 sm:p-6">
          <div>
            <div className="text-sm font-semibold text-gray-900">Zugewiesene Briefings</div>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Öffne ein Briefing, um Anweisungen, Dateien und deine Deliverables zu verwalten.
            </p>
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-gray-600">Wird geladen...</p>
          ) : briefs.length === 0 ? (
            <div className="mt-4 rounded-2xl border bg-white p-8 text-center">
              <div className="text-base font-semibold text-gray-900">
                Noch keine Briefings zugewiesen
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Sobald unser Team dir eine Kampagne zuweist, erscheint sie hier.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {briefs.map((b) => (
                <Link
                  key={b.id}
                  href={`/creator/briefs/${b.id}`}
                  className="group block rounded-2xl border bg-white px-5 py-4 transition hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate text-base font-semibold text-gray-900">
                          {b.title}
                        </div>
                        <span className={statusBadge(b.status)}>{statusLabel(b.status)}</span>
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        Brand: {b.brand.brandProfile?.companyName ?? b.brand.email}
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        {b.nicheGroup ?? "—"} • {(b.niches ?? []).slice(0, 5).join(", ") || "—"}
                      </div>
                    </div>

                    <div className="text-left md:text-right">
                      <div className="text-[11px] text-gray-500">
                        Aktualisiert: {new Date(b.updatedAt).toLocaleString("de-DE")}
                      </div>
                      <div className="mt-2 text-xs font-semibold text-emerald-950 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                        Briefing öffnen →
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