import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireCreator } from "@/lib/auth-server";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await requireCreator(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id: briefId } = await ctx.params;

  const brief = await prisma.brief.findFirst({
    where: {
      id: briefId,
      assignedCreatorId: auth.userId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      deadline: true,
      licenseTerm: true,
      nicheGroup: true,
      niches: true,
      deliverableCount: true,
      brand: {
        select: {
          email: true,
          brandProfile: {
            select: {
              companyName: true,
            },
          },
        },
      },
      assets: {
        select: {
          asset: {
            select: {
              id: true,
              bucket: true,
              path: true,
              fileName: true,
              mimeType: true,
              sizeBytes: true,
            },
          },
        },
      },
      deliverables: {
        where: {
          creatorId: auth.userId,
          isLatest: true,
        },
        orderBy: {
          slotIndex: "asc",
        },
        select: {
          id: true,
          slotIndex: true,
          revision: true,
          isLatest: true,
          status: true,
          staffFeedback: true,
          brandStatus: true,
          brandFeedback: true,
          isLocked: true,
          lockedAt: true,
          bucket: true,
          path: true,
          fileName: true,
          mimeType: true,
          sizeBytes: true,
          createdAt: true,
        },
      },
    },
  });

  if (!brief) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    brief: {
      ...brief,
      assets: (brief.assets ?? []).map((x) => x.asset),
    },
  });
}