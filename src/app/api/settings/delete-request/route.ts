import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-server";
import { NotificationType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId: auth.userId },
      update: {
        deleteRequestedAt: new Date(),
      },
      create: {
        userId: auth.userId,
        deleteRequestedAt: new Date(),
      },
      select: {
        userId: true,
        deleteRequestedAt: true,
      },
    });

    const staffUsers = await prisma.user.findMany({
      where: { role: "STAFF" },
      select: { id: true },
    });

    if (staffUsers.length > 0) {
      await prisma.notification.createMany({
        data: staffUsers.map((u) => ({
          userId: u.id,
          type: NotificationType.SUPPORT_NEW_TICKET,
          title: "Account deletion request",
          message: `${auth.email} requested account deletion.`,
          link: "/settings",
        })),
      });
    }

    return NextResponse.json({ ok: true, settings });
  } catch (e: any) {
    console.error("POST /api/settings/delete-request error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}