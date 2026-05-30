import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function getToken(req: Request) {
  const h = req.headers.get("authorization") || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
}

async function getUser(req: Request) {
  const token = getToken(req);
  if (!token) return null;

  const { data } = await supabaseAdmin.auth.getUser(token);
  const email = data?.user?.email?.toLowerCase();
  if (!email) return null;

  return prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });
}

function clean(value: unknown) {
  const v = String(value ?? "").trim();
  return v.length ? v : null;
}

function enumOrNull<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  const v = String(value ?? "").trim() as T;
  return allowed.includes(v) ? v : null;
}

const COMPANY_SIZE_VALUES = ["SIZE_1_10", "SIZE_11_50", "SIZE_51_250", "SIZE_251_PLUS"] as const;

const UGC_EXPERIENCE_VALUES = [
  "NONE",
  "FIRST_CAMPAIGNS",
  "REGULAR_CAMPAIGNS",
  "PROFESSIONAL_TEAM",
] as const;

const MONTHLY_BUDGET_VALUES = [
  "UNDER_1000",
  "BUDGET_1000_5000",
  "BUDGET_5000_10000",
  "BUDGET_10000_25000",
  "BUDGET_25000_PLUS",
] as const;

export async function GET(req: Request) {
  const user = await getUser(req);

  if (!user || user.role !== "BRAND") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.brandProfile.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json({ ok: true, profile });
}

export async function PATCH(req: Request) {
  const user = await getUser(req);

  if (!user || user.role !== "BRAND") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const data = {
    companyName: clean(body.companyName),
    industry: clean(body.industry),

    contactName: clean(body.contactName),
    contactEmail: clean(body.contactEmail),
    contactPhone: clean(body.contactPhone),

    websiteUrl: clean(body.websiteUrl),
    instagramUrl: clean(body.instagramUrl),
    tiktokUrl: clean(body.tiktokUrl),
    linkedinUrl: clean(body.linkedinUrl),

    billingEmail: clean(body.billingEmail),
    billingCompanyName: clean(body.billingCompanyName),
    vatId: clean(body.vatId),

    addressLine1: clean(body.addressLine1),
    addressLine2: clean(body.addressLine2),
    city: clean(body.city),
    postalCode: clean(body.postalCode),
    country: clean(body.country),

    companySize: enumOrNull(body.companySize, COMPANY_SIZE_VALUES),
    ugcExperience: enumOrNull(body.ugcExperience, UGC_EXPERIENCE_VALUES),
    monthlyBudget: enumOrNull(body.monthlyBudget, MONTHLY_BUDGET_VALUES),

    contractContactName: clean(body.contractContactName),
    contractContactRole: clean(body.contractContactRole),

    isOnboarded: Boolean(
      clean(body.companyName) &&
        clean(body.industry) &&
        clean(body.contactName) &&
        clean(body.contactEmail) &&
        clean(body.contactPhone)
    ),
  };

  const updated = await prisma.brandProfile.upsert({
    where: { userId: user.id },
    update: data,
    create: {
      userId: user.id,
      ...data,
    },
  });

  return NextResponse.json({ ok: true, profile: updated });
}