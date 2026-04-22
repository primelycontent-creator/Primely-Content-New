import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { UserRole } from "@prisma/client";

function supabaseFromToken(token: string) {
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

  const supabase = supabaseFromToken(token);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function GET(req: Request) {
  try {
    const user = await getAuthedUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email.toLowerCase() },
      select: { id: true, role: true },
    });

    if (!dbUser || dbUser.role !== UserRole.BRAND) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId: dbUser.id },
      select: { companyName: true },
    });

    const totalBriefs = await prisma.brief.count({
      where: { brandId: dbUser.id },
    });

    const recentBriefs = await prisma.brief.findMany({
      where: { brandId: dbUser.id },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        niche: true,
        deadline: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      companyName: brandProfile?.companyName ?? null,
      totalBriefs,
      recentBriefs,
    });
  } catch (e: any) {
    console.error("brand dashboard api error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
