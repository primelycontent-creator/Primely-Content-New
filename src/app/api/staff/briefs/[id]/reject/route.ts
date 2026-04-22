import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { CreatorApprovalStatus } from "@prisma/client";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function getToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

async function getAuthedStaff(req: Request) {
  const token = getToken(req);
  if (!token) return { ok: false as const, status: 401, error: "Missing bearer token" };

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData?.user?.email) {
    return { ok: false as const, status: 401, error: "Invalid token" };
  }

  const email = userData.user.email.toLowerCase();
  const dbUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });

  if (!dbUser || dbUser.role !== "STAFF") {
    return { ok: false as const, status: 403, error: "Forbidden" };
  }

  return { ok: true as const, userId: dbUser.id };
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthedStaff(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id: creatorId } = await ctx.params;
    if (!creatorId) {
      return NextResponse.json({ error: "Missing creator id" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const rejectionReason = String(body?.rejectionReason ?? "").trim() || null;

    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!creator || creator.role !== "CREATOR") {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const profile = await prisma.creatorProfile.upsert({
      where: { userId: creatorId },
      update: {
        approvalStatus: CreatorApprovalStatus.REJECTED,
        approvedAt: null,
        approvedByUserId: auth.userId,
        rejectionReason,
      },
      create: {
        userId: creatorId,
        approvalStatus: CreatorApprovalStatus.REJECTED,
        approvedAt: null,
        approvedByUserId: auth.userId,
        rejectionReason,
      },
      select: {
        id: true,
        userId: true,
        approvalStatus: true,
        approvedAt: true,
        approvedByUserId: true,
        rejectionReason: true,
      },
    });

    return NextResponse.json({ ok: true, profile });
  } catch (e: any) {
    console.error("api/staff/creators/[id]/reject POST error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}