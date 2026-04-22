import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/auth-server";
import { NotificationType } from "@prisma/client";

const UGC_BUCKET = "ugc";

function safeStr(v: unknown) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

function safeInt(v: unknown) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.floor(n));
}

function assertPathMatchesStructure(args: {
  staffUserId: string;
  briefId: string;
  bucket: string;
  path: string;
}) {
  const { staffUserId, briefId, bucket, path } = args;

  if (bucket !== UGC_BUCKET) {
    return `Invalid bucket. Expected "${UGC_BUCKET}".`;
  }

  const prefix = `users/${staffUserId}/staff/briefs/${briefId}/`;
  if (!path.startsWith(prefix)) {
    return `Invalid path. Must start with "${prefix}"`;
  }

  if (path.includes("..")) return "Invalid path (..)";
  if (path.length > 900) return "Invalid path (too long)";

  return null;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireStaff(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id: briefId } = await ctx.params;
    if (!briefId) {
      return NextResponse.json({ error: "Missing brief id" }, { status: 400 });
    }

    const brief = await prisma.brief.findUnique({
      where: { id: briefId },
      select: {
        id: true,
        title: true,
        assignedCreatorId: true,
        brandId: true,
      },
    });

    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));

    const bucket = safeStr(body?.bucket) ?? UGC_BUCKET;
    const path = safeStr(body?.path);
    const fileName = safeStr(body?.fileName);
    const mimeType = safeStr(body?.mimeType);
    const sizeBytes = safeInt(body?.sizeBytes);

    if (!path) {
      return NextResponse.json({ error: "Missing path" }, { status: 400 });
    }

    const pathErr = assertPathMatchesStructure({
      staffUserId: auth.userId,
      briefId,
      bucket,
      path,
    });

    if (pathErr) {
      return NextResponse.json({ error: pathErr }, { status: 400 });
    }

    const asset = await prisma.asset.upsert({
      where: {
        bucket_path: {
          bucket,
          path,
        },
      },
      update: {
        fileName: fileName ?? undefined,
        mimeType: mimeType ?? undefined,
        sizeBytes: sizeBytes ?? undefined,
      },
      create: {
        userId: auth.userId,
        bucket,
        path,
        fileName,
        mimeType,
        sizeBytes,
        status: "UPLOADED",
      },
      select: {
        id: true,
        bucket: true,
        path: true,
        fileName: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
      },
    });

    await prisma.briefAsset.upsert({
      where: {
        briefId_assetId: {
          briefId,
          assetId: asset.id,
        },
      },
      update: {},
      create: {
        briefId,
        assetId: asset.id,
      },
    });

    const notifyUserIds = [brief.brandId, brief.assignedCreatorId].filter(
      Boolean
    ) as string[];

    if (notifyUserIds.length > 0) {
      await prisma.notification.createMany({
        data: notifyUserIds.map((userId) => ({
          userId,
          type: NotificationType.NEW_BRIEF,
          title: "New briefing file uploaded",
          message: `A new file was added to "${brief.title}".`,
          link:
            userId === brief.brandId
              ? `/brand/briefs/${brief.id}`
              : `/creator/briefs/${brief.id}`,
        })),
      });
    }

    return NextResponse.json({
      ok: true,
      asset,
    });
  } catch (e: any) {
    console.error("api/staff/briefs/[id]/assets POST error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}