"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { LEGAL_VERSIONS } from "@/lib/legal";
import { usePathname, useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Role = "BRAND" | "CREATOR";

export default function LegalAcceptanceGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkLegal();
  }, []);

  async function checkLegal() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      setAllowed(true); // nicht eingeloggt → kein block
      setLoading(false);
      return;
    }

    const res = await fetch("/api/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    const user = json?.user;

    if (!user) {
      setAllowed(true);
      setLoading(false);
      return;
    }

    const role: Role = user.role;
    const acceptance = user.legalAcceptance;

    const expected =
      role === "BRAND"
        ? LEGAL_VERSIONS.BRAND
        : LEGAL_VERSIONS.CREATOR;

    const isAccepted =
      acceptance?.termsVersion === expected.termsVersion &&
      acceptance?.privacyVersion === expected.privacyVersion &&
      acceptance?.agbVersion === expected.agbVersion;

    if (!isAccepted) {
      // 🚨 redirect wenn NICHT auf legal page
      if (!pathname.startsWith("/legal")) {
        router.push(`/legal/terms/${role.toLowerCase()}`);
        return;
      }
    }

    setAllowed(true);
    setLoading(false);
  }

  if (loading) return null;

  return <>{allowed ? children : null}</>;
}