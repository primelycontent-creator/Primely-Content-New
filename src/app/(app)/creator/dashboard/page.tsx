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
  deadline?: string | null;
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
    phone?: string | null;
    portfolioUrl?: string | null;
    bio?: string | null;
    instagram?: string | null;
    tiktok?: string | null;
    nicheGroup?: string | null;
    niches?: string[];
    equipment?: string[];
    price30sCents?: number | null;
    introVideoAssetId?: string | null;
    approvalStatus?: "PENDING" | "APPROVED" | "REJECTED" | null;
    rejectionReason?: string | null;
  } | null;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("de-DE");
}

function statusLabel(status: string) {
  const s = String(status).toUpperCase();
  if (s === "IN_PROGRESS") return "In Arbeit";
  if (s === "DONE") return "Abgeschlossen";
  if (s === "REVIEW") return "In Prüfung";
  if (s === "SUBMITTED") return "Neu";
  if (s === "DECLINED") return "Abgelehnt";
  return status.replaceAll("_", " ");
}

function statusBadge(status: string) {
  const s = String(status).toUpperCase();
  const base = "rounded-full border px-4 py-1.5 text-xs font-semibold";

  if (s === "SUBMITTED") return `${base} border-amber-100 bg-amber-50 text-amber-900`;
  if (s === "IN_PROGRESS") return `${base} border-violet-100 bg-violet-50 text-violet-900`;
  if (s === "REVIEW") return `${base} border-blue-100 bg-blue-50 text-blue-900`;
  if (s === "DONE") return `${base} border-emerald-100 bg-emerald-50 text-emerald-900`;
  if (s === "DECLINED") return `${base} border-rose-100 bg-rose-50 text-rose-900`;

  return `${base} border-gray-100 bg-white text-gray-800`;
}

function getCreatorWelcomeName(user: MeUser | null) {
  if (!user) return "";
  return user.creatorProfile?.fullName?.trim() || user.email || "";
}

function initials(name: string) {
  const clean = name.trim();
  if (!clean) return "C";
  return clean
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
}

