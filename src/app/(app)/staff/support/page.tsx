"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type TicketRow = {
  id: string;
  subject: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED" | string;
  briefId: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; email: string; role: string };
  _count?: { messages: number };
};

async function readSafeJson(res: Response) {
  const text = await res.text();
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

export default function StaffSupportPage() {
  const [token, setToken] = useState<string | null>(null);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
    });
  }, []);

  async function load() {
    if (!token) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/support/tickets", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const { json, text } = await readSafeJson(res);
    if (!res.ok) {
      setError(json?.error ?? text.slice(0, 200));
      setLoading(false);
      return;
    }

    setTickets(json?.tickets ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [token]);

  return (
    <div className="p-8">
      <div className="mx-auto max-w-6xl rounded-3xl border bg-white/80 p-10 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="font-serif text-5xl leading-[0.95] tracking-tight text-gray-900">
              Support Inbox
            </h1>
            <p className="mt-3 text-sm text-gray-600">
              All support tickets from brands and creators.
            </p>
          </div>

          <Link
            href="/staff/dashboard"
            className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Back
          </Link>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-8 rounded-3xl border bg-white p-6">
          {loading ? (
            <p className="text-sm text-gray-600">Loading…</p>
          ) : tickets.length === 0 ? (
            <p className="text-sm text-gray-600">No tickets yet.</p>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <Link
                  key={t.id}
                  href={`/staff/support/${t.id}`}
                  className="block rounded-2xl border bg-white px-5 py-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-gray-900">{t.subject}</div>
                      <div className="mt-1 text-xs text-gray-500">
                        {t.user.role} • {t.user.email} • Messages: {t._count?.messages ?? 0}
                        {t.briefId ? ` • Brief: ${t.briefId}` : ""}
                      </div>
                    </div>

                    <span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-gray-800">
                      {t.status.replace("_", " ")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}