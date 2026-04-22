"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handle() {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        router.push("/login");
        return;
      }

      // 👉 hier kannst du Role Routing machen
      const user = data.session.user;

      // optional: fetch /api/me
      router.push("/dashboard");
    }

    handle();
  }, [router]);

  return (
    <div className="p-8 text-center">
      Confirming your email...
    </div>
  );
}