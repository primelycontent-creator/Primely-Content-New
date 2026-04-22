"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const UGC_BUCKET = "ugc";

type CreatorRow = {
  id: string;
  email: string;
  profileImageUrl?: string | null;
  emailConfirmed?: boolean;
  isVerified?: boolean;
  creatorProfile: {
    fullName: string | null;
    nicheGroup: string | null;
    niches: string[];
    price30sCents: number | null;
    city?: string | null;
    country?: string | null;
    bio?: string | null;
    equipment?: string[];
    approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
  } | null;
};

type AssetRow = {
  id: string;
  bucket: string;
  path: string;
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
};

type DeliverableRow = {
  id: string;
  slotIndex: number;
  revision?: number;
  isLatest?: boolean;
  status: "PENDING" | "CHANGES_REQUESTED" | "APPROVED" | string;
  staffFeedback?: string | null;
  staffReviewedAt?: string | null;
  brandStatus?: "PENDING" | "CHANGES_REQUESTED" | "APPROVED" | string;
  brandFeedback?: string | null;
  brandReviewedAt?: string | null;
  isLocked?: boolean;
  lockedAt?: string | null;
  bucket: string;
  path: string;
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
  updatedAt?: string;
  creator?: { id: string; email: string } | null;
};

type BriefDetail = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  deadline: string | null;
  licenseTerm: string | null;
  nicheGroup: string | null;
  niches: string[];
  deliverableCount: number;

  companyName: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;

  brand: {
    id: string;
    email: string;
    brandProfile?: { companyName: string | null } | null;
  };

  assignedCreatorId: string | null;
  assignedCreator: {
    id: string;
    email: string;
    creatorProfile: {
      fullName: string | null;
      nicheGroup: string | null;
      niches: string[];
      price30sCents: number | null;
      portfolioUrl: string | null;
      instagram: string | null;
      tiktok: string | null;
      city: string | null;
      country: string | null;
      approvalStatus?: string | null;
      profileImageAssetId?: string | null;
    } | null;
  } | null;

  assets: AssetRow[];
  deliverables?: DeliverableRow[];
};

const STATUSES = ["SUBMITTED", "REVIEW", "IN_PROGRESS", "DONE", "DECLINED"] as const;

async function readSafeJson(res: Response) {
  const text = await res.text();
  const looksLikeHtml =
    text.trim().startsWith("<!DOCTYPE") ||
    text.trim().startsWith("<html") ||
    text.includes("<head>");

  if (looksLikeHtml) return { json: null, text };

  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

function safeFileName(name: string) {
  return name.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
}

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size > 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }
  return `${size.toFixed(unit === 0 ? 0 : 2)} ${units[unit]}`;
}

function displayNameFromPath(path: string, fileName?: string | null) {
  if (fileName) return fileName;
  const last = path.split("/").pop();
  return last || path;
}

function isVideo(mime?: string | null, path?: string) {
  const m = (mime || "").toLowerCase();
  if (m.startsWith("video/")) return true;
  const p = (path || "").toLowerCase();
  return p.endsWith(".mp4") || p.endsWith(".mov") || p.endsWith(".webm");
}

function isImage(mime?: string | null, path?: string) {
  const m = (mime || "").toLowerCase();
  if (m.startsWith("image/")) return true;
  const p = (path || "").toLowerCase();
  return p.endsWith(".png") || p.endsWith(".jpg") || p.endsWith(".jpeg") || p.endsWith(".webp");
}

function isPdf(mime?: string | null, path?: string) {
  const m = (mime || "").toLowerCase();
  if (m.includes("pdf")) return true;
  const p = (path || "").toLowerCase();
  return p.endsWith(".pdf");
}

function creatorDisplayName(c: CreatorRow | BriefDetail["assignedCreator"] | null) {
  if (!c) return "—";
  return c.creatorProfile?.fullName?.trim() || c.email || "—";
}

function creatorPriceLabel(cents?: number | null) {
  if (typeof cents !== "number") return "—";
  return `€${(cents / 100).toFixed(0)}`;
}

function approvalBadge(creator: CreatorRow) {
  if (creator.isVerified) {
    return "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900";
  }
  if (creator.creatorProfile?.approvalStatus === "REJECTED") {
    return "rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-900";
  }
  return "rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900";
}

