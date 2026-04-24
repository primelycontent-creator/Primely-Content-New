"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Role = "BRAND" | "CREATOR" | "STAFF";

function dashboardFor(role: Role) {
  if (role === "BRAND") return "/brand/dashboard";
  if (role === "CREATOR") return "/creator/dashboard";
  return "/staff/dashboard";
}

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("E-Mail wird bestätigt...");

  useEffect(() => {
    async function run() {
      try {
        // 🔑 User nach Email-Confirm holen
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;

        const user = data.user;

        if (!user?.id || !user.email) {
          window.location.href = "/login";
          return;
        }

        const metadata = user.user_metadata ?? {};
        const role = String(metadata.role ?? "").toUpperCase() as Role;

        if (!["BRAND", "CREATOR", "STAFF"].includes(role)) {
          throw new Error("Keine gültige Rolle gefunden.");
        }

        // 🔥 HIER passiert jetzt der Sync (richtiger Zeitpunkt!)
        const syncRes = await fetch("/api/auth/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
            role,
            companyName: metadata.companyName ?? null,
            contactPerson: metadata.contactPerson ?? null,
            phone: metadata.phone ?? null,
            displayName: metadata.fullName ?? null,
            acceptedTerms: metadata.acceptedTerms === true,
            acceptedPrivacy: metadata.acceptedPrivacy === true,
          }),
        });

        if (!syncRes.ok) {
          const text = await syncRes.text();
          throw new Error(text || "Sync fehlgeschlagen.");
        }

        setMessage("E-Mail bestätigt. Weiterleitung...");

        // 🚀 Redirect direkt ins Dashboard
        window.location.href = dashboardFor(role);
      } catch (err: any) {
        setMessage(err?.message ?? "Bestätigung fehlgeschlagen.");
      }
    }

    run();
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center bg-neutral-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">
          Konto bestätigen
        </h1>
        <p className="mt-4 text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}