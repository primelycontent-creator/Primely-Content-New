import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-server";
import { LEGAL_VERSIONS, normalizeLegalRole } from "@/lib/legal";
import { NotificationType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const role = normalizeLegalRole(auth.role);
    if (!role) {
      return NextResponse.json(
        { error: "No legal flow for this role" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const acceptTerms = body?.acceptTerms === true;
    const acceptPrivacy = body?.acceptPrivacy === true;
    const acceptAgb = body?.acceptAgb === true;

    if (!acceptTerms || !acceptPrivacy || !acceptAgb) {
      return NextResponse.json(
        { error: "All legal documents must be accepted." },
        { status: 400 }
      );
    }

    const versions = LEGAL_VERSIONS[role];
    const now = new Date();

    const updatedUser = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        termsAcceptedAt: now,
        privacyAcceptedAt: now,
        agbAcceptedAt: now,
        termsVersion: versions.termsVersion,
        privacyVersion: versions.privacyVersion,
        agbVersion: versions.agbVersion,
      },
      select: {
        id: true,
        role: true,
        termsVersion: true,
        privacyVersion: true,
        agbVersion: true,
      },
    });

    await prisma.notification.updateMany({
      where: {
        userId: auth.userId,
        type: NotificationType.LEGAL_UPDATE,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({
      ok: true,
      user: updatedUser,
    });
  } catch (e: any) {
    console.error("POST /api/legal/accept error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}