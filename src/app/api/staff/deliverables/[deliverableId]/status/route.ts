import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/auth-server";

const ALLOWED = ["PENDING", "CHANGES_REQUESTED", "APPROVED"] as const;

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireStaff(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await ctx.params;
  const body = await req.json();
  const status = String(body?.status ?? "").toUpperCase();

  if (!ALLOWED.includes(status as any)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.deliverable.update({
    where: { id },
    data: { status: status as any },
    select: { id: true, status: true, briefId: true },
  });

  // Wenn alle Deliverables APPROVED -> Brief DONE
  const counts = await prisma.deliverable.groupBy({
    by: ["status"],
    where: { briefId: updated.briefId },
    _count: { _all: true },
  });

  const total = counts.reduce((a, c) => a + c._count._all, 0);
  const approved = counts.find((c) => c.status === "APPROVED")?._count._all ?? 0;

  if (total > 0 && approved === total) {
    await prisma.brief.update({
      where: { id: updated.briefId },
      data: { status: "DONE" },
    });
  }

  return NextResponse.json({ ok: true, deliverable: updated });
}