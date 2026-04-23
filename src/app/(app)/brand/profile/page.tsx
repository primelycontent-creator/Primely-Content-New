"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BrandProfilePage() {
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const inputClassName =
    "w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10";

  async function load() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const res = await fetch("/api/brand/profile", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const json = await res.json();
    setForm(json.profile || {});
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    try {
      setSaving(true);

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      await fetch("/api/brand/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      alert("Profil gespeichert");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-gray-600 sm:p-8">Profil wird geladen...</div>;
  }

  return (
    <div className="px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-2xl rounded-3xl border bg-white p-5 shadow-sm sm:p-8">
        <h1 className="font-serif text-4xl tracking-tight text-gray-900 sm:text-5xl">
          Brand-Profil
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Diese Informationen werden für deine Briefings und die Kommunikation mit unserem Team genutzt.
        </p>

        <div className="mt-8 space-y-4">
          <input
            placeholder="Firmenname"
            value={form.companyName || ""}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            className={inputClassName}
          />

          <input
            placeholder="Ansprechperson"
            value={form.contactName || ""}
            onChange={(e) => setForm({ ...form, contactName: e.target.value })}
            className={inputClassName}
          />

          <input
            type="email"
            placeholder="E-Mail"
            value={form.contactEmail || ""}
            onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
            className={inputClassName}
            autoComplete="email"
            inputMode="email"
          />

          <input
            placeholder="Telefon"
            value={form.contactPhone || ""}
            onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
            className={inputClassName}
            inputMode="tel"
          />

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="w-full rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
          >
            {saving ? "Wird gespeichert..." : "Speichern"}
          </button>
        </div>
      </div>
    </div>
  );
}