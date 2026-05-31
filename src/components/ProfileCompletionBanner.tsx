"use client";

import Link from "next/link";

type Role = "BRAND" | "CREATOR";

type Props = {
  role: Role;
  user: any;
};

type MissingItem = {
  label: string;
  shortLabel: string;
};

export default function ProfileCompletionBanner({ role, user }: Props) {
  const missing: MissingItem[] = [];

  if (role === "CREATOR") {
    const p = user?.creatorProfile;

    if (!p?.fullName) {
      missing.push({ label: "Vollständiger Name fehlt", shortLabel: "Name" });
    }

    if (!p?.phone) {
      missing.push({ label: "Telefonnummer fehlt", shortLabel: "Telefon" });
    }

    if (!p?.country) {
      missing.push({ label: "Land fehlt", shortLabel: "Land" });
    }

    if (!p?.nicheGroup) {
      missing.push({ label: "Hauptnische fehlt", shortLabel: "Hauptnische" });
    }

    if (!Array.isArray(p?.niches) || p.niches.length === 0) {
      missing.push({ label: "Unter-Nischen fehlen", shortLabel: "Nischen" });
    }

    if (!p?.bio) {
      missing.push({ label: "Kurzbeschreibung fehlt", shortLabel: "Bio" });
    }

    if (!p?.instagram && !p?.tiktok && !p?.portfolioUrl) {
      missing.push({ label: "Portfolio oder Social-Profil fehlt", shortLabel: "Socials" });
    }

    if (!p?.price30sCents) {
      missing.push({ label: "Preisangabe fehlt", shortLabel: "Preis" });
    }

    if (!p?.introVideoAssetId) {
      missing.push({ label: "Intro-Video fehlt", shortLabel: "Intro-Video" });
    }

    if (!p?.profileImageAssetId && !p?.profileImageAsset) {
      missing.push({ label: "Profilbild fehlt", shortLabel: "Profilbild" });
    }
  }

  if (role === "BRAND") {
    const p = user?.brandProfile;

    if (!p?.companyName) {
      missing.push({ label: "Firmenname fehlt", shortLabel: "Firma" });
    }

    if (!p?.contactName) {
      missing.push({ label: "Ansprechperson fehlt", shortLabel: "Kontakt" });
    }

    if (!p?.contactEmail) {
      missing.push({ label: "Kontakt-E-Mail fehlt", shortLabel: "E-Mail" });
    }
  }

  const totalChecks = role === "CREATOR" ? 10 : 3;
  const completed = Math.max(0, totalChecks - missing.length);
  const progress = Math.round((completed / totalChecks) * 100);

  if (missing.length === 0) return null;

  const href = role === "CREATOR" ? "/creator/profile" : "/brand/profile";

  const eyebrow = role === "CREATOR" ? "Creator-Profil" : "Brand-Profil";
  const title =
    role === "CREATOR"
      ? `Dein Creator-Profil ist zu ${progress}% vollständig`
      : `Dein Brand-Profil ist zu ${progress}% vollständig`;

  const description =
    role === "CREATOR"
      ? "Vervollständige dein Profil, damit unser Team dich besser passenden Kampagnen zuordnen kann."
      : "Vervollständige dein Brand-Profil, damit Kampagnenanfragen schneller vorbereitet werden können.";

  const cta = role === "CREATOR" ? "Profil vervollständigen" : "Brand-Profil vervollständigen";

  return (
    <div className="mb-8 rounded-[28px] border border-amber-200 bg-gradient-to-br from-white to-amber-50/70 p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            {eyebrow}
          </div>

          <div className="mt-2 text-xl font-semibold tracking-tight text-gray-950">
            {title}
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            {description}
          </p>

          <div className="mt-5 h-2.5 w-full max-w-xl overflow-hidden rounded-full bg-amber-100">
            <div
              className="h-full rounded-full bg-gray-950 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {missing.slice(0, 6).map((item) => (
              <span
                key={item.shortLabel}
                className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-900"
                title={item.label}
              >
                Offen: {item.shortLabel}
              </span>
            ))}

            {missing.length > 6 ? (
              <span className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-900">
                +{missing.length - 6} weitere
              </span>
            ) : null}
          </div>
        </div>

        <div className="shrink-0">
          <Link
            href={href}
            className="inline-flex w-full justify-center rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 sm:w-auto"
          >
            {cta}
          </Link>
        </div>
      </div>
    </div>
  );
}