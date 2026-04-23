"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { LEGAL_VERSIONS } from "@/lib/legal";
import { usePathname, useRouter } from "next/navigation";

type Role = "BRAND" | "CREATOR" | "STAFF";

type MeResponse = {
  user?: {
    id: string;
    email: string;
    role: Role;
    termsVersion?: string | null;
    privacyVersion?: string | null;
    agbVersion?: string | null;
    termsAcceptedAt?: string | null;
    privacyAcceptedAt?: string | null;
    agbAcceptedAt?: string | null;
  };
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

      const res = await fetch("/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const json = (await res.json()) as MeResponse;
      const user = json?.user;

      if (!user) {
        setAllowed(true);
        setLoading(false);
        return;
      }

      if (user.role === "STAFF") {
        setAllowed(true);
        setLoading(false);
        return;
      }

      const expected =
        user.role === "BRAND" ? LEGAL_VERSIONS.BRAND : LEGAL_VERSIONS.CREATOR;

      const isAccepted =
        user.termsVersion === expected.termsVersion &&
        user.privacyVersion === expected.privacyVersion &&
        user.agbVersion === expected.agbVersion &&
        !!user.termsAcceptedAt &&
        !!user.privacyAcceptedAt &&
        !!user.agbAcceptedAt;

      if (!isAccepted) {
        const target = `/legal/${user.role.toLowerCase()}`;

        if (pathname !== target) {
          router.push(target);
          return;
        }
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