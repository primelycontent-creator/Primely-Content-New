"use client";

import Link from "next/link";

type Role = "BRAND" | "CREATOR";

type Props = {
  role: Role;
  user: any;
};

export default function ProfileCompletionBanner({ role, user }: Props) {
  const missing: string[] = [];

  if (role === "CREATOR") {
    const p = user?.creatorProfile;

    if (!p?.fullName) missing.push("Full name");
    if (!p?.country) missing.push("Country");
    if (!p?.nicheGroup) missing.push("Niche group");
    if (!Array.isArray(p?.niches) || p.niches.length === 0) missing.push("Sub niches");
    if (!p?.bio) missing.push("Bio");
    if (!p?.instagram && !p?.tiktok) missing.push("Social profile");
    if (!p?.price30sCents) missing.push("Pricing");
    if (!p?.introVideoAssetId) missing.push("Intro video");
  }

  if (role === "BRAND") {
    const p = user?.brandProfile;

    if (!p?.companyName) missing.push("Company name");
  }

  const totalChecks = role === "CREATOR" ? 8 : 1;
  const completed = Math.max(0, totalChecks - missing.length);
  const progress = Math.round((completed / totalChecks) * 100);

  if (missing.length === 0) return null;

  const href = role === "CREATOR" ? "/creator/profile" : "/brand/profile";
  const cta = role === "CREATOR" ? "Complete creator profile" : "Complete brand profile";

  return (
    <div className="mb-8 rounded-3xl border border-amber-200 bg-gradient-to-br from-white to-amber-50/60 p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold tracking-[0.18em] text-amber-800">
            PROFILE COMPLETION
          </div>

          <div className="mt-2 text-xl font-semibold text-gray-900">
            Your profile is {progress}% complete
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Finish the remaining details so your account looks professional and the platform can guide you correctly.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {missing.map((item) => (
              <span
                key={item}
                className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-900"
              >
                Missing: {item}
              </span>
            ))}
          </div>

          <div className="mt-5 h-2.5 w-full max-w-xl overflow-hidden rounded-full bg-amber-100">
            <div
              className="h-full rounded-full bg-emerald-950 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="shrink-0">
          <Link
            href={href}
            className="inline-flex rounded-full bg-emerald-950 px-5 py-3 text-sm font-semibold text-white shadow hover:opacity-95"
          >
            {cta}
          </Link>
        </div>
      </div>
    </div>
  );
}