"use client";

import Script from "next/script";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CAL_LINK = "primely-content-htyfnn/30min";

const LICENSE_OPTIONS = [
  "1 Monat",
  "3 Monate",
  "6 Monate",
  "12 Monate",
  "Unbegrenzt",
] as const;

type LicenseLabel = (typeof LICENSE_OPTIONS)[number];

const NICHE_GROUPS = [
  "Beauty & Skincare",
  "Fitness & Gesundheit",
  "Fashion",
  "Tech & Gadgets",
  "Home & Living",
  "Food & Getränke",
  "Persönlichkeitsentwicklung & Coaching",
  "Finanzen & Versicherungen",
  "Haustiere",
  "Reisen & Lifestyle",
] as const;

type NicheGroup = (typeof NICHE_GROUPS)[number];

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
  name: "file" | "calendar" | "upload" | "check" | "brief" | "target" | "info";
}) {
  const common = "h-5 w-5";

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
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h6" />
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

  const groups = NICHE_GROUPS;
  const [activeGroup, setActiveGroup] = useState<NicheGroup>(groups[0]);
  const [subNiche, setSubNiche] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formLocked = Boolean(draftBriefId);
  const calEmbedId = "primely-cal-inline";

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
  }, [title, companyName, contactName, contactEmail, savingDraft, savingFinal, uploading]);

  const canSubmit = useMemo(() => {
    return Boolean(draftBriefId && consultationBooked && !savingFinal && !uploading);
  }, [draftBriefId, consultationBooked, savingFinal, uploading]);
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
    if (!draftBriefId) return;

    const initCal = () => {
      const Cal = (window as any).Cal;
      const element = document.getElementById(calEmbedId);

      if (!Cal || !element) return false;

      try {
        element.innerHTML = "";

        Cal("init", {
          origin: "https://cal.com",
        });

        Cal("inline", {
          elementOrSelector: `#${calEmbedId}`,
          calLink: CAL_LINK,
          config: {
            name: contactName || undefined,
            email: contactEmail || undefined,
            notes: title
              ? `Kampagne: ${title} | Kampagnen-ID: ${draftBriefId}`
              : `Kampagnen-ID: ${draftBriefId}`,
            "metadata[briefId]": draftBriefId,
            "metadata[bookingType]": "INITIAL",
          },
        });

        Cal("ui", {
          hideEventTypeDetails: false,
          layout: "month_view",
        });

        return true;
      } catch (err) {
        console.error("Cal embed init failed:", err);
        return false;
      }
    };

    if (initCal()) return;

    const interval = window.setInterval(() => {
      if (initCal()) window.clearInterval(interval);
    }, 300);

    return () => window.clearInterval(interval);
  }, [draftBriefId, contactName, contactEmail, title]);

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
        niches: subNiche.trim() ? [subNiche.trim()] : [],
        companyName: companyName.trim() || null,
        contactName: contactName.trim() || null,
        contactEmail: contactEmail.trim() || null,
        contactPhone: contactPhone.trim() || null,
        consultationRequired: true,
      }),
    });

    const { json, text } = await readSafeJson(res);

    if (!res.ok) {
      throw new Error(json?.error ?? `Kampagne konnte nicht gespeichert werden: ${text.slice(0, 200)}`);
    }

    const briefId = (json?.brief?.id || json?.briefId) as string | undefined;
    if (!briefId) throw new Error("Kampagne wurde gespeichert, aber keine Kampagnen-ID zurückgegeben.");

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

      setTimeout(() => {
        document.getElementById("erstgespraech")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    } catch (e: any) {
      alert(e?.message ?? "Kampagne konnte nicht vorbereitet werden.");
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

        setTimeout(() => {
          document.getElementById("final-submit-button")?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 500);

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
      alert("Bitte speichere zuerst die Kampagne und buche danach das Erstgespräch.");
      return;
    }

    if (!consultationBooked) {
      alert("Bitte buche zuerst das Erstgespräch. Danach wird die Kampagne automatisch freigeschaltet.");
      return;
    }

    try {
      setSavingFinal(true);

      const session = await requireSession();
      if (!session) return;

      await submitBrief(session.token, draftBriefId);

      router.push("/brand/briefs");
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "Kampagne konnte nicht eingereicht werden.");
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
    <>
      <Script
        id="cal-embed-bootstrap"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function (C, A, L) {
              let p = function (a, ar) { a.q.push(ar); };
              let d = C.document;
              C.Cal = C.Cal || function () {
                let cal = C.Cal;
                let ar = arguments;
                if (!cal.loaded) {
                  cal.ns = {};
                  cal.q = cal.q || [];
                  d.head.appendChild(d.createElement("script")).src = A;
                  cal.loaded = true;
                }
                if (ar[0] === L) {
                  const api = function () { p(api, arguments); };
                  const namespace = ar[1];
                  api.q = api.q || [];
                  if (typeof namespace === "string") {
                    cal.ns[namespace] = cal.ns[namespace] || api;
                    p(cal.ns[namespace], ar);
                    return;
                  }
                  p(cal, ar);
                  return;
                }
                p(cal, ar);
              };
            })(window, "https://app.cal.com/embed/embed.js", "init");
          `,
        }}
      />

      <div className="min-h-screen bg-[#fbfaf7] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <Link href="/brand/dashboard" className="inline-flex items-center gap-2 rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-50">
              ← Zurück
            </Link>

            <Link href="/brand/support" className="hidden rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-50 sm:inline-flex">
              Support
            </Link>
          </div>

          <div className="rounded-[36px] border bg-white/70 p-5 shadow-sm sm:p-8 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Neue Kampagne
                </div>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
                  Kampagne erstellen
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500">
                  Erstelle deine Kampagnenanfrage und buche direkt das Erstgespräch.
                  Nach dem Termin prüfen wir deine Anfrage und besprechen die nächsten Schritte.
                </p>
              </div>

              <div className="rounded-[28px] border bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-gray-950">Ablauf</div>
                <div className="mt-5 space-y-3 text-sm text-gray-600">
                  <div>1. Kampagnendaten ausfüllen</div>
                  <div>2. Erstgespräch direkt im Kalender buchen</div>
                  <div>3. Kampagne final einreichen</div>
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-6">
              <Section eyebrow="Schritt 1" title="Kontaktinformationen" subtitle="Diese Angaben übernehmen wir automatisch aus deinem Brand-Profil." icon={<Icon name="brief" />}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input value={companyName} readOnly placeholder="Firma" />
                  <Input value={contactName} readOnly placeholder="Ansprechpartner" />
                  <Input value={contactEmail} readOnly placeholder="E-Mail" />
                  <Input value={contactPhone} readOnly placeholder="Telefon" />
                </div>
              </Section>

              <Section eyebrow="Schritt 2" title="Kampagnendaten" icon={<Icon name="file" />}>
                <div className="grid gap-5">
                  <Input disabled={formLocked} placeholder="Kampagnen-Titel" value={title} onChange={(e) => setTitle(e.target.value)} />

                  <div className="grid gap-4 md:grid-cols-3">
                    <select value={deadline} disabled={formLocked} onChange={(e) => setDeadline(e.target.value)} className="rounded-2xl border bg-white px-4 py-3 text-sm">
                      <option value="">Keine Deadline</option>
                      <option value="7">7 Tage</option>
                      <option value="14">14 Tage</option>
                      <option value="30">30 Tage</option>
                      <option value="60">60 Tage</option>
                    </select>

                    <select value={String(deliverableCount)} disabled={formLocked} onChange={(e) => setDeliverableCount(Number(e.target.value))} className="rounded-2xl border bg-white px-4 py-3 text-sm">
                      <option value="1">1 Video</option>
                      <option value="2">2 Videos</option>
                      <option value="3">3 Videos</option>
                      <option value="4">4 Videos</option>
                      <option value="5">5 Videos</option>
                    </select>

                    <select value={licenseTerm} disabled={formLocked} onChange={(e) => setLicenseTerm(e.target.value as LicenseLabel)} className="rounded-2xl border bg-white px-4 py-3 text-sm">
                      {LICENSE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </Section>

              <Section eyebrow="Schritt 3" title="Beschreibung" icon={<Icon name="info" />}>
                <Textarea
                  disabled={formLocked}
                  className="min-h-[220px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Beschreibe Produkt, Zielgruppe, gewünschte Hooks, No-Gos, Must-haves oder besondere Anforderungen."
                />
              </Section>

              <Section eyebrow="Schritt 4" title="Ziel-Nische" subtitle="Wähle eine Hauptnische und beschreibe frei, welche Art Creator, Themen oder Produkte besonders gut zur Kampagne passen." icon={<Icon name="target" />}>
                <div className="mb-3 text-xs font-semibold text-gray-600">Hauptnische</div>

                <div className="flex flex-wrap gap-2">
                  {groups.map((g) => (
                    <button
                      key={g}
                      type="button"
                      disabled={formLocked}
                      onClick={() => setActiveGroup(g)}
                      className={
                        g === activeGroup
                          ? "rounded-full bg-gray-950 px-4 py-2 text-xs font-semibold text-white"
                          : "rounded-full border bg-white px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-50"
                      }
                    >
                      {g}
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <div className="text-sm font-medium text-gray-700">Unter-Nische / Kampagnen-Fokus</div>
                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Beschreibe möglichst genau, welche Creator-Art, Produktbereiche oder Content-Themen zur Kampagne passen.
                  </p>

                  <Textarea
                    disabled={formLocked}
                    className="mt-3 min-h-[150px]"
                    value={subNiche}
                    onChange={(e) => setSubNiche(e.target.value)}
                    placeholder={`z. B.\n\nSkincare Routinen, Gym & Supplements, Luxury Hotel Content, Streetwear Try-ons, Smart Home Gadgets, Haustierprodukte, Kaffee & Barista, Gaming Setup, Outdoor Camping`}
                  />

                  <div className="mt-3 rounded-2xl border bg-[#fbfaf7] p-4 text-xs leading-5 text-gray-500">
                    Tipp: Je genauer du den Kampagnen-Fokus beschreibst, desto besser kann unser Team passende Creator auswählen.
                  </div>
                </div>
              </Section>

              <Section eyebrow="Schritt 5" title="Dateien" icon={<Icon name="upload" />}>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => onPickFiles(e.target.files)} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />

                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={formLocked} className="rounded-full border bg-white px-4 py-2 text-xs font-semibold">
                  Dateien hinzufügen
                </button>

                <div className="mt-4 rounded-2xl border bg-[#fbfaf7] p-4">
                  {files.length === 0 ? (
                    <div className="text-sm text-gray-500">Keine Dateien ausgewählt.</div>
                  ) : (
                    <div className="space-y-2">
                      {files.map((f, idx) => (
                        <div key={`${f.name}-${f.size}-${idx}`} className="flex items-center justify-between gap-4 rounded-xl border bg-white px-4 py-3">
                          <div>
                            <div className="text-sm font-medium">{f.name}</div>
                            <div className="text-xs text-gray-500">{bytesToMb(f.size)}</div>
                          </div>

                          <button type="button" onClick={() => removeFile(idx)} disabled={formLocked} className="rounded-full border px-3 py-1 text-xs">
                            Entfernen
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Section>

              <Section eyebrow="Schritt 6" title="Erstgespräch buchen" subtitle="Das Erstgespräch ist erforderlich, damit wir die Kampagne prüfen können." icon={<Icon name="calendar" />}>
                <div id="erstgespraech" />

                {!draftBriefId ? (
                  <div className="rounded-3xl border bg-[#fbfaf7] p-6">
                    <div className="text-sm font-semibold text-gray-950">Erstgespräch vorbereiten</div>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                      Klicke auf „Weiter zum Erstgespräch“. Deine Kampagne wird als Entwurf gespeichert und danach erscheint der Kalender direkt auf dieser Seite.
                    </p>

                    <button type="button" onClick={startBookingStep} disabled={!canCreateDraft} className="mt-5 rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">
                      {savingDraft ? "Kampagne wird vorbereitet..." : "Weiter zum Erstgespräch"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className={consultationBooked ? "rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900" : "rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"}>
                      {consultationBooked
                        ? "Erstgespräch wurde bestätigt."
                        : "Bitte Termin im Kalender auswählen. Nach der Buchung wird der Termin automatisch bestätigt."}
                    </div>

                    <div className="overflow-hidden rounded-[28px] border bg-white">
                      <div id={calEmbedId} className="min-h-[760px] w-full" />
                    </div>

                    <button type="button" onClick={() => checkConsultationStatus(true)} disabled={checkingBooking || consultationBooked} className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
                      {checkingBooking ? "Termin wird geprüft..." : "Terminstatus prüfen"}
                    </button>
                  </div>
                )}
              </Section>

              <div className="sticky bottom-4 z-10 rounded-[28px] border bg-white/95 p-4 shadow-lg backdrop-blur">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm text-gray-600">
                    {!draftBriefId
                      ? "Bitte Kampagne vorbereiten und Erstgespräch buchen."
                      : consultationBooked
                      ? "Bereit zum Einreichen."
                      : "Warte auf Terminbestätigung."}
                  </div>

                  <button id="final-submit-button" type="button" onClick={onSubmit} disabled={!canSubmit} className="rounded-full bg-gray-950 px-8 py-3 text-sm font-semibold text-white disabled:opacity-50">
                    {savingFinal ? "Kampagne wird eingereicht..." : "Kampagne einreichen"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}