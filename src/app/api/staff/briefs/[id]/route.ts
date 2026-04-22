import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/auth-server";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireStaff(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id: briefId } = await ctx.params;

    const brief = await prisma.brief.findUnique({
      where: { id: briefId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        deadline: true,
        licenseTerm: true,
        nicheGroup: true,
        niches: true,
        deliverableCount: true,

        companyName: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,

        brand: {
          select: {
            id: true,
            email: true,
            brandProfile: {
              select: {
                companyName: true,
              },
            },
          },
        },

        assignedCreatorId: true,
        assignedCreator: {
          select: {
            id: true,
            email: true,
            creatorProfile: {
              select: {
                fullName: true,
                nicheGroup: true,
                niches: true,
                price30sCents: true,
                portfolioUrl: true,
                instagram: true,
                tiktok: true,
                city: true,
                country: true,
                profileImageAssetId: true,
                approvalStatus: true,
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
                createdAt: true,
              },
            },
          },
        },

        deliverables: {
          where: {
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
            staffReviewedAt: true,
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
            creator: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!brief) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      brief: {
        ...brief,
        assets: (brief.assets ?? []).map((x) => x.asset),
      },
    });
  } catch (e: any) {
    console.error("api/staff/briefs/[id] GET error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}