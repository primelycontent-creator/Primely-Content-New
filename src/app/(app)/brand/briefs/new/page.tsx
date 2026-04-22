"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const LICENSE_OPTIONS = [
  "1 Month",
  "3 Months",
  "6 Months",
  "12 Months",
  "Unlimited",
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

function safeFileName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");
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

function Section(props: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border bg-white p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{props.title}</h2>
          {props.subtitle ? (
            <p className="mt-1 text-sm text-gray-600">{props.subtitle}</p>
          ) : null}
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
        "w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-950/20 " +
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
        "w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-950/20 " +
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
    throw new Error(json?.error ?? `Presign failed: ${text.slice(0, 200)}`);
  }
  if (!json?.token || !json?.path) {
    throw new Error("Presign returned missing token/path");
  }

  return json as { bucket: string; path: string; token: string; signedUrl?: string };
}

function mapLicenseToApi(value: LicenseLabel) {
  if (value === "1 Month") return "M1";
  if (value === "3 Months") return "M3";
  if (value === "6 Months") return "M6";
  if (value === "12 Months") return "M12";
  return "UNLIMITED";
}

export default function NewBriefPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const companyName = profile?.companyName || "";
  const contactName = profile?.contactName || "";
  const contactEmail = profile?.contactEmail || "";
  const contactPhone = profile?.contactPhone || "";

  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState<string>("");
  const [licenseTerm, setLicenseTerm] = useState<LicenseLabel>("3 Months");
  const [deliverableCount, setDeliverableCount] = useState<number>(1);
  const [description, setDescription] = useState("");

  const groups = Object.keys(NICHE_GROUPS) as NicheGroup[];
  const [activeGroup, setActiveGroup] = useState<NicheGroup>(groups[0]);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const activeSubs = NICHE_GROUPS[activeGroup];

  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        alert(e?.message ?? "Failed to load brand profile");
      } finally {
        setProfileLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  function toggleNiche(n: string) {
    setSelectedNiches((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n);
      if (prev.length >= 5) return prev;
      return [...prev, n];
    });
  }

  function clearNiches() {
    setSelectedNiches([]);
  }

  function onPickFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => mergeUniqueFiles(prev, Array.from(list), 10));
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  const nichesHint = useMemo(
    () => `${selectedNiches.length}/5 selected`,
    [selectedNiches.length]
  );

  const canSubmit = useMemo(() => {
    return (
      !!title.trim() &&
      !!companyName.trim() &&
      !!contactName.trim() &&
      !!contactEmail.trim() &&
      !saving &&
      !uploading
    );
  }, [title, companyName, contactName, contactEmail, saving, uploading]);

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
      }),
    });

    const { json, text } = await readSafeJson(res);
    if (!res.ok) {
      throw new Error(json?.error ?? `Create brief failed: ${text.slice(0, 200)}`);
    }

    const briefId = (json?.brief?.id || json?.briefId) as string | undefined;
    if (!briefId) throw new Error("Create brief returned no briefId");

    return briefId;
  }

  async function uploadAllFiles(token: string, userId: string, briefId: string) {
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const bucket = "ugc";
        const path = `users/${userId}/briefs/${briefId}/${crypto.randomUUID()}-${safeFileName(
          file.name
        )}`;

        const presign = await presignUpload(token, bucket, path);

        const up = await supabase.storage
          .from(bucket)
          .uploadToSignedUrl(presign.path, presign.token, file, {
            contentType: file.type || "application/octet-stream",
          });

        if (up.error) throw new Error(up.error.message ?? "Upload failed");
      }
    } finally {
      setUploading(false);
    }
  }

  async function submitBrief(token: string, briefId: string) {
    const res = await fetch(`/api/brand/briefs/${briefId}/submit`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const { json, text } = await readSafeJson(res);
    if (!res.ok) {
      throw new Error(json?.error ?? `Submit failed: ${text.slice(0, 200)}`);
    }
  }

  async function onSubmit() {
    try {
      setSaving(true);

      const session = await requireSession();
      if (!session) return;

      const briefId = await createDraftBrief(session.token);
      await uploadAllFiles(session.token, session.userId, briefId);
      await submitBrief(session.token, briefId);

      router.push("/brand/dashboard");
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "Unknown error");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  if (profileLoading) {
    return <div className="p-8">Loading profile...</div>;
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl rounded-3xl border bg-white/80 p-10 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="font-serif text-5xl leading-[0.95] tracking-tight text-gray-900">
              Create Briefing
            </h1>
            <p className="mt-3 text-sm text-gray-600">
              Create a new brief, upload optional files, and submit it to staff review.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/brand/dashboard"
              className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              Back
            </Link>
          </div>
        </div>

        <div className="mt-10 space-y-6">
          <Section
            title="Contact Information"
            subtitle="Automatically pulled from your brand profile"
            right={
              <Link
                href="/brand/profile"
                className="text-xs font-semibold text-gray-500 underline"
              >
                Edit profile
              </Link>
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Company name</label>
                <div className="mt-2">
                  <Input value={companyName} readOnly />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Contact person</label>
                <div className="mt-2">
                  <Input value={contactName} readOnly />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="mt-2">
                  <Input value={contactEmail} readOnly />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <div className="mt-2">
                  <Input value={contactPhone} readOnly />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Campaign Information" subtitle="Basic briefing data">
            <div className="grid gap-5">
              <div>
                <label className="text-sm font-medium text-gray-700">Briefing title</label>
                <div className="mt-2">
                  <Input
                    placeholder="e.g. TikTok UGC for new product"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Deadline</label>
                  <div className="mt-2">
                    <select
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-950/20"
                    >
                      <option value="">No deadline</option>
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                      <option value="30">30 days</option>
                      <option value="60">60 days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Number of videos</label>
                  <div className="mt-2">
                    <select
                      value={String(deliverableCount)}
                      onChange={(e) => setDeliverableCount(Number(e.target.value))}
                      className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-950/20"
                    >
                      <option value="1">1 video</option>
                      <option value="2">2 videos</option>
                      <option value="3">3 videos</option>
                      <option value="4">4 videos</option>
                      <option value="5">5 videos</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">License</label>
                  <div className="mt-2">
                    <select
                      className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-950/20"
                      value={licenseTerm}
                      onChange={(e) => setLicenseTerm(e.target.value as LicenseLabel)}
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
            </div>
          </Section>

          <Section title="Campaign Description" subtitle="Goals, deliverables, do’s & don’ts">
            <label className="text-sm font-medium text-gray-700">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <div className="mt-2">
              <Textarea
                className="min-h-[220px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a clear briefing: hooks, angles, deliverables, examples…"
              />
            </div>
          </Section>

          <Section
            title="Target Niches"
            subtitle="Choose a niche group first, then pick up to 5 sub-niches."
            right={
              <div className="flex items-center gap-3">
                <span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                  {nichesHint}
                </span>
                <button
                  type="button"
                  onClick={clearNiches}
                  className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            }
          >
            <div>
              <div className="text-xs font-semibold text-gray-600">Niche groups</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {groups.map((g) => {
                  const active = g === activeGroup;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setActiveGroup(g)}
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
            </div>

            <div className="mt-6 rounded-2xl border bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-xs font-semibold text-gray-600">
                  {activeGroup} – Sub niches
                </div>
                <div className="text-xs text-gray-500">max 5</div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {activeSubs.map((n) => {
                  const selected = selectedNiches.includes(n);
                  const disabled = !selected && selectedNiches.length >= 5;

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
                      title={disabled ? "Max 5 selected" : undefined}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>

              {selectedNiches.length > 0 ? (
                <div className="mt-5">
                  <div className="text-xs font-semibold text-gray-600">Selected</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedNiches.map((n) => (
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
          </Section>

          <Section
            title="Upload Brief Files"
            subtitle="Optional – you can upload now or later"
            right={
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full border bg-white px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50"
              >
                Add files
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

            <div className="rounded-2xl border bg-white p-4">
              <div className="text-xs font-semibold text-gray-600">Upload queue</div>

              {files.length === 0 ? (
                <div className="mt-3 text-sm text-gray-500">
                  No files selected. Click <span className="font-semibold">Add files</span>.
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  {files.map((f, idx) => (
                    <div
                      key={`${f.name}-${f.size}-${idx}`}
                      className="flex items-center justify-between rounded-xl border bg-white px-4 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-gray-900">{f.name}</div>
                        <div className="text-xs text-gray-500">{bytesToMb(f.size)}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="rounded-full border px-3 py-1 text-xs font-semibold hover:bg-gray-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-3 text-xs text-gray-500">Max 10 files • up to 50MB each</p>
            </div>
          </Section>

          <div className="sticky bottom-4 rounded-3xl border bg-white/95 p-4 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-gray-600">
                {uploading ? "Uploading files…" : saving ? "Saving…" : "Ready"}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={onSubmit}
                  disabled={!canSubmit}
                  className="rounded-full bg-emerald-950 px-8 py-3 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-50"
                >
                  {saving ? (uploading ? "Uploading…" : "Saving…") : "Submit Briefing"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}