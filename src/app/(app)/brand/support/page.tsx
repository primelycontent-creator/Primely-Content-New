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

function statusLabel(status: string) {
  if (status === "OPEN") return "Offen";
  if (status === "IN_PROGRESS") return "In Bearbeitung";
  if (status === "CLOSED") return "Geschlossen";
  return status.replace("_", " ");
}

export default function BrandSupportPage() {
  const [token, setToken] = useState<string | null>(null);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [briefId, setBriefId] = useState("");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function createTicket() {
    if (!token) return;
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          message,
          briefId: briefId.trim() || null,
        }),
      });

      const { json, text } = await readSafeJson(res);
      if (!res.ok) throw new Error(json?.error ?? text.slice(0, 200));

      setSubject("");
      setMessage("");
      setBriefId("");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Ticket konnte nicht erstellt werden.");
    } finally {
      setBusy(false);
    }
  }

  const inputClassName =
    "w-full appearance-none rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-emerald-950/20";

  return (
    <div className="px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-5xl rounded-3xl border bg-white/80 p-5 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
          <div>
            <h1 className="font-serif text-4xl leading-[0.95] tracking-tight text-gray-900 sm:text-5xl">
              Support
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Erstelle ein Support-Ticket und verfolge Antworten unseres Teams.
            </p>
          </div>

          <Link
            href="/brand/dashboard"
            className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Zurück
          </Link>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-8 rounded-3xl border bg-white p-5 sm:p-6">
          <div className="text-sm font-semibold text-gray-900">Neues Ticket</div>

          <div className="mt-4 grid gap-4">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Betreff"
              className={inputClassName}
            />

            <input
              value={briefId}
              onChange={(e) => setBriefId(e.target.value)}
              placeholder="Optionale Briefing-ID"
              className={inputClassName}
            />

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Beschreibe dein Anliegen..."
              className="min-h-[160px] w-full appearance-none rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-emerald-950/20"
            />

            <button
              type="button"
              disabled={busy || !subject.trim() || !message.trim()}
              onClick={createTicket}
              className="w-full rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50 sm:w-auto"
            >
              {busy ? "Wird erstellt..." : "Ticket erstellen"}
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border bg-white p-5 sm:p-6">
          <div className="text-sm font-semibold text-gray-900">Deine Tickets</div>

          {loading ? (
            <p className="mt-3 text-sm text-gray-600">Wird geladen...</p>
          ) : tickets.length === 0 ? (
            <p className="mt-3 text-sm text-gray-600">Noch keine Tickets vorhanden.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {tickets.map((t) => (
                <Link
                  key={t.id}
                  href={`/brand/support/${t.id}`}
                  className="block rounded-2xl border bg-white px-5 py-4 hover:bg-gray-50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-gray-900">
                        {t.subject}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Nachrichten: {t._count?.messages ?? 0}
                        {t.briefId ? ` • Briefing: ${t.briefId}` : ""}
                      </div>
                    </div>

                    <span className="w-fit rounded-full border bg-white px-3 py-1 text-xs font-semibold text-gray-800">
                      {statusLabel(t.status)}
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