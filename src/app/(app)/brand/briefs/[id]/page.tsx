"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Image as ImageIcon,
  LifeBuoy,
  Megaphone,
  PackageCheck,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type CreatorProfileSafe = {
  nicheGroup?: string | null;
  niches?: string[];
  equipment?: string[];
  profileImageAsset?: {
    bucket: string;
    path: string;
    fileName?: string | null;
  } | null;
};

type CampaignDetail = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  deadline?: string | null;
  licenseTerm?: string | null;
  nicheGroup?: string | null;
  niches?: string[];
  deliverableCount?: number;

  companyName?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;

  consultationRequired?: boolean | null;
  consultationBooked?: boolean | null;
  consultationBookedAt?: string | null;
  consultationBookingUrl?: string | null;

  assignedCreator?: {
    id: string;
    creatorProfile?: CreatorProfileSafe | null;
  } | null;

  _count?: {
    assets?: number;
    deliverables?: number;
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

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("de-DE");
}

function licenseLabel(v?: string | null) {
  if (!v) return "—";
  if (v === "M1") return "1 Monat";
  if (v === "M3") return "3 Monate";
  if (v === "M6") return "6 Monate";
  if (v === "M12") return "12 Monate";
  if (v === "UNLIMITED") return "Unbegrenzt";
  return v;
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

function publicStorageUrl(asset?: { bucket: string; path: string } | null) {
  if (!asset?.bucket || !asset?.path) return "";
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${asset.bucket}/${asset.path}`;
}

function InfoCard(props: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border bg-white p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3eee7] text-gray-950">
        {props.icon}
      </div>
      <div className="mt-5 text-2xl font-semibold text-gray-950">{props.value}</div>
      <div className="mt-1 text-sm text-gray-500">{props.title}</div>
    </div>
  );
}

function Section(props: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-lg font-semibold tracking-tight text-gray-950">{props.title}</h2>
      {props.subtitle ? (
        <p className="mt-1 text-sm leading-6 text-gray-500">{props.subtitle}</p>
      ) : null}
      <div className="mt-6">{props.children}</div>
    </section>
  );
}

export default function BrandCampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const campaignId = params.id;

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        router.push(`/login?next=/brand/briefs/${campaignId}`);
        return;
      }

      const res = await fetch(`/api/brand/briefs/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const { json, text } = await readSafeJson(res);
      if (!res.ok) throw new Error(json?.error ?? text.slice(0, 200));

      setCampaign((json?.brief ?? json?.campaign ?? null) as CampaignDetail | null);
    } catch (e: any) {
      setError(e?.message ?? "Kampagne konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  const creatorProfile = campaign?.assignedCreator?.creatorProfile ?? null;
  const creatorImageUrl = useMemo(
    () => publicStorageUrl(creatorProfile?.profileImageAsset ?? null),
    [creatorProfile]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf7] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[36px] border bg-white p-8 text-sm text-gray-500 shadow-sm">
          Kampagne wird geladen...
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-[#fbfaf7] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/brand/briefs"
            className="inline-flex rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-50"
          >
            ← Zurück zu Kampagnen
          </Link>

          <div className="mt-6 rounded-[36px] border border-rose-200 bg-rose-50 p-8 text-sm text-rose-800">
            {error ?? "Kampagne wurde nicht gefunden."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/brand/briefs"
            className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-50"
          >
            ← Alle Kampagnen
          </Link>

          <Link
            href="/brand/support"
            className="inline-flex items-center gap-2 rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-50"
          >
            <LifeBuoy className="h-4 w-4" />
            Support
          </Link>
        </div>

        <div className="rounded-[36px] border bg-white/70 p-5 shadow-sm sm:p-8 lg:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Kampagnendetail
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
                {campaign.title}
              </h1>

              <div className="mt-5 flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                    campaign.status
                  )}`}
                >
                  {statusLabel(campaign.status)}
                </span>

                <span
                  className={
                    campaign.consultationBooked
                      ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900"
                      : "rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900"
                  }
                >
                  {campaign.consultationBooked ? "Erstgespräch gebucht" : "Erstgespräch ausstehend"}
                </span>
              </div>

              <p className="mt-5 max-w-3xl text-sm leading-6 text-gray-500">
                Hier findest du alle wichtigen Informationen, Dateien, Termine und nächsten Schritte zu dieser Kampagne.
              </p>
            </div>

            <div className="rounded-[28px] border bg-white p-5 shadow-sm lg:w-[320px]">
              <div className="text-sm font-semibold text-gray-950">Nächster Schritt</div>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Unser Team prüft die Kampagne und koordiniert die nächsten Schritte über Primely Content.
              </p>

              <Link
                href="/brand/support"
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gray-950 px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                Rückfrage stellen
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-4">
            <InfoCard
              title="Videos"
              value={campaign.deliverableCount ?? 1}
              icon={<PackageCheck className="h-5 w-5" />}
            />
            <InfoCard
              title="Dateien"
              value={campaign._count?.assets ?? 0}
              icon={<FileText className="h-5 w-5" />}
            />
            <InfoCard
              title="Deliverables"
              value={campaign._count?.deliverables ?? 0}
              icon={<CheckCircle className="h-5 w-5" />}
            />
            <InfoCard
              title="Support"
              value={campaign._count?.supportTickets ?? 0}
              icon={<LifeBuoy className="h-5 w-5" />}
            />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Section
              title="Kampagneninformationen"
              subtitle="Zusammenfassung der wichtigsten Angaben."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border bg-[#fbfaf7] p-4">
                  <div className="text-xs text-gray-500">Erstellt</div>
                  <div className="mt-1 text-sm font-semibold text-gray-950">
                    {formatDate(campaign.createdAt)}
                  </div>
                </div>

                <div className="rounded-2xl border bg-[#fbfaf7] p-4">
                  <div className="text-xs text-gray-500">Zuletzt aktualisiert</div>
                  <div className="mt-1 text-sm font-semibold text-gray-950">
                    {formatDate(campaign.updatedAt)}
                  </div>
                </div>

                <div className="rounded-2xl border bg-[#fbfaf7] p-4">
                  <div className="text-xs text-gray-500">Deadline</div>
                  <div className="mt-1 text-sm font-semibold text-gray-950">
                    {formatDate(campaign.deadline)}
                  </div>
                </div>

                <div className="rounded-2xl border bg-[#fbfaf7] p-4">
                  <div className="text-xs text-gray-500">Lizenz</div>
                  <div className="mt-1 text-sm font-semibold text-gray-950">
                    {licenseLabel(campaign.licenseTerm)}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border bg-[#fbfaf7] p-4">
                <div className="text-xs text-gray-500">Beschreibung</div>
                <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {campaign.description?.trim() || "Keine Beschreibung hinterlegt."}
                </div>
              </div>
            </Section>

            <Section
              title="Erstgespräch"
              subtitle="Terminstatus für diese Kampagne."
            >
              <div
                className={
                  campaign.consultationBooked
                    ? "rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"
                    : "rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900"
                }
              >
                <div className="flex items-start gap-3">
                  {campaign.consultationBooked ? (
                    <CheckCircle className="mt-0.5 h-5 w-5" />
                  ) : (
                    <Clock className="mt-0.5 h-5 w-5" />
                  )}

                  <div>
                    <div className="text-sm font-semibold">
                      {campaign.consultationBooked
                        ? "Erstgespräch gebucht"
                        : "Erstgespräch noch ausstehend"}
                    </div>
                    <div className="mt-1 text-sm leading-6">
                      {campaign.consultationBooked
                        ? `Termin bestätigt: ${formatDateTime(campaign.consultationBookedAt)}`
                        : "Bitte buche das Erstgespräch, damit wir die Kampagne final prüfen können."}
                    </div>
                  </div>
                </div>
              </div>

              {campaign.consultationBookingUrl ? (
                <a
                  href={campaign.consultationBookingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-50"
                >
                  Termin öffnen
                </a>
              ) : null}
            </Section>

            <Section
              title="Nischen & Fokus"
              subtitle="Diese Angaben nutzen wir für Creator-Matching und Kampagnenbewertung."
            >
              <div className="flex flex-wrap gap-2">
                {campaign.nicheGroup ? (
                  <span className="rounded-full bg-gray-950 px-4 py-2 text-xs font-semibold text-white">
                    {campaign.nicheGroup}
                  </span>
                ) : null}

                {(campaign.niches ?? []).map((n) => (
                  <span
                    key={n}
                    className="rounded-full border bg-white px-4 py-2 text-xs font-semibold text-gray-700"
                  >
                    {n}
                  </span>
                ))}

                {!campaign.nicheGroup && (campaign.niches ?? []).length === 0 ? (
                  <span className="text-sm text-gray-500">Keine Nischen hinterlegt.</span>
                ) : null}
              </div>
            </Section>

            <Section
              title="Creator"
              subtitle="Creator-Informationen werden anonymisiert angezeigt. Die Kommunikation läuft über Primely Content."
            >
              {creatorProfile ? (
                <div className="rounded-3xl border bg-[#fbfaf7] p-5">
                  <div className="flex items-center gap-5">
                    <div className="relative h-24 w-24 overflow-hidden rounded-3xl border bg-white">
                      {creatorImageUrl ? (
                        <Image
                          src={creatorImageUrl}
                          alt="Creator Profilbild"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-gray-950">
                        Creator wurde ausgewählt
                      </div>
                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        Persönliche Kontaktdaten werden nicht angezeigt. Alle Abstimmungen erfolgen über Primely Content.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {creatorProfile.nicheGroup ? (
                      <span className="rounded-full bg-gray-950 px-3 py-1 text-xs font-semibold text-white">
                        {creatorProfile.nicheGroup}
                      </span>
                    ) : null}

                    {(creatorProfile.niches ?? []).slice(0, 5).map((n) => (
                      <span
                        key={n}
                        className="rounded-full border bg-white px-3 py-1 text-xs text-gray-600"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed bg-[#fbfaf7] p-8 text-center">
                  <Megaphone className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-3 text-sm font-semibold text-gray-950">
                    Noch kein Creator zugewiesen
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Nach der Prüfung schlagen wir passende Creator für diese Kampagne vor.
                  </p>
                </div>
              )}
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}