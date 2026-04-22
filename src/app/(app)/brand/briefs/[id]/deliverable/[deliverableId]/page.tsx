"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

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

type Deliverable = {
  id: string;
  briefId: string;
  status: string;
  staffFeedback: string | null;
  brandStatus: string;
  brandFeedback: string | null;
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
};

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

  if (s === "PENDING") return `${base} border-gray-200 bg-white text-gray-800`;
  if (s === "CHANGES_REQUESTED") {
    return `${base} border-amber-200 bg-amber-50 text-amber-900`;
  }
  if (s === "APPROVED") {
    return `${base} border-emerald-200 bg-emerald-50 text-emerald-900`;
  }

  return `${base} border-gray-200 bg-white text-gray-800`;
}

function reviewText(data: Deliverable) {
  if (data.brandStatus === "APPROVED" && data.isLocked) {
    return "Final approved";
  }
  if (data.brandStatus === "CHANGES_REQUESTED") {
    return "Changes requested";
  }
  return "Pending review";
}

export default function BrandDeliverablePage() {
  const { id, deliverableId } = useParams<{
    id: string;
    deliverableId: string;
  }>();

  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<Deliverable | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [feedback, setFeedback] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
    });
  }, []);

  async function load() {
    if (!token || !deliverableId) return;

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/brand/deliverables/${deliverableId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const { json, text } = await readSafeJson(res);

    if (!res.ok) {
      setError((json as any)?.error ?? text ?? "Failed to load deliverable");
      setLoading(false);
      return;
    }

    const next = ((json as any)?.deliverable ?? null) as Deliverable | null;
    setData(next);
    setFeedback(next?.brandFeedback ?? "");
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [token, deliverableId]);

  async function update(status: "APPROVED" | "CHANGES_REQUESTED") {
    if (!token || !data) return;

    setBusy(true);
    setError(null);

    try {
      const res = await fetch(`/api/brand/deliverables/${data.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          feedback: status === "CHANGES_REQUESTED" ? feedback.trim() : null,
        }),
      });

      const { json, text } = await readSafeJson(res);

      if (!res.ok) {
        throw new Error((json as any)?.error ?? text ?? "Update failed");
      }

      await load();
    } catch (e: any) {
      setError(e?.message ?? "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function preview() {
    if (!token || !data) return;

    try {
      setError(null);

      const res = await fetch("/api/brand/storage/signed-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bucket: data.bucket,
          path: data.path,
        }),
      });

      const { json, text } = await readSafeJson(res);

      if (!res.ok) {
        throw new Error((json as any)?.error ?? text ?? "Preview failed");
      }

      const signedUrl = String((json as any)?.signedUrl ?? "");
      if (!signedUrl) {
        throw new Error("Preview failed");
      }

      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      setError(e?.message ?? "Preview failed");
    }
  }

  async function download() {
    if (!token || !data) return;

    try {
      setError(null);

      const res = await fetch("/api/brand/storage/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bucket: data.bucket,
          path: data.path,
          fileName: data.fileName,
        }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (!res.ok) {
        if (contentType.includes("application/json")) {
          const { json, text } = await readSafeJson(res);
          throw new Error((json as any)?.error ?? text ?? "Download failed");
        }
        throw new Error("Download failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = data.fileName || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.message ?? "Download failed");
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="rounded-3xl border bg-white/70 p-10 shadow-sm">
          <div className="text-sm text-gray-600">Loading deliverable…</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="rounded-3xl border bg-white/70 p-10 shadow-sm">
          <div className="text-sm text-gray-600">{error ?? "Deliverable not found"}</div>
        </div>
      </div>
    );
  }

  const isFinalApproved = data.brandStatus === "APPROVED" && data.isLocked === true;
  const canRequestChanges = !isFinalApproved;
  const canApprove = !isFinalApproved;
  const canDownload = isFinalApproved;

  return (
    <div className="p-8">
      <div className="rounded-3xl border bg-white/70 p-10 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="text-xs font-semibold tracking-wide text-gray-600">DELIVERABLE REVIEW</div>
            <h1 className="mt-2 break-words font-serif text-5xl leading-[0.95] tracking-tight text-gray-900">
              {data.fileName ?? "Unnamed file"}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className={statusBadge(data.status)}>
                Staff: {data.status.replaceAll("_", " ")}
              </span>
              <span className={statusBadge(data.brandStatus)}>
                Brand: {reviewText(data)}
              </span>
              {data.isLocked ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
                  Locked
                </span>
              ) : null}
            </div>

            <div className="mt-3 text-sm text-gray-600">
              Uploaded: {new Date(data.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push(`/brand/briefs/${id}`)}
              className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              Back to Brief
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">File</div>
                <p className="mt-1 text-xs text-gray-500">
                  Preview the upload and review the final result.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={preview}
                  className="rounded-full border bg-white px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Preview
                </button>

                {canDownload ? (
                  <button
                    type="button"
                    onClick={download}
                    className="rounded-full bg-emerald-950 px-4 py-2 text-xs font-semibold text-white hover:opacity-95"
                  >
                    Download
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="rounded-full border border-gray-200 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-400"
                  >
                    Download locked until final approval
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border bg-white/70 p-4">
              <div className="text-sm font-semibold text-gray-900">
                {data.fileName ?? data.path}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {data.mimeType ?? "—"} • {formatBytes(data.sizeBytes)}
              </div>
              <div className="mt-2 break-all text-[11px] text-gray-400">{data.path}</div>
            </div>

            {data.brandReviewedAt ? (
              <div className="mt-4 text-xs text-gray-500">
                Brand reviewed: {new Date(data.brandReviewedAt).toLocaleString()}
              </div>
            ) : null}

            {data.lockedAt ? (
              <div className="mt-1 text-xs text-gray-500">
                Locked: {new Date(data.lockedAt).toLocaleString()}
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border bg-white p-6">
            <div className="text-sm font-semibold text-gray-900">Review</div>
            <p className="mt-1 text-xs text-gray-500">
              Approve this deliverable as final or request changes.
            </p>

            {data.staffFeedback ? (
              <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                <div className="text-xs font-semibold tracking-wide">STAFF FEEDBACK</div>
                <div className="mt-2 whitespace-pre-wrap">{data.staffFeedback}</div>
              </div>
            ) : null}

            {data.brandFeedback && data.brandStatus === "CHANGES_REQUESTED" ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <div className="text-xs font-semibold tracking-wide">CURRENT BRAND FEEDBACK</div>
                <div className="mt-2 whitespace-pre-wrap">{data.brandFeedback}</div>
              </div>
            ) : null}

            {canRequestChanges ? (
              <div className="mt-5">
                <label className="text-sm font-medium text-gray-700">
                  Feedback for requested changes
                </label>
                <textarea
                  placeholder="Describe clearly what should be changed…"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="mt-2 min-h-[140px] w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-emerald-950/20"
                />
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <div className="font-semibold">Final approval completed</div>
                <div className="mt-1">
                  This deliverable is locked. No further changes can be requested.
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {canApprove ? (
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  disabled={busy}
                  className="rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-50"
                >
                  Final approve
                </button>
              ) : null}

              {canRequestChanges ? (
                <button
                  type="button"
                  onClick={() => update("CHANGES_REQUESTED")}
                  disabled={busy || !feedback.trim()}
                  className="rounded-full border border-amber-300 bg-white px-5 py-3 text-sm font-semibold text-amber-900 hover:bg-amber-50 disabled:opacity-50"
                >
                  Request changes
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl border bg-white p-6 shadow-2xl">
            <div className="text-lg font-semibold text-gray-900">Final approval</div>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Once you confirm this approval:
              <br />• the creator will not be able to change this deliverable anymore
              <br />• this upload will be locked as final
              <br />• download will be enabled
              <br />• this step should be treated as contractually final for this file
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setConfirmOpen(false);
                  await update("APPROVED");
                }}
                className="rounded-full bg-emerald-950 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
              >
                Confirm final approval
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}