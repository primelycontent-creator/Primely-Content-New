import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { requireBrand } from "@/lib/auth-server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const auth = await requireBrand(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const bucket = String(body?.bucket ?? "").trim();
    const path = String(body?.path ?? "").trim();

    if (!bucket || !path) {
      return NextResponse.json(
        { error: "Missing bucket/path" },
        { status: 400 }
      );
    }

    // Preview darf die Brand sehen, wenn das Deliverable zu einem eigenen Brief gehört
    const deliverable = await prisma.deliverable.findFirst({
      where: {
        bucket,
        path,
        brief: {
          brandId: auth.userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!deliverable) {
      return NextResponse.json(
        { error: "Preview not allowed" },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 10);

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: error?.message ?? "Failed to sign url" },
        { status: 500 }
      );
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (e: any) {
    console.error("api/brand/storage/signed-url POST error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}