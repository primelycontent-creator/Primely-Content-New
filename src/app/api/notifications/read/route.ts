import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const id = String(body?.id ?? "").trim();

    if (!id) {
      return NextResponse.json({ error: "Missing notification id" }, { status: 400 });
    }

    const existing = await prisma.notification.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
      select: {
        id: true,
        read: true,
      },
    });

    return NextResponse.json({ ok: true, notification: updated });
  } catch (e: any) {
    console.error("POST /api/notifications/read error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}