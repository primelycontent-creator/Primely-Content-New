"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import { supabase } from "@/lib/supabaseClient";

const NICHE_GROUPS = {
  "Beauty & Skincare": ["Hautpflege", "Make-up", "Anti-Aging", "Naturkosmetik"],
  "Fitness & Gesundheit": ["Supplements", "Home Workouts", "Fitness-Programme", "Abnehmprodukte", "Biohacking"],
  Fashion: ["Streetwear", "Sportbekleidung", "Schmuck", "Taschen", "Sneaker"],
  "Tech & Gadgets": ["Smartphones & Zubehör", "Gimbals", "Kameras", "Smartwatches", "KI-Tools & Apps"],
  "Home & Living": ["Einrichtung", "Küchengadgets", "Haushaltshelfer", "DIY-Produkte", "Dekoration"],
  "Food & Getränke": ["Proteinprodukte", "Kaffee-Marken", "Energy Drinks", "Süßigkeiten", "Kochboxen"],
  "Persönlichkeitsentwicklung & Coaching": ["Online-Kurse", "Trading", "Mindset", "Dating-Coaching", "Business-Coaching"],
  "Finanzen & Versicherungen": ["Investment-Apps", "Kryptowährungen", "Versicherungen", "Kreditkarten"],
  Haustiere: ["Hundefutter", "Katzenzubehör", "Spielzeug", "Pflegeprodukte"],
  "Reisen & Lifestyle": ["Reisegadgets", "Hotels", "Koffer", "Camper", "Auslandsversicherungen"],
} as const;

type NicheGroup = keyof typeof NICHE_GROUPS;

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
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [nicheGroup, setNicheGroup] = useState<NicheGroup>("Beauty & Skincare");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [agreeTos, setAgreeTos] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) return setError("Please enter your full name.");
    if (!email.trim()) return setError("Please enter your email.");
    if (!nicheGroup) return setError("Please choose your niche group.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    if (!agreeTos || !agreePrivacy) {
      return setError("Please accept the Terms and Privacy Policy.");
    }

    setLoading(true);

    try {
      const role = "CREATOR";

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            fullName: fullName.trim(),
            country: country.trim() || null,
            nicheGroup,
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

        const sessionRes = await supabase.auth.getSession();
        const token = sessionRes.data.session?.access_token;

        if (token) {
          await fetch("/api/creator/profile", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fullName: fullName.trim(),
              country: country.trim() || null,
              nicheGroup,
            }),
          });
        }
      }

      router.push("/register/success?role=creator");
    } catch (e: any) {
      setError(e?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="mx-auto max-w-[760px] text-center">
        <h1 className="font-serif text-5xl tracking-tight text-gray-900">
          Create Creator Account
        </h1>
        <p className="mt-3 text-gray-600">
          Create your account first. After email confirmation you complete your profile, intro video and uploads.
        </p>

        <form onSubmit={onSubmit} className="mt-10 text-left">
          <div className="space-y-4">
            <input
              className="w-full rounded-xl border bg-white/80 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-emerald-900/30"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="w-full rounded-xl border bg-white/80 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-emerald-900/30"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />

              <input
                className="w-full rounded-xl border bg-white/80 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-emerald-900/30"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>

            <select
              className="w-full rounded-xl border bg-white/80 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-emerald-900/30"
              value={nicheGroup}
              onChange={(e) => setNicheGroup(e.target.value as NicheGroup)}
            >
              {Object.keys(NICHE_GROUPS).map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>

            <div className="relative">
              <input
                className="w-full rounded-xl border bg-white/80 px-4 py-3 pr-12 text-base outline-none focus:ring-2 focus:ring-emerald-900/30"
                type={showPw ? "text" : "password"}
                placeholder="Password"
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
                className="w-full rounded-xl border bg-white/80 px-4 py-3 pr-12 text-base outline-none focus:ring-2 focus:ring-emerald-900/30"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
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
              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={agreeTos}
                  onChange={(e) => setAgreeTos(e.target.checked)}
                />
                <span>
                  I agree to the{" "}
                  <Link className="underline" href="/terms/creator">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link className="underline" href="/agb/creator">
                    AGB
                  </Link>
                </span>
              </label>

              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                />
                <span>
                  I agree to the{" "}
                  <Link className="underline" href="/privacy/creator">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="mx-auto block w-full max-w-[360px] rounded-xl bg-emerald-950 px-4 py-3 text-base font-medium text-white shadow hover:opacity-95 disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create creator account"}
              </button>
            </div>

            <p className="pt-4 text-center text-gray-700">
              Want to join as brand?{" "}
              <Link className="font-medium underline" href="/register/brand">
                Switch to brand signup
              </Link>
            </p>
          </div>
        </form>
      </div>
    </AuthShell>
  );
}