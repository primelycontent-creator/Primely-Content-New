import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireBrand } from "@/lib/auth-server";
import { BrandReviewStatus, NotificationType } from "@prisma/client";

function pickId(params: any) {
  return params?.id ?? params?.deliverableId ?? null;
}

export async function GET(req: Request, ctx: { params: Promise<any> }) {
  try {
    const auth = await requireBrand(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const params = await ctx.params;
    const deliverableId = pickId(params);

    if (!deliverableId) {
      return NextResponse.json({ error: "Missing deliverable id" }, { status: 400 });
    }

    const deliverable = await prisma.deliverable.findFirst({
      where: {
        id: deliverableId,
        brief: {
          brandId: auth.userId,
        },
      },
      select: {
        id: true,
        briefId: true,
        status: true,
        staffFeedback: true,
        brandStatus: true,
        brandFeedback: true,
        brandReviewedAt: true,
        isLocked: true,
        lockedAt: true,
        bucket: true,
        path: true,
        fileName: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!deliverable) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      deliverable,
    });
  } catch (e: any) {
    console.error("api/brand/deliverables/[id] GET error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<any> }) {
  try {
    const auth = await requireBrand(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const params = await ctx.params;
    const deliverableId = pickId(params);

    if (!deliverableId) {
      return NextResponse.json({ error: "Missing deliverable id" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const rawStatus = String(body?.status ?? "").toUpperCase().trim();

    if (rawStatus !== "APPROVED" && rawStatus !== "CHANGES_REQUESTED") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const nextBrandStatus =
      rawStatus === "APPROVED"
        ? BrandReviewStatus.APPROVED
        : BrandReviewStatus.CHANGES_REQUESTED;

    const feedback =
      nextBrandStatus === BrandReviewStatus.CHANGES_REQUESTED
        ? String(body?.feedback ?? "").trim()
        : null;

    if (
      nextBrandStatus === BrandReviewStatus.CHANGES_REQUESTED &&
      !feedback
    ) {
      return NextResponse.json(
        { error: "Feedback required for CHANGES_REQUESTED" },
        { status: 400 }
      );
    }

    const existing = await prisma.deliverable.findFirst({
      where: {
        id: deliverableId,
        brief: {
          brandId: auth.userId,
        },
        status: "APPROVED",
      },
      select: {
        id: true,
        briefId: true,
        creatorId: true,
        brandStatus: true,
        isLocked: true,
        slotIndex: true,
        brief: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (existing.isLocked) {
      return NextResponse.json(
        { error: "This deliverable is already final approved and locked." },
        { status: 400 }
      );
    }

    const now = new Date();

    const updated = await prisma.deliverable.update({
      where: { id: deliverableId },
      data: {
        brandStatus: nextBrandStatus,
        brandFeedback: feedback,
        brandReviewedAt: now,
        ...(nextBrandStatus === BrandReviewStatus.APPROVED
          ? {
              isLocked: true,
              lockedAt: now,
            }
          : {
              isLocked: false,
              lockedAt: null,
            }),
      },
      select: {
        id: true,
        briefId: true,
        slotIndex: true,
        brandStatus: true,
        brandFeedback: true,
        brandReviewedAt: true,
        isLocked: true,
        lockedAt: true,
        updatedAt: true,
      },
    });

    const staffUsers = await prisma.user.findMany({
      where: { role: "STAFF" },
      select: { id: true },
    });

    if (nextBrandStatus === BrandReviewStatus.CHANGES_REQUESTED && staffUsers.length > 0) {
      await prisma.notification.createMany({
        data: staffUsers.map((s) => ({
          userId: s.id,
          type: NotificationType.BRAND_CHANGES_REQUESTED,
          title: "Brand requested changes",
          message: `The brand requested changes for slot ${existing.slotIndex} in "${existing.brief.title}".`,
          link: `/staff/briefs/${existing.briefId}`,
        })),
      });
    }

    if (nextBrandStatus === BrandReviewStatus.APPROVED) {
      await prisma.notification.create({
        data: {
          userId: existing.creatorId,
          type: NotificationType.BRAND_APPROVED,
          title: "Brand approved deliverable",
          message: `Your deliverable for slot ${existing.slotIndex} in "${existing.brief.title}" was approved by the brand and is now final.`,
          link: `/creator/briefs/${existing.briefId}`,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      deliverable: updated,
    });
  } catch (e: any) {
    console.error("api/brand/deliverables/[id] PATCH error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}