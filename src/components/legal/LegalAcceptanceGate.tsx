"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";

type LegalStatusResponse = {
  ok?: boolean;
  legal?: {
    role: "BRAND" | "CREATOR" | null;
    requiresAcceptance: boolean;
  };
  error?: string;
};

export default function LegalAcceptanceGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) return null;
    return createClient(url, anonKey);
  }, []);

  useEffect(() => {
    checkLegal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  async function checkLegal() {
    try {
      if (!supabase) {
        setAllowed(true);
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        setAllowed(true);
        setLoading(false);
        return;
      }

      const res = await fetch("/api/me/legal-status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const json = (await res.json()) as LegalStatusResponse;

      if (!res.ok || !json?.ok || !json.legal) {
        setAllowed(true);
        setLoading(false);
        return;
      }

      const legal = json.legal;

      if (!legal.role || !legal.requiresAcceptance) {
        setAllowed(true);
        setLoading(false);
        return;
      }

      const target = `/legal/${legal.role.toLowerCase()}`;

      if (pathname !== target) {
        router.replace(target);
        return;
      }

      setAllowed(true);
      setLoading(false);
    } catch {
      setAllowed(true);
      setLoading(false);
    }
  }

  if (loading) return null;

  return <>{allowed ? children : null}</>;
}