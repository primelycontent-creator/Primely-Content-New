"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type CreatorCard = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  profileImageUrl: string | null;
  emailConfirmed: boolean;
  isVerified: boolean;
  creatorProfile: {
    id: string;
    fullName: string | null;
    phone: string | null;
    city: string | null;
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
  _count: {
    assignedBriefs: number;
    deliverables: number;
  };
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
    return {
      className:
        "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900",
      label: "Approved",
    };
  }

  if (s === "REJECTED") {
    return {
      className:
        "rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-900",
      label: "Rejected",
    };
  }

  return {
    className:
      "rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900",
    label: "Pending",
  };
}

function emailBadge(confirmed: boolean) {
  return confirmed
    ? {
        className:
          "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900",
        label: "Email confirmed",
      }
    : {
        className:
          "rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-900",
        label: "Email not confirmed",
      };
}

export default function StaffCreatorsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [items, setItems] = useState<CreatorCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [nicheGroup, setNicheGroup] = useState("");
  const [country, setCountry] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
    });
  }, []);

  async function load() {
    if (!token) return;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (nicheGroup.trim()) params.set("nicheGroup", nicheGroup.trim());
    if (country.trim()) params.set("country", country.trim());
    if (workMode.trim()) params.set("workMode", workMode.trim());
    if (approvalStatus.trim()) params.set("approvalStatus", approvalStatus.trim());
    if (onlyVerified) params.set("onlyVerified", "true");
    if (sort.trim()) params.set("sort", sort.trim());

    const res = await fetch(`/api/staff/creators?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const { json, text } = await readSafeJson(res);

    if (!res.ok) {
      setError((json as any)?.error ?? text.slice(0, 200));
      setLoading(false);
      return;
    }

    setItems(((json as any)?.creators ?? []) as CreatorCard[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const nicheOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((x) => {
      if (x.creatorProfile?.nicheGroup) set.add(x.creatorProfile.nicheGroup);
    });
    return Array.from(set).sort();
  }, [items]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      approved: items.filter((x) => x.creatorProfile?.approvalStatus === "APPROVED").length,
      pending: items.filter((x) => x.creatorProfile?.approvalStatus === "PENDING").length,
      rejected: items.filter((x) => x.creatorProfile?.approvalStatus === "REJECTED").length,
      verified: items.filter((x) => x.isVerified).length,
    };
  }, [items]);

  return (
    <div className="rounded-3xl border bg-white/70 p-10 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-5xl leading-[0.95] tracking-tight text-gray-900">
            Creator Database
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-gray-600">
            Search, filter and review creators for upcoming campaigns.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border bg-white px-3 py-1">
              Total: <b>{stats.total}</b>
            </span>
            <span className="rounded-full border bg-white px-3 py-1">
              Approved: <b>{stats.approved}</b>
            </span>
            <span className="rounded-full border bg-white px-3 py-1">
              Pending: <b>{stats.pending}</b>
            </span>
            <span className="rounded-full border bg-white px-3 py-1">
              Rejected: <b>{stats.rejected}</b>
            </span>
            <span className="rounded-full border bg-white px-3 py-1">
              Verified: <b>{stats.verified}</b>
            </span>
          </div>
        </div>

        <div className="rounded-full border bg-white px-4 py-2 text-sm font-semibold text-gray-800">
          {items.length} creator{items.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="mt-8 rounded-3xl border bg-white p-6">
        <div className="grid gap-3 lg:grid-cols-5">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, niche..."
            className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-950/20 lg:col-span-2"
          />

          <select
            value={nicheGroup}
            onChange={(e) => setNicheGroup(e.target.value)}
            className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-950/20"
          >
            <option value="">All niche groups</option>
            {nicheOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country"
            className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-950/20"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
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
          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-950/20"
          >
            <option value="">All work modes</option>
            <option value="FULL_TIME">Full time</option>
            <option value="PART_TIME">Part time</option>
          </select>

          <select
            value={approvalStatus}
            onChange={(e) => setApprovalStatus(e.target.value)}
            className="rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-950/20"
          >
            <option value="">All approval states</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <label className="inline-flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={onlyVerified}
              onChange={(e) => setOnlyVerified(e.target.checked)}
            />
            Only verified
          </label>

          <button
            type="button"
            onClick={load}
            className="rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-white shadow hover:opacity-95"
          >
            Apply filters
          </button>

          <button
            type="button"
            onClick={() => {
              setQ("");
              setNicheGroup("");
              setCountry("");
              setWorkMode("");
              setApprovalStatus("");
              setOnlyVerified(false);
              setSort("newest");
              setTimeout(() => load(), 0);
            }}
            className="rounded-full border bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 rounded-3xl border bg-white p-8 text-sm text-gray-600">
          Loading creators…
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-3xl border bg-white p-10 text-center">
          <div className="text-lg font-semibold text-gray-900">No creators found</div>
          <p className="mt-2 text-sm text-gray-600">
            Try changing your filters or search term.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {items.map((creator) => {
            const p = creator.creatorProfile;
            const displayName = p?.fullName || creator.email;
            const approval = approvalBadge(p?.approvalStatus);
            const email = emailBadge(creator.emailConfirmed);

            return (
              <Link
                key={creator.id}
                href={`/staff/creators/${creator.id}`}
                className="group rounded-3xl border bg-white p-6 transition hover:bg-gray-50"
              >
                <div className="flex gap-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border bg-gray-100">
                    {creator.profileImageUrl ? (
                      <Image
                        src={creator.profileImageUrl}
                        alt={displayName}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-gray-500">
                        {displayName.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="truncate text-lg font-semibold text-gray-900">
                        {displayName}
                      </div>
                      {p?.nicheGroup ? (
                        <span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-gray-800">
                          {p.nicheGroup}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-1 text-sm text-gray-500">{creator.email}</div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={approval.className}>{approval.label}</span>
                      <span className={email.className}>{email.label}</span>
                      {creator.isVerified ? (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
                          Ready for assignment
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                      <span className="rounded-full border bg-white px-3 py-1">
                        Price: <b>{priceLabel(p?.price30sCents)}</b>
                      </span>
                      <span className="rounded-full border bg-white px-3 py-1">
                        Mode: <b>{modeLabel(p?.workMode)}</b>
                      </span>
                      <span className="rounded-full border bg-white px-3 py-1">
                        Location: <b>{p?.country || p?.city || "—"}</b>
                      </span>
                      <span className="rounded-full border bg-white px-3 py-1">
                        Briefs: <b>{creator._count.assignedBriefs}</b>
                      </span>
                    </div>

                    <div className="mt-3 line-clamp-2 text-sm text-gray-600">
                      {p?.bio?.trim()
                        ? p.bio
                        : (p?.niches ?? []).length > 0
                          ? (p?.niches ?? []).join(", ")
                          : "No short description yet."}
                    </div>

                    {(p?.equipment ?? []).length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(p?.equipment ?? []).slice(0, 3).map((eq) => (
                          <span
                            key={eq}
                            className="rounded-full border bg-white px-3 py-1 text-[11px] font-semibold text-gray-700"
                          >
                            {eq}
                          </span>
                        ))}
                        {(p?.equipment ?? []).length > 3 ? (
                          <span className="rounded-full border bg-white px-3 py-1 text-[11px] font-semibold text-gray-500">
                            +{(p?.equipment ?? []).length - 3} more
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="mt-4 text-xs font-semibold text-emerald-950 opacity-0 transition group-hover:opacity-100">
                      Open creator profile →
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}