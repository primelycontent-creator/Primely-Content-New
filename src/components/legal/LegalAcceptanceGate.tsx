"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { LEGAL_VERSIONS } from "@/lib/legal";
import { usePathname, useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

  useEffect(() => {
    checkLegal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  async function checkLegal() {
    try {
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

      // STAFF soll keinen Legal-Redirect bekommen
      if (user.role === "STAFF") {
        setAllowed(true);
        setLoading(false);
        return;
      }

      const role = user.role; // nur BRAND oder CREATOR relevant
      const expected =
        role === "BRAND" ? LEGAL_VERSIONS.BRAND : LEGAL_VERSIONS.CREATOR;

      const isAccepted =
        user.termsVersion === expected.termsVersion &&
        user.privacyVersion === expected.privacyVersion &&
        user.agbVersion === expected.agbVersion &&
        !!user.termsAcceptedAt &&
        !!user.privacyAcceptedAt &&
        !!user.agbAcceptedAt;

      if (!isAccepted) {
        if (!pathname.startsWith("/legal")) {
          router.push(`/legal/terms/${role.toLowerCase()}`);
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