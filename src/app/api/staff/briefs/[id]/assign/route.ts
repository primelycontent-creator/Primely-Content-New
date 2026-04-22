import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { BriefStatus } from "@prisma/client";

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

    const { id: briefId } = await ctx.params;
    if (!briefId) {
      return NextResponse.json({ error: "Missing brief id" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const creatorId = String(body?.creatorId ?? "").trim();
    if (!creatorId) {
      return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });
    }

    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      select: {
        id: true,
        email: true,
        role: true,
        creatorProfile: {
          select: {
            approvalStatus: true,
          },
        },
      },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    if (creator.role !== "CREATOR") {
      return NextResponse.json({ error: "User is not a creator" }, { status: 400 });
    }

    if (creator.creatorProfile?.approvalStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "Creator is not staff-approved yet" },
        { status: 400 }
      );
    }

    const { data: supabaseUserData, error: supabaseUserErr } =
      await supabaseAdmin.auth.admin.getUserById(creator.id);

    if (supabaseUserErr || !supabaseUserData?.user) {
      return NextResponse.json(
        { error: "Could not verify creator email confirmation" },
        { status: 400 }
      );
    }

    if (!supabaseUserData.user.email_confirmed_at) {
      return NextResponse.json(
        { error: "Creator email is not confirmed yet" },
        { status: 400 }
      );
    }

    const brief = await prisma.brief.findUnique({
      where: { id: briefId },
      select: { id: true },
    });

    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    const updated = await prisma.brief.update({
      where: { id: briefId },
      data: {
        assignedCreatorId: creatorId,
        status: BriefStatus.IN_PROGRESS,
      },
      select: {
        id: true,
        status: true,
        updatedAt: true,
        assignedCreatorId: true,
        assignedCreator: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, brief: updated });
  } catch (e: any) {
    console.error("api/staff/briefs/[id]/assign POST error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}