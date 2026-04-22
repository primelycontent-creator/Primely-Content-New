import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireCreator } from "@/lib/auth-server";

function safeStr(v: unknown) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

function safeInt(v: unknown) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.floor(n));
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireCreator(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id: briefId } = await ctx.params;
    const body = await req.json().catch(() => ({}));

    const bucket = safeStr(body?.bucket);
    const path = safeStr(body?.path);
    const fileName = safeStr(body?.fileName);
    const mimeType = safeStr(body?.mimeType);
    const sizeBytes = safeInt(body?.sizeBytes);
    const slotIndex = safeInt(body?.slotIndex);

    if (!bucket) {
      return NextResponse.json({ error: "Missing bucket" }, { status: 400 });
    }

    if (!path) {
      return NextResponse.json({ error: "Missing path" }, { status: 400 });
    }

    if (!slotIndex || slotIndex < 1) {
      return NextResponse.json(
        { error: "Missing or invalid slotIndex" },
        { status: 400 }
      );
    }

    const brief = await prisma.brief.findFirst({
      where: {
        id: briefId,
        assignedCreatorId: auth.userId,
      },
      select: {
        id: true,
        deliverableCount: true,
      },
    });

    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    if (slotIndex > brief.deliverableCount) {
      return NextResponse.json(
        {
          error: `slotIndex exceeds deliverableCount (${brief.deliverableCount})`,
        },
        { status: 400 }
      );
    }

    const latestExisting = await prisma.deliverable.findFirst({
      where: {
        briefId,
        creatorId: auth.userId,
        slotIndex,
        isLatest: true,
      },
      orderBy: {
        revision: "desc",
      },
      select: {
        id: true,
        revision: true,
        isLocked: true,
        brandStatus: true,
      },
    });

    if (latestExisting?.isLocked) {
      return NextResponse.json(
        {
          error:
            "This slot is already final approved and locked. A new upload is not allowed.",
        },
        { status: 400 }
      );
    }

    const nextRevision = (latestExisting?.revision ?? 0) + 1;

    const deliverable = await prisma.$transaction(async (tx) => {
      if (latestExisting) {
        await tx.deliverable.update({
          where: { id: latestExisting.id },
          data: {
            isLatest: false,
          },
        });
      }

      return tx.deliverable.create({
        data: {
          briefId,
          creatorId: auth.userId,
          slotIndex,
          revision: nextRevision,
          isLatest: true,
          replacesDeliverableId: latestExisting?.id ?? null,

          bucket,
          path,
          fileName,
          mimeType,
          sizeBytes,

          status: "PENDING",
          staffFeedback: null,
          staffReviewedAt: null,

          brandStatus: "PENDING",
          brandFeedback: null,
          brandReviewedAt: null,

          isLocked: false,
          lockedAt: null,
        },
        select: {
          id: true,
          briefId: true,
          creatorId: true,
          slotIndex: true,
          revision: true,
          isLatest: true,
          status: true,
          staffFeedback: true,
          brandStatus: true,
          brandFeedback: true,
          isLocked: true,
          bucket: true,
          path: true,
          fileName: true,
          mimeType: true,
          sizeBytes: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    return NextResponse.json({ ok: true, deliverable });
  } catch (e: any) {
    console.error("api/creator/briefs/[id]/deliverables POST error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}