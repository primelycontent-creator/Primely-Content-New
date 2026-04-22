import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-server";
import { NotificationType } from "@prisma/client";

function safeStr(v: any) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

export async function GET(req: Request) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const tickets = await prisma.supportTicket.findMany({
    where: auth.role === "STAFF" ? {} : { userId: auth.userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      subject: true,
      status: true,
      briefId: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  return NextResponse.json({ ok: true, tickets });
}

export async function POST(req: Request) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => ({}));

  const subject = safeStr(body?.subject);
  const message = safeStr(body?.message);
  const briefId = safeStr(body?.briefId);

  if (!subject) {
    return NextResponse.json({ error: "Missing subject" }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  if (briefId) {
    const brief = await prisma.brief.findFirst({
      where:
        auth.role === "BRAND"
          ? { id: briefId, brandId: auth.userId }
          : auth.role === "CREATOR"
          ? { id: briefId, assignedCreatorId: auth.userId }
          : { id: briefId },
      select: { id: true },
    });

    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: auth.userId,
      briefId: briefId ?? null,
      subject,
      status: "OPEN",
      messages: {
        create: {
          senderUserId: auth.userId,
          senderRole: auth.role,
          message,
        },
      },
    },
    select: {
      id: true,
      subject: true,
      status: true,
      briefId: true,
      createdAt: true,
      updatedAt: true,
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
        title: "New support ticket",
        message: `${auth.role} opened a new support ticket: ${subject}`,
        link: `/staff/support/${ticket.id}`,
      })),
    });
  }

  return NextResponse.json({ ok: true, ticket });
}