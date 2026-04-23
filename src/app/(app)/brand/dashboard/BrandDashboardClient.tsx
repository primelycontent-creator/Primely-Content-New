"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type MeResponse =
  | {
      ok: true;
      role: "BRAND" | "CREATOR" | "STAFF";
      companyName: string | null;
      displayName: string | null;
    }
  | { error: string };

export default function BrandDashboardClient() {
  const [companyName, setCompanyName] = useState<string | null>(null);

  const headline = useMemo(() => {
    return companyName ? `Willkommen, ${companyName}` : "Willkommen";
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
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
        <h1 className="font-serif text-4xl tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          {headline}
        </h1>

        <Link
          href="/brand/briefs/new"
          className="w-full rounded-full bg-emerald-950 px-6 py-3 text-center text-sm font-semibold text-white shadow hover:opacity-95 sm:w-auto"
        >
          + Briefing erstellen
        </Link>
      </div>

      <div className="mt-8 rounded-[28px] border bg-white/60 p-5 shadow-sm sm:mt-10 sm:p-8 lg:p-10">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <div className="text-2xl font-semibold text-slate-900">
              Deine Briefings
            </div>
            <div className="mt-1 text-sm leading-6 text-slate-600 sm:text-base">
              Alle aktiven und aktuellen Briefings auf einen Blick.
            </div>
          </div>

          <Link
            href="/brand/briefs/new"
            className="w-full rounded-full border bg-white px-6 py-3 text-center text-sm font-medium text-slate-900 hover:bg-slate-50 sm:w-auto"
          >
            Neues Briefing
          </Link>
        </div>

        <div className="mt-8 rounded-[22px] border bg-white p-6 sm:p-10">
          <div className="text-2xl font-semibold text-slate-900">
            Noch keine Briefings vorhanden
          </div>
          <div className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
            Erstelle dein erstes Briefing, um einen Workflow mit unserem Team zu starten.
          </div>

          <Link
            href="/brand/briefs/new"
            className="mt-8 inline-flex w-full justify-center rounded-full bg-emerald-950 px-8 py-4 text-sm font-semibold text-white shadow hover:opacity-95 sm:w-auto"
          >
            Briefing erstellen
          </Link>
        </div>

        <div className="mt-6 text-sm leading-6 text-slate-500">
          Tipp: Im Dashboard findest du deine Briefings übersichtlich als Liste. Neue Briefings kannst du jederzeit erstellen oder bearbeiten.
        </div>
      </div>
    </div>
  );
}