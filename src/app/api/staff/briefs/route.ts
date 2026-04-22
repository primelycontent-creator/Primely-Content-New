import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { BriefStatus } from "@prisma/client";

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
  if (!token) return { ok: false as const, status: 401, error: "Missing bearer token" };

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData?.user?.email) {
    return { ok: false as const, status: 401, error: "Invalid token" };
  }

  const email = userData.user.email.toLowerCase();
  const dbUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });

  if (!dbUser || dbUser.role !== "STAFF") {
    return { ok: false as const, status: 403, error: "Forbidden" };
  }

  return { ok: true as const, userId: dbUser.id };
}

function parseStatus(raw: string | null): BriefStatus | "ALL" {
  if (!raw) return "ALL";
  const s = raw.toUpperCase().trim();
  if (s === "ALL") return "ALL";
  if (s === "DRAFT") return BriefStatus.DRAFT;
  if (s === "SUBMITTED") return BriefStatus.SUBMITTED;
  if (s === "IN_PROGRESS") return BriefStatus.IN_PROGRESS;
  if (s === "DECLINED") return BriefStatus.DECLINED;
  return "ALL";
}

export async function GET(req: Request) {
  try {
    const auth = await getAuthedStaff(req);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const url = new URL(req.url);
    const statusParam = parseStatus(url.searchParams.get("status"));

    const where =
      statusParam === "ALL"
        ? {}
        : { status: statusParam };

    const briefs = await prisma.brief.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
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
            creatorProfile: { select: { fullName: true, nicheGroup: true } },
          },
        },

        _count: { select: { assets: true, deliverables: true } },
      },
    });

    return NextResponse.json({ ok: true, briefs });
  } catch (e: any) {
    console.error("api/staff/briefs GET error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}