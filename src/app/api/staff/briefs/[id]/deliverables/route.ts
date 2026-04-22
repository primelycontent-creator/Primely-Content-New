import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function getToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

async function getAuthedStaff(req: Request) {
  const token = getToken(req);
  if (!token) return { error: "Missing bearer token", status: 401 as const };

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData?.user?.email) return { error: "Invalid token", status: 401 as const };

  const email = userData.user.email.toLowerCase();
  const dbUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });

  if (!dbUser || dbUser.role !== "STAFF") return { error: "Forbidden", status: 403 as const };
  return { userId: dbUser.id };
}

// GET /api/staff/briefs/:id/deliverables
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthedStaff(req);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id: briefId } = await ctx.params;

    // Brief + Deliverables laden
    const brief = await prisma.brief.findUnique({
      where: { id: briefId },
      select: {
        id: true,
        title: true,
        brandId: true,
        assignedCreatorId: true,
        deliverables: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            bucket: true,
            path: true,
            fileName: true,
            mimeType: true,
            sizeBytes: true,
            createdAt: true,
            creatorId: true,
          },
        },
      },
    });

    if (!brief) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // signed URLs generieren (1h gültig)
    const items = await Promise.all(
      (brief.deliverables ?? []).map(async (d) => {
        const { data, error } = await supabaseAdmin.storage
          .from(d.bucket)
          .createSignedUrl(d.path, 60 * 60);

        return {
          ...d,
          signedUrl: error ? null : data?.signedUrl ?? null,
        };
      })
    );

    return NextResponse.json({ ok: true, briefId, deliverables: items });
  } catch (e: any) {
    console.error("GET staff deliverables error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}