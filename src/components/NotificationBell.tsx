"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

async function readSafeJson(res: Response) {
  const text = await res.text();
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

export default function NotificationBell() {
  const [token, setToken] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadNotifications(currentToken?: string | null) {
    const authToken = currentToken ?? token;
    if (!authToken) {
      setNotifications([]);
      setUnread(0);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        cache: "no-store",
      });

      const { json } = await readSafeJson(res);
      if (!res.ok) {
        setNotifications([]);
        setUnread(0);
        return;
      }

      setNotifications(json?.notifications ?? []);
      setUnread(json?.unread ?? 0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function markAsRead(id: string, link?: string | null) {
    if (!token) return;

    await fetch("/api/notifications/read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });

    await loadNotifications(token);

    if (link) {
      window.location.href = link;
    }
  }

  if (!token) return null;

  return (
    <div className="fixed right-6 top-24 z-50">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="relative rounded-full border bg-white px-4 py-3 text-sm shadow-sm hover:bg-gray-50"
          aria-label="Notifications"
        >
          <span className="text-base">🔔</span>

          {unread > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
              {unread}
            </span>
          ) : null}
        </button>

        {open ? (
          <div className="absolute right-0 mt-3 w-96 overflow-hidden rounded-3xl border bg-white shadow-xl">
            <div className="border-b px-5 py-4">
              <div className="text-sm font-semibold text-gray-900">Notifications</div>
              <div className="mt-1 text-xs text-gray-500">
                {loading ? "Loading…" : `${unread} unread`}
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {!loading && notifications.length === 0 ? (
                <div className="px-5 py-6 text-sm text-gray-500">No notifications.</div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => markAsRead(n.id, n.link)}
                    className="block w-full border-b px-5 py-4 text-left hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900">{n.title}</div>
                        <div className="mt-1 whitespace-pre-wrap text-xs text-gray-600">
                          {n.message}
                        </div>
                        <div className="mt-2 text-[11px] text-gray-400">
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {!n.read ? (
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-600" />
                      ) : null}
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="px-5 py-3">
              <button
                type="button"
                onClick={() => loadNotifications(token)}
                className="rounded-full border bg-white px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}