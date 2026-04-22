import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-server";
import { NotificationType } from "@prisma/client";

function safeStr(v: any) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const message = safeStr(body?.message);

  if (!message) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.findFirst({
    where: auth.role === "STAFF" ? { id } : { id, userId: auth.userId },
    select: {
      id: true,
      userId: true,
      subject: true,
      status: true,
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const created = await prisma.supportMessage.create({
    data: {
      ticketId: ticket.id,
      senderUserId: auth.userId,
      senderRole: auth.role,
      message,
    },
    select: {
      id: true,
      message: true,
      senderRole: true,
      createdAt: true,
    },
  });

  await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: {
      status: auth.role === "STAFF" ? "IN_PROGRESS" : "OPEN",
    },
  });

  if (auth.role === "STAFF") {
    await prisma.notification.create({
      data: {
        userId: ticket.userId,
        type: NotificationType.SUPPORT_NEW_MESSAGE,
        title: "New support reply",
        message: `Staff replied to your ticket: ${ticket.subject}`,
        link:
          ticket.user.role === "BRAND"
            ? `/brand/support/${ticket.id}`
            : `/creator/support/${ticket.id}`,
      },
    });
  } else {
    const staffUsers = await prisma.user.findMany({
      where: { role: "STAFF" },
      select: { id: true },
    });

    if (staffUsers.length > 0) {
      await prisma.notification.createMany({
        data: staffUsers.map((u) => ({
          userId: u.id,
          type: NotificationType.SUPPORT_NEW_MESSAGE,
          title: "Support ticket updated",
          message: `${auth.role} replied to support ticket: ${ticket.subject}`,
          link: `/staff/support/${ticket.id}`,
        })),
      });
    }
  }

  return NextResponse.json({ ok: true, message: created });
}