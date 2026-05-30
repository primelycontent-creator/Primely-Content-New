"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CAL_BOOKING_URL = "https://cal.com/primely-content-htyfnn/30min";

const LICENSE_OPTIONS = [
  "1 Monat",
  "3 Monate",
  "6 Monate",
  "12 Monate",
  "Unbegrenzt",
] as const;

type LicenseLabel = (typeof LICENSE_OPTIONS)[number];

const NICHE_GROUPS = {
  "Beauty & Skincare": ["Hautpflege", "Make-up", "Anti-Aging", "Naturkosmetik"],
  "Fitness & Gesundheit": [
    "Supplements",
    "Home Workouts",
    "Fitness-Programme",
    "Abnehmprodukte",
    "Biohacking",
  ],
  Fashion: ["Streetwear", "Sportbekleidung", "Schmuck", "Taschen", "Sneaker"],
  "Tech & Gadgets": [
    "Smartphones & Zubehör",
    "Gimbals",
    "Kameras",
    "Smartwatches",
    "KI-Tools & Apps",
  ],
  "Home & Living": [
    "Einrichtung",
    "Küchengadgets",
    "Haushaltshelfer",
    "DIY-Produkte",
    "Dekoration",
  ],
  "Food & Getränke": [
    "Proteinprodukte",
    "Kaffee-Marken",
    "Energy Drinks",
    "Süßigkeiten",
    "Kochboxen",
  ],
  "Persönlichkeitsentwicklung & Coaching": [
    "Online-Kurse",
    "Trading",
    "Mindset",
    "Dating-Coaching",
    "Business-Coaching",
  ],
  "Finanzen & Versicherungen": [
    "Investment-Apps",
    "Kryptowährungen",
    "Versicherungen",
    "Kreditkarten",
  ],
  Haustiere: ["Hundefutter", "Katzenzubehör", "Spielzeug", "Pflegeprodukte"],
  "Reisen & Lifestyle": [
    "Reisegadgets",
    "Hotels",
    "Koffer",
    "Camper",
    "Auslandsversicherungen",
  ],
} as const;

type NicheGroup = keyof typeof NICHE_GROUPS;

type BrandProfile = {
  companyName?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
};

type BriefDetailDto = {
  id: string;
  consultationBooked?: boolean | null;
  consultationBookedAt?: string | null;
  consultationBookingUrl?: string | null;
};

function safeFileName(name: string) {
  return name.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
}

function mergeUniqueFiles(prev: File[], incoming: File[], max = 10) {
  const map = new Map<string, File>();
  for (const f of prev) map.set(`${f.name}-${f.size}`, f);
  for (const f of incoming) map.set(`${f.name}-${f.size}`, f);
  return Array.from(map.values()).slice(0, max);
}

function bytesToMb(n?: number | null) {
  if (!n || n <= 0) return "";
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

async function readSafeJson(res: Response) {
  const text = await res.text();
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

function mapLicenseToApi(value: LicenseLabel) {
  if (value === "1 Monat") return "M1";
  if (value === "3 Monate") return "M3";
  if (value === "6 Monate") return "M6";
  if (value === "12 Monate") return "M12";
  return "UNLIMITED";
}

function Icon(props: {
  name:
    | "file"
    | "calendar"
    | "upload"
    | "check"
    | "chevron"
    | "brief"
    | "target"
    | "info";
}) {
  const common = "h-5 w-5";
  if (props.name === "file") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 17h6" />
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
  if (props.name === "upload") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 16V4" />
        <path d="m7 9 5-5 5 5" />
        <path d="M4 20h16" />
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
  if (props.name === "brief") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M3 13h18" />
      </svg>
    );
  }
  if (props.name === "target") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1" />
      </svg>
    );
  }
  if (props.name === "info") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 10v6" />
        <path d="M12 7h.01" />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function Section(props: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          {props.icon ? (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f3eee7] text-gray-950">
              {props.icon}
            </div>
          ) : null}

          <div>
            {props.eyebrow ? (
              <div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                {props.eyebrow}
              </div>
            ) : null}
            <h2 className="text-lg font-semibold tracking-tight text-gray-950">{props.title}</h2>
            {props.subtitle ? (
              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">{props.subtitle}</p>
            ) : null}
          </div>
        </div>

        {props.right ? <div className="shrink-0">{props.right}</div> : null}
      </div>

      <div className="mt-6">{props.children}</div>
    </section>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-gray-950/10 disabled:bg-gray-50 disabled:text-gray-500 " +
        (props.className ?? "")
      }
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={
        "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-gray-950/10 disabled:bg-gray-50 disabled:text-gray-500 " +
        (props.className ?? "")
      }
    />
  );
}