function profilePercent(user: MeUser | null) {
  const p = user?.creatorProfile;
  if (!p) return 0;

  const checks = [
    p.fullName,
    p.phone,
    p.portfolioUrl,
    p.bio,
    p.instagram || p.tiktok,
    p.nicheGroup,
    p.niches && p.niches.length > 0,
    p.equipment && p.equipment.length > 0,
    p.price30sCents,
    p.introVideoAssetId,
  ];

  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

function Icon(props: {
  name:
    | "brief"
    | "clock"
    | "check"
    | "user"
    | "upload"
    | "support"
    | "calendar"
    | "chevron"
    | "bell";
}) {
  const common = "h-5 w-5";

  if (props.name === "brief") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M3 13h18" />
      </svg>
    );
  }

  if (props.name === "clock") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
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

  if (props.name === "user") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.6-4 14.4-4 16 0" />
      </svg>
    );
  }

  if (props.name === "upload") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 16V4" />
        <path d="m7 9 5-5 5 5" />
        <path d="M4 20h16" />
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

  if (props.name === "bell") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
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
  icon: "brief" | "clock" | "check";
  tone?: "dark" | "violet" | "green";
}) {
  const iconClass =
    props.tone === "dark"
      ? "bg-gray-950 text-white"
      : props.tone === "violet"
      ? "bg-violet-50 text-gray-950"
      : "bg-emerald-50 text-gray-950";

  return (
    <div className="rounded-[28px] border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-5">
        <div>
          <div className="text-sm font-medium text-gray-700">{props.label}</div>
          <div className="mt-5 text-4xl font-semibold tracking-tight text-gray-950">{props.value}</div>
          <div className="mt-3 text-sm text-gray-500">{props.hint}</div>
        </div>

        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${iconClass}`}>
          <Icon name={props.icon} />
        </div>
      </div>
    </div>
  );
}

function QuickRow(props: {
  icon: "user" | "upload" | "support";
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <Link href={props.href} className="group flex items-center gap-4 border-b py-6 last:border-b-0">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f3eee7] text-gray-950">
        <Icon name={props.icon} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-gray-950">{props.title}</div>
        <div className="mt-1 text-xs leading-5 text-gray-500">{props.subtitle}</div>
      </div>

      <div className="text-gray-950 transition group-hover:translate-x-1">
        <Icon name="chevron" />
      </div>
    </Link>
  );
}

function CreatorVerificationBanner({ user }: { user: MeUser }) {
  const emailConfirmed = !!user.emailConfirmed;
  const approvalStatus = user.creatorProfile?.approvalStatus ?? "PENDING";
  const rejectionReason = user.creatorProfile?.rejectionReason ?? null;

  if (emailConfirmed && approvalStatus === "APPROVED") return null;

  if (!emailConfirmed) {
    return (
      <div className="mb-6 rounded-[28px] border border-amber-200 bg-amber-50 p-5 text-amber-900">
        <div className="text-sm font-semibold">Bitte bestätige deine E-Mail-Adresse</div>
        <p className="mt-2 text-sm leading-6">
          Dein Creator-Konto ist noch nicht vollständig verifiziert.
        </p>
      </div>
    );
  }

  if (approvalStatus === "REJECTED") {
    return (
      <div className="mb-6 rounded-[28px] border border-rose-200 bg-rose-50 p-5 text-rose-900">
        <div className="text-sm font-semibold">Dein Creator-Profil wurde noch nicht freigegeben</div>
        <p className="mt-2 text-sm leading-6">Bitte prüfe dein Profil und ergänze fehlende Informationen.</p>

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
    <div className="mb-6 rounded-[28px] border border-blue-200 bg-blue-50 p-5 text-blue-900">
      <div className="text-sm font-semibold">Dein Konto wird geprüft</div>
      <p className="mt-2 text-sm leading-6">
        Deine E-Mail-Adresse ist bestätigt. Unser Team prüft aktuell dein Creator-Profil.
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
    async function load() {
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
    }

    load();
  }, [token]);

  const stats = useMemo(() => {
    return {
      total: briefs.length,
      inProgress: briefs.filter((b) => String(b.status).toUpperCase() === "IN_PROGRESS").length,
      review: briefs.filter((b) => String(b.status).toUpperCase() === "REVIEW").length,
      done: briefs.filter((b) => String(b.status).toUpperCase() === "DONE").length,
    };
  }, [briefs]);

  const recentBriefs = useMemo(() => {
    return [...briefs]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);
  }, [briefs]);

  const welcomeName = getCreatorWelcomeName(user);
  const displayName = welcomeName || "Creator";
  const percent = profilePercent(user);

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="hidden md:block">
              <div className="text-sm font-semibold text-gray-400">Creator Dashboard</div>
            </div>

            <div className="ml-auto flex items-center gap-4">
              <Link
                href="/creator/profile"
                className="hidden items-center gap-3 rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 shadow-sm hover:bg-gray-50 sm:inline-flex"
              >
                Profil vervollständigen
                <span className="rounded-full border px-2 py-0.5 text-xs">{percent}%</span>
              </Link>

              <Link
                href="/creator/support"
                className="relative flex h-10 w-10 items-center justify-center rounded-full border bg-white text-gray-950"
                aria-label="Support"
              >
                <Icon name="support" />
              </Link>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eee9e2] text-sm font-semibold text-gray-950">
                {initials(displayName)}
              </div>
            </div>
          </div>

          {user ? <ProfileCompletionBanner role="CREATOR" user={user} /> : null}
          {user ? <CreatorVerificationBanner user={user} /> : null}

          <div className="rounded-[36px] border bg-white/70 p-5 shadow-sm sm:p-8 lg:p-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
                  Willkommen zurück, {displayName} 👋
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                  Hier ist dein aktueller Überblick über deine Briefings, Uploads und nächsten Schritte.
                </p>
              </div>

              <Link
                href="/creator/profile"
                className="inline-flex w-fit rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 shadow-sm hover:bg-gray-50 sm:hidden"
              >
                Profil vervollständigen · {percent}%
              </Link>
            </div>

            {err ? (
              <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
                {err}
              </div>
            ) : null}

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <StatCard
                label="Zugewiesene Briefings"
                value={loading ? 0 : stats.total}
                hint="Aktuell insgesamt"
                icon="brief"
                tone="dark"
              />

              <StatCard
                label="In Bearbeitung"
                value={loading ? 0 : stats.inProgress}
                hint="Aktive Umsetzungen"
                icon="clock"
                tone="violet"
              />

              <StatCard
                label="Abgeschlossen"
                value={loading ? 0 : stats.done}
                hint="Finalisierte Aufträge"
                icon="check"
                tone="green"
              />
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
                <div className="flex items-center justify-between gap-4 border-b pb-5">
                  <h2 className="text-lg font-semibold tracking-tight text-gray-950">
                    Deine zugewiesenen Briefings
                  </h2>

                  <Link href="/creator/briefs" className="text-xs font-semibold text-gray-950 hover:underline">
                    Alle anzeigen
                  </Link>
                </div>

                {loading ? (
                  <div className="mt-8 text-sm text-gray-500">Briefings werden geladen...</div>
                ) : recentBriefs.length === 0 ? (
                  <div className="mt-8 rounded-3xl border border-dashed bg-[#fbfaf7] p-8 text-center">
                    <div className="text-base font-semibold text-gray-950">
                      Noch keine Briefings zugewiesen
                    </div>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      Sobald unser Team dir eine Kampagne zuweist, erscheint sie hier.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentBriefs.map((b) => (
                      <Link
                        key={b.id}
                        href={`/creator/briefs/${b.id}`}
                        className="group flex items-center gap-4 py-5"
                      >
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#f3eee7] text-gray-950">
                          <Icon name="brief" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-gray-950">
                            {b.title}
                          </div>

                          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                            <span>{b.brand.brandProfile?.companyName ?? "Brand"}</span>
                            <span>•</span>
                            <span>{b.nicheGroup ?? "Keine Nische"}</span>
                          </div>
                        </div>

                        <div className="hidden items-center gap-2 text-xs text-gray-500 md:flex">
                          <Icon name="calendar" />
                          {formatDate(b.deadline ?? b.updatedAt)}
                        </div>

                        <span className={statusBadge(b.status)}>{statusLabel(b.status)}</span>

                        <div className="text-gray-950 transition group-hover:translate-x-1">
                          <Icon name="chevron" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                <Link
                  href="/creator/briefs"
                  className="mt-5 flex items-center justify-center gap-2 rounded-2xl border bg-white px-5 py-4 text-sm font-semibold text-gray-950 hover:bg-gray-50"
                >
                  Alle Briefings anzeigen
                  <Icon name="chevron" />
                </Link>
              </section>

              <section className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
                <h2 className="text-lg font-semibold tracking-tight text-gray-950">Schnellzugriff</h2>

                <div className="mt-6">
                  <QuickRow
                    icon="user"
                    title="Profil vervollständigen"
                    subtitle="Erhöhe deine Chancen auf passende Briefings."
                    href="/creator/profile"
                  />
                  <QuickRow
                    icon="upload"
                    title="Deliverable hochladen"
                    subtitle="Lade Content zu einem Briefing hoch."
                    href="/creator/briefs"
                  />
                  <QuickRow
                    icon="support"
                    title="Support kontaktieren"
                    subtitle="Wir helfen dir schnell weiter."
                    href="/creator/support"
                  />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Link
        href="/creator/support"
        className="fixed bottom-6 right-6 z-20 hidden items-center gap-3 rounded-full bg-gray-950 px-6 py-4 text-sm font-semibold text-white shadow-xl hover:opacity-90 md:inline-flex"
      >
        <Icon name="support" />
        Support
      </Link>
    </div>
  );
}