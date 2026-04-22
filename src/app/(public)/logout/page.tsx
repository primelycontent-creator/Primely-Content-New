"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await supabase.auth.signOut();
        await fetch("/api/auth/logout", { method: "POST" });
        document.cookie = "pc_role=; path=/; max-age=0";
      } finally {
        router.replace("/");
      }
    })();
  }, [router]);

  return <div className="p-10 text-center text-black/60">Logging out…</div>;
}
