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
  status: "OPEN" | "IN_PROGRESS" | "CLOSED" | string;
  briefId: string | null;
  user: { id: string; email: string; role: string };
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

export default function StaffSupportDetailPage() {
  const params = useParams<{ id: string }>();
  const ticketId = params.id;

  const [token, setToken] = useState<string | null>(null);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"OPEN" | "IN_PROGRESS" | "CLOSED">("OPEN");
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

    const t = json?.ticket ?? null;
    setTicket(t);
    setStatus((t?.status as any) ?? "OPEN");
    setLoading(false);
  }

  useEffect(() => {
    load();
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
      setError(e?.message ?? "Send error");
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus() {
    if (!token) return;
    setBusy(true);
    setError(null);

    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const { json, text } = await readSafeJson(res);
      if (!res.ok) throw new Error(json?.error ?? text.slice(0, 200));

      await load();
    } catch (e: any) {
      setError(e?.message ?? "Status update error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl rounded-3xl border bg-white/80 p-10 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-xs font-semibold tracking-wide text-gray-600">SUPPORT TICKET</div>
            <h1 className="mt-2 text-4xl font-serif tracking-tight text-gray-900">
              {ticket?.subject ?? "Loading…"}
            </h1>
            {ticket ? (
              <div className="mt-3 text-xs text-gray-500">
                {ticket.user.role} • {ticket.user.email}
                {ticket.brief ? ` • Brief: ${ticket.brief.title}` : ""}
              </div>
            ) : null}
          </div>

          <Link
            href="/staff/support"
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

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="rounded-3xl border bg-white p-6">
            {loading ? (
              <p className="text-sm text-gray-600">Loading…</p>
            ) : !ticket ? (
              <p className="text-sm text-gray-600">Ticket not found.</p>
            ) : (
              <div className="space-y-3">
                {ticket.messages.map((m) => (
                  <div key={m.id} className="rounded-2xl border bg-white px-4 py-3">
                    <div className="text-xs font-semibold text-gray-500">{m.senderRole}</div>
                    <div className="mt-2 whitespace-pre-wrap text-sm text-gray-900">{m.message}</div>
                    <div className="mt-2 text-[11px] text-gray-400">
                      {new Date(m.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border bg-white p-6">
            <div className="text-sm font-semibold text-gray-900">Ticket status</div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="mt-4 w-full rounded-2xl border px-4 py-3 text-sm outline-none"
            >
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="CLOSED">CLOSED</option>
            </select>

            <button
              type="button"
              onClick={updateStatus}
              disabled={busy}
              className="mt-4 w-full rounded-full border bg-white px-4 py-3 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
            >
              Save status
            </button>

            <div className="mt-8 text-sm font-semibold text-gray-900">Reply</div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your reply…"
              className="mt-4 min-h-[140px] w-full rounded-2xl border px-4 py-3 text-sm outline-none"
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={busy || !message.trim()}
              className="mt-4 w-full rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
            >
              {busy ? "Sending…" : "Send reply"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}