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

type BriefStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "REVIEW"
  | "IN_PROGRESS"
  | "DONE"
  | "DECLINED"
  | "APPROVED"
  | string;

type BriefListItem = {
  id: string;
  title: string;
  status: BriefStatus;
  createdAt: string;
  updatedAt: string;
  deadline: string | null;
  licenseTerm: "M1" | "M3" | "M6" | "M12" | "UNLIMITED" | null;
  nicheGroup: string | null;
  niches: string[];
  consultationBooked?: boolean | null;
  consultationBookedAt?: string | null;
  consultationBookingUrl?: string | null;
  _count?: { assets: number; deliverables: number };
};

type MeUser = {
  id: string;
  email: string;
  role: "BRAND" | "CREATOR" | "STAFF";
  brandProfile?: {
    companyName?: string | null;
    contactName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    billingEmail?: string | null;
    billingCompanyName?: string | null;
    vatId?: string | null;
    addressLine1?: string | null;
    city?: string | null;
    postalCode?: string | null;
    country?: string | null;
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

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function consultationLabel(b: BriefListItem) {
  if (b.consultationBooked) return "Erstgespräch gebucht";
  if (String(b.status).toUpperCase() === "DRAFT") return "Entwurf";
  return "Erstgespräch ausstehend";
}

function consultationBadgeClass(b: BriefListItem) {
  if (b.consultationBooked) return "bg-emerald-50 text-emerald-800 border-emerald-100";
  if (String(b.status).toUpperCase() === "DRAFT") return "bg-gray-50 text-gray-700 border-gray-100";
  return "bg-amber-50 text-amber-800 border-amber-100";
}

function getBrandWelcomeName(user: MeUser | null) {
  if (!user) return "";
  return (
    user.brandProfile?.companyName?.trim() ||
    user.brandProfile?.contactName?.trim() ||
    user.email ||
    ""
  );
}

function initials(name: string) {
  const clean = name.trim();
  if (!clean) return "B";
  return clean
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
}

function Icon(props: {
  name:
    | "grid"
    | "file"
    | "eye"
    | "check"
    | "user"
    | "bank"
    | "bell"
    | "support"
    | "calendar"
    | "chevron";
}) {
  const common = "h-5 w-5";

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

  if (props.name === "file") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 17h6" />
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

  if (props.name === "user") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.6-4 14.4-4 16 0" />
      </svg>
    );
  }

  if (props.name === "bank") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 10h18L12 4z" />
        <path d="M5 10v8M10 10v8M14 10v8M19 10v8M3 20h18" />
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
  icon: "file" | "eye" | "check";
  dark?: boolean;
}) {
  return (
    <div className="rounded-[28px] border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-5">
        <div>
          <div className="text-sm font-medium text-gray-700">{props.label}</div>
          <div className="mt-5 text-4xl font-semibold tracking-tight text-gray-950">
            {props.value}
          </div>
          <div className="mt-3 text-sm text-gray-500">{props.hint}</div>
        </div>

        <div
          className={
            props.dark
              ? "flex h-16 w-16 items-center justify-center rounded-full bg-gray-950 text-white shadow-sm"
              : "flex h-16 w-16 items-center justify-center rounded-full border bg-gray-50 text-gray-950"
          }
        >
          <Icon name={props.icon} />
        </div>
      </div>
    </div>
  );
}

