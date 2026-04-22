import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Role = "BRAND" | "CREATOR" | "STAFF";

function safeString(value: unknown) {
  const s = String(value ?? "").trim();
  return s.length > 0 ? s : null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      id?: string;
      email?: string;
      role?: Role;
      companyName?: string | null;
      contactPerson?: string | null;
      phone?: string | null;
      displayName?: string | null;

      acceptedTerms?: boolean;
      acceptedPrivacy?: boolean;
      acceptedAgb?: boolean;
      termsVersion?: string | null;
      privacyVersion?: string | null;
      agbVersion?: string | null;
    };

    const id = String(body.id ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const role = String(body.role ?? "").trim().toUpperCase() as Role;

    if (!id || !email || !role) {
      return NextResponse.json(
        { error: "Missing id/email/role" },
        { status: 400 }
      );
    }

    if (!["BRAND", "CREATOR", "STAFF"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const companyName = safeString(body.companyName);
    const contactPerson = safeString(body.contactPerson);
    const phone = safeString(body.phone);
    const displayName = safeString(body.displayName);

    const acceptedTerms = body.acceptedTerms === true;
    const acceptedPrivacy = body.acceptedPrivacy === true;
    const acceptedAgb = body.acceptedAgb === true;

    const termsVersion = safeString(body.termsVersion);
    const privacyVersion = safeString(body.privacyVersion);
    const agbVersion = safeString(body.agbVersion);

    const now = new Date();

    const legalData =
      acceptedTerms &&
      acceptedPrivacy &&
      acceptedAgb &&
      termsVersion &&
      privacyVersion &&
      agbVersion
        ? {
            termsAcceptedAt: now,
            privacyAcceptedAt: now,
            termsVersion: `${termsVersion}|${agbVersion}`,
            privacyVersion,
          }
        : {};

    const existingById = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });

    const existingByEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true },
    });

    let userId = id;
    let finalRole: Role = role;

    if (existingById) {
      const updated = await prisma.user.update({
        where: { id },
        data: {
          email,
          role,
          ...legalData,
        },
        select: { id: true, role: true },
      });

      userId = updated.id;
      finalRole = updated.role;
    } else if (existingByEmail) {
      const updated = await prisma.user.update({
        where: { email },
        data: {
          role,
          ...legalData,
        },
        select: { id: true, role: true },
      });

      userId = updated.id;
      finalRole = updated.role;
    } else {
      const created = await prisma.user.create({
        data: {
          id,
          email,
          role,
          ...legalData,
        },
        select: { id: true, role: true },
      });

      userId = created.id;
      finalRole = created.role;
    }

    if (finalRole === "BRAND") {
      await prisma.brandProfile.upsert({
        where: { userId },
        update: {
          companyName: companyName ?? undefined,
          contactName: contactPerson ?? undefined,
          contactEmail: email,
          contactPhone: phone ?? undefined,
        },
        create: {
          userId,
          companyName,
          contactName: contactPerson,
          contactEmail: email,
          contactPhone: phone,
        },
      });
    }

    if (finalRole === "CREATOR") {
      await prisma.creatorProfile.upsert({
        where: { userId },
        update: {
          fullName: displayName ?? undefined,
          phone: phone ?? undefined,
        },
        create: {
          userId,
          fullName: displayName,
          phone,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      userId,
      role: finalRole,
    });
  } catch (e: any) {
    console.error("api/auth/sync POST error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}