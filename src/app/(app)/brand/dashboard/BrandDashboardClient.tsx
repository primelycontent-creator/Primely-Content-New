"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type MeResponse =
  | { ok: true; role: "BRAND" | "CREATOR" | "STAFF"; companyName: string | null; displayName: string | null }
  | { error: string };

export default function BrandDashboardClient() {
  const [companyName, setCompanyName] = useState<string | null>(null);

  const headline = useMemo(() => {
    return companyName ? `Welcome, ${companyName}` : "Welcome, Your Brand";
  }, [companyName]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;

      const res = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = (await res.json()) as MeResponse;
      if ("ok" in json && json.ok) setCompanyName(json.companyName);
    })();
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-6">
        <h1 className="font-serif text-6xl tracking-tight text-slate-900">{headline}</h1>

        <Link
          href="/brand/briefs/new"
          className="rounded-full bg-emerald-950 px-6 py-3 text-white shadow hover:opacity-95"
        >
          + Create Briefing
        </Link>
      </div>

      <div className="mt-10 rounded-[28px] border bg-white/60 p-10 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl font-semibold text-slate-900">Your Briefings</div>
            <div className="mt-1 text-slate-600">All your active and recent briefings.</div>
          </div>
          <Link
            href="/brand/briefs/new"
            className="rounded-full border bg-white px-6 py-3 font-medium text-slate-900 hover:bg-slate-50"
          >
            New Briefing
          </Link>
        </div>

        <div className="mt-8 rounded-[22px] border bg-white p-10">
          <div className="text-2xl font-semibold text-slate-900">No briefings yet</div>
          <div className="mt-2 text-slate-600">Create your first briefing to start a workflow with Staff.</div>

          <Link
            href="/brand/briefs/new"
            className="mt-8 inline-flex rounded-full bg-emerald-950 px-8 py-4 text-white shadow hover:opacity-95"
          >
            Create Briefing
          </Link>
        </div>

        <div className="mt-6 text-sm text-slate-500">
          Tip: “Briefings” in the sidebar is only for creating/editing — dashboard is list-first.
        </div>
      </div>
    </div>
  );
}