function TaskRow(props: {
  icon: "user" | "bank" | "bell" | "check";
  title: string;
  subtitle: string;
  href: string;
  done: boolean;
}) {
  return (
    <Link href={props.href} className="group flex items-center gap-4 border-b py-6 last:border-b-0">
      <div
        className={
          props.done
            ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-800"
            : "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f3eee7] text-gray-950"
        }
      >
        {props.done ? <Icon name="check" /> : <Icon name={props.icon} />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-gray-950">{props.title}</div>
          {props.done ? (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
              Erledigt
            </span>
          ) : null}
        </div>
        <div className="mt-1 text-xs leading-5 text-gray-500">{props.subtitle}</div>
      </div>

      <div className="text-gray-950 transition group-hover:translate-x-1">
        <Icon name="chevron" />
      </div>
    </Link>
  );
}

export default function BrandDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<BriefListItem[]>([]);
  const [user, setUser] = useState<MeUser | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      router.push("/login?next=/brand/dashboard");
      return;
    }

    const [briefsRes, meRes, settingsRes] = await Promise.all([
      fetch("/api/brand/briefs", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch("/api/settings", {
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

    setSettingsLoaded(settingsRes.ok);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const running = items.filter((x) =>
      ["SUBMITTED", "REVIEW", "IN_PROGRESS", "APPROVED"].includes(String(x.status).toUpperCase())
    ).length;

    const review = items.filter((x) =>
      ["SUBMITTED", "REVIEW"].includes(String(x.status).toUpperCase())
    ).length;

    const done = items.filter((x) => ["DONE"].includes(String(x.status).toUpperCase())).length;

    const waitingCall = items.filter(
      (x) => !x.consultationBooked && String(x.status).toUpperCase() !== "DRAFT"
    ).length;

    return { running, review, done, waitingCall };
  }, [items]);

  const recentCampaigns = useMemo(() => {
    return [...items]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2);
  }, [items]);

  const taskState = useMemo(() => {
    const p = user?.brandProfile;

    const profileDone = Boolean(
      p?.companyName?.trim() &&
        p?.contactName?.trim() &&
        (p?.contactEmail?.trim() || user?.email)
    );

    const businessDone = Boolean(
      p?.billingEmail?.trim() ||
        p?.billingCompanyName?.trim() ||
        (p?.addressLine1?.trim() && p?.city?.trim() && p?.postalCode?.trim())
    );

    const firstCampaignDone = items.length > 0;

    return {
      profileDone,
      businessDone,
      settingsDone: settingsLoaded,
      firstCampaignDone,
    };
  }, [user, items.length, settingsLoaded]);

  const welcomeName = getBrandWelcomeName(user);
  const displayName = welcomeName || "Brand";

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="hidden md:block">
              <div className="text-sm font-semibold text-gray-400">Brand Dashboard</div>
            </div>

            <div className="ml-auto flex items-center gap-4">
              <Link
                href="/brand/briefs/new"
                className="hidden rounded-full bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 sm:inline-flex"
              >
                Neue Kampagne
              </Link>

              <Link
                href="/brand/support"
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

          {user ? <ProfileCompletionBanner role="BRAND" user={user} /> : null}

          <div className="rounded-[36px] border bg-white/70 p-5 shadow-sm sm:p-8 lg:p-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
                  Willkommen zurück, {displayName} 👋
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                  Hier findest du den aktuellen Überblick über deine Kampagnen, offene Aufgaben und nächste Schritte.
                </p>
              </div>

              <Link
                href="/brand/briefs/new"
                className="inline-flex w-fit rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 sm:hidden"
              >
                Neue Kampagne
              </Link>
            </div>

            {error ? (
              <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
                {error}
              </div>
            ) : null}

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <StatCard
                label="Laufende Kampagnen"
                value={loading ? 0 : stats.running}
                hint={stats.waitingCall > 0 ? `${stats.waitingCall} Erstgespräch ausstehend` : "Aktuell in Bearbeitung"}
                icon="file"
                dark
              />
              <StatCard
                label="In Prüfung"
                value={loading ? 0 : stats.review}
                hint="Prüfung durch unser Team"
                icon="eye"
              />
              <StatCard
                label="Abgeschlossen"
                value={loading ? 0 : stats.done}
                hint="Erfolgreich finalisiert"
                icon="check"
              />
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold tracking-tight text-gray-950">
                    Letzte erstellte Kampagnen
                  </h2>
                  <Link href="/brand/briefs" className="text-xs font-semibold text-gray-950 hover:underline">
                    Alle anzeigen
                  </Link>
                </div>

                {loading ? (
                  <div className="mt-8 text-sm text-gray-500">Kampagnen werden geladen...</div>
                ) : recentCampaigns.length === 0 ? (
                  <div className="mt-8 rounded-3xl border border-dashed bg-[#fbfaf7] p-8 text-center">
                    <div className="text-base font-semibold text-gray-950">Noch keine Kampagnen</div>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      Starte deine erste Kampagne und buche direkt dein Erstgespräch.
                    </p>
                    <Link
                      href="/brand/briefs/new"
                      className="mt-5 inline-flex rounded-full bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white"
                    >
                      Kampagne erstellen
                    </Link>
                  </div>
                ) : (
                  <div className="mt-6 divide-y">
                    {recentCampaigns.map((b) => (
                      <Link
                        key={b.id}
                        href={`/brand/briefs/${b.id}`}
                        className="group flex items-center gap-4 py-5"
                      >
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#f3eee7] text-gray-950">
                          <Icon name="file" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-gray-950">
                            {b.title}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            Erstellt am {formatDate(b.createdAt)}
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${consultationBadgeClass(b)}`}>
                              {consultationLabel(b)}
                            </span>

                            {b.deadline ? (
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-gray-500">
                                <Icon name="calendar" />
                                {formatDate(b.deadline)}
                              </span>
                            ) : null}
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
                  href="/brand/briefs"
                  className="mt-5 flex items-center justify-center gap-2 rounded-2xl border bg-white px-5 py-4 text-sm font-semibold text-gray-950 hover:bg-gray-50"
                >
                  Alle Kampagnen anzeigen
                  <Icon name="chevron" />
                </Link>
              </section>

              <section className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
                <h2 className="text-lg font-semibold tracking-tight text-gray-950">Aufgaben</h2>

                <div className="mt-6">
                  <TaskRow
                    icon="user"
                    title="Profil vervollständigen"
                    subtitle="Erhöhe die Qualität deiner Kampagnen-Anfragen."
                    href="/brand/profile"
                    done={taskState.profileDone}
                  />
                  <TaskRow
                    icon="bank"
                    title="Unternehmensdaten prüfen"
                    subtitle="Halte Rechnungs- und Kontaktdaten aktuell."
                    href="/brand/profile"
                    done={taskState.businessDone}
                  />
                  <TaskRow
                    icon="bell"
                    title="Benachrichtigungen verwalten"
                    subtitle="Verpasse keine Updates zu deinen Kampagnen."
                    href="/brand/settings"
                    done={taskState.settingsDone}
                  />
                  <TaskRow
                    icon="check"
                    title="Erste Kampagne erstellen"
                    subtitle="Starte deinen ersten UGC-Auftrag über die Plattform."
                    href="/brand/briefs/new"
                    done={taskState.firstCampaignDone}
                  />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Link
        href="/brand/support"
        className="fixed bottom-6 right-6 z-20 hidden items-center gap-3 rounded-full bg-gray-950 px-6 py-4 text-sm font-semibold text-white shadow-xl hover:opacity-90 md:inline-flex"
      >
        <Icon name="support" />
        Support
      </Link>
    </div>
  );
}