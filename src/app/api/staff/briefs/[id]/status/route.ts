import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/auth-server";

const ALLOWED = ["SUBMITTED", "REVIEW", "IN_PROGRESS", "DONE", "DECLINED"] as const;

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireStaff(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await ctx.params;

  const body = await req.json().catch(() => ({}));
  const nextStatus = String(body?.status ?? "").toUpperCase();

  if (!ALLOWED.includes(nextStatus as any)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const brief = await prisma.brief.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!brief) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.brief.update({
    where: { id },
    data: { status: nextStatus as any },
    select: { id: true, status: true, updatedAt: true },
  });

  return NextResponse.json({ ok: true, brief: updated });
}