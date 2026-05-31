import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

function getToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

export async function POST(req: Request) {
  try {
    const jwt = getToken(req);
    if (!jwt) {
      return NextResponse.json({ error: "Missing Authorization Bearer token" }, { status: 401 });
    }

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(jwt);

    if (userErr || !userData?.user?.email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const email = userData.user.email.toLowerCase();

    const dbUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found in DB" }, { status: 404 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      bucket?: string;
      path?: string;
    };

    const bucket = String(body.bucket ?? "ugc").trim();
    const path = String(body.path ?? "").trim();

    if (!path) {
      return NextResponse.json({ error: "Missing path" }, { status: 400 });
    }

    if (bucket !== "ugc") {
      return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
    }

    const expectedPrefix = `users/${dbUser.id}/`;

    if (!path.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { error: `Invalid path. Must start with "${expectedPrefix}"` },
        { status: 400 }
      );
    }

    if (path.includes("..") || path.length > 900) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Presign failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      bucket,
      path: data.path,
      token: data.token,
      signedUrl: data.signedUrl,
    });
  } catch (e: any) {
    console.error("POST /api/storage/presign error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}