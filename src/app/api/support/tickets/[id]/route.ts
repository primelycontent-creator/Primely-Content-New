import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/auth-server";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await ctx.params;

  const ticket = await prisma.supportTicket.findFirst({
    where: auth.role === "STAFF" ? { id } : { id, userId: auth.userId },
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
      brief: {
        select: {
          id: true,
          title: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          message: true,
          senderRole: true,
          createdAt: true,
          sender: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, ticket });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const rawStatus = String(body?.status ?? "").toUpperCase().trim();

  if (!["OPEN", "IN_PROGRESS", "CLOSED"].includes(rawStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await prisma.supportTicket.findFirst({
    where: auth.role === "STAFF" ? { id } : { id, userId: auth.userId },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.supportTicket.update({
    where: { id },
    data: { status: rawStatus as any },
    select: {
      id: true,
      status: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ ok: true, ticket: updated });
}