import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireCreator } from "@/lib/auth-server";

export async function GET(req: Request) {
  try {
    const auth = await requireCreator(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const briefs = await prisma.brief.findMany({
      where: {
        assignedCreatorId: auth.userId,
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
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
      },
    });

    return NextResponse.json({
      ok: true,
      briefs,
    });
  } catch (e: any) {
    console.error("api/creator/briefs GET error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}