import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireBrand } from "@/lib/auth-server";
import { createClient } from "@supabase/supabase-js";

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
    const fileName = String(body?.fileName ?? "").trim();

    if (!bucket || !path) {
      return NextResponse.json(
        { error: "Missing bucket or path" },
        { status: 400 }
      );
    }

    // Nur final approved + locked + gehört zur Brand
    const deliverable = await prisma.deliverable.findFirst({
      where: {
        bucket,
        path,
        status: "APPROVED",
        brandStatus: "APPROVED",
        isLocked: true,
        brief: {
          brandId: auth.userId,
        },
      },
      select: {
        id: true,
        fileName: true,
        mimeType: true,
      },
    });

    if (!deliverable) {
      return NextResponse.json(
        { error: "Download not allowed (deliverable is not final approved and locked)." },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .download(path);

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Storage error" },
        { status: 500 }
      );
    }

    const bytes = Buffer.from(await data.arrayBuffer());
    const name =
      fileName ||
      deliverable.fileName ||
      path.split("/").pop() ||
      "download";

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": deliverable.mimeType ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(name)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("api/brand/storage/download POST error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}