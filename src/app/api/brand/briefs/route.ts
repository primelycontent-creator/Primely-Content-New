import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireBrand } from "@/lib/auth-server";
import { LicenseTerm } from "@prisma/client";

function safeStr(v: any) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

function safeDate(v: any) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function mapLicenseTerm(input: any): LicenseTerm | null {
  if (!input) return null;
  const s = String(input).trim().toUpperCase();

  if (s === "M1" || s === "1 MONTH" || s === "1" || s === "M_1") return LicenseTerm.M1;
  if (s === "M3" || s === "3 MONTHS" || s === "3" || s === "M_3") return LicenseTerm.M3;
  if (s === "M6" || s === "6 MONTHS" || s === "6" || s === "M_6") return LicenseTerm.M6;
  if (s === "M12" || s === "12 MONTHS" || s === "12" || s === "M_12") return LicenseTerm.M12;
  if (s.includes("UNLIMITED")) return LicenseTerm.UNLIMITED;

  if (s.includes("1")) return LicenseTerm.M1;
  if (s.includes("3") && !s.includes("13")) return LicenseTerm.M3;
  if (s.includes("6")) return LicenseTerm.M6;
  if (s.includes("12")) return LicenseTerm.M12;

  return null;
}

export async function GET(req: Request) {
  try {
    const auth = await requireBrand(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const briefs = await prisma.brief.findMany({
      where: { brandId: auth.userId },
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
        deliverableCount: true,
        _count: {
          select: {
            assets: true,
            deliverables: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, briefs });
  } catch (e: any) {
    console.error("api/brand/briefs GET error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireBrand(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));

    const title = safeStr(body?.title);
    if (!title) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    const description = safeStr(body?.description);
    const deadline = safeDate(body?.deadline);
    const licenseTerm = mapLicenseTerm(body?.licenseTerm);

    const nicheGroup = safeStr(body?.nicheGroup);
    const niches = Array.isArray(body?.niches)
      ? body.niches.map(String).map((x: string) => x.trim()).filter(Boolean).slice(0, 5)
      : [];

    const companyName = safeStr(body?.companyName);
    const contactName = safeStr(body?.contactName);
    const contactEmail = safeStr(body?.contactEmail);
    const contactPhone = safeStr(body?.contactPhone);

    const rawDeliverableCount = Number(body?.deliverableCount ?? 1);
    const deliverableCount = Number.isFinite(rawDeliverableCount)
      ? Math.min(5, Math.max(1, Math.floor(rawDeliverableCount)))
      : 1;

    const brief = await prisma.brief.create({
      data: {
        brandId: auth.userId,
        title,
        description,
        deadline,
        licenseTerm,
        nicheGroup,
        niches,
        companyName,
        contactName,
        contactEmail,
        contactPhone,
        deliverableCount,
        status: "DRAFT",
      },
      select: {
        id: true,
        title: true,
        status: true,
        deliverableCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, brief });
  } catch (e: any) {
    console.error("api/brand/briefs POST error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}