import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireStaff } from "@/lib/auth-server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function safeFileName(name: string) {
  return String(name || "download")
    .trim()
    .replace(/[^\w.\-()+\s]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 180);
}

export async function POST(req: Request) {
  const auth = await requireStaff(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => ({}));
  const bucket = String(body?.bucket ?? "").trim();
  const path = String(body?.path ?? "").trim();
  const fileName = safeFileName(body?.fileName ?? path.split("/").pop() ?? "download");

  if (!bucket || !path) {
    return NextResponse.json({ error: "Missing bucket/path" }, { status: 400 });
  }

  // 10 min signed url
  const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, 60 * 10);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message ?? "Failed to sign url" }, { status: 404 });
  }

  // Fetch file server-side
  const upstream = await fetch(data.signedUrl);
  if (!upstream.ok) {
    return NextResponse.json({ error: `Upstream fetch failed (${upstream.status})` }, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${fileName}"`,
      // optional caching off:
      "Cache-Control": "no-store",
    },
  });
}