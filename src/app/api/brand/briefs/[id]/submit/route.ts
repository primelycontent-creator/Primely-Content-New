import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireBrand } from "@/lib/auth-server";
import { NotificationType } from "@prisma/client";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireBrand(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id: briefId } = await ctx.params;
    if (!briefId) {
      return NextResponse.json({ error: "Missing brief id" }, { status: 400 });
    }

    const existing = await prisma.brief.findFirst({
      where: { id: briefId, brandId: auth.userId },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (existing.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only drafts can be submitted" },
        { status: 400 }
      );
    }

    const updated = await prisma.brief.update({
      where: { id: briefId },
      data: { status: "SUBMITTED" },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    });

    const staffUsers = await prisma.user.findMany({
      where: { role: "STAFF" },
      select: { id: true },
    });

    if (staffUsers.length > 0) {
      await prisma.notification.createMany({
        data: staffUsers.map((u) => ({
          userId: u.id,
          type: NotificationType.NEW_BRIEF,
          title: "New briefing submitted",
          message: `A brand submitted the briefing "${updated.title}".`,
          link: `/staff/briefs/${updated.id}`,
        })),
      });
    }

    return NextResponse.json({ ok: true, brief: updated });
  } catch (e: any) {
    console.error("api/brand/briefs/[id]/submit POST error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}