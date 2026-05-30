import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";
import { CreatorWorkMode } from "@prisma/client";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function getToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

async function getAuthedCreator(req: Request) {
  const token = getToken(req);
  if (!token) return { error: "Missing bearer token", status: 401 as const };

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData?.user?.email) {
    return { error: "Invalid token", status: 401 as const };
  }

  const email = userData.user.email.toLowerCase();

  const dbUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, email: true },
  });

  if (!dbUser) return { error: "Unauthorized", status: 401 as const };
  if (dbUser.role !== "CREATOR") return { error: "Forbidden", status: 403 as const };

  return { userId: dbUser.id, email: dbUser.email };
}

function safeStr(v: any) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

function safeStrArr(v: any, max = 20) {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x).trim()).filter(Boolean).slice(0, max);
}

function safeInt(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.floor(n));
}

function mapWorkMode(input: any): CreatorWorkMode | null {
  if (!input) return null;
  const s = String(input).trim().toUpperCase();
  if (s === "FULL_TIME") return CreatorWorkMode.FULL_TIME;
  if (s === "PART_TIME") return CreatorWorkMode.PART_TIME;
  return null;
}

const assetSelect = {
  id: true,
  bucket: true,
  path: true,
  fileName: true,
  mimeType: true,
  sizeBytes: true,
  createdAt: true,
};

export async function GET(req: Request) {
  try {
    const auth = await getAuthedCreator(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const profile = await prisma.creatorProfile.findUnique({
      where: { userId: auth.userId },
      include: {
        introVideoAsset: { select: assetSelect },
        profileImageAsset: { select: assetSelect },
      },
    });

    return NextResponse.json({ ok: true, profile: profile ?? null });
  } catch (e: any) {
    console.error("api/creator/profile GET error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await getAuthedCreator(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();

    const price30sEur = body?.price30sEur;
    const price30sCents =
      price30sEur == null || price30sEur === ""
        ? null
        : safeInt(Math.round(Number(price30sEur) * 100));

    const updated = await prisma.creatorProfile.upsert({
      where: { userId: auth.userId },
      update: {
        fullName: safeStr(body?.fullName),
        phone: safeStr(body?.phone),
        addressLine1: safeStr(body?.addressLine1),
        addressLine2: safeStr(body?.addressLine2),
        city: safeStr(body?.city),
        postalCode: safeStr(body?.postalCode),
        country: safeStr(body?.country),
        workMode: mapWorkMode(body?.workMode),
        nicheGroup: safeStr(body?.nicheGroup),
        niches: safeStrArr(body?.niches, 10),
        portfolioUrl: safeStr(body?.portfolioUrl),
        bio: safeStr(body?.bio),
        instagram: safeStr(body?.instagram),
        tiktok: safeStr(body?.tiktok),
        equipment: safeStrArr(body?.equipment, 30),
        price30sCents,
      },
      create: {
        userId: auth.userId,
        fullName: safeStr(body?.fullName),
        phone: safeStr(body?.phone),
        addressLine1: safeStr(body?.addressLine1),
        addressLine2: safeStr(body?.addressLine2),
        city: safeStr(body?.city),
        postalCode: safeStr(body?.postalCode),
        country: safeStr(body?.country),
        workMode: mapWorkMode(body?.workMode),
        nicheGroup: safeStr(body?.nicheGroup),
        niches: safeStrArr(body?.niches, 10),
        portfolioUrl: safeStr(body?.portfolioUrl),
        bio: safeStr(body?.bio),
        instagram: safeStr(body?.instagram),
        tiktok: safeStr(body?.tiktok),
        equipment: safeStrArr(body?.equipment, 30),
        price30sCents,
      },
      include: {
        introVideoAsset: { select: assetSelect },
        profileImageAsset: { select: assetSelect },
      },
    });

    return NextResponse.json({ ok: true, profile: updated });
  } catch (e: any) {
    console.error("api/creator/profile PATCH error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}