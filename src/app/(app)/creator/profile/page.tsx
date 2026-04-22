"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const NICHE_GROUPS = {
  "Beauty & Skincare": ["Hautpflege", "Make-up", "Anti-Aging", "Naturkosmetik"],
  "Fitness & Gesundheit": ["Supplements", "Home Workouts", "Fitness-Programme", "Abnehmprodukte", "Biohacking"],
  Fashion: ["Streetwear", "Sportbekleidung", "Schmuck", "Taschen", "Sneaker"],
  "Tech & Gadgets": ["Smartphones & Zubehör", "Gimbals", "Kameras", "Smartwatches", "KI-Tools & Apps"],
  "Home & Living": ["Einrichtung", "Küchengadgets", "Haushaltshelfer", "DIY-Produkte", "Dekoration"],
  "Food & Getränke": ["Proteinprodukte", "Kaffee-Marken", "Energy Drinks", "Süßigkeiten", "Kochboxen"],
  "Persönlichkeitsentwicklung & Coaching": ["Online-Kurse", "Trading", "Mindset", "Dating-Coaching", "Business-Coaching"],
  "Finanzen & Versicherungen": ["Investment-Apps", "Kryptowährungen", "Versicherungen", "Kreditkarten"],
  Haustiere: ["Hundefutter", "Katzenzubehör", "Spielzeug", "Pflegeprodukte"],
  "Reisen & Lifestyle": ["Reisegadgets", "Hotels", "Koffer", "Camper", "Auslandsversicherungen"],
} as const;

type NicheGroup = keyof typeof NICHE_GROUPS;

function safeFileName(name: string) {
  return name.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
}

