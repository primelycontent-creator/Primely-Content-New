"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type MeResponse =
  | { ok: true; user: { id: string; email: string; role: "BRAND" | "CREATOR" | "STAFF" } }
  | { error: string };

export default function Navbar() {
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<"BRAND" | "CREATOR" | "STAFF" | null>(null);

  const dashboardHref = useMemo(() => {
    if (role === "BRAND") return "/brand/dashboard";
    if (role === "CREATOR") return "/creator/dashboard";
    if (role === "STAFF") return "/staff/dashboard";
    return "/login";
  }, [role]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);

      const { data } = await supabase.auth.getSession();
      const session = data.session;
      const access = session?.access_token ?? null;

      if (!alive) return;

      setToken(access);

      if (!access) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${access}` },
          cache: "no-store",
        });

        const json = (await res.json()) as MeResponse;
        if (!alive) return;

        if ("ok" in json && json.ok) setRole(json.user.role);
        else setRole(null);
      } catch {
        if (!alive) return;
        setRole(null);
      }

      setLoading(false);
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token ?? null);

      if (!session) {
        setRole(null);
        setLoading(false);
      } else {
        load();
      }
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [pathname]);

  async function onLogout() {
    try {
      setLogoutBusy(true);
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (e) {
      console.error("Logout failed:", e);
      setLogoutBusy(false);
    }
  }

  return (
    <header className="w-full border-b bg-transparent">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/#home" className="flex items-center gap-3">
          <Image
            src="/logov2.png"
            alt="Primely Content"
            width={150}
            height={40}
            priority
            className="h-24 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-gray-700 md:flex">
          <a href="/#home" className="hover:opacity-70">
            Home
          </a>
          <a href="/#brands" className="hover:opacity-70">
            For Brands
          </a>
          <a href="/#creators" className="hover:opacity-70">
            For Creators
          </a>
          <a href="/#about" className="hover:opacity-70">
            About us
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-10 w-[220px] animate-pulse rounded-full bg-black/5" />
          ) : token ? (
            <>
              <button
                onClick={onLogout}
                disabled={logoutBusy}
                className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-60"
              >
                {logoutBusy ? "Logging out…" : "Logout"}
              </button>

              <Link
                href={dashboardHref}
                className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}