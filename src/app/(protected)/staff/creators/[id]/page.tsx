"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type CreatorDetail = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  emailConfirmed: boolean;
  creatorProfile: {
    id: string;
    fullName: string | null;
    phone: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    postalCode: string | null;
    country: string | null;
    workMode: "FULL_TIME" | "PART_TIME" | null;
    nicheGroup: string | null;
    niches: string[];
    portfolioUrl: string | null;
    bio: string | null;
    instagram: string | null;
    tiktok: string | null;
    equipment: string[];
    price30sCents: number | null;
    introVideoAssetId: string | null;
    profileImageAssetId: string | null;
    approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
    approvedAt: string | null;
    approvedByUserId: string | null;
    rejectionReason: string | null;
  } | null;
  assignedBriefs: Array<{
    id: string;
    title: string;
    status: string;
    updatedAt: string;
    brand: {
      email: string;
      brandProfile: {
        companyName: string | null;
      } | null;
    };
  }>;
  deliverables: Array<{
    id: string;
    briefId: string;
    fileName: string | null;
    mimeType: string | null;
    sizeBytes: number | null;
    status: string;
    brandStatus: string;
    createdAt: string;
    brief: {
      id: string;
      title: string;
    };
  }>;
};

async function readSafeJson(res: Response) {
  const text = await res.text();
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

function priceLabel(cents: number | null | undefined) {
  if (typeof cents !== "number") return "—";
  return `€${(cents / 100).toFixed(0)}`;
}

function modeLabel(v: string | null | undefined) {
  if (v === "FULL_TIME") return "Full time";
  if (v === "PART_TIME") return "Part time";
  return "—";
}

function approvalBadge(status?: "PENDING" | "APPROVED" | "REJECTED" | null) {
  const s = String(status ?? "PENDING").toUpperCase();

  if (s === "APPROVED") {
    return "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900";
  }

  if (s === "REJECTED") {
    return "rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-900";
  }

  return "rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900";
}

function confirmBadge(ok: boolean) {
  return ok
    ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900"
    : "rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-900";
}

export default function StaffCreatorDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [creator, setCreator] = useState<CreatorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const creatorId = params.id;

  async function loadCreator(currentToken: string) {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/staff/creators/${creatorId}`, {
      headers: { Authorization: `Bearer ${currentToken}` },
      cache: "no-store",
    });

    const { json, text } = await readSafeJson(res);

    if (!res.ok) {
      setError((json as any)?.error ?? text.slice(0, 200));
      setLoading(false);
      return;
    }

    const nextCreator = ((json as any)?.creator ?? null) as CreatorDetail | null;
    setCreator(nextCreator);
    setRejectionReason(nextCreator?.creatorProfile?.rejectionReason ?? "");
    setLoading(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const nextToken = data.session?.access_token ?? null;
      setToken(nextToken);
    });
  }, []);

  useEffect(() => {
    if (!token) return;
    loadCreator(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, creatorId]);

  async function approveCreator() {
    if (!token) return;

    try {
      setBusy(true);
      setError(null);

      const res = await fetch(`/api/staff/creators/${creatorId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { json, text } = await readSafeJson(res);

      if (!res.ok) {
        throw new Error((json as any)?.error ?? text.slice(0, 200));
      }

      await loadCreator(token);
    } catch (e: any) {
      setError(e?.message ?? "Approve failed");
    } finally {
      setBusy(false);
    }
  }

  async function rejectCreator() {
    if (!token) return;

    try {
      setBusy(true);
      setError(null);

      const res = await fetch(`/api/staff/creators/${creatorId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rejectionReason: rejectionReason.trim() || null,
        }),
      });

      const { json, text } = await readSafeJson(res);

      if (!res.ok) {
        throw new Error((json as any)?.error ?? text.slice(0, 200));
      }

      await loadCreator(token);
    } catch (e: any) {
      setError(e?.message ?? "Reject failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="rounded-3xl border bg-white/70 p-10 shadow-sm">
          <div className="text-sm text-gray-600">Loading creator…</div>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="p-8">
        <div className="rounded-3xl border bg-white/70 p-10 shadow-sm">
          <div className="text-sm text-gray-600">{error ?? "Creator not found"}</div>
        </div>
      </div>
    );
  }

  const p = creator.creatorProfile;
  const displayName = p?.fullName || creator.email;

  return (
    <div className="p-8">
      <div className="rounded-3xl border bg-white/70 p-10 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-5">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border bg-gray-100 text-3xl font-semibold text-gray-500">
              {displayName.slice(0, 1).toUpperCase()}
            </div>

            <div>
              <div className="text-xs font-semibold tracking-wide text-gray-600">CREATOR</div>
              <h1 className="mt-2 font-serif text-5xl leading-[0.95] tracking-tight text-gray-900">
                {displayName}
              </h1>
              <div className="mt-3 text-sm text-gray-600">{creator.email}</div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
                <span className="rounded-full border bg-white px-3 py-1">
                  Price: <b>{priceLabel(p?.price30sCents)}</b>
                </span>
                <span className="rounded-full border bg-white px-3 py-1">
                  Work mode: <b>{modeLabel(p?.workMode)}</b>
                </span>
                <span className="rounded-full border bg-white px-3 py-1">
                  Country: <b>{p?.country || "—"}</b>
                </span>
                <span className="rounded-full border bg-white px-3 py-1">
                  Intro video: <b>{p?.introVideoAssetId ? "Yes" : "No"}</b>
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className={approvalBadge(p?.approvalStatus)}>
                  {p?.approvalStatus === "APPROVED"
                    ? "Staff approved"
                    : p?.approvalStatus === "REJECTED"
                    ? "Rejected"
                    : "Pending review"}
                </span>

                <span className={confirmBadge(creator.emailConfirmed)}>
                  {creator.emailConfirmed ? "Email confirmed" : "Email not confirmed"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/staff/creators")}
            className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Back
          </button>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border bg-white p-6">
            <div className="text-sm font-semibold text-gray-900">Profile Overview</div>

            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <div><span className="text-gray-500">Phone:</span> {p?.phone || "—"}</div>
              <div><span className="text-gray-500">Niche group:</span> {p?.nicheGroup || "—"}</div>
              <div><span className="text-gray-500">Niches:</span> {(p?.niches ?? []).length ? p!.niches.join(", ") : "—"}</div>
              <div><span className="text-gray-500">Portfolio:</span> {p?.portfolioUrl || "—"}</div>
              <div><span className="text-gray-500">Instagram:</span> {p?.instagram || "—"}</div>
              <div><span className="text-gray-500">TikTok:</span> {p?.tiktok || "—"}</div>
              <div><span className="text-gray-500">Address:</span> {[p?.addressLine1, p?.city, p?.postalCode, p?.country].filter(Boolean).join(", ") || "—"}</div>
              <div>
                <span className="text-gray-500">Approved at:</span>{" "}
                {p?.approvedAt ? new Date(p.approvedAt).toLocaleString() : "—"}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border bg-white/60 p-4">
              <div className="text-xs font-semibold tracking-wide text-gray-600">BIO</div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                {p?.bio?.trim() || "No bio yet."}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-6">
            <div className="text-sm font-semibold text-gray-900">Verification Actions</div>
            <p className="mt-2 text-sm text-gray-600">
              A creator should only be approved once the profile looks complete and the email has been confirmed.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy || !creator.emailConfirmed}
                onClick={approveCreator}
                className="rounded-full border border-emerald-700 bg-emerald-950 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "Saving..." : "Approve creator"}
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={rejectCreator}
                className="rounded-full border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
              >
                {busy ? "Saving..." : "Reject creator"}
              </button>
            </div>

            {!creator.emailConfirmed ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                This creator cannot be approved for campaign assignment until the email address has been confirmed.
              </div>
            ) : null}

            <div className="mt-6">
              <label className="text-sm font-medium text-gray-700">
                Rejection reason / internal note
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Optional reason for rejection or note for later..."
                className="mt-2 min-h-[140px] w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-950/20"
              />
            </div>

            {p?.approvalStatus === "REJECTED" && p?.rejectionReason ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                <div className="font-semibold">Current rejection reason</div>
                <div className="mt-1 whitespace-pre-wrap">{p.rejectionReason}</div>
              </div>
            ) : null}

            <div className="mt-6 text-sm font-semibold text-gray-900">Equipment</div>

            {(p?.equipment ?? []).length === 0 ? (
              <p className="mt-4 text-sm text-gray-600">No equipment listed yet.</p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {p!.equipment.map((eq) => (
                  <span
                    key={eq}
                    className="rounded-full border bg-white px-3 py-1.5 text-xs font-semibold text-gray-700"
                  >
                    {eq}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border bg-white p-6">
          <div className="text-sm font-semibold text-gray-900">Assigned Briefings</div>

          {creator.assignedBriefs.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">No assigned briefings yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {creator.assignedBriefs.map((b) => (
                <div
                  key={b.id}
                  className="rounded-2xl border bg-white px-4 py-3"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{b.title}</div>
                      <div className="mt-1 text-xs text-gray-500">
                        Brand: {b.brand.brandProfile?.companyName ?? b.brand.email}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      {b.status.replace("_", " ")} • {new Date(b.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-3xl border bg-white p-6">
          <div className="text-sm font-semibold text-gray-900">Recent Deliverables</div>

          {creator.deliverables.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">No deliverables yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {creator.deliverables.map((d) => (
                <div
                  key={d.id}
                  className="rounded-2xl border bg-white px-4 py-3"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-gray-900">
                        {d.fileName ?? "Unnamed file"}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Brief: {d.brief.title}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      {d.status.replace("_", " ")} • {new Date(d.createdAt).toLocaleString()}
                    </div>
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