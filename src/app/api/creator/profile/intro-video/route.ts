import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const UGC_BUCKET = "ugc";

function getToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

async function getAuthedCreator(req: Request) {
  const token = getToken(req);
  if (!token) return { error: "Missing bearer token", status: 401 as const };

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData?.user?.email) return { error: "Invalid token", status: 401 as const };

  const email = userData.user.email.toLowerCase();

  const dbUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });

  if (!dbUser) return { error: "Unauthorized", status: 401 as const };
  if (dbUser.role !== "CREATOR") return { error: "Forbidden", status: 403 as const };

  return { userId: dbUser.id };
}

function safeStr(v: any) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

function assertPath(args: { userId: string; bucket: string; path: string }) {
  const { userId, bucket, path } = args;

  if (bucket !== UGC_BUCKET) return `Invalid bucket. Expected "${UGC_BUCKET}".`;

  // RLS Struktur: users/<uid>/...
  const prefix = `users/${userId}/`;
  if (!path.startsWith(prefix)) return `Invalid path. Must start with "${prefix}"`;

  if (path.includes("..")) return "Invalid path (..)";
  if (path.length > 900) return "Invalid path (too long)";

  return null;
}

/**
 * Body:
 * {
 *  bucket: "ugc",
 *  path: "users/<creatorId>/creator/intro/<file>",
 *  fileName?: string,
 *  mimeType?: string,
 *  sizeBytes?: number
 * }
 */
export async function POST(req: Request) {
  try {
    const auth = await getAuthedCreator(req);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await req.json();

    const bucket = String(body?.bucket ?? UGC_BUCKET).trim() || UGC_BUCKET;
    const path = String(body?.path ?? "").trim();
    const fileName = safeStr(body?.fileName);
    const mimeType = safeStr(body?.mimeType);
    const sizeBytes = typeof body?.sizeBytes === "number" ? Math.max(0, Math.floor(body.sizeBytes)) : null;

    if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

    const err = assertPath({ userId: auth.userId, bucket, path });
    if (err) return NextResponse.json({ error: err }, { status: 400 });

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
      select: { id: true, bucket: true, path: true, fileName: true, mimeType: true, sizeBytes: true, createdAt: true },
    });

    const profile = await prisma.creatorProfile.upsert({
      where: { userId: auth.userId },
      update: { introVideoAssetId: asset.id },
      create: { userId: auth.userId, introVideoAssetId: asset.id },
      include: { introVideoAsset: true },
    });

    return NextResponse.json({ ok: true, asset, profile });
  } catch (e: any) {
    console.error("api/creator/profile/intro-video POST error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}