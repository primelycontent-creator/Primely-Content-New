import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { UserRole } from "@prisma/client";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function getToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

function safeStr(v: any) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

function mapRole(v: any): UserRole {
  const role = String(v ?? "").toUpperCase();
  if (role === "CREATOR") return UserRole.CREATOR;
  if (role === "STAFF") return UserRole.STAFF;
  return UserRole.BRAND;
}

export async function POST(req: Request) {
  try {
    const token = getToken(req);
    if (!token) {
      return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user?.email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const supaUser = data.user!;
    const email = supaUser.email!.toLowerCase();
    const meta = supaUser.user_metadata ?? {};
    const role = mapRole(meta.role);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        emailConfirmedAt: supaUser.email_confirmed_at
          ? new Date(supaUser.email_confirmed_at)
          : undefined,
      },
      create: {
        email,
        role,
        emailConfirmedAt: supaUser.email_confirmed_at
          ? new Date(supaUser.email_confirmed_at)
          : null,
        termsAcceptedAt: meta.acceptedTerms ? new Date() : null,
        privacyAcceptedAt: meta.acceptedPrivacy ? new Date() : null,
        agbAcceptedAt: meta.acceptedTerms ? new Date() : null,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (role === UserRole.BRAND) {
      await prisma.brandProfile.upsert({
        where: { userId: user.id },
        update: {
          companyName: safeStr(meta.companyName),
          contactName: safeStr(meta.contactPerson),
          contactEmail: email,
          contactPhone: safeStr(meta.phone),
          websiteUrl: safeStr(meta.website),
        },
        create: {
          userId: user.id,
          companyName: safeStr(meta.companyName),
          contactName: safeStr(meta.contactPerson),
          contactEmail: email,
          contactPhone: safeStr(meta.phone),
          websiteUrl: safeStr(meta.website),
        },
      });
    }

    if (role === UserRole.CREATOR) {
      await prisma.creatorProfile.upsert({
        where: { userId: user.id },
        update: {
          fullName: safeStr(meta.fullName),
          phone: safeStr(meta.phone),
        },
        create: {
          userId: user.id,
          fullName: safeStr(meta.fullName),
          phone: safeStr(meta.phone),
        },
      });
    }

    await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    return NextResponse.json({ ok: true, user });
  } catch (e: any) {
    console.error("POST /api/auth/sync error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}