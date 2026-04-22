// src/app/api/assets/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

function getSupabaseFromToken(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
}

async function getAuthedUser(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return null;

  const supabase = getSupabaseFromToken(token);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email || !data.user?.id) return null;
  return { user: data.user, token };
}

export async function POST(req: Request) {
  try {
    const authed = await getAuthedUser(req);
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      bucket?: string;
      path?: string;
      fileName?: string;
      mimeType?: string;
      sizeBytes?: number;
      status?: string;
    };

    const bucket = (body.bucket ?? "").trim();
    const path = (body.path ?? "").trim();

    if (!bucket || !path) {
      return NextResponse.json({ error: "Missing bucket/path" }, { status: 400 });
    }

    const created = await prisma.asset.create({
      data: {
        userId: authed.user.id,
        bucket,
        path,
        fileName: body.fileName ?? null,
        mimeType: body.mimeType ?? null,
        sizeBytes: typeof body.sizeBytes === "number" ? body.sizeBytes : null,
        status: body.status ?? "UPLOADED",
      },
      select: { id: true, bucket: true, path: true },
    });

    return NextResponse.json({ ok: true, asset: created });
  } catch (e: any) {
    console.error("assets POST error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
