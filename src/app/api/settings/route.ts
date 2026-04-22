import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-server";

export async function GET(req: Request) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId: auth.userId },
      update: {},
      create: {
        userId: auth.userId,
      },
      select: {
        id: true,
        userId: true,
        inAppNotifications: true,
        emailNotifications: true,
        notifyNewBrief: true,
        notifyCreatorUpload: true,
        notifyStaffChanges: true,
        notifyBrandChanges: true,
        notifyApprovals: true,
        notifySupport: true,
        notifyLegalUpdates: true,
        deleteRequestedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, settings });
  } catch (e: any) {
    console.error("GET /api/settings error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));

    const toBool = (v: unknown, fallback: boolean) =>
      typeof v === "boolean" ? v : fallback;

    const existing = await prisma.userSettings.upsert({
      where: { userId: auth.userId },
      update: {},
      create: {
        userId: auth.userId,
      },
      select: {
        inAppNotifications: true,
        emailNotifications: true,
        notifyNewBrief: true,
        notifyCreatorUpload: true,
        notifyStaffChanges: true,
        notifyBrandChanges: true,
        notifyApprovals: true,
        notifySupport: true,
        notifyLegalUpdates: true,
        deleteRequestedAt: true,
      },
    });

    const settings = await prisma.userSettings.update({
      where: { userId: auth.userId },
      data: {
        inAppNotifications: toBool(body?.inAppNotifications, existing.inAppNotifications),
        emailNotifications: toBool(body?.emailNotifications, existing.emailNotifications),
        notifyNewBrief: toBool(body?.notifyNewBrief, existing.notifyNewBrief),
        notifyCreatorUpload: toBool(body?.notifyCreatorUpload, existing.notifyCreatorUpload),
        notifyStaffChanges: toBool(body?.notifyStaffChanges, existing.notifyStaffChanges),
        notifyBrandChanges: toBool(body?.notifyBrandChanges, existing.notifyBrandChanges),
        notifyApprovals: toBool(body?.notifyApprovals, existing.notifyApprovals),
        notifySupport: toBool(body?.notifySupport, existing.notifySupport),
        notifyLegalUpdates: toBool(body?.notifyLegalUpdates, existing.notifyLegalUpdates),
      },
      select: {
        id: true,
        userId: true,
        inAppNotifications: true,
        emailNotifications: true,
        notifyNewBrief: true,
        notifyCreatorUpload: true,
        notifyStaffChanges: true,
        notifyBrandChanges: true,
        notifyApprovals: true,
        notifySupport: true,
        notifyLegalUpdates: true,
        deleteRequestedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, settings });
  } catch (e: any) {
    console.error("PATCH /api/settings error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}