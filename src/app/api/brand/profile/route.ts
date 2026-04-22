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

// GET
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

// PATCH
export async function PATCH(req: Request) {
  const user = await getUser(req);
  if (!user || user.role !== "BRAND") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const updated = await prisma.brandProfile.upsert({
    where: { userId: user.id },
    update: {
      companyName: body.companyName || null,
      contactName: body.contactName || null,
      contactEmail: body.contactEmail || null,
      contactPhone: body.contactPhone || null,
      addressLine1: body.addressLine1 || null,
      addressLine2: body.addressLine2 || null,
      city: body.city || null,
      postalCode: body.postalCode || null,
      country: body.country || null,
    },
    create: {
      userId: user.id,
      companyName: body.companyName || null,
      contactName: body.contactName || null,
      contactEmail: body.contactEmail || null,
      contactPhone: body.contactPhone || null,
      addressLine1: body.addressLine1 || null,
      addressLine2: body.addressLine2 || null,
      city: body.city || null,
      postalCode: body.postalCode || null,
      country: body.country || null,
    },
  });

  return NextResponse.json({ ok: true, profile: updated });
}