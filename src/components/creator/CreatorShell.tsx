"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Me = { ok: true; user: { role: "BRAND" | "CREATOR" | "STAFF"; email: string } } | { error: string };

export default function CreatorShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  const nav = useMemo(
    () => [
      { href: "/creator/dashboard", label: "Dashboard" },
      { href: "/creator/profile", label: "Profile" },
      { href: "/creator/uploads", label: "Uploads" },
      { href: "/creator/support", label: "Support" },
      { href: "/creator/settings", label: "Settings" },
    ],
    []
  );

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        router.push("/login?next=/creator/dashboard");
        return;
      }

      const res = await fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } });
      const json = (await res.json()) as Me;

      if (!alive) return;

      if ("ok" in json && json.ok) {
        if (json.user.role !== "CREATOR") {
          router.push("/"); // oder role-based redirect
          return;
        }
        setEmail(json.user.email);
      } else {
        router.push("/login?next=/creator/dashboard");
        return;
      }

      setLoading(false);
    }

    load();
    return () => {
      alive = false;
    };
  }, [router]);

  async function onLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#F5F1EA] text-gray-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <div className="text-[11px] font-semibold tracking-wide text-gray-600">CREATOR AREA</div>
            <h1 className="mt-2 font-serif text-5xl leading-[0.95] tracking-tight">
              Creator Dashboard
            </h1>
            <p className="mt-3 text-sm text-gray-600">
              Manage your profile, upload deliverables, and track assigned briefings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="rounded-3xl border bg-white/70 p-4 shadow-sm">
            <div className="px-3 pb-3 text-xs font-semibold text-gray-600">
              {loading ? "Loading..." : email ?? "—"}
            </div>

            <div className="space-y-1">
              {nav.map((i) => {
                const active = pathname?.startsWith(i.href);
                return (
                  <Link
                    key={i.href}
                    href={i.href}
                    className={
                      active
                        ? "block rounded-2xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white"
                        : "block rounded-2xl px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-black/5"
                    }
                  >
                    {i.label}
                  </Link>
                );
              })}
            </div>
          </aside>

          <main className="rounded-3xl border bg-white/70 p-6 shadow-sm">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}