function approvalLabel(creator: CreatorRow) {
  if (creator.isVerified) return "Verified";
  if (creator.creatorProfile?.approvalStatus === "REJECTED") return "Rejected";
  if (!creator.emailConfirmed) return "Email not confirmed";
  return "Pending review";
}

function staffStatusBadge(status: string) {
  const s = String(status).toUpperCase();
  const base = "rounded-full border px-3 py-1 text-xs font-semibold";

  if (s === "APPROVED") return `${base} border-emerald-200 bg-emerald-50 text-emerald-900`;
  if (s === "CHANGES_REQUESTED") return `${base} border-amber-200 bg-amber-50 text-amber-900`;
  return `${base} border-gray-200 bg-white text-gray-800`;
}

function brandStatusBadge(status?: string) {
  const s = String(status ?? "").toUpperCase();
  const base = "rounded-full border px-3 py-1 text-xs font-semibold";

  if (s === "APPROVED") return `${base} border-emerald-200 bg-emerald-50 text-emerald-900`;
  if (s === "CHANGES_REQUESTED") return `${base} border-amber-200 bg-amber-50 text-amber-900`;
  return `${base} border-gray-200 bg-white text-gray-800`;
}

export default function StaffBriefDetailPage() {
  const params = useParams<{ id: string }>();
  const briefId = params.id;
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [brief, setBrief] = useState<BriefDetail | null>(null);
  const [creators, setCreators] = useState<CreatorRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [signBusy, setSignBusy] = useState<Record<string, boolean>>({});
  const [staffFeedback, setStaffFeedback] = useState<Record<string, string>>({});

  const [creatorModalOpen, setCreatorModalOpen] = useState(false);
  const [assigningCreatorId, setAssigningCreatorId] = useState<string | null>(null);

  const [creatorQuery, setCreatorQuery] = useState("");
  const [creatorNicheGroup, setCreatorNicheGroup] = useState("");
  const [creatorCountry, setCreatorCountry] = useState("");
  const [creatorSort, setCreatorSort] = useState("newest");

  const [uploadingStaffFile, setUploadingStaffFile] = useState(false);
  const staffFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
      setSessionUserId(data.session?.user?.id ?? null);
    });
  }, []);

  async function loadAll() {
    if (!token) return;
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/staff/briefs/${briefId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const { json, text } = await readSafeJson(res);
    if (!res.ok) {
      setError((json as any)?.error ?? text.slice(0, 180));
      setLoading(false);
      return;
    }

    const nextBrief = (json as any).brief as BriefDetail;
    nextBrief.deliverables = [...(nextBrief.deliverables ?? [])].sort(
      (a, b) => (a.slotIndex ?? 999) - (b.slotIndex ?? 999)
    );
    setBrief(nextBrief);

    await loadCreators(false);
    setLoading(false);
  }

  async function loadCreators(openModalAfter = false) {
    if (!token) return;

    const params = new URLSearchParams();
    if (creatorQuery.trim()) params.set("q", creatorQuery.trim());
    if (creatorNicheGroup.trim()) params.set("nicheGroup", creatorNicheGroup.trim());
    if (creatorCountry.trim()) params.set("country", creatorCountry.trim());
    params.set("onlyVerified", "true");
    if (creatorSort.trim()) params.set("sort", creatorSort.trim());

    const cRes = await fetch(`/api/staff/creators?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const c = await readSafeJson(cRes);
    if (!cRes.ok) {
      setError((c.json as any)?.error ?? c.text.slice(0, 180));
      return;
    }

    setCreators(((c.json as any)?.creators ?? []) as CreatorRow[]);

    if (openModalAfter) {
      setCreatorModalOpen(true);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, briefId]);

  const nicheOptions = useMemo(() => {
    const set = new Set<string>();
    creators.forEach((x) => {
      if (x.creatorProfile?.nicheGroup) set.add(x.creatorProfile.nicheGroup);
    });
    return Array.from(set).sort();
  }, [creators]);

  async function setStatus(status: string) {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/staff/briefs/${briefId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const { json, text } = await readSafeJson(res);
      if (!res.ok) throw new Error((json as any)?.error ?? text.slice(0, 180));

      setBrief((prev) =>
        prev
          ? {
              ...prev,
              status: (json as any).brief.status,
              updatedAt: (json as any).brief.updatedAt,
            }
          : prev
      );
    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setBusy(false);
    }
  }

  async function assignCreator(creatorId: string) {
    if (!token) return;

    setBusy(true);
    setAssigningCreatorId(creatorId);
    setError(null);

    try {
      const res = await fetch(`/api/staff/briefs/${briefId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ creatorId }),
      });
      const { json, text } = await readSafeJson(res);
      if (!res.ok) throw new Error((json as any)?.error ?? text.slice(0, 180));

      setCreatorModalOpen(false);
      await loadAll();
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setBusy(false);
      setAssigningCreatorId(null);
    }
  }

  async function requestSignedUrl(bucket: string, path: string) {
    if (!token) throw new Error("Missing token");

    const res = await fetch("/api/staff/storage/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ bucket, path }),
    });

    const { json, text } = await readSafeJson(res);

    if (!res.ok) {
      const err = (json as any)?.error ?? text.slice(0, 200);
      throw new Error(err);
    }

    const signedUrl = String((json as any)?.signedUrl ?? "");
    if (!signedUrl) throw new Error("No signedUrl returned");
    return signedUrl;
  }

  async function onPreviewFile(key: string, bucket: string, path: string) {
    setError(null);
    setSignBusy((p) => ({ ...p, [key]: true }));
    try {
      const url = await requestSignedUrl(bucket, path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      setError(e?.message ?? "Preview error");
    } finally {
      setSignBusy((p) => ({ ...p, [key]: false }));
    }
  }

  async function onDownloadFile(
    key: string,
    bucket: string,
    path: string,
    fileName?: string | null
  ) {
    setError(null);
    setSignBusy((p) => ({ ...p, [key]: true }));

    try {
      if (!token) throw new Error("Missing token");

      const res = await fetch("/api/staff/storage/download", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bucket, path, fileName }),
      });

      if (!res.ok) {
        const { json, text } = await readSafeJson(res);
        throw new Error((json as any)?.error ?? text.slice(0, 200));
      }

      const blob = await res.blob();
      const name = (fileName || path.split("/").pop() || "download").trim();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.message ?? "Download error");
    } finally {
      setSignBusy((p) => ({ ...p, [key]: false }));
    }
  }

  async function updateDeliverableStatus(
    deliverableId: string,
    status: "APPROVED" | "CHANGES_REQUESTED"
  ) {
    if (!token) return;
    setBusy(true);
    setError(null);

    try {
      const res = await fetch(`/api/staff/deliverables/${deliverableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          status,
          feedback: status === "CHANGES_REQUESTED" ? (staffFeedback[deliverableId] ?? "") : null,
        }),
      });

      const { json, text } = await readSafeJson(res);
      if (!res.ok) throw new Error((json as any)?.error ?? text.slice(0, 180));

      await loadAll();
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setBusy(false);
    }
  }

  async function presignUpload(path: string) {
    if (!token) throw new Error("Missing token");

    const res = await fetch("/api/storage/presign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        bucket: UGC_BUCKET,
        path,
      }),
    });

    const { json, text } = await readSafeJson(res);
    if (!res.ok) throw new Error((json as any)?.error ?? text.slice(0, 200));

    return json as {
      bucket: string;
      path: string;
      token: string;
    };
  }

  async function attachStaffBriefAsset(meta: {
    bucket: string;
    path: string;
    fileName?: string;
    mimeType?: string;
    sizeBytes?: number;
  }) {
    if (!token) throw new Error("Missing token");

    const res = await fetch(`/api/staff/briefs/${briefId}/assets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(meta),
    });

    const { json, text } = await readSafeJson(res);
    if (!res.ok) throw new Error((json as any)?.error ?? text.slice(0, 200));

    return json;
  }

  async function onPickStaffFile(file: File | null) {
    if (!file || !sessionUserId || !brief) return;

    try {
      setUploadingStaffFile(true);
      setError(null);

      const path = `users/${sessionUserId}/staff/briefs/${brief.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
      const presign = await presignUpload(path);

      const up = await supabase.storage
        .from(UGC_BUCKET)
        .uploadToSignedUrl(presign.path, presign.token, file, {
          contentType: file.type || "application/octet-stream",
        });

      if (up.error) {
        throw new Error(up.error.message ?? "Upload failed");
      }

      await attachStaffBriefAsset({
        bucket: UGC_BUCKET,
        path: presign.path,
        fileName: file.name,
        mimeType: file.type || undefined,
        sizeBytes: file.size,
      });

      await loadAll();
    } catch (e: any) {
      setError(e?.message ?? "Staff upload failed");
    } finally {
      setUploadingStaffFile(false);
      if (staffFileInputRef.current) {
        staffFileInputRef.current.value = "";
      }
    }
  }

  if (loading && !brief) {
    return (
      <div className="p-8">
        <div className="rounded-3xl border bg-white/70 p-10 shadow-sm">
          <div className="text-sm text-gray-600">Loading…</div>
        </div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="p-8">
        <div className="rounded-3xl border bg-white/70 p-10 shadow-sm">
          <div className="text-sm text-gray-600">{error ?? "Brief not found"}</div>
        </div>
      </div>
    );
  }

  const deliverables = brief.deliverables ?? [];

  const staffAssets = brief.assets.filter((a) => a.path.includes(`/staff/briefs/${brief.id}/`));
  const brandAssets = brief.assets.filter((a) => !a.path.includes(`/staff/briefs/${brief.id}/`));

  return (
    <div className="p-8">
      <div className="rounded-3xl border bg-white/70 p-10 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="text-xs font-semibold tracking-wide text-gray-600">BRIEF</div>
            <h1 className="mt-2 truncate font-serif text-5xl leading-[0.95] tracking-tight text-gray-900">
              {brief.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-gray-800">
                {brief.status.replace("_", " ")}
              </span>
              <span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-gray-800">
                {brief.deliverableCount} slot{brief.deliverableCount > 1 ? "s" : ""}
              </span>
              <span className="text-xs text-gray-500">
                Updated: {new Date(brief.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/staff/dashboard")}
            className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Back
          </button>
        </div>

        {error && (
          <div className="mt-6 whitespace-pre-wrap rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border bg-white p-6">
            <div className="text-sm font-semibold text-gray-900">Brand</div>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <div><span className="text-gray-500">Email:</span> {brief.brand.email}</div>
              <div className="pt-2 text-xs font-semibold tracking-wide text-gray-500">CONTACT (from brief)</div>
              <div><span className="text-gray-500">Company:</span> {brief.companyName ?? "—"}</div>
              <div><span className="text-gray-500">Name:</span> {brief.contactName ?? "—"}</div>
              <div><span className="text-gray-500">Email:</span> {brief.contactEmail ?? "—"}</div>
              <div><span className="text-gray-500">Phone:</span> {brief.contactPhone ?? "—"}</div>
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-6">
            <div className="text-sm font-semibold text-gray-900">Campaign</div>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <div><span className="text-gray-500">Deadline:</span> {brief.deadline ? new Date(brief.deadline).toLocaleDateString() : "—"}</div>
              <div><span className="text-gray-500">License:</span> {brief.licenseTerm ?? "—"}</div>
              <div><span className="text-gray-500">Niche group:</span> {brief.nicheGroup ?? "—"}</div>
              <div><span className="text-gray-500">Niches:</span> {(brief.niches ?? []).length ? brief.niches.join(", ") : "—"}</div>
              <div><span className="text-gray-500">Required uploads:</span> {brief.deliverableCount}</div>
            </div>

            {brief.description && (
              <div className="mt-5 rounded-2xl border bg-white/60 p-4">
                <div className="text-xs font-semibold tracking-wide text-gray-600">DESCRIPTION</div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{brief.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border bg-white p-6">
          <div className="text-sm font-semibold text-gray-900">Workflow Actions</div>

          <div className="mt-4 flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                disabled={busy}
                onClick={() => setStatus(s)}
                className="rounded-full border bg-white px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-60"
              >
                Mark {s.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border bg-white/70 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">Assigned Creator</div>
                <p className="mt-1 text-xs text-gray-500">
                  Select the best verified creator for this briefing.
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadCreators(true)}
                disabled={busy}
                className="rounded-full bg-emerald-950 px-5 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-50"
              >
                {brief.assignedCreator ? "Change creator" : "Select creator"}
              </button>
            </div>

            {brief.assignedCreator ? (
              <div className="mt-5 rounded-2xl border bg-white p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-gray-900">
                      {creatorDisplayName(brief.assignedCreator)}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">{brief.assignedCreator.email}</div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                      <span className="rounded-full border bg-white px-3 py-1">
                        Price: <b>{creatorPriceLabel(brief.assignedCreator.creatorProfile?.price30sCents)}</b>
                      </span>
                      <span className="rounded-full border bg-white px-3 py-1">
                        Niche: <b>{brief.assignedCreator.creatorProfile?.nicheGroup ?? "—"}</b>
                      </span>
                      <span className="rounded-full border bg-white px-3 py-1">
                        Location: <b>{brief.assignedCreator.creatorProfile?.country || brief.assignedCreator.creatorProfile?.city || "—"}</b>
                      </span>
                    </div>

                    {(brief.assignedCreator.creatorProfile?.niches ?? []).length > 0 ? (
                      <div className="mt-3 text-xs text-gray-600">
                        {(brief.assignedCreator.creatorProfile?.niches ?? []).join(", ")}
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(`/staff/creators/${brief.assignedCreator?.id}`)}
                    className="rounded-full border bg-white px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Open creator profile
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed bg-gray-50 p-6 text-sm text-gray-500">
                No creator assigned yet.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border bg-white p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">Staff Files / Script Templates</div>
              <p className="mt-1 text-xs text-gray-500">
                Upload scripts, hooks, shot lists or internal briefing files for the creator.
              </p>
            </div>

            <div>
              <input
                ref={staffFileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => onPickStaffFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => staffFileInputRef.current?.click()}
                disabled={uploadingStaffFile}
                className="rounded-full bg-emerald-950 px-5 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-50"
              >
                {uploadingStaffFile ? "Uploading…" : "Upload staff file"}
              </button>
            </div>
          </div>

          {staffAssets.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed bg-gray-50 p-6 text-sm text-gray-500">
              No staff files uploaded yet.
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {staffAssets.map((a) => {
                const key = `staff-asset-${a.id}`;
                const busyFile = !!signBusy[key];
                const label = displayNameFromPath(a.path, a.fileName);

                return (
                  <div
                    key={a.id}
                    className="flex flex-col gap-3 rounded-2xl border bg-white px-4 py-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-gray-900">{label}</div>
                      <div className="text-xs text-gray-500">
                        {a.mimeType ?? "—"} • {formatBytes(a.sizeBytes)} • {a.bucket}
                      </div>
                      <div className="truncate text-[11px] text-gray-400">{a.path}</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busyFile}
                        onClick={() => onPreviewFile(key, a.bucket, a.path)}
                        className="rounded-full border bg-white px-4 py-2 text-xs font-semibold hover:bg-gray-50 disabled:opacity-60"
                      >
                        {busyFile ? "…" : "Preview"}
                      </button>
                      <button
                        type="button"
                        disabled={busyFile}
                        onClick={() => onDownloadFile(key, a.bucket, a.path, a.fileName)}
                        className="rounded-full bg-emerald-950 px-4 py-2 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-60"
                      >
                        {busyFile ? "…" : "Download"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-3xl border bg-white p-6">
          <div className="text-sm font-semibold text-gray-900">Brief Attachments (from Brand)</div>

          {brandAssets.length === 0 ? (
            <p className="mt-3 text-sm text-gray-600">No brand files attached.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {brandAssets.map((a) => {
                const key = `brand-asset-${a.id}`;
                const busyFile = !!signBusy[key];
                const label = displayNameFromPath(a.path, a.fileName);

                return (
                  <div
                    key={a.id}
                    className="flex flex-col gap-3 rounded-2xl border bg-white px-4 py-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-gray-900">{label}</div>
                      <div className="text-xs text-gray-500">
                        {a.mimeType ?? "—"} • {formatBytes(a.sizeBytes)} • {a.bucket}
                      </div>
                      <div className="truncate text-[11px] text-gray-400">{a.path}</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busyFile}
                        onClick={() => onPreviewFile(key, a.bucket, a.path)}
                        className="rounded-full border bg-white px-4 py-2 text-xs font-semibold hover:bg-gray-50 disabled:opacity-60"
                      >
                        {busyFile ? "…" : "Preview"}
                      </button>
                      <button
                        type="button"
                        disabled={busyFile}
                        onClick={() => onDownloadFile(key, a.bucket, a.path, a.fileName)}
                        className="rounded-full bg-emerald-950 px-4 py-2 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-60"
                      >
                        {busyFile ? "…" : "Download"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-3xl border bg-white p-6">
          <div>
            <div className="text-sm font-semibold text-gray-900">Creator Deliverables</div>
            <p className="mt-1 text-xs text-gray-500">
              Review every upload slot individually and manage change requests cleanly.
            </p>
          </div>

          {deliverables.length === 0 ? (
            <p className="mt-3 text-sm text-gray-600">No deliverables uploaded yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {deliverables.map((d) => {
                const key = `del-${d.id}`;
                const busyFile = !!signBusy[key];
                const label = displayNameFromPath(d.path, d.fileName);
                const previewHint = isVideo(d.mimeType, d.path)
                  ? "Video"
                  : isImage(d.mimeType, d.path)
                  ? "Image"
                  : isPdf(d.mimeType, d.path)
                  ? "PDF"
                  : "File";

                return (
                  <div key={d.id} className="rounded-2xl border bg-white px-4 py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="truncate text-sm font-semibold text-gray-900">
                            Slot {d.slotIndex}: {label}
                          </div>

                          <span className={staffStatusBadge(d.status)}>
                            Staff: {d.status.replace("_", " ")}
                          </span>

                          <span className={brandStatusBadge(d.brandStatus)}>
                            Brand: {String(d.brandStatus ?? "PENDING").replace("_", " ")}
                          </span>

                          {d.isLocked ? (
                            <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-900">
                              Locked
                            </span>
                          ) : null}

                          {typeof d.revision === "number" ? (
                            <span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                              Rev {d.revision}
                            </span>
                          ) : null}

                          <span className="text-[11px] text-gray-400">{previewHint}</span>
                        </div>

                        {d.staffFeedback ? (
                          <div className="mt-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                            <div className="text-xs font-semibold">Staff feedback</div>
                            <div className="mt-1 whitespace-pre-wrap">{d.staffFeedback}</div>
                          </div>
                        ) : null}

                        {String(d.brandStatus ?? "").toUpperCase() === "CHANGES_REQUESTED" && d.brandFeedback ? (
                          <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                            <div className="text-xs font-semibold">Brand feedback</div>
                            <div className="mt-1 whitespace-pre-wrap">{d.brandFeedback}</div>
                          </div>
                        ) : null}

                        <div className="mt-1 text-xs text-gray-500">
                          {d.mimeType ?? "—"} • {formatBytes(d.sizeBytes)} • {new Date(d.createdAt).toLocaleString()}
                        </div>
                        <div className="truncate text-[11px] text-gray-400">{d.path}</div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busyFile}
                          onClick={() => onPreviewFile(key, d.bucket, d.path)}
                          className="rounded-full border bg-white px-4 py-2 text-xs font-semibold hover:bg-gray-50 disabled:opacity-60"
                        >
                          {busyFile ? "…" : "Preview"}
                        </button>
                        <button
                          type="button"
                          disabled={busyFile}
                          onClick={() => onDownloadFile(key, d.bucket, d.path, d.fileName)}
                          className="rounded-full bg-emerald-950 px-4 py-2 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-60"
                        >
                          {busyFile ? "…" : "Download"}
                        </button>
                      </div>
                    </div>

                    {!d.isLocked ? (
                      <div className="mt-3 grid gap-3">
                        <textarea
                          className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                          placeholder="Write feedback for the creator if changes are needed…"
                          value={staffFeedback[d.id] ?? ""}
                          onChange={(e) =>
                            setStaffFeedback((p) => ({ ...p, [d.id]: e.target.value }))
                          }
                        />

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => updateDeliverableStatus(d.id, "APPROVED")}
                            className="rounded-full border border-green-700 bg-white px-4 py-2 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:opacity-60"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={busy || !(staffFeedback[d.id] ?? "").trim()}
                            onClick={() => updateDeliverableStatus(d.id, "CHANGES_REQUESTED")}
                            className="rounded-full border border-amber-700 bg-white px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-60"
                          >
                            Request changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                        This deliverable is final approved by the brand and locked.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {creatorModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-3xl border bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <div className="text-lg font-semibold text-gray-900">Select Creator</div>
                <div className="mt-1 text-sm text-gray-500">
                  Search and assign a verified creator to this briefing.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCreatorModalOpen(false)}
                className="rounded-full border bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="border-b px-6 py-4">
              <div className="grid gap-3 lg:grid-cols-4">
                <input
                  value={creatorQuery}
                  onChange={(e) => setCreatorQuery(e.target.value)}
                  placeholder="Search name, email, niche..."
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-950/20 lg:col-span-2"
                />

                <select
                  value={creatorNicheGroup}
                  onChange={(e) => setCreatorNicheGroup(e.target.value)}
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-950/20"
                >
                  <option value="">All niche groups</option>
                  {nicheOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>

                <select
                  value={creatorSort}
                  onChange={(e) => setCreatorSort(e.target.value)}
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-950/20"
                >
                  <option value="newest">Newest</option>
                  <option value="updated">Recently updated</option>
                  <option value="name_asc">Name A-Z</option>
                  <option value="name_desc">Name Z-A</option>
                  <option value="price_asc">Price low-high</option>
                  <option value="price_desc">Price high-low</option>
                </select>
              </div>

              <div className="mt-3 flex flex-wrap gap-3">
                <input
                  value={creatorCountry}
                  onChange={(e) => setCreatorCountry(e.target.value)}
                  placeholder="Country"
                  className="rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-950/20"
                />

                <button
                  type="button"
                  onClick={() => loadCreators()}
                  className="rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-white shadow hover:opacity-95"
                >
                  Apply filters
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCreatorQuery("");
                    setCreatorNicheGroup("");
                    setCreatorCountry("");
                    setCreatorSort("newest");
                    setTimeout(() => loadCreators(), 0);
                  }}
                  className="rounded-full border bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-6 py-6">
              {creators.length === 0 ? (
                <div className="rounded-2xl border border-dashed bg-gray-50 p-10 text-center text-sm text-gray-500">
                  No verified creators found for these filters.
                </div>
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {creators.map((creator) => {
                    const name = creatorDisplayName(creator);
                    const creatorBusy = assigningCreatorId === creator.id;

                    return (
                      <div key={creator.id} className="rounded-3xl border bg-white p-5">
                        <div className="flex gap-4">
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border bg-gray-100">
                            {creator.profileImageUrl ? (
                              <Image
                                src={creator.profileImageUrl}
                                alt={name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-gray-500">
                                {name.slice(0, 1).toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="truncate text-base font-semibold text-gray-900">
                                {name}
                              </div>
                              <span className={approvalBadge(creator)}>
                                {approvalLabel(creator)}
                              </span>
                            </div>

                            <div className="mt-1 text-sm text-gray-500">{creator.email}</div>

                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                              <span className="rounded-full border bg-white px-3 py-1">
                                Price: <b>{creatorPriceLabel(creator.creatorProfile?.price30sCents)}</b>
                              </span>
                              <span className="rounded-full border bg-white px-3 py-1">
                                Niche: <b>{creator.creatorProfile?.nicheGroup ?? "—"}</b>
                              </span>
                              <span className="rounded-full border bg-white px-3 py-1">
                                Location: <b>{creator.creatorProfile?.country || creator.creatorProfile?.city || "—"}</b>
                              </span>
                            </div>

                            <div className="mt-3 line-clamp-2 text-sm text-gray-600">
                              {creator.creatorProfile?.bio?.trim()
                                ? creator.creatorProfile.bio
                                : (creator.creatorProfile?.niches ?? []).length
                                ? (creator.creatorProfile?.niches ?? []).join(", ")
                                : "No short description yet."}
                            </div>

                            {(creator.creatorProfile?.equipment ?? []).length > 0 ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {(creator.creatorProfile?.equipment ?? []).slice(0, 3).map((eq) => (
                                  <span
                                    key={eq}
                                    className="rounded-full border bg-white px-3 py-1 text-[11px] font-semibold text-gray-700"
                                  >
                                    {eq}
                                  </span>
                                ))}
                              </div>
                            ) : null}

                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => assignCreator(creator.id)}
                                disabled={busy || creatorBusy || !creator.isVerified}
                                className="rounded-full bg-emerald-950 px-4 py-2 text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50"
                              >
                                {creatorBusy ? "Assigning..." : "Assign creator"}
                              </button>

                              <button
                                type="button"
                                onClick={() => router.push(`/staff/creators/${creator.id}`)}
                                className="rounded-full border bg-white px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50"
                              >
                                Open profile
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}