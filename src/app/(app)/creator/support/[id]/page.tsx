"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type TicketDetail = {
  id: string;
  subject: string;
  status: string;
  briefId: string | null;
  brief?: { id: string; title: string } | null;
  messages: Array<{
    id: string;
    message: string;
    senderRole: string;
    createdAt: string;
    sender?: { id: string; email: string } | null;
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

function statusLabel(status: string) {
  const s = status.replaceAll("_", " ");
  if (status === "OPEN") return "Offen";
  if (status === "IN_PROGRESS") return "In Bearbeitung";
  if (status === "CLOSED") return "Geschlossen";
  return s;
}

export default function CreatorSupportDetailPage() {
  const params = useParams<{ id: string }>();
  const ticketId = params.id;

  const [token, setToken] = useState<string | null>(null);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
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

    const res = await fetch(`/api/support/tickets/${ticketId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const { json, text } = await readSafeJson(res);
    if (!res.ok) {
      setError(json?.error ?? text.slice(0, 200));
      setLoading(false);
      return;
    }

    setTicket(json?.ticket ?? null);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, ticketId]);

  async function sendMessage() {
    if (!token || !message.trim()) return;
    setBusy(true);
    setError(null);

    try {
      const res = await fetch(`/api/support/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      const { json, text } = await readSafeJson(res);
      if (!res.ok) throw new Error(json?.error ?? text.slice(0, 200));

      setMessage("");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Nachricht konnte nicht gesendet werden.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-4xl rounded-3xl border bg-white/80 p-5 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
          <div>
            <div className="text-xs font-semibold tracking-wide text-gray-600">
              SUPPORT-TICKET
            </div>
            <h1 className="mt-2 font-serif text-4xl tracking-tight text-gray-900 sm:text-5xl">
              {ticket?.subject ?? "Wird geladen..."}
            </h1>
          </div>

          <Link
            href="/creator/support"
            className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Zurück
          </Link>
        </div>

        {ticket ? (
          <div className="mt-4 text-xs text-gray-500">
            Status: {statusLabel(ticket.status)}
            {ticket.brief ? ` • Briefing: ${ticket.brief.title}` : ""}
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-8 rounded-3xl border bg-white p-5 sm:p-6">
          {loading ? (
            <p className="text-sm text-gray-600">Wird geladen...</p>
          ) : !ticket ? (
            <p className="text-sm text-gray-600">Ticket wurde nicht gefunden.</p>
          ) : (
            <div className="space-y-3">
              {ticket.messages.map((m) => (
                <div key={m.id} className="rounded-2xl border bg-white px-4 py-3">
                  <div className="text-xs font-semibold text-gray-500">
                    {m.senderRole === "BRAND"
                      ? "Brand"
                      : m.senderRole === "STAFF"
                      ? "Staff"
                      : m.senderRole}
                  </div>
                  <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-900">
                    {m.message}
                  </div>
                  <div className="mt-2 text-[11px] text-gray-400">
                    {new Date(m.createdAt).toLocaleString("de-DE")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-3xl border bg-white p-5 sm:p-6">
          <div className="text-sm font-semibold text-gray-900">Antwort</div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Schreibe deine Antwort..."
            className="mt-4 min-h-[140px] w-full appearance-none rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-emerald-950/20"
          />
          <button
            type="button"
            disabled={busy || !message.trim()}
            onClick={sendMessage}
            className="mt-4 w-full rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50 sm:w-auto"
          >
            {busy ? "Wird gesendet..." : "Antwort senden"}
          </button>
        </div>
      </div>
    </div>
  );
}