async function presignUpload(token: string, bucket: string, path: string) {
  const res = await fetch("/api/storage/presign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bucket, path }),
  });

  const { json, text } = await readSafeJson(res);

  if (!res.ok) {
    throw new Error(json?.error ?? `Upload-Vorbereitung fehlgeschlagen: ${text.slice(0, 200)}`);
  }

  if (!json?.token || !json?.path) {
    throw new Error("Upload-Vorbereitung hat keinen Token/Pfad zurückgegeben.");
  }

  return json as { bucket: string; path: string; token: string; signedUrl?: string };
}

export default function NewBriefPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [savingDraft, setSavingDraft] = useState(false);
  const [savingFinal, setSavingFinal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [checkingBooking, setCheckingBooking] = useState(false);

  const [draftBriefId, setDraftBriefId] = useState<string | null>(null);
  const [consultationBooked, setConsultationBooked] = useState(false);
  const [consultationBookedAt, setConsultationBookedAt] = useState<string | null>(null);

  const companyName = profile?.companyName || "";
  const contactName = profile?.contactName || "";
  const contactEmail = profile?.contactEmail || "";
  const contactPhone = profile?.contactPhone || "";

  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState<string>("");
  const [licenseTerm, setLicenseTerm] = useState<LicenseLabel>("3 Monate");
  const [deliverableCount, setDeliverableCount] = useState<number>(1);
  const [description, setDescription] = useState("");

  const groups = Object.keys(NICHE_GROUPS) as NicheGroup[];
  const [activeGroup, setActiveGroup] = useState<NicheGroup>(groups[0]);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const activeSubs = NICHE_GROUPS[activeGroup];

  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formLocked = Boolean(draftBriefId);

  const calUrl = useMemo(() => {
    const rawUrl = CAL_BOOKING_URL.trim();
    if (!rawUrl) return "";

    try {
      const url = new URL(rawUrl);

      if (contactName) url.searchParams.set("name", contactName);
      if (contactEmail) url.searchParams.set("email", contactEmail);
      if (title) {
        url.searchParams.set(
          "notes",
          `Briefing: ${title}${draftBriefId ? ` | Briefing-ID: ${draftBriefId}` : ""}`
        );
      }

      if (draftBriefId) {
        url.searchParams.set("metadata[briefId]", draftBriefId);
        url.searchParams.set("metadata[bookingType]", "INITIAL");
      }

      return url.toString();
    } catch {
      return "";
    }
  }, [contactName, contactEmail, title, draftBriefId]);

  const canCreateDraft = useMemo(() => {
    return (
      !!title.trim() &&
      !!companyName.trim() &&
      !!contactName.trim() &&
      !!contactEmail.trim() &&
      !savingDraft &&
      !savingFinal &&
      !uploading
    );
  }, [
    title,
    companyName,
    contactName,
    contactEmail,
    savingDraft,
    savingFinal,
    uploading,
  ]);

  const canSubmit = useMemo(() => {
    return Boolean(draftBriefId && consultationBooked && !savingFinal && !uploading);
  }, [draftBriefId, consultationBooked, savingFinal, uploading]);

  const nichesHint = useMemo(
    () => `${selectedNiches.length}/5 ausgewählt`,
    [selectedNiches.length]
  );

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

        if (!token) {
          router.push("/login?next=/brand/briefs/new");
          return;
        }

        const res = await fetch("/api/brand/profile", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        const { json, text } = await readSafeJson(res);

        if (!res.ok) {
          throw new Error(json?.error ?? text.slice(0, 200));
        }

        if (!json?.profile || !json.profile.companyName) {
          router.push("/brand/profile");
          return;
        }

        setProfile(json.profile as BrandProfile);
      } catch (e: any) {
        alert(e?.message ?? "Brand-Profil konnte nicht geladen werden.");
      } finally {
        setProfileLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  useEffect(() => {
    if (!draftBriefId || consultationBooked) return;

    const interval = window.setInterval(() => {
      checkConsultationStatus(false);
    }, 5000);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftBriefId, consultationBooked]);

  async function requireSession() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const userId = data.session?.user?.id;

    if (!token || !userId) {
      router.push("/login?next=/brand/briefs/new");
      return null;
    }

    return { token, userId };
  }

  function toggleNiche(n: string) {
    if (formLocked) return;

    setSelectedNiches((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n);
      if (prev.length >= 5) return prev;
      return [...prev, n];
    });
  }

  function clearNiches() {
    if (formLocked) return;
    setSelectedNiches([]);
  }

  function onPickFiles(list: FileList | null) {
    if (!list || formLocked) return;
    setFiles((prev) => mergeUniqueFiles(prev, Array.from(list), 10));
  }

  function removeFile(idx: number) {
    if (formLocked) return;
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function createDraftBrief(token: string) {
    const res = await fetch("/api/brand/briefs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
        deadline: deadline
          ? new Date(Date.now() + Number(deadline) * 24 * 60 * 60 * 1000).toISOString()
          : null,
        licenseTerm: mapLicenseToApi(licenseTerm),
        deliverableCount,
        nicheGroup: activeGroup,
        niches: selectedNiches.slice(0, 5),
        companyName: companyName.trim() || null,
        contactName: contactName.trim() || null,
        contactEmail: contactEmail.trim() || null,
        contactPhone: contactPhone.trim() || null,
        consultationRequired: true,
      }),
    });

    const { json, text } = await readSafeJson(res);

    if (!res.ok) {
      throw new Error(json?.error ?? `Briefing konnte nicht gespeichert werden: ${text.slice(0, 200)}`);
    }

    const briefId = (json?.brief?.id || json?.briefId) as string | undefined;
    if (!briefId) throw new Error("Briefing wurde gespeichert, aber keine Briefing-ID zurückgegeben.");

    return briefId;
  }

  async function uploadAllFiles(token: string, userId: string, briefId: string) {
    if (files.length === 0) return;

    setUploading(true);

    try {
      for (const file of files) {
        const bucket = "ugc";
        const path = `users/${userId}/briefs/${briefId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;

        const presign = await presignUpload(token, bucket, path);

        const up = await supabase.storage
          .from(bucket)
          .uploadToSignedUrl(presign.path, presign.token, file, {
            contentType: file.type || "application/octet-stream",
          });

        if (up.error) throw new Error(up.error.message ?? "Upload fehlgeschlagen.");
      }
    } finally {
      setUploading(false);
    }
  }

  async function startBookingStep() {
    try {
      setSavingDraft(true);

      const session = await requireSession();
      if (!session) return;

      const briefId = await createDraftBrief(session.token);
      await uploadAllFiles(session.token, session.userId, briefId);

      setDraftBriefId(briefId);
      setConsultationBooked(false);
      setConsultationBookedAt(null);
    } catch (e: any) {
      alert(e?.message ?? "Briefing konnte nicht vorbereitet werden.");
    } finally {
      setSavingDraft(false);
      setUploading(false);
    }
  }

  async function checkConsultationStatus(showAlert = true) {
    if (!draftBriefId) return;

    try {
      setCheckingBooking(true);

      const session = await requireSession();
      if (!session) return;

      const res = await fetch(`/api/brand/briefs/${draftBriefId}`, {
        headers: { Authorization: `Bearer ${session.token}` },
        cache: "no-store",
      });

      const { json, text } = await readSafeJson(res);

      if (!res.ok) {
        throw new Error(json?.error ?? text.slice(0, 200));
      }

      const brief = ((json as any)?.brief ?? null) as BriefDetailDto | null;

      if (brief?.consultationBooked) {
        setConsultationBooked(true);
        setConsultationBookedAt(brief.consultationBookedAt ?? null);
        return;
      }

      if (showAlert) {
        alert("Der Termin wurde noch nicht bestätigt. Bitte buche das Erstgespräch im Kalender.");
      }
    } catch (e: any) {
      if (showAlert) alert(e?.message ?? "Terminstatus konnte nicht geprüft werden.");
    } finally {
      setCheckingBooking(false);
    }
  }

  async function submitBrief(token: string, briefId: string) {
    const res = await fetch(`/api/brand/briefs/${briefId}/submit`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const { json, text } = await readSafeJson(res);

    if (!res.ok) {
      throw new Error(json?.error ?? `Einreichen fehlgeschlagen: ${text.slice(0, 200)}`);
    }
  }

  async function onSubmit() {
    if (!draftBriefId) {
      alert("Bitte speichere zuerst das Briefing und buche danach das Erstgespräch.");
      return;
    }

    if (!consultationBooked) {
      alert("Bitte buche zuerst das Erstgespräch. Danach wird das Briefing automatisch freigeschaltet.");
      return;
    }

    try {
      setSavingFinal(true);

      const session = await requireSession();
      if (!session) return;

      await submitBrief(session.token, draftBriefId);

      router.push("/brand/dashboard");
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "Briefing konnte nicht eingereicht werden.");
    } finally {
      setSavingFinal(false);
    }
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#fbfaf7] px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-6xl rounded-[36px] border bg-white p-8 text-sm text-gray-500 shadow-sm">
          Profil wird geladen...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/brand/dashboard"
            className="inline-flex items-center gap-2 rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-50"
          >
            ← Zurück
          </Link>

          <Link
            href="/brand/support"
            className="hidden rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-50 sm:inline-flex"
          >
            Support
          </Link>
        </div>

        <div className="rounded-[36px] border bg-white/70 p-5 shadow-sm sm:p-8 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Neues Briefing
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
                Briefing erstellen
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500">
                Erstelle deine Kampagnenanfrage und buche direkt das Erstgespräch.
                Nach dem Termin prüfen wir dein Briefing und besprechen die nächsten Schritte.
              </p>
            </div>

            <div className="rounded-[28px] border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3eee7] text-gray-950">
                  <Icon name="calendar" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-950">Ablauf</div>
                  <div className="text-xs text-gray-500">Briefing + Erstgespräch</div>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-gray-600">
                <div className="flex gap-3">
                  <span className="font-semibold text-gray-950">1.</span>
                  <span>Briefingdaten ausfüllen</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-semibold text-gray-950">2.</span>
                  <span>Erstgespräch im Kalender buchen</span>
                </div>
                <div className="flex gap-3">
                  <span className="font-semibold text-gray-950">3.</span>
                  <span>Briefing final einreichen</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6">
            <Section
              eyebrow="Schritt 1"
              title="Kontaktinformationen"
              subtitle="Diese Angaben übernehmen wir automatisch aus deinem Brand-Profil."
              icon={<Icon name="brief" />}
              right={
                <Link href="/brand/profile" className="text-xs font-semibold text-gray-500 underline">
                  Profil bearbeiten
                </Link>
              }
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Firma</label>
                  <Input className="mt-2" value={companyName} readOnly />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Ansprechpartner</label>
                  <Input className="mt-2" value={contactName} readOnly />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">E-Mail</label>
                  <Input className="mt-2" value={contactEmail} readOnly />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Telefon</label>
                  <Input className="mt-2" value={contactPhone} readOnly />
                </div>
              </div>
            </Section>

            <Section
              eyebrow="Schritt 2"
              title="Kampagnendaten"
              subtitle="Diese Informationen helfen uns, passende Creator und eine realistische Umsetzung einzuschätzen."
              icon={<Icon name="file" />}
            >
              <div className="grid gap-5">
                <div>
                  <label className="text-sm font-medium text-gray-700">Briefing-Titel</label>
                  <Input
                    className="mt-2"
                    disabled={formLocked}
                    placeholder="z. B. TikTok UGC für neues Produkt"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Deadline</label>
                    <select
                      value={deadline}
                      disabled={formLocked}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10 disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="">Keine Deadline</option>
                      <option value="7">7 Tage</option>
                      <option value="14">14 Tage</option>
                      <option value="30">30 Tage</option>
                      <option value="60">60 Tage</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Anzahl Videos</label>
                    <select
                      value={String(deliverableCount)}
                      disabled={formLocked}
                      onChange={(e) => setDeliverableCount(Number(e.target.value))}
                      className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10 disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="1">1 Video</option>
                      <option value="2">2 Videos</option>
                      <option value="3">3 Videos</option>
                      <option value="4">4 Videos</option>
                      <option value="5">5 Videos</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Lizenz</label>
                    <select
                      value={licenseTerm}
                      disabled={formLocked}
                      onChange={(e) => setLicenseTerm(e.target.value as LicenseLabel)}
                      className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-950/10 disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      {LICENSE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </Section>

            <Section
              eyebrow="Schritt 3"
              title="Beschreibung"
              subtitle="Je klarer das Briefing, desto besser können wir Creator, Skriptidee und Umsetzung vorbereiten."
              icon={<Icon name="info" />}
            >
              <label className="text-sm font-medium text-gray-700">
                Kampagnenbeschreibung <span className="text-gray-400">(optional)</span>
              </label>
              <Textarea
                disabled={formLocked}
                className="mt-2 min-h-[220px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschreibe Produkt, Zielgruppe, gewünschte Hooks, No-Gos, Must-haves, Beispielvideos oder besondere Anforderungen."
              />
            </Section>

            <Section
              eyebrow="Schritt 4"
              title="Ziel-Nischen"
              subtitle="Wähle die Nischen, die am besten zu Produkt und Zielgruppe passen."
              icon={<Icon name="target" />}
              right={
                <div className="flex items-center gap-3">
                  <span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                    {nichesHint}
                  </span>
                  <button
                    type="button"
                    onClick={clearNiches}
                    disabled={formLocked}
                    className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Zurücksetzen
                  </button>
                </div>
              }
            >
              <div className="text-xs font-semibold text-gray-600">Nischengruppe</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {groups.map((g) => {
                  const active = g === activeGroup;
                  return (
                    <button
                      key={g}
                      type="button"
                      disabled={formLocked}
                      onClick={() => setActiveGroup(g)}
                      className={
                        active
                          ? "rounded-full bg-gray-950 px-4 py-2 text-xs font-semibold text-white"
                          : "rounded-full border bg-white px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                      }
                    >
                      {g}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border bg-[#fbfaf7] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-xs font-semibold text-gray-600">
                    {activeGroup} – Unter-Nischen
                  </div>
                  <div className="text-xs text-gray-500">max. 5</div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {activeSubs.map((n) => {
                    const selected = selectedNiches.includes(n);
                    const disabled = (!selected && selectedNiches.length >= 5) || formLocked;

                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => toggleNiche(n)}
                        disabled={disabled}
                        className={
                          selected
                            ? "rounded-full bg-gray-950 px-4 py-2 text-xs font-semibold text-white"
                            : disabled
                            ? "rounded-full border bg-white px-4 py-2 text-xs font-semibold text-gray-400 opacity-60"
                            : "rounded-full border bg-white px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50"
                        }
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Section>

            <Section
              eyebrow="Schritt 5"
              title="Dateien"
              subtitle="Optional. Lade Produktbilder, Beispielvideos, Guidelines oder weitere Unterlagen hoch."
              icon={<Icon name="upload" />}
              right={
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={formLocked}
                  className="rounded-full border bg-white px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                >
                  Dateien hinzufügen
                </button>
              }
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => onPickFiles(e.target.files)}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              />

              <div className="rounded-2xl border bg-[#fbfaf7] p-4">
                {files.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    Keine Dateien ausgewählt.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {files.map((f, idx) => (
                      <div
                        key={`${f.name}-${f.size}-${idx}`}
                        className="flex items-center justify-between gap-4 rounded-xl border bg-white px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-gray-900">{f.name}</div>
                          <div className="text-xs text-gray-500">{bytesToMb(f.size)}</div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          disabled={formLocked}
                          className="rounded-full border px-3 py-1 text-xs font-semibold hover:bg-gray-50 disabled:opacity-50"
                        >
                          Entfernen
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="mt-3 text-xs text-gray-500">
                  Max. 10 Dateien • bis zu 50 MB pro Datei
                </p>
              </div>
            </Section>

            <Section
              eyebrow="Schritt 6"
              title="Erstgespräch buchen"
              subtitle="Das Erstgespräch ist erforderlich, damit wir das Briefing prüfen und die passende Umsetzung vorbereiten können."
              icon={<Icon name="calendar" />}
            >
              {!draftBriefId ? (
                <div className="rounded-3xl border bg-[#fbfaf7] p-6">
                  <div className="text-sm font-semibold text-gray-950">
                    Briefing vorbereiten
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                    Speichere dein Briefing, um anschließend direkt im Kalender einen Termin zu wählen.
                    Die Terminbuchung erfolgt als Gast — es ist kein Cal.com Konto erforderlich.
                  </p>

                  <button
                    type="button"
                    onClick={startBookingStep}
                    disabled={!canCreateDraft}
                    className="mt-5 rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                  >
                    {savingDraft
                      ? uploading
                        ? "Dateien werden hochgeladen..."
                        : "Briefing wird gespeichert..."
                      : "Briefing speichern & Termin wählen"}
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div
                    className={
                      consultationBooked
                        ? "rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900"
                        : "rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"
                    }
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Icon name={consultationBooked ? "check" : "calendar"} />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {consultationBooked
                            ? "Erstgespräch wurde bestätigt"
                            : "Bitte Termin im Kalender auswählen"}
                        </div>
                        <div className="mt-1 leading-6">
                          {consultationBooked
                            ? `Der Termin wurde erfolgreich mit diesem Briefing verknüpft${
                                consultationBookedAt ? ` (${new Date(consultationBookedAt).toLocaleString("de-DE")})` : ""
                              }.`
                            : "Nach der Buchung wird der Termin automatisch über den Kalender bestätigt. Das kann wenige Sekunden dauern."}
                        </div>
                      </div>
                    </div>
                  </div>

                  {calUrl ? (
                    <div className="overflow-hidden rounded-[28px] border bg-white">
                      <iframe
                        src={calUrl}
                        className="h-[760px] w-full"
                        title="Erstgespräch buchen"
                      />
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">
                      Der Kalender konnte nicht geladen werden. Bitte prüfe den Cal.com Buchungslink.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => checkConsultationStatus(true)}
                    disabled={checkingBooking || consultationBooked}
                    className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {checkingBooking ? "Termin wird geprüft..." : "Terminstatus prüfen"}
                  </button>
                </div>
              )}
            </Section>

            <div className="sticky bottom-4 z-10 rounded-[28px] border bg-white/95 p-4 shadow-lg backdrop-blur">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-gray-600">
                  {!draftBriefId
                    ? "Bitte Briefing speichern und Erstgespräch buchen."
                    : consultationBooked
                    ? "Bereit zum Einreichen."
                    : "Warte auf Terminbestätigung."}
                </div>

                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={!canSubmit}
                  className="rounded-full bg-gray-950 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                >
                  {savingFinal ? "Briefing wird eingereicht..." : "Briefing einreichen"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}