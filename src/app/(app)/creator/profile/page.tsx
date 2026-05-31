

"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
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
type IntroAsset = {
  id: string;
  bucket: string;
  path: string;
  fileName?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  createdAt: string;
};
type ProfileImageAsset = {
  id: string;
  bucket: string;
  path: string;
  fileName?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  createdAt: string;
};
type CreatorProfileDto = {
  id: string;
  userId: string;
  fullName?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  workMode?: "FULL_TIME" | "PART_TIME" | null;
  nicheGroup?: string | null;
  niches: string[];
  portfolioUrl?: string | null;
  bio?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  equipment: string[];
  price30sCents?: number | null;
  introVideoAsset?: IntroAsset | null;
  profileImageAsset?: ProfileImageAsset | null;
};
function safeFileName(name: string) {
  return name.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
}
function bytesToMb(n?: number | null) {
  if (!n || n <= 0) return "";
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}
function publicAssetUrl(asset: { bucket: string; path: string }) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${asset.bucket}/${encodeURI(asset.path)}`;
}
async function readSafeJson(res: Response) {
  const text = await res.text();
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}
function Icon(props: {
  name:
    | "user"
    | "video"
    | "image"
    | "target"
    | "link"
    | "camera"
    | "location"
    | "check"
    | "upload"
    | "save"
    | "support"
    | "chevron";
}) {
  const common = "h-5 w-5";
  if (props.name === "user") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.6-4 14.4-4 16 0" />
      </svg>
    );
  }
  if (props.name === "video") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="6" width="12" height="12" rx="2" />
        <path d="m16 10 5-3v10l-5-3z" />
      </svg>
    );
  }
  if (props.name === "image") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="m4 16 4-4 4 4 3-3 5 5" />
        <circle cx="9" cy="9" r="1.5" />
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
  if (props.name === "link") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
        <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
      </svg>
    );
  }
  if (props.name === "camera") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 7h3l2-3h4l2 3h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    );
  }
  if (props.name === "location") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 21s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12z" />
        <circle cx="12" cy="9" r="2.5" />
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
  if (props.name === "upload") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 16V4" />
        <path d="m7 9 5-5 5 5" />
        <path d="M4 20h16" />
      </svg>
    );
  }
  if (props.name === "save") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 3h12l2 2v16H5z" />
        <path d="M8 3v6h8V3" />
        <path d="M8 21v-7h8v7" />
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
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
function Card(props: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[28px] border bg-white p-5 shadow-sm sm:p-7 ${props.className ?? ""}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          {props.icon ? (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f3eee7] text-gray-950">
              {props.icon}
            </div>
          ) : null}
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-gray-950">
              {props.title}
            </h2>
            {props.subtitle ? (
              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                {props.subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {props.right ? <div className="shrink-0">{props.right}</div> : null}
      </div>
      <div className="mt-6">{props.children}</div>
    </section>
  );
}
function Label(props: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-gray-700">{props.children}</label>;
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
function CompletionItem(props: { done: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3">
      <span className="text-sm text-gray-700">{props.label}</span>
      <span
        className={
          props.done
            ? "flex h-7 w-7 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800"
            : "flex h-7 w-7 items-center justify-center rounded-full border bg-gray-50 text-gray-300"
        }
      >
        <Icon name="check" />
      </span>
    </div>
  );
}
export default function CreatorProfilePage() {
  const groups = Object.keys(NICHE_GROUPS) as NicheGroup[];
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [workMode, setWorkMode] = useState<"FULL_TIME" | "PART_TIME" | "">("");
  const [nicheGroup, setNicheGroup] = useState<NicheGroup | "">(groups[0] ?? "");
  const [niches, setNiches] = useState<string[]>([]);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [equipmentInput, setEquipmentInput] = useState("");
  const [price30sEur, setPrice30sEur] = useState("");
  const [introAsset, setIntroAsset] = useState<IntroAsset | null>(null);
  const [profileImageAsset, setProfileImageAsset] = useState<ProfileImageAsset | null>(null);
  const [uploadingIntro, setUploadingIntro] = useState(false);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const introInputRef = useRef<HTMLInputElement | null>(null);
  const profileImageInputRef = useRef<HTMLInputElement | null>(null);
  const activeSubs = useMemo(() => {
    if (!nicheGroup) return [];
    return NICHE_GROUPS[nicheGroup];
  }, [nicheGroup]);
  const completion = useMemo(() => {
    const checks = [
      { key: "profileImage", label: "Profilbild", done: !!profileImageAsset },
      { key: "intro", label: "Intro-Video", done: !!introAsset },
      { key: "basic", label: "Grunddaten", done: !!fullName.trim() && !!phone.trim() && !!workMode },
      { key: "niches", label: "Nischen", done: !!nicheGroup && niches.length > 0 },
      { key: "socials", label: "Portfolio / Socials", done: !!portfolioUrl.trim() || !!instagram.trim() || !!tiktok.trim() },
      { key: "price", label: "Preisangabe", done: !!price30sEur.trim() },
      { key: "equipment", label: "Equipment", done: equipment.length > 0 },
      { key: "bio", label: "Bio", done: !!bio.trim() },
    ];
    const done = checks.filter((x) => x.done).length;
    const percent = Math.round((done / checks.length) * 100);
    return { checks, percent };
  }, [
    profileImageAsset,
    introAsset,
    fullName,
    phone,
    workMode,
    nicheGroup,
    niches.length,
    portfolioUrl,
    instagram,
    tiktok,
    price30sEur,
    equipment.length,
    bio,
  ]);
  function toggleNiche(n: string) {
    setNiches((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n);
      if (prev.length >= 5) return prev;
      return [...prev, n];
    });
  }
  function addEquipmentChip() {
    const s = equipmentInput.trim();
    if (!s) return;
    setEquipment((prev) => Array.from(new Set([...prev, s])).slice(0, 30));
    setEquipmentInput("");
  }
  function removeEquipmentChip(val: string) {
    setEquipment((prev) => prev.filter((x) => x !== val));
  }
  async function getTokenAndUserId() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) return null;

  const meRes = await fetch("/api/me", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const { json, text } = await readSafeJson(meRes);

  if (!meRes.ok || !json?.user?.id) {
    throw new Error(json?.error ?? text.slice(0, 200) ?? "User konnte nicht geladen werden.");
  }

  return {
    token,
    userId: String(json.user.id),
  };
}
  async function loadProfile() {
    const auth = await getTokenAndUserId();

    if (!auth) {
      setLoading(false);
      return;
    }

    const res = await fetch("/api/creator/profile", {
      method: "GET",
      headers: { Authorization: `Bearer ${auth.token}` },
      cache: "no-store",
    });

    const { json, text } = await readSafeJson(res);
    if (!res.ok) throw new Error(json?.error ?? text.slice(0, 200));

    const p = (json?.profile ?? null) as CreatorProfileDto | null;
    if (!p) return;

    setFullName(p.fullName ?? "");
    setPhone(p.phone ?? "");

    setAddressLine1(p.addressLine1 ?? "");
    setAddressLine2(p.addressLine2 ?? "");
    setCity(p.city ?? "");
    setPostalCode(p.postalCode ?? "");
    setCountry(p.country ?? "");

    setWorkMode((p.workMode as any) ?? "");

    const ng = (p.nicheGroup as any) ?? "";
    if (ng && groups.includes(ng)) {
      setNicheGroup(ng);
    }

    setNiches(Array.isArray(p.niches) ? p.niches : []);

    setPortfolioUrl(p.portfolioUrl ?? "");
    setBio(p.bio ?? "");
    setInstagram(p.instagram ?? "");
    setTiktok(p.tiktok ?? "");

    setEquipment(Array.isArray(p.equipment) ? p.equipment : []);
    setPrice30sEur(p.price30sCents != null ? String(p.price30sCents / 100) : "");

    setIntroAsset(p.introVideoAsset ?? null);
    setProfileImageAsset(p.profileImageAsset ?? null);
  }

  useEffect(() => {
    async function run() {
      try {
        setLoading(true);
        await loadProfile();
      } catch (e: any) {
        alert(e?.message ?? "Profil konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    }

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSave() {
    try {
      setSaving(true);

      const auth = await getTokenAndUserId();
      if (!auth) {
        alert("Bitte melde dich erneut an.");
        return;
      }

      const res = await fetch("/api/creator/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          fullName,
          phone,
          addressLine1,
          addressLine2,
          city,
          postalCode,
          country,
          workMode: workMode || null,
          nicheGroup: nicheGroup || null,
          niches,
          portfolioUrl,
          bio,
          instagram,
          tiktok,
          equipment,
          price30sEur: price30sEur === "" ? null : Number(price30sEur),
        }),
      });

      const { json, text } = await readSafeJson(res);
      if (!res.ok) throw new Error(json?.error ?? text.slice(0, 200));

      alert("Profil gespeichert ✅");
    } catch (e: any) {
      alert(e?.message ?? "Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
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

  async function attachIntroVideo(
    token: string,
    meta: {
      bucket: string;
      path: string;
      fileName?: string;
      mimeType?: string;
      sizeBytes?: number;
    }
  ) {
    const res = await fetch("/api/creator/profile/intro-video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(meta),
    });

    const { json, text } = await readSafeJson(res);
    if (!res.ok) throw new Error(json?.error ?? text.slice(0, 200));

    const asset = json?.asset as IntroAsset | undefined;
    if (asset) setIntroAsset(asset);
  }

  async function attachProfileImage(
    token: string,
    meta: {
      bucket: string;
      path: string;
      fileName?: string;
      mimeType?: string;
      sizeBytes?: number;
    }
  ) {
    const res = await fetch("/api/creator/profile/profile-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(meta),
    });

    const { json, text } = await readSafeJson(res);
    if (!res.ok) throw new Error(json?.error ?? text.slice(0, 200));

    const asset = json?.asset as ProfileImageAsset | undefined;
    if (asset) setProfileImageAsset(asset);
  }

  async function onPickIntroVideo(file: File | null) {
    if (!file) return;

    if (!file.type.includes("video")) {
      alert("Bitte lade eine Videodatei hoch.");
      return;
    }

    try {
      setUploadingIntro(true);

      const auth = await getTokenAndUserId();
      if (!auth) {
        alert("Bitte melde dich erneut an.");
        return;
      }

      const bucket = "ugc";
      const path = `users/${auth.userId}/creator/intro/${crypto.randomUUID()}-${safeFileName(
        file.name
      )}`;

      const presign = await presignUpload(auth.token, bucket, path);

      const up = await supabase.storage
        .from(bucket)
        .uploadToSignedUrl(presign.path, presign.token, file, {
          contentType: file.type || "video/mp4",
        });

      if (up.error) throw new Error(up.error.message ?? "Upload fehlgeschlagen.");

      await attachIntroVideo(auth.token, {
        bucket,
        path: presign.path,
        fileName: file.name,
        mimeType: file.type || "video/mp4",
        sizeBytes: file.size,
      });
    } catch (e: any) {
      alert(e?.message ?? "Intro-Video Upload fehlgeschlagen.");
    } finally {
      setUploadingIntro(false);
    }
  }

  async function onPickProfileImage(file: File | null) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Bitte lade eine Bilddatei hoch.");
      return;
    }

    try {
      setUploadingProfileImage(true);

      const auth = await getTokenAndUserId();
      if (!auth) {
        alert("Bitte melde dich erneut an.");
        return;
      }

      const bucket = "ugc";
      const path = `users/${auth.userId}/creator/profile-image/${crypto.randomUUID()}-${safeFileName(
        file.name
      )}`;

      const presign = await presignUpload(auth.token, bucket, path);

      const up = await supabase.storage
        .from(bucket)
        .uploadToSignedUrl(presign.path, presign.token, file, {
          contentType: file.type || "image/jpeg",
        });

      if (up.error) throw new Error(up.error.message ?? "Upload fehlgeschlagen.");

      await attachProfileImage(auth.token, {
        bucket,
        path: presign.path,
        fileName: file.name,
        mimeType: file.type || "image/jpeg",
        sizeBytes: file.size,
      });
    } catch (e: any) {
      alert(e?.message ?? "Profilbild Upload fehlgeschlagen.");
    } finally {
      setUploadingProfileImage(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf7] px-4 py-6 sm:p-8">
        <div className="mx-auto max-w-7xl rounded-[36px] border bg-white p-8 text-sm text-gray-500 shadow-sm">
          Profil wird geladen...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/creator/dashboard"
            className="inline-flex items-center gap-2 rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-50"
          >
            ← Zurück
          </Link>

          <Link
            href="/creator/support"
            className="hidden rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-50 sm:inline-flex"
          >
            Support
          </Link>
        </div>

        <div className="rounded-[36px] border bg-white/70 p-5 shadow-sm sm:p-8 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Creator Profil
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
                Dein Profil für passende Kampagnen
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500">
                Je vollständiger dein Profil ist, desto besser kann unser Team dich passenden Brands und Kampagnen zuordnen.
              </p>
            </div>

            <div className="rounded-[28px] border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-950">Profilvollständigkeit</div>
                  <div className="mt-1 text-xs text-gray-500">
                    Für internes Matching und Freigabe
                  </div>
                </div>
                <div className="text-3xl font-semibold text-gray-950">{completion.percent}%</div>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gray-950 transition-all"
                  style={{ width: `${completion.percent}%` }}
                />
              </div>

              <div className="mt-5 grid gap-2">
                {completion.checks.map((x) => (
                  <CompletionItem key={x.key} label={x.label} done={x.done} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Card
              title="Profilbild"
              subtitle="Ein klares Profilbild hilft unserem Team, dich schneller einzuordnen."
              icon={<Icon name="image" />}
            >
              <input
                ref={profileImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPickProfileImage(e.target.files?.[0] ?? null)}
              />

              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[28px] border bg-[#f3eee7]">
                  {profileImageAsset ? (
                    <Image
                      src={publicAssetUrl(profileImageAsset)}
                      alt="Profilbild"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-gray-400">
                      {fullName?.trim()?.charAt(0)?.toUpperCase() || "C"}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => profileImageInputRef.current?.click()}
                    disabled={uploadingProfileImage}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 sm:w-auto"
                  >
                    <Icon name="upload" />
                    {uploadingProfileImage
                      ? "Wird hochgeladen..."
                      : profileImageAsset
                      ? "Profilbild ersetzen"
                      : "Profilbild hochladen"}
                  </button>

                  <p className="mt-3 text-xs leading-5 text-gray-500">
                    Empfehlung: klares Gesicht, gutes Licht, ruhiger Hintergrund.
                  </p>

                  {profileImageAsset ? (
                    <div className="mt-4 rounded-2xl border bg-[#fbfaf7] p-4">
                      <div className="truncate text-sm font-medium text-gray-950">
                        {profileImageAsset.fileName ?? profileImageAsset.path}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {bytesToMb(profileImageAsset.sizeBytes)}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>

            <Card
              title="Intro-Video"
              subtitle="Ein kurzes Vorstellungsvideo hilft bei der Freigabe und beim Matching."
              icon={<Icon name="video" />}
            >
              <input
                ref={introInputRef}
                type="file"
                accept="video/mp4,video/*"
                className="hidden"
                onChange={(e) => onPickIntroVideo(e.target.files?.[0] ?? null)}
              />

              <button
                type="button"
                onClick={() => introInputRef.current?.click()}
                disabled={uploadingIntro}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 sm:w-auto"
              >
                <Icon name="upload" />
                {uploadingIntro
                  ? "Wird hochgeladen..."
                  : introAsset
                  ? "Intro-Video ersetzen"
                  : "Intro-Video hochladen"}
              </button>

              <p className="mt-3 text-xs leading-5 text-gray-500">
                Ideal: 15–45 Sekunden, kurz vorstellen, Stil erklären, Licht und Ton sauber.
              </p>

              {introAsset ? (
                <div className="mt-5 rounded-2xl border bg-[#fbfaf7] p-4">
                  <div className="truncate text-sm font-medium text-gray-950">
                    {introAsset.fileName ?? introAsset.path}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {bytesToMb(introAsset.sizeBytes)}
                  </div>
                </div>
              ) : null}
            </Card>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card title="Persönliche Informationen" icon={<Icon name="user" />}>
              <div className="grid gap-4">
                <div>
                  <Label>Vollständiger Name</Label>
                  <Input
                    className="mt-2"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Vorname Nachname"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Telefon</Label>
                    <Input
                      className="mt-2"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+49..."
                      inputMode="tel"
                    />
                  </div>

                  <div>
                    <Label>Arbeitsmodell</Label>
                    <select
                      value={workMode}
                      onChange={(e) => setWorkMode(e.target.value as any)}
                      className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm text-gray-950 outline-none focus:ring-2 focus:ring-gray-950/10"
                    >
                      <option value="">Auswählen...</option>
                      <option value="FULL_TIME">Vollzeit</option>
                      <option value="PART_TIME">Teilzeit</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            <Card
              title="Portfolio & Social Media"
              subtitle="Zeige uns, wo wir deinen Stil und deine bisherigen Inhalte sehen können."
              icon={<Icon name="link" />}
            >
              <div className="grid gap-4">
                <div>
                  <Label>Portfolio URL</Label>
                  <Input
                    className="mt-2"
                    placeholder="https://..."
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Instagram</Label>
                    <Input
                      className="mt-2"
                      placeholder="@username oder Link"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>TikTok</Label>
                    <Input
                      className="mt-2"
                      placeholder="@username oder Link"
                      value={tiktok}
                      onChange={(e) => setTiktok(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Bio</Label>
                  <Textarea
                    className="mt-2 min-h-[150px]"
                    placeholder="Kurzbeschreibung über dich, deinen Stil, deine Erfahrung und Content-Stärken..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card
              title="Nischen & Spezialisierung"
              subtitle="Wähle eine Hauptnische und bis zu 5 passende Unter-Nischen."
              icon={<Icon name="target" />}
              right={
                <span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                  {niches.length}/5 ausgewählt
                </span>
              }
            >
              <div className="text-xs font-semibold text-gray-600">Hauptnische</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {groups.map((g) => {
                  const active = g === nicheGroup;

                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        setNicheGroup(g);
                        setNiches([]);
                      }}
                      className={
                        active
                          ? "rounded-full bg-gray-950 px-4 py-2 text-xs font-semibold text-white"
                          : "rounded-full border bg-white px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50"
                      }
                    >
                      {g}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl border bg-[#fbfaf7] p-4">
                <div className="mb-3 text-xs font-semibold text-gray-600">
                  Kampagnen-Fokus auswählen
                </div>

                <div className="flex flex-wrap gap-2">
                  {activeSubs.map((n) => {
                    const selected = niches.includes(n);
                    const disabled = !selected && niches.length >= 5;

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
            </Card>

            <Card
              title="Preise & Equipment"
              subtitle="Gib einen realistischen Eindruck von deinem Setup und deiner Preisrange."
              icon={<Icon name="camera" />}
            >
              <div className="grid gap-5">
                <div>
                  <Label>Preis für 1x 30s Video in EUR</Label>
                  <Input
                    className="mt-2"
                    placeholder="z. B. 150"
                    value={price30sEur}
                    onChange={(e) => setPrice30sEur(e.target.value)}
                    inputMode="decimal"
                  />
                </div>

                <div>
                  <div className="flex items-baseline justify-between">
                    <Label>Equipment</Label>
                    <span className="text-xs text-gray-500">{equipment.length}/30</span>
                  </div>

                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <Input
                      placeholder='z. B. "iPhone 15 Pro", "Sony ZV-E10", "Softbox"'
                      value={equipmentInput}
                      onChange={(e) => setEquipmentInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addEquipmentChip();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addEquipmentChip}
                      className="shrink-0 rounded-2xl border bg-white px-5 py-3 text-sm font-semibold hover:bg-gray-50"
                    >
                      Hinzufügen
                    </button>
                  </div>

                  {equipment.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {equipment.map((x) => (
                        <button
                          key={x}
                          type="button"
                          onClick={() => removeEquipmentChip(x)}
                          className="rounded-full bg-gray-950 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          {x} ×
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed bg-[#fbfaf7] p-4 text-sm text-gray-500">
                      Noch kein Equipment hinzugefügt.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-6">
            <Card
              title="Adresse"
              subtitle="Dein Standort hilft beim internen Matching mit passenden Kampagnen."
              icon={<Icon name="location" />}
            >
              <div className="grid gap-4">
                <div>
                  <Label>Adresse Zeile 1</Label>
                  <Input
                    className="mt-2"
                    placeholder="Straße und Hausnummer"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Adresse Zeile 2</Label>
                  <Input
                    className="mt-2"
                    placeholder="Adresszusatz, Wohnung, Etage (optional)"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>Stadt</Label>
                    <Input
                      className="mt-2"
                      placeholder="Stadt"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Postleitzahl</Label>
                    <Input
                      className="mt-2"
                      placeholder="PLZ"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Land</Label>
                    <Input
                      className="mt-2"
                      placeholder="Land"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="sticky bottom-4 z-10 mt-8 rounded-[28px] border bg-white/95 p-4 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-gray-600">
                Profilvollständigkeit:{" "}
                <span className="font-semibold text-gray-950">{completion.percent}%</span>
              </div>

              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-950 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
              >
                <Icon name="save" />
                {saving ? "Wird gespeichert..." : "Änderungen speichern"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}