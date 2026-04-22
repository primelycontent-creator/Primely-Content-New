import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireBrand } from "@/lib/auth-server";
import { LicenseTerm, NotificationType } from "@prisma/client";

const UGC_BUCKET = "ugc";

function safeStr(v: any) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

function safeDate(v: any) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function mapLicenseTerm(input: any): LicenseTerm | null {
  if (!input) return null;
  const s = String(input).trim().toUpperCase();

  if (s === "M1" || s === "1 MONTH" || s === "1" || s === "M_1") return LicenseTerm.M1;
  if (s === "M3" || s === "3 MONTHS" || s === "3" || s === "M_3") return LicenseTerm.M3;
  if (s === "M6" || s === "6 MONTHS" || s === "6" || s === "M_6") return LicenseTerm.M6;
  if (s === "M12" || s === "12 MONTHS" || s === "12" || s === "M_12") return LicenseTerm.M12;
  if (s.includes("UNLIMITED")) return LicenseTerm.UNLIMITED;

  if (s.includes("1")) return LicenseTerm.M1;
  if (s.includes("3") && !s.includes("13")) return LicenseTerm.M3;
  if (s.includes("6")) return LicenseTerm.M6;
  if (s.includes("12")) return LicenseTerm.M12;

  return null;
}

function assertPathMatchesStructure(args: { brandId: string; briefId: string; bucket: string; path: string }) {
  const { brandId, briefId, bucket, path } = args;

  if (bucket !== UGC_BUCKET) return `Invalid bucket. Expected "${UGC_BUCKET}".`;

  const prefix = `users/${brandId}/briefs/${briefId}/`;
  if (!path.startsWith(prefix)) return `Invalid path. Must start with "${prefix}"`;

  if (path.includes("..")) return "Invalid path (..)";
  if (path.length > 900) return "Invalid path (too long)";
  return null;
}

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireBrand(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id: briefId } = await ctx.params;
  if (!briefId) return NextResponse.json({ error: "Missing brief id" }, { status: 400 });

  const brief = await prisma.brief.findFirst({
    where: { id: briefId, brandId: auth.userId },
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

      companyName: true,
      contactName: true,
      contactEmail: true,
      contactPhone: true,

      brand: {
        select: {
          id: true,
          email: true,
          brandProfile: { select: { companyName: true } },
        },
      },

      assignedCreator: {
        select: {
          id: true,
          email: true,
          creatorProfile: { select: { fullName: true } },
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
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          brandStatus: true,
          brandFeedback: true,
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

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireBrand(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id: briefId } = await ctx.params;
  if (!briefId) return NextResponse.json({ error: "Missing brief id" }, { status: 400 });

  const exists = await prisma.brief.findFirst({
    where: { id: briefId, brandId: auth.userId },
    select: { id: true },
  });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));

  const title = safeStr(body?.title);
  if (!title) return NextResponse.json({ error: "Missing title" }, { status: 400 });

  const updated = await prisma.brief.update({
    where: { id: briefId },
    data: {
      title,
      description: safeStr(body?.description),
      deadline: safeDate(body?.deadline),
      licenseTerm: mapLicenseTerm(body?.licenseTerm),
      nicheGroup: safeStr(body?.nicheGroup),
      niches: Array.isArray(body?.niches)
        ? body.niches.map(String).map((x: string) => x.trim()).filter(Boolean).slice(0, 5)
        : [],
      companyName: safeStr(body?.companyName),
      contactName: safeStr(body?.contactName),
      contactEmail: safeStr(body?.contactEmail),
      contactPhone: safeStr(body?.contactPhone),
    },
    select: { id: true, updatedAt: true },
  });

  return NextResponse.json({ ok: true, briefId: updated.id, updatedAt: updated.updatedAt });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireBrand(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id: briefId } = await ctx.params;
    if (!briefId) return NextResponse.json({ error: "Missing brief id" }, { status: 400 });

    const brief = await prisma.brief.findFirst({
      where: { id: briefId, brandId: auth.userId },
      select: { id: true, title: true },
    });
    if (!brief) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json().catch(() => ({}));

    const bucket = String(body?.bucket ?? "").trim() || UGC_BUCKET;
    const path = String(body?.path ?? "").trim();
    const fileName = safeStr(body?.fileName);
    const mimeType = safeStr(body?.mimeType);

    const sizeBytesRaw = body?.sizeBytes;
    const sizeBytes =
      typeof sizeBytesRaw === "number" && Number.isFinite(sizeBytesRaw) && sizeBytesRaw >= 0
        ? Math.floor(sizeBytesRaw)
        : null;

    if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

    const pathErr = assertPathMatchesStructure({ brandId: auth.userId, briefId, bucket, path });
    if (pathErr) return NextResponse.json({ error: pathErr }, { status: 400 });

    const asset = await prisma.asset.upsert({
      where: { bucket_path: { bucket, path } },
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
      where: { briefId_assetId: { briefId, assetId: asset.id } },
      update: {},
      create: { briefId, assetId: asset.id },
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
          title: "Brand uploaded brief assets",
          message: `New files were uploaded to briefing "${brief.title}".`,
          link: `/staff/briefs/${brief.id}`,
        })),
      });
    }

    return NextResponse.json({ ok: true, asset });
  } catch (e: any) {
    console.error("api/brand/briefs/[id] POST attach asset error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}