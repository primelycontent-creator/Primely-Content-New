"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import { supabase } from "@/lib/supabaseClient";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M2 12s3.5-7 10-7c2.2 0 4.1.7 5.7 1.7M22 12s-3.5 7-10 7c-2.2 0-4.1-.7-5.7-1.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10.7 10.7A3 3 0 0 0 13.3 13.3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

async function readSafeJson(res: Response) {
  const text = await res.text();
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

export default function CreatorRegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("+49");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [portfolio, setPortfolio] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [agreeTos, setAgreeTos] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClassName =
    "w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) return setError("Bitte gib deinen Namen ein.");
    if (!email.trim()) return setError("Bitte gib deine E-Mail-Adresse ein.");
    if (password.length < 6) return setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
    if (password !== confirm) return setError("Die Passwörter stimmen nicht überein.");
    if (!agreeTos || !agreePrivacy) {
      return setError("Bitte akzeptiere die Nutzungsbedingungen und die Datenschutzerklärung.");
    }

    setLoading(true);

    try {
      const role = "CREATOR";

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: "https://www.primely-content.com/login",
          data: {
            role,
            fullName: fullName.trim(),
            phone: `${countryCode} ${phoneNumber}`.trim(),
            portfolioUrl: portfolio.trim() || null,
            acceptedTerms: true,
            acceptedPrivacy: true,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;

      if (user?.id && user.email) {
        const syncRes = await fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
            role,
          }),
        });

        const syncData = await readSafeJson(syncRes);
        if (!syncRes.ok) {
          throw new Error((syncData.json as any)?.error ?? syncData.text.slice(0, 200));
        }
      }

      router.push("/register/success?role=creator");
    } catch (e: any) {
      setError(e?.message ?? "Registrierung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="mx-auto max-w-[760px] text-center">
        <h1 className="font-serif text-4xl tracking-tight text-gray-900 sm:text-5xl">
          Creator-Konto erstellen
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
          Erstelle zuerst dein Konto. Dein Profil kannst du nach der E-Mail-Bestätigung vervollständigen.
        </p>

        <form onSubmit={onSubmit} className="mt-8 text-left sm:mt-10">
          <div className="space-y-4">
            <input
              className={inputClassName}
              placeholder="Vollständiger Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <input
                className={inputClassName}
                type="email"
                placeholder="E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                inputMode="email"
              />

              <input
                className={inputClassName}
                placeholder="Portfolio / Instagram / Website (optional)"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-[96px_1fr] gap-3">
              <select
                className={inputClassName}
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                <option value="+1">+1</option>
                <option value="+44">+44</option>
                <option value="+49">+49</option>
                <option value="+33">+33</option>
                <option value="+39">+39</option>
                <option value="+34">+34</option>
                <option value="+31">+31</option>
                <option value="+43">+43</option>
                <option value="+41">+41</option>
              </select>

              <input
                className={inputClassName}
                placeholder="Telefonnummer"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                inputMode="tel"
              />
            </div>

            <div className="relative">
              <input
                className={`${inputClassName} pr-12`}
                type={showPw ? "text" : "password"}
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 hover:text-gray-800"
              >
                <EyeIcon open={showPw} />
              </button>
            </div>

            <div className="relative">
              <input
                className={`${inputClassName} pr-12`}
                type={showConfirm ? "text" : "password"}
                placeholder="Passwort bestätigen"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 hover:text-gray-800"
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 text-sm leading-6 text-gray-700">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                  checked={agreeTos}
                  onChange={(e) => setAgreeTos(e.target.checked)}
                />
                <span>
                  Ich akzeptiere die{" "}
                  <Link className="underline" href="/legal/creator">
                    Nutzungsbedingungen und AGB
                  </Link>
                </span>
              </label>

              <label className="flex items-start gap-3 text-sm leading-6 text-gray-700">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                />
                <span>
                  Ich akzeptiere die{" "}
                  <Link className="underline" href="/legal/creator">
                    Datenschutzerklärung
                  </Link>
                </span>
              </label>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                {error}
              </div>
            ) : null}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="mx-auto block w-full max-w-[360px] rounded-xl bg-emerald-950 px-4 py-3 text-base font-medium text-white shadow hover:opacity-95 disabled:opacity-60"
              >
                {loading ? "Konto wird erstellt..." : "Creator-Konto erstellen"}
              </button>
            </div>

            <p className="pt-4 text-center text-sm leading-6 text-gray-700 sm:text-base">
              Du möchtest als Brand beitreten?{" "}
              <Link className="font-medium underline" href="/register/brand">
                Zum Brand-Login wechseln
              </Link>
            </p>
          </div>
        </form>
      </div>
    </AuthShell>
  );
}