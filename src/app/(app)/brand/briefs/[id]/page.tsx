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

type DeliverableRow = {
  id: string;
  status: string;
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
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  deadline: string | null;
  licenseTerm: string | null;
  nicheGroup: string | null;
  niches: string[];
  assignedCreator: {
    id: string;
    email: string;
    creatorProfile: {
      fullName: string | null;
    } | null;
  } | null;
  brand: {
    id: string;
    email: string;
    brandProfile: {
      companyName: string | null;
    } | null;
  };
  assets: Array<{
    id: string;
    bucket: string;
    path: string;
    fileName: string | null;
    mimeType?: string | null;
    sizeBytes?: number | null;
    createdAt?: string;
  }>;
  deliverables: DeliverableRow[];
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

  if (s === "DRAFT") return `${base} border-gray-200 bg-white text-gray-800`;
  if (s === "SUBMITTED") return `${base} border-amber-200 bg-amber-50 text-amber-900`;
  if (s === "REVIEW") return `${base} border-blue-200 bg-blue-50 text-blue-900`;
  if (s === "IN_PROGRESS") return `${base} border-amber-200 bg-amber-50 text-amber-900`;
  if (s === "DONE" || s === "APPROVED") return `${base} border-emerald-200 bg-emerald-50 text-emerald-900`;
  if (s === "DECLINED") return `${base} border-rose-200 bg-rose-50 text-rose-900`;

  return `${base} border-gray-200 bg-white text-gray-800`;
}

function reviewBadge(status: string) {
  const s = String(status).toUpperCase();
  const base = "rounded-full border px-3 py-1 text-xs font-semibold";

  if (s === "PENDING") return `${base} border-gray-200 bg-white text-gray-800`;
  if (s === "CHANGES_REQUESTED") return `${base} border-amber-200 bg-amber-50 text-amber-900`;
  if (s === "APPROVED") return `${base} border-emerald-200 bg-emerald-50 text-emerald-900`;

  return `${base} border-gray-200 bg-white text-gray-800`;
}

export default function BrandBriefDetailPage() {
  const params = useParams<{ id: string }>();
  const briefId = params.id;
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [brief, setBrief] = useState<BriefDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
    });
  }, []);

  useEffect(() => {
    (async () => {
      if (!token || !briefId) return;

      setLoading(true);
      setError(null);

      const res = await fetch(`/api/brand/briefs/${briefId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const { json, text } = await readSafeJson(res);

      if (!res.ok) {
        setError((json as any)?.error ?? text.slice(0, 200));
        setBrief(null);
        setLoading(false);
        return;
      }

      setBrief(((json as any)?.brief ?? null) as BriefDetail | null);
      setLoading(false);
    })();
  }, [token, briefId]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="rounded-3xl border bg-white/70 p-10 shadow-sm">
          <div className="text-sm text-gray-600">Loading brief…</div>
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

  const creatorName =
    brief.assignedCreator?.creatorProfile?.fullName?.trim() ||
    brief.assignedCreator?.email ||
    "Not assigned yet";

  return (
    <div className="p-8">
      <div className="rounded-3xl border bg-white/70 p-10 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="text-xs font-semibold tracking-wide text-gray-600">BRIEFING</div>
            <h1 className="mt-2 font-serif text-5xl leading-[0.95] tracking-tight text-gray-900">
              {brief.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className={statusBadge(brief.status)}>
                {brief.status.replaceAll("_", " ")}
              </span>
            </div>

            <div className="mt-3 text-sm text-gray-600">
              Brand: {brief.brand.brandProfile?.companyName ?? brief.brand.email}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/brand/dashboard")}
              className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              Back
            </button>

            <button
              type="button"
              onClick={() => router.push(`/brand/briefs/${brief.id}/edit`)}
              className="rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-white shadow hover:opacity-95"
            >
              Edit Brief
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border bg-white p-6">
            <div className="text-sm font-semibold text-gray-900">Campaign Overview</div>

            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <div>
                <span className="text-gray-500">Deadline:</span>{" "}
                {brief.deadline ? new Date(brief.deadline).toLocaleDateString() : "—"}
              </div>
              <div>
                <span className="text-gray-500">License:</span> {brief.licenseTerm ?? "—"}
              </div>
              <div>
                <span className="text-gray-500">Niche group:</span> {brief.nicheGroup ?? "—"}
              </div>
              <div>
                <span className="text-gray-500">Niches:</span>{" "}
                {(brief.niches ?? []).length ? brief.niches.join(", ") : "—"}
              </div>
              <div>
                <span className="text-gray-500">Assigned creator:</span> {creatorName}
              </div>
            </div>

            {brief.description ? (
              <div className="mt-5 rounded-2xl border bg-white/60 p-4">
                <div className="text-xs font-semibold tracking-wide text-gray-600">DESCRIPTION</div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                  {brief.description}
                </p>
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border bg-white p-6">
            <div className="text-sm font-semibold text-gray-900">Brand Files</div>

            {(brief.assets ?? []).length === 0 ? (
              <p className="mt-4 text-sm text-gray-600">No attachments uploaded yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {brief.assets.map((a) => (
                  <div key={a.id} className="rounded-2xl border bg-white px-4 py-3">
                    <div className="truncate text-sm font-semibold text-gray-900">
                      {a.fileName ?? a.path}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {a.bucket} • {formatBytes(a.sizeBytes)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-gray-900">Creator Deliverables</div>
              <p className="mt-1 text-xs text-gray-500">
                Review the uploads for this briefing.
              </p>
            </div>
          </div>

          {(brief.deliverables ?? []).length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">No deliverables uploaded yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {brief.deliverables.map((d, index) => (
                <div
                  key={d.id}
                  className="flex flex-col gap-3 rounded-2xl border bg-white px-4 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="truncate text-sm font-semibold text-gray-900">
                        Slot {index + 1}: {d.fileName ?? d.path}
                      </div>
                      <span className={statusBadge(d.status)}>
                        {d.status.replaceAll("_", " ")}
                      </span>
                      <span className={reviewBadge(d.brandStatus)}>
                        Brand review: {d.brandStatus.replaceAll("_", " ")}
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-gray-500">
                      {d.mimeType ?? "—"} • {formatBytes(d.sizeBytes)} •{" "}
                      {new Date(d.createdAt).toLocaleString()}
                    </div>

                    {d.brandFeedback ? (
                      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                        <div className="font-semibold">Your feedback</div>
                        <div className="mt-1 whitespace-pre-wrap">{d.brandFeedback}</div>
                      </div>
                    ) : null}
                  </div>

                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={() => router.push(`/brand/briefs/${brief.id}/deliverables/${d.id}`)}
                      className="rounded-full border bg-white px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      Open review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}