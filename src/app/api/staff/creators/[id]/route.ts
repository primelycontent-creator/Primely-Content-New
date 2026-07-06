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

    const { id } = await ctx.params;

    const creator = await prisma.user.findFirst({
      where: {
        id,
        role: "CREATOR",
      },
      select: {
        id: true,
        email: true,
        emailConfirmedAt: true,
        createdAt: true,
        updatedAt: true,

        creatorProfile: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            postalCode: true,
            country: true,
            workMode: true,
            nicheGroup: true,
            niches: true,
            portfolioUrl: true,
            bio: true,
            instagram: true,
            tiktok: true,
            equipment: true,
            price30sCents: true,
            introVideoAssetId: true,
            profileImageAssetId: true,
            approvalStatus: true,
            approvedAt: true,
            approvedByUserId: true,
            rejectionReason: true,

            profileImageAsset: {
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

            introVideoAsset: {
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

        assignedBriefs: {
          orderBy: { updatedAt: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            status: true,
            updatedAt: true,
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
          },
        },

        deliverables: {
          orderBy: { createdAt: "desc" },
          take: 12,
          select: {
            id: true,
            briefId: true,
            fileName: true,
            mimeType: true,
            sizeBytes: true,
            status: true,
            brandStatus: true,
            createdAt: true,
            brief: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      creator: {
        ...creator,
        emailConfirmed: !!creator.emailConfirmedAt,
      },
    });
  } catch (e: any) {
    console.error("api/staff/creators/[id] GET error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}