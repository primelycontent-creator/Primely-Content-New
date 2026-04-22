import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/auth-server";

function safeString(value: unknown) {
  const s = String(value ?? "").trim();
  return s.length ? s : null;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireStaff(req);

    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { id: creatorId } = await ctx.params;

    if (!creatorId) {
      return NextResponse.json(
        { error: "Missing creator id" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const reason = safeString(body?.reason);

    const creator = await prisma.user.findFirst({
      where: {
        id: creatorId,
        role: "CREATOR",
      },
      select: {
        id: true,
        creatorProfile: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }

    if (!creator.creatorProfile) {
      return NextResponse.json(
        { error: "Creator profile not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.creatorProfile.update({
      where: { userId: creatorId },
      data: {
        approvalStatus: "REJECTED",
        approvedAt: null,
        approvedByUserId: auth.userId,
        rejectionReason: reason,
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

    return NextResponse.json({
      ok: true,
      creatorProfile: updated,
    });
  } catch (e: any) {
    console.error("api/staff/creators/[id]/reject POST error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}