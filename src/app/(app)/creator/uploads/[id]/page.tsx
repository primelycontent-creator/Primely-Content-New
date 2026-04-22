"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const UGC_BUCKET = "ugc";

type ExistingDeliverable = {
  id: string;
  slotIndex: number;
  status: string;
  staffFeedback: string | null;
  brandStatus: string;
  brandFeedback: string | null;
  bucket: string;
  path: string;
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
};

type BriefDetail = {
  id: string;
  title: string;
  status: string;
  deliverableCount: number;
  brand: {
    email: string;
    brandProfile: { companyName: string | null } | null;
  };
  deliverables: ExistingDeliverable[];
};

type SlotState = {
  file: File | null;
  previewUrl: string | null;
};

async function readSafeJson(res: Response) {
  const text = await res.text();
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

function safeFileName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");
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

function statusBadge(status: string) {
  const s = String(status).toUpperCase();
  const base = "rounded-full border px-3 py-1 text-xs font-semibold";

  if (s === "APPROVED") return `${base} border-emerald-200 bg-emerald-50 text-emerald-900`;
  if (s === "CHANGES_REQUESTED") return `${base} border-amber-200 bg-amber-50 text-amber-900`;
  if (s === "PENDING") return `${base} border-gray-200 bg-white text-gray-800`;

  return `${base} border-gray-200 bg-white text-gray-800`;
}

export default function CreatorUploadsDetailPage() {
  const params = useParams<{ id: string }>();
  const briefId = params.id;
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [brief, setBrief] = useState<BriefDetail | null>(null);
  const [slots, setSlots] = useState<SlotState[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
      setUserId(data.session?.user?.id ?? null);
    });
  }, []);

  async function load() {
    if (!token) return;

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/creator/briefs/${briefId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const { json, text } = await readSafeJson(res);

    if (!res.ok) {
      setError((json as any)?.error ?? text.slice(0, 200));
      setLoading(false);
      return;
    }

    const nextBrief = ((json as any)?.brief ?? null) as BriefDetail | null;
    setBrief(nextBrief);

    const count = Math.max(1, Math.min(5, Number(nextBrief?.deliverableCount ?? 1)));

    setSlots((prev) => {
      prev.forEach((s) => {
        if (s.previewUrl) URL.revokeObjectURL(s.previewUrl);
      });
      return Array.from({ length: count }).map(() => ({
        file: null,
        previewUrl: null,
      }));
    });

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [token, briefId]);

  function updateSlot(index: number, file: File | null) {
    setSlots((prev) => {
      const next = [...prev];
      const old = next[index];

      if (old?.previewUrl) {
        URL.revokeObjectURL(old.previewUrl);
      }

      next[index] = {
        file,
        previewUrl: file ? URL.createObjectURL(file) : null,
      };

      return next;
    });
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

  async function createDeliverableRow(meta: {
    briefId: string;
    bucket: string;
    path: string;
    slotIndex: number;
    fileName?: string;
    mimeType?: string;
    sizeBytes?: number;
  }) {
    if (!token) throw new Error("Missing token");

    const res = await fetch(`/api/creator/briefs/${meta.briefId}/deliverables`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        bucket: meta.bucket,
        path: meta.path,
        slotIndex: meta.slotIndex,
        fileName: meta.fileName,
        mimeType: meta.mimeType,
        sizeBytes: meta.sizeBytes,
      }),
    });

    const { json, text } = await readSafeJson(res);
    if (!res.ok) throw new Error((json as any)?.error ?? text.slice(0, 200));
  }

  async function uploadAll() {
    if (!token || !userId || !brief) return;

    const selectedFiles = slots.map((s) => s.file).filter(Boolean) as File[];
    if (selectedFiles.length === 0) {
      setError("Please select at least one file.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      for (let i = 0; i < slots.length; i++) {
        const file = slots[i]?.file;
        if (!file) continue;

        const slotIndex = i + 1;
        const path = `users/${userId}/deliverables/${brief.id}/${slotIndex}-${crypto.randomUUID()}-${safeFileName(file.name)}`;

        const presign = await presignUpload(path);

        const up = await supabase.storage
          .from(UGC_BUCKET)
          .uploadToSignedUrl(presign.path, presign.token, file, {
            contentType: file.type || "application/octet-stream",
          });

        if (up.error) {
          throw new Error(up.error.message ?? "Upload failed");
        }

        await createDeliverableRow({
          briefId: brief.id,
          bucket: UGC_BUCKET,
          path: presign.path,
          slotIndex,
          fileName: file.name,
          mimeType: file.type || undefined,
          sizeBytes: file.size,
        });
      }

      await load();
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const deliverablesBySlot = useMemo(() => {
    const map = new Map<number, ExistingDeliverable>();
    (brief?.deliverables ?? []).forEach((d) => {
      map.set(d.slotIndex, d);
    });
    return map;
  }, [brief]);

  if (loading) {
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

  return (
    <div className="p-8">
      <div className="rounded-3xl border bg-white/70 p-10 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-serif text-5xl leading-[0.95] tracking-tight text-gray-900">
              Upload Deliverables
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-gray-600">
              Upload your requested deliverables slot by slot. Each slot belongs to one required video.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push(`/creator/briefs/${brief.id}`)}
              className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              Back to Brief
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={uploadAll}
              className="rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-50"
            >
              {busy ? "Uploading…" : "Upload selected files"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 rounded-3xl border bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">{brief.title}</div>
              <div className="mt-1 text-xs text-gray-500">
                Brand: {brief.brand.brandProfile?.companyName ?? brief.brand.email}
              </div>
            </div>

            <span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-gray-800">
              {brief.deliverableCount} required slot{brief.deliverableCount > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {slots.map((slot, index) => {
            const slotIndex = index + 1;
            const existing = deliverablesBySlot.get(slotIndex);

            return (
              <div key={slotIndex} className="rounded-2xl border bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Video Slot {slotIndex}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      One upload per slot.
                    </div>
                  </div>

                  {existing ? (
                    <span className={statusBadge(existing.status)}>
                      {existing.status.replace("_", " ")}
                    </span>
                  ) : (
                    <span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-gray-800">
                      Empty
                    </span>
                  )}
                </div>

                {existing ? (
                  <div className="mt-4 rounded-xl border bg-gray-50 p-3">
                    <div className="truncate text-sm font-medium text-gray-900">
                      Current: {existing.fileName ?? existing.path}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {existing.mimeType ?? "—"} • {formatBytes(existing.sizeBytes)}
                    </div>

                    {existing.staffFeedback ? (
                      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                        <div className="font-semibold">Staff feedback</div>
                        <div className="mt-1 whitespace-pre-wrap">{existing.staffFeedback}</div>
                      </div>
                    ) : null}

                    {String(existing.brandStatus).toUpperCase() === "CHANGES_REQUESTED" && existing.brandFeedback ? (
                      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                        <div className="font-semibold">Brand feedback</div>
                        <div className="mt-1 whitespace-pre-wrap">{existing.brandFeedback}</div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed bg-gray-50 p-4 text-xs text-gray-500">
                    No upload in this slot yet.
                  </div>
                )}

                <div className="mt-4">
                  <input
                    type="file"
                    accept="video/*,.mov,.mp4,.pdf,.png,.jpg,.jpeg,.zip"
                    className="block w-full text-sm"
                    onChange={(e) => updateSlot(index, e.target.files?.[0] ?? null)}
                  />
                </div>

                {slot.file ? (
                  <div className="mt-4 rounded-xl border bg-white p-3">
                    <div className="truncate text-sm font-medium text-gray-900">
                      Selected: {slot.file.name}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {(slot.file.size / 1024 / 1024).toFixed(2)} MB
                    </div>

                    {slot.previewUrl && slot.file.type.startsWith("video/") ? (
                      <video
                        src={slot.previewUrl}
                        controls
                        className="mt-3 w-full rounded-xl"
                      />
                    ) : (
                      <div className="mt-3 rounded-xl border bg-gray-50 p-3 text-xs text-gray-600">
                        Preview is mainly available for videos. This file can still be uploaded normally.
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => updateSlot(index, null)}
                      className="mt-3 rounded-full border bg-white px-4 py-2 text-xs font-semibold hover:bg-gray-50"
                    >
                      Remove selection
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}