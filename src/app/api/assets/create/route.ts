import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      userId: string;
      bucket: string;
      path: string;
      fileName?: string;
      mimeType?: string;
      sizeBytes?: number;
    };

    if (!body.userId || !body.bucket || !body.path) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const asset = await prisma.asset.create({
      data: {
        userId: body.userId,
        bucket: body.bucket,
        path: body.path,
        mimeType: body.mimeType,
        // status + createdAt kommen aus schema defaults
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, assetId: asset.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
