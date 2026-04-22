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

  async function load() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const res = await fetch("/api/brand/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();
    setForm(json.profile || {});
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
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

    alert("Saved");
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="max-w-2xl space-y-4 rounded-3xl border bg-white p-8">
        <h1 className="text-2xl font-semibold">Brand Profile</h1>

        <input
          placeholder="Company Name"
          value={form.companyName || ""}
          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          className="w-full rounded-xl border px-4 py-3"
        />

        <input
          placeholder="Contact Name"
          value={form.contactName || ""}
          onChange={(e) => setForm({ ...form, contactName: e.target.value })}
          className="w-full rounded-xl border px-4 py-3"
        />

        <input
          placeholder="Email"
          value={form.contactEmail || ""}
          onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
          className="w-full rounded-xl border px-4 py-3"
        />

        <input
          placeholder="Phone"
          value={form.contactPhone || ""}
          onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
          className="w-full rounded-xl border px-4 py-3"
        />

        <button
          onClick={save}
          className="rounded-full bg-black px-6 py-3 text-white"
        >
          Save
        </button>
      </div>
    </div>
  );
}