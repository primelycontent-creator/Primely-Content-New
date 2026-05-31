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
    if (!jwt) return NextResponse.json({ error: "Missing token" }, { status: 401 });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(jwt);
    if (userErr || !userData?.user?.email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: userData.user.email.toLowerCase() },
      select: { id: true },
    });

    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const bucket = String(body?.bucket ?? "ugc").trim();
    const path = String(body?.path ?? "").trim();

    if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

    const expectedPrefix = `users/${dbUser.id}/`;
    if (!path.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { error: `Invalid path. Must start with "${expectedPrefix}"` },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60);

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: error?.message ?? "Signed URL failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, signedUrl: data.signedUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}