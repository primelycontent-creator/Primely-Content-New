import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-server";
import { LEGAL_VERSIONS, normalizeLegalRole } from "@/lib/legal";
import { NotificationType } from "@prisma/client";

export async function GET(req: Request) {
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

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        role: true,
        termsVersion: true,
        privacyVersion: true,
        agbVersion: true,
        termsAcceptedAt: true,
        privacyAcceptedAt: true,
        agbAcceptedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const target = LEGAL_VERSIONS[role];

    const needsTerms =
      user.termsVersion !== target.termsVersion || !user.termsAcceptedAt;
    const needsPrivacy =
      user.privacyVersion !== target.privacyVersion || !user.privacyAcceptedAt;
    const needsAgb =
      user.agbVersion !== target.agbVersion || !user.agbAcceptedAt;

    const requiresAcceptance = needsTerms || needsPrivacy || needsAgb;

    if (requiresAcceptance) {
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: user.id,
          type: NotificationType.LEGAL_UPDATE,
          read: false,
        },
        select: { id: true },
      });

      if (!existingNotification) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: NotificationType.LEGAL_UPDATE,
            title: "Legal documents updated",
            message:
              "Please review and accept the latest Terms, Privacy Policy and AGB before continuing.",
            link: "/legal-update",
          },
        });
      }
    }

    return NextResponse.json({
      ok: true,
      legal: {
        role,
        requiresAcceptance,
        current: {
          termsVersion: target.termsVersion,
          privacyVersion: target.privacyVersion,
          agbVersion: target.agbVersion,
        },
        accepted: {
          termsVersion: user.termsVersion,
          privacyVersion: user.privacyVersion,
          agbVersion: user.agbVersion,
          termsAcceptedAt: user.termsAcceptedAt,
          privacyAcceptedAt: user.privacyAcceptedAt,
          agbAcceptedAt: user.agbAcceptedAt,
        },
        missing: {
          terms: needsTerms,
          privacy: needsPrivacy,
          agb: needsAgb,
        },
      },
    });
  } catch (e: any) {
    console.error("GET /api/me/legal-status error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}