async function readSafeJson(res: Response) {
  const text = await res.text();
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

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

function Card(props: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl border bg-white p-8 ${props.className ?? ""}`}>
      <div>
        <h2 className="text-[28px] font-serif leading-none tracking-tight text-gray-900">{props.title}</h2>
        {props.subtitle ? <p className="mt-2 text-sm text-gray-600">{props.subtitle}</p> : null}
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
        "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-emerald-950/20 " +
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
        "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-emerald-950/20 " +
        (props.className ?? "")
      }
    />
  );
}

export default function CreatorProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const groups = Object.keys(NICHE_GROUPS) as NicheGroup[];

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
  const [price30sEur, setPrice30sEur] = useState<string>("");

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

  const nichesHint = useMemo(() => `${niches.length}/5 selected`, [niches.length]);

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
    setEquipment((prev) => {
      const next = [...prev, s];
      return Array.from(new Set(next)).slice(0, 30);
    });
    setEquipmentInput("");
  }

  function removeEquipmentChip(val: string) {
    setEquipment((prev) => prev.filter((x) => x !== val));
  }

  async function getTokenAndUserId() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const userId = data.session?.user?.id;
    if (!token || !userId) return null;
    return { token, userId };
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
    if (ng && groups.includes(ng)) setNicheGroup(ng);
    setNiches(Array.isArray(p.niches) ? p.niches : []);

    setPortfolioUrl(p.portfolioUrl ?? "");
    setBio(p.bio ?? "");
    setInstagram(p.instagram ?? "");
    setTiktok(p.tiktok ?? "");

    setEquipment(Array.isArray(p.equipment) ? p.equipment : []);
    setPrice30sEur(p.price30sCents != null ? (p.price30sCents / 100).toString() : "");
    setIntroAsset(p.introVideoAsset ?? null);
    setProfileImageAsset(p.profileImageAsset ?? null);
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await loadProfile();
      } catch (e: any) {
        alert(e?.message ?? "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSave() {
    try {
      setSaving(true);

      const auth = await getTokenAndUserId();
      if (!auth) {
        alert("Please login again.");
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

      alert("Saved ✅");
    } catch (e: any) {
      alert(e?.message ?? "Save failed");
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
    if (!res.ok) throw new Error(json?.error ?? `Presign failed: ${text.slice(0, 200)}`);
    if (!json?.token || !json?.path) throw new Error("Presign returned missing token/path");

    return json as { bucket: string; path: string; token: string; signedUrl?: string };
  }

  async function attachIntroVideo(
    token: string,
    meta: { bucket: string; path: string; fileName?: string; mimeType?: string; sizeBytes?: number }
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
    meta: { bucket: string; path: string; fileName?: string; mimeType?: string; sizeBytes?: number }
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
      alert("Please upload a video file (mp4).");
      return;
    }

    try {
      setUploadingIntro(true);

      const auth = await getTokenAndUserId();
      if (!auth) {
        alert("Please login again.");
        return;
      }

      const bucket = "ugc";
      const path = `users/${auth.userId}/creator/intro/${crypto.randomUUID()}-${safeFileName(file.name)}`;

      const presign = await presignUpload(auth.token, bucket, path);

      const up = await supabase.storage
        .from(bucket)
        .uploadToSignedUrl(presign.path, presign.token, file, {
          contentType: file.type || "video/mp4",
        });

      if (up.error) throw new Error(up.error.message ?? "Upload failed");

      await attachIntroVideo(auth.token, {
        bucket,
        path: presign.path,
        fileName: file.name,
        mimeType: file.type || "video/mp4",
        sizeBytes: file.size,
      });

      alert("Intro video uploaded ✅");
    } catch (e: any) {
      alert(e?.message ?? "Intro upload failed");
    } finally {
      setUploadingIntro(false);
    }
  }

  async function onPickProfileImage(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    try {
      setUploadingProfileImage(true);

      const auth = await getTokenAndUserId();
      if (!auth) {
        alert("Please login again.");
        return;
      }

      const bucket = "ugc";
      const path = `users/${auth.userId}/creator/profile-image/${crypto.randomUUID()}-${safeFileName(file.name)}`;

      const presign = await presignUpload(auth.token, bucket, path);

      const up = await supabase.storage
        .from(bucket)
        .uploadToSignedUrl(presign.path, presign.token, file, {
          contentType: file.type || "image/jpeg",
        });

      if (up.error) throw new Error(up.error.message ?? "Upload failed");

      await attachProfileImage(auth.token, {
        bucket,
        path: presign.path,
        fileName: file.name,
        mimeType: file.type || "image/jpeg",
        sizeBytes: file.size,
      });

      alert("Profile image uploaded ✅");
    } catch (e: any) {
      alert(e?.message ?? "Profile image upload failed");
    } finally {
      setUploadingProfileImage(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="rounded-3xl border bg-white/70 p-10 shadow-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="rounded-3xl border bg-white/70 p-10 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-[820px]">
            <h1 className="font-serif text-5xl leading-[0.95] tracking-tight text-gray-900">
              Creator Profile
            </h1>
            <p className="mt-3 text-sm text-gray-600">
              Keep your profile up to date so brands can match you faster.
            </p>
          </div>

          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card title="Basics">
              <div className="grid gap-4">
                <div>
                  <Label>Full name</Label>
                  <Input
                    className="mt-2"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Name Vorname"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Phone</Label>
                    <Input
                      className="mt-2"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+49…"
                    />
                  </div>

                  <div>
                    <Label>Work mode</Label>
                    <select
                      className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-emerald-950/20"
                      value={workMode}
                      onChange={(e) => setWorkMode(e.target.value as any)}
                    >
                      <option value="">Select…</option>
                      <option value="FULL_TIME">Full time</option>
                      <option value="PART_TIME">Part time</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Niches">
              <div className="flex items-baseline justify-between">
                <div className="text-sm font-medium text-gray-700">Niche group</div>
                <span className="text-xs text-gray-500">{nichesHint}</span>
              </div>

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
                          ? "rounded-full bg-emerald-950 px-4 py-2 text-xs font-semibold text-white"
                          : "rounded-full border bg-white px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50"
                      }
                    >
                      {g}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl border bg-white p-5">
                <div className="mb-3 text-xs font-semibold text-gray-600">Sub niches (choose up to 5)</div>

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
                            ? "rounded-full bg-emerald-950 px-4 py-2 text-xs font-semibold text-white"
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

                {niches.length > 0 ? (
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-gray-600">Selected</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {niches.map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => toggleNiche(n)}
                          className="rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white"
                          title="Click to remove"
                        >
                          {n} ×
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card
              title="Profile Image"
              subtitle="Upload a clear profile photo so staff can recognize you faster."
            >
              <input
                ref={profileImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPickProfileImage(e.target.files?.[0] ?? null)}
              />

              <div className="flex items-start gap-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border bg-gray-100">
                  {profileImageAsset ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${profileImageAsset.bucket}/${profileImageAsset.path}`}
                      alt="Profile image"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-gray-400">
                      {fullName?.trim()?.charAt(0)?.toUpperCase() || "C"}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => profileImageInputRef.current?.click()}
                    disabled={uploadingProfileImage}
                    className="w-full rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {uploadingProfileImage
                      ? "Uploading…"
                      : profileImageAsset
                      ? "Replace profile image"
                      : "Upload profile image"}
                  </button>

                  <p className="mt-3 text-xs text-gray-500">
                    Best result: clear face, bright light, simple background.
                  </p>

                  {profileImageAsset ? (
                    <div className="mt-4 rounded-2xl border bg-white/70 p-4">
                      <div className="text-xs font-semibold text-gray-700">Current profile image</div>
                      <div className="mt-2 break-all text-sm text-gray-900">
                        {profileImageAsset.fileName ?? profileImageAsset.path}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {profileImageAsset.sizeBytes != null
                          ? `${(profileImageAsset.sizeBytes / 1024 / 1024).toFixed(2)} MB`
                          : ""}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>

            <Card
              title="Intro Video"
              subtitle="Upload one short introduction video (mp4). Brands & staff will use it for quick evaluation."
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
                className="w-full rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {uploadingIntro ? "Uploading…" : introAsset ? "Replace intro video" : "Upload intro video"}
              </button>

              <p className="mt-3 text-xs text-gray-500">
                Tip: Keep it ~15–45 seconds. Default playback is muted in the UI.
              </p>

              {introAsset ? (
                <div className="mt-6 rounded-2xl border bg-white/70 p-4">
                  <div className="text-xs font-semibold text-gray-700">Current intro video</div>
                  <div className="mt-2 break-all text-sm text-gray-900">
                    {introAsset.fileName ?? introAsset.path}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {introAsset.sizeBytes != null
                      ? `${(introAsset.sizeBytes / 1024 / 1024).toFixed(2)} MB`
                      : ""}
                  </div>
                </div>
              ) : null}
            </Card>

            <Card title="Quality checklist">
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Clear niche selection</li>
                <li>• Portfolio link if available</li>
                <li>• Realistic pricing for 30s</li>
                <li>• Intro video uploaded</li>
                <li>• Profile image uploaded</li>
              </ul>
            </Card>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Card
            title="Address"
            subtitle="Your location helps with brand matching and campaign fit."
            className="h-full"
          >
            <div className="grid gap-4">
              <div>
                <Label>Address line 1</Label>
                <Input
                  className="mt-2"
                  placeholder="Address line 1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                />
              </div>

              <div>
                <Label>Address line 2</Label>
                <Input
                  className="mt-2"
                  placeholder="Address line 2 (optional)"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>City</Label>
                  <Input
                    className="mt-2"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Postal code</Label>
                  <Input
                    className="mt-2"
                    placeholder="Postal code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input
                    className="mt-2"
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card
            title="Portfolio & Social"
            subtitle="Show brands where they can see your style and experience."
            className="h-full"
          >
            <div className="grid gap-4">
              <div>
                <Label>Portfolio URL</Label>
                <Input
                  className="mt-2"
                  placeholder="Portfolio URL (optional)"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Instagram</Label>
                  <Input
                    className="mt-2"
                    placeholder="Instagram (optional)"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </div>

                <div>
                  <Label>TikTok</Label>
                  <Input
                    className="mt-2"
                    placeholder="TikTok (optional)"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Bio</Label>
                <Textarea
                  className="mt-2 min-h-[180px]"
                  placeholder="Short description about you, your style, experience…"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card
            title="Pricing & Equipment"
            subtitle="Give brands a realistic first impression of your setup and pricing."
            className="xl:col-span-2"
          >
            <div className="grid gap-8 xl:grid-cols-[0.75fr_1.25fr]">
              <div>
                <Label>Price for 1x 30s video (EUR)</Label>
                <Input
                  className="mt-2"
                  placeholder="e.g. 150"
                  value={price30sEur}
                  onChange={(e) => setPrice30sEur(e.target.value)}
                  inputMode="decimal"
                />
                <p className="mt-2 text-xs text-gray-500">We store prices internally in cents.</p>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <Label>Equipment</Label>
                  <span className="text-xs text-gray-500">{equipment.length}/30</span>
                </div>

                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder='e.g. "iPhone 15 Pro", "Sony ZV-E10", "Softbox"'
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
                    Add
                  </button>
                </div>

                {equipment.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {equipment.map((x) => (
                      <button
                        key={x}
                        type="button"
                        onClick={() => removeEquipmentChip(x)}
                        className="rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white"
                        title="Click to remove"
                      >
                        {x} ×
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed p-4 text-sm text-gray-500">
                    No equipment added yet.
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-full bg-emerald-950 px-8 py-3 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}