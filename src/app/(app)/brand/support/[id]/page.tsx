"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  LifeBuoy,
  MessageCircle,
  Send,
} from "lucide-react";

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
  if (status === "OPEN") return "Offen";
  if (status === "IN_PROGRESS") return "In Bearbeitung";
  if (status === "CLOSED") return "Geschlossen";
  return status.replaceAll("_", " ");
}

function statusClass(status: string) {
  if (status === "OPEN") return "border-amber-200 bg-amber-50 text-amber-900";
  if (status === "IN_PROGRESS") return "border-blue-200 bg-blue-50 text-blue-900";
  if (status === "CLOSED") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  return "border-gray-200 bg-gray-50 text-gray-700";
}

function senderLabel(role: string) {
  if (role === "BRAND") return "Du";
  if (role === "STAFF") return "Primely Support";
  if (role === "CREATOR") return "Creator Support";
  return role;
}

function formatDateTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("de-DE");
}

export default function BrandSupportDetailPage() {
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

  const messageCount = useMemo(() => ticket?.messages?.length ?? 0, [ticket]);

  return (
    <div className="min-h-screen bg-[#fbfaf7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/brand/support"
            className="inline-flex items-center gap-2 rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Link>
        </div>

        <div className="rounded-[36px] border bg-white/70 p-5 shadow-sm sm:p-8 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Support-Ticket
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
                {ticket?.subject ?? "Ticket wird geladen..."}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500">
                Hier kannst du direkt mit unserem Team zu dieser Anfrage schreiben.
              </p>

              {ticket ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                      ticket.status
                    )}`}
                  >
                    {statusLabel(ticket.status)}
                  </span>

                  {ticket.brief ? (
                    <span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                      Kampagne: {ticket.brief.title}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="rounded-[28px] border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3eee7] text-gray-950">
                  <LifeBuoy className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-950">Ticket-Übersicht</div>
                  <div className="text-xs text-gray-500">{messageCount} Nachrichten</div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-[#fbfaf7] p-4 text-sm leading-6 text-gray-600">
                Unser Team antwortet direkt in diesem Ticket. Bei kampagnenbezogenen Anliegen bleibt alles zentral dokumentiert.
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
              {error}
            </div>
          ) : null}

          <div className="mt-10 rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3eee7] text-gray-950">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-gray-950">
                  Nachrichtenverlauf
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Alle Antworten zu diesem Ticket bleiben hier gespeichert.
                </p>
              </div>
            </div>

            <div className="mt-8">
              {loading ? (
                <div className="rounded-3xl border bg-[#fbfaf7] p-8 text-sm text-gray-500">
                  Ticket wird geladen...
                </div>
              ) : !ticket ? (
                <div className="rounded-3xl border border-dashed bg-[#fbfaf7] p-8 text-sm text-gray-500">
                  Ticket wurde nicht gefunden.
                </div>
              ) : ticket.messages.length === 0 ? (
                <div className="rounded-3xl border border-dashed bg-[#fbfaf7] p-8 text-center">
                  <MessageCircle className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-3 text-sm font-semibold text-gray-950">
                    Noch keine Nachrichten
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {ticket.messages.map((m) => {
                    const isBrand = m.senderRole === "BRAND";
                    const isStaff = m.senderRole === "STAFF";

                    return (
                      <div
                        key={m.id}
                        className={`flex ${isBrand ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={
                            isBrand
                              ? "max-w-[82%] rounded-[24px] bg-gray-950 px-5 py-4 text-white shadow-sm"
                              : isStaff
                              ? "max-w-[82%] rounded-[24px] border bg-[#fbfaf7] px-5 py-4 text-gray-950"
                              : "max-w-[82%] rounded-[24px] border bg-white px-5 py-4 text-gray-950"
                          }
                        >
                          <div
                            className={
                              isBrand
                                ? "text-xs font-semibold text-white/70"
                                : "text-xs font-semibold text-gray-500"
                            }
                          >
                            {senderLabel(m.senderRole)}
                          </div>

                          <div className="mt-2 whitespace-pre-wrap text-sm leading-6">
                            {m.message}
                          </div>

                          <div
                            className={
                              isBrand
                                ? "mt-3 text-[11px] text-white/50"
                                : "mt-3 text-[11px] text-gray-400"
                            }
                          >
                            {formatDateTime(m.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-4 z-10 mt-6 rounded-[28px] border bg-white/95 p-4 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                {ticket?.status === "CLOSED" ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-emerald-700" />
                    Dieses Ticket ist geschlossen. Du kannst trotzdem eine weitere Nachricht senden.
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 text-gray-500" />
                    Schreibe deine Antwort direkt an das Primely Support-Team.
                  </>
                )}
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nachricht schreiben..."
                className="min-h-[120px] w-full rounded-2xl border bg-white px-4 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-gray-950/10"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={busy || !message.trim()}
                  onClick={sendMessage}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {busy ? "Wird gesendet..." : "Antwort senden"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}