"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ArrowLeft,
  LifeBuoy,
  MessageCircle,
  PlusCircle,
  Search,
  Clock,
  CheckCircle,
} from "lucide-react";

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
  return status.replaceAll("_", " ");
}

function statusClass(status: string) {
  if (status === "OPEN") return "border-amber-200 bg-amber-50 text-amber-900";
  if (status === "IN_PROGRESS") return "border-blue-200 bg-blue-50 text-blue-900";
  if (status === "CLOSED") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  return "border-gray-200 bg-gray-50 text-gray-700";
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("de-DE");
}

export default function BrandSupportPage() {
  const [token, setToken] = useState<string | null>(null);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Kampagne");
  const [message, setMessage] = useState("");
  const [briefId, setBriefId] = useState("");
  const [q, setQ] = useState("");

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
      const finalSubject = subject.trim()
        ? `[${category}] ${subject.trim()}`
        : `[${category}] Neue Anfrage`;

      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: finalSubject,
          message,
          briefId: briefId.trim() || null,
        }),
      });

      const { json, text } = await readSafeJson(res);
      if (!res.ok) throw new Error(json?.error ?? text.slice(0, 200));

      setSubject("");
      setCategory("Kampagne");
      setMessage("");
      setBriefId("");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Ticket konnte nicht erstellt werden.");
    } finally {
      setBusy(false);
    }
  }

  const stats = useMemo(() => {
    return {
      open: tickets.filter((t) => t.status === "OPEN").length,
      progress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
      closed: tickets.filter((t) => t.status === "CLOSED").length,
    };
  }, [tickets]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return tickets;

    return tickets.filter((t) => {
      return (
        t.subject.toLowerCase().includes(query) ||
        String(t.briefId ?? "").toLowerCase().includes(query) ||
        statusLabel(t.status).toLowerCase().includes(query)
      );
    });
  }, [tickets, q]);

  const inputClassName =
    "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-gray-950/10";

  return (
    <div className="min-h-screen bg-[#fbfaf7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/brand/dashboard"
            className="inline-flex items-center gap-2 rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Link>
        </div>

        <div className="rounded-[36px] border bg-white/70 p-5 shadow-sm sm:p-8 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Brand Support
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
                Support & Rückfragen
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500">
                Stelle Fragen zu Kampagnen, Verträgen, Rechnungen oder Änderungswünschen. Unser Team antwortet direkt im Ticket.
              </p>
            </div>

            <div className="rounded-[28px] border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3eee7] text-gray-950">
                  <LifeBuoy className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-950">Ticket-Status</div>
                  <div className="text-xs text-gray-500">Aktuelle Anfragen</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-[#fbfaf7] p-3">
                  <div className="text-lg font-semibold text-gray-950">{stats.open}</div>
                  <div className="text-[11px] text-gray-500">Offen</div>
                </div>
                <div className="rounded-2xl bg-[#fbfaf7] p-3">
                  <div className="text-lg font-semibold text-gray-950">{stats.progress}</div>
                  <div className="text-[11px] text-gray-500">Aktiv</div>
                </div>
                <div className="rounded-2xl bg-[#fbfaf7] p-3">
                  <div className="text-lg font-semibold text-gray-950">{stats.closed}</div>
                  <div className="text-[11px] text-gray-500">Erledigt</div>
                </div>
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
              {error}
            </div>
          ) : null}

          <div className="mt-10 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3eee7] text-gray-950">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-gray-950">
                    Neues Ticket erstellen
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Beschreibe dein Anliegen so konkret wie möglich.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Kategorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={inputClassName}
                  >
                    <option>Kampagne</option>
                    <option>Änderungswunsch</option>
                    <option>Rechnung / Vertrag</option>
                    <option>Termin / Erstgespräch</option>
                    <option>Freigabe / Feedback</option>
                    <option>Sonstiges</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Betreff</label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="z. B. Rückfrage zur aktuellen Kampagne"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Kampagnen-ID <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    value={briefId}
                    onChange={(e) => setBriefId(e.target.value)}
                    placeholder="Nur falls bekannt"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Nachricht</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Beschreibe dein Anliegen..."
                    className="min-h-[180px] w-full rounded-2xl border bg-white px-4 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-gray-950/10"
                  />
                </div>

                <button
                  type="button"
                  disabled={busy || !message.trim()}
                  onClick={createTicket}
                  className="w-full rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50 sm:w-auto"
                >
                  {busy ? "Ticket wird erstellt..." : "Ticket erstellen"}
                </button>
              </div>
            </section>

            <section className="rounded-[28px] border bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-gray-950">
                    Deine Tickets
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Öffne ein Ticket, um Antworten und Nachrichten zu sehen.
                  </p>
                </div>
              </div>

              <div className="relative mt-5">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tickets suchen..."
                  className="w-full rounded-2xl border bg-white py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-gray-950/10"
                />
              </div>

              <div className="mt-6">
                {loading ? (
                  <div className="rounded-3xl border bg-[#fbfaf7] p-8 text-sm text-gray-500">
                    Tickets werden geladen...
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="rounded-3xl border border-dashed bg-[#fbfaf7] p-8 text-center">
                    <MessageCircle className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="mt-3 text-sm font-semibold text-gray-950">
                      Noch keine Tickets
                    </div>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      Sobald du eine Anfrage stellst, erscheint sie hier.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filtered.map((t) => (
                      <Link
                        key={t.id}
                        href={`/brand/support/${t.id}`}
                        className="group block py-5"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-gray-950">
                              {t.subject}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                              <span className="rounded-full border bg-white px-3 py-1">
                                Nachrichten: <b>{t._count?.messages ?? 0}</b>
                              </span>
                              <span className="rounded-full border bg-white px-3 py-1">
                                Aktualisiert: <b>{formatDate(t.updatedAt)}</b>
                              </span>
                              {t.briefId ? (
                                <span className="rounded-full border bg-white px-3 py-1">
                                  Kampagne: <b>{t.briefId}</b>
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                                t.status
                              )}`}
                            >
                              {statusLabel(t.status)}
                            </span>
                            <span className="text-sm font-semibold text-gray-950 transition group-hover:translate-x-1">
                              Öffnen →
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}