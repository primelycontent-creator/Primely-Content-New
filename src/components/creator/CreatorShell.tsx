"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  Upload,
  LifeBuoy,
  User,
  Settings,
  LogOut,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Me =
  | { ok: true; user: { role: "BRAND" | "CREATOR" | "STAFF"; email: string } }
  | { error: string };

export default function CreatorShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  const nav = useMemo(
    () => [
      { href: "/creator/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/creator/briefs", label: "Briefings", icon: Upload },
      { href: "/creator/profile", label: "Creator-Profil", icon: User },
      { href: "/creator/support", label: "Support", icon: LifeBuoy },
      { href: "/creator/settings", label: "Einstellungen", icon: Settings },
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

      const res = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const json = (await res.json()) as Me;

      if (!alive) return;

      if ("ok" in json && json.ok) {
        if (json.user.role !== "CREATOR") {
          router.push("/");
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
    <div className="min-h-screen bg-[#fbfaf7] text-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-[28px] border bg-white/80 p-5 shadow-sm">
            <div className="mb-6">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Creator
              </div>
              <div className="mt-2 truncate text-sm font-medium text-gray-700">
                {loading ? "Wird geladen..." : email ?? "—"}
              </div>
            </div>

            <nav className="space-y-2">
              {nav.map((item) => {
                const active =
                  pathname === item.href || pathname?.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      active
                        ? "flex items-center gap-3 rounded-2xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white shadow-sm"
                        : "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-black/5"
                    }
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={onLogout}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              <LogOut className="h-5 w-5" />
              Abmelden
            </button>
          </aside>

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}