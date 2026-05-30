"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function dashboardFor(role: string) {
  if (role === "BRAND") return "/brand/dashboard";
  if (role === "CREATOR") return "/creator/dashboard";
  if (role === "STAFF") return "/staff/dashboard";
  return "/login";
}

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handle() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          router.push(`/login?error=${encodeURIComponent(error.message)}`);
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session?.access_token) {
        router.push("/login");
        return;
      }

      const syncRes = await fetch("/api/auth/sync", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
      });

      const syncJson = await syncRes.json().catch(() => null);

      if (!syncRes.ok || !syncJson?.user?.role) {
        router.push("/login?error=Account konnte nicht synchronisiert werden");
        return;
      }

      router.push(dashboardFor(syncJson.user.role));
    }

    handle();
  }, [router]);

  return <div className="p-8 text-center">E-Mail wird bestätigt...</div>;
}