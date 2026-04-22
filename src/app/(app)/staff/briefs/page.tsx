"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Creator = { id: string; email: string; creatorProfile?: { displayName?: string | null } | null };
type Brief = {
  id: string;
  title: string;
  description?: string | null;
  createdAt: string;
  nicheGroup?: string | null;
  niches?: string[] | null;
  brand?: { email: string; brandProfile?: { companyName?: string | null } | null } | null;
  assignment?: { id: string; creator: { id: string; email: string } } | null;
};

export default function StaffBriefsPage() {
  const [loading, setLoading] = useState(true);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({}); // briefId -> creatorId
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    const [bRes, cRes] = await Promise.all([
      fetch("/api/staff/briefs", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/staff/creators", { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    const bJson = await bRes.json();
    const cJson = await cRes.json();

    setBriefs(bJson.briefs ?? []);
    setCreators(cJson.creators ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const creatorOptions = useMemo(
    () =>
      creators.map((c) => ({
        id: c.id,
        label: c.creatorProfile?.displayName
          ? `${c.creatorProfile.displayName} — ${c.email}`
          : c.email,
      })),
    [creators]
  );

  async function assign(briefId: string) {
    const creatorId = selected[briefId];
    if (!creatorId) return alert("Bitte Creator auswählen.");

    setBusy(briefId);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    const res = await fetch("/api/staff/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ briefId, creatorId }),
    });

    const json = await res.json();
    if (!res.ok) {
      setBusy(null);
      return alert(json?.error ?? "Assign failed");
    }

    await load();
    setBusy(null);
  }

  return (
    <div className="p-8">
      <div className="rounded-3xl border bg-white/70 p-10 shadow-sm">
        <h1 className="font-serif text-5xl leading-[0.95] tracking-tight text-gray-900">
          Staff — Briefs
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          Hier landen alle <b>SUBMITTED</b> Briefs. Wähle einen Creator und weise zu.
        </p>

        <div className="mt-8 rounded-2xl border bg-white p-6">
          {loading ? (
            <div className="text-sm text-gray-600">Loading…</div>
          ) : briefs.length === 0 ? (
            <div className="text-sm text-gray-600">Keine offenen Briefs.</div>
          ) : (
            <div className="space-y-4">
              {briefs.map((b) => (
                <div key={b.id} className="rounded-2xl border p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-lg font-semibold text-gray-900 truncate">{b.title}</div>
                      <div className="mt-1 text-xs text-gray-600">
                        Brand: {b.brand?.brandProfile?.companyName ?? b.brand?.email ?? "—"}
                      </div>
                      {b.nicheGroup && (
                        <div className="mt-2 text-xs text-gray-600">
                          <b>{b.nicheGroup}</b>
                          {b.niches?.length ? ` · ${b.niches.join(", ")}` : ""}
                        </div>
                      )}
                      {b.description && (
                        <div className="mt-3 text-sm text-gray-700">{b.description}</div>
                      )}
                    </div>

                    <div className="w-full sm:w-[340px] rounded-2xl border bg-gray-50 p-4">
                      <div className="text-xs font-semibold text-gray-700">Assign Creator</div>

                      <select
                        className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                        value={selected[b.id] ?? b.assignment?.creator.id ?? ""}
                        onChange={(e) => setSelected((p) => ({ ...p, [b.id]: e.target.value }))}
                      >
                        <option value="">Select…</option>
                        {creatorOptions.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>

                      <button
                        className="mt-3 w-full rounded-full bg-emerald-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                        onClick={() => assign(b.id)}
                        disabled={busy === b.id}
                      >
                        {busy === b.id ? "Assigning…" : "Assign"}
                      </button>

                      {b.assignment?.creator?.email && (
                        <div className="mt-2 text-xs text-gray-600">
                          Aktuell zugewiesen: <b>{b.assignment.creator.email}</b>
                        </div>
                      )}
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
