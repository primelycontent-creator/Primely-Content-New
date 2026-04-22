import { NextResponse } from "next/server";

type Role = "BRAND" | "CREATOR";

const LEGAL_VERSIONS = {
  BRAND: {
    termsVersion: "brand-terms-v1",
    privacyVersion: "brand-privacy-v1",
    agbVersion: "brand-agb-v1",
  },
  CREATOR: {
    termsVersion: "creator-terms-v1",
    privacyVersion: "creator-privacy-v1",
    agbVersion: "creator-agb-v1",
  },
} as const;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawRole = String(searchParams.get("role") ?? "")
      .trim()
      .toUpperCase();

    if (rawRole !== "BRAND" && rawRole !== "CREATOR") {
      return NextResponse.json(
        { error: "Missing or invalid role" },
        { status: 400 }
      );
    }

    const role = rawRole as Role;
    const versions = LEGAL_VERSIONS[role];

    return NextResponse.json({
      ok: true,
      role,
      legal: versions,
    });
  } catch (e: any) {
    console.error("GET /api/legal/current error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}