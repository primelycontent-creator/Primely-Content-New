import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";
import { DeliverableStatus, NotificationType } from "@prisma/client";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function getToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

async function getAuthedStaff(req: Request) {
  const token = getToken(req);
  if (!token) return { error: "Missing bearer token", status: 401 as const };

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData?.user?.email) return { error: "Invalid token", status: 401 as const };

  const email = userData.user.email.toLowerCase();
  const dbUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });

  if (!dbUser || dbUser.role !== "STAFF") return { error: "Forbidden", status: 403 as const };
  return { userId: dbUser.id };
}

export async function PATCH(req: Request, ctx: { params: Promise<{ deliverableId: string }> }) {
  try {
    const auth = await getAuthedStaff(req);
    if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { deliverableId } = await ctx.params;
    if (!deliverableId) {
      return NextResponse.json({ error: "Missing deliverable id" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const statusStr = String(body?.status ?? "").toUpperCase().trim();
    const feedback = String(body?.feedback ?? "").trim();

    const nextStatus =
      statusStr === "APPROVED"
        ? DeliverableStatus.APPROVED
        : statusStr === "CHANGES_REQUESTED"
        ? DeliverableStatus.CHANGES_REQUESTED
        : null;

    if (!nextStatus) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (nextStatus === DeliverableStatus.CHANGES_REQUESTED && !feedback) {
      return NextResponse.json(
        { error: "Feedback required when requesting changes" },
        { status: 400 }
      );
    }

    const existing = await prisma.deliverable.findUnique({
      where: { id: deliverableId },
      select: {
        id: true,
        briefId: true,
        creatorId: true,
        brief: { select: { title: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Deliverable not found" }, { status: 404 });
    }

    const updated = await prisma.deliverable.update({
      where: { id: deliverableId },
      data: {
        status: nextStatus,
        staffFeedback: nextStatus === DeliverableStatus.CHANGES_REQUESTED ? feedback : null,
      },
      select: {
        id: true,
        status: true,
        staffFeedback: true,
        briefId: true,
        creatorId: true,
      },
    });

    if (nextStatus === DeliverableStatus.CHANGES_REQUESTED) {
      await prisma.notification.create({
        data: {
          userId: existing.creatorId,
          type: NotificationType.STAFF_CHANGES_REQUESTED,
          title: "Staff requested changes",
          message: `Changes were requested for "${existing.brief.title}".`,
          link: `/creator/briefs/${existing.briefId}`,
        },
      });
    }

    if (nextStatus === DeliverableStatus.APPROVED) {
      const brandOwner = await prisma.brief.findUnique({
        where: { id: existing.briefId },
        select: { brandId: true, title: true },
      });

      if (brandOwner?.brandId) {
        await prisma.notification.create({
          data: {
            userId: brandOwner.brandId,
            type: NotificationType.CREATOR_UPLOAD,
            title: "New deliverable approved by staff",
            message: `A deliverable for "${brandOwner.title}" is ready for your review.`,
            link: `/brand/briefs/${existing.briefId}`,
          },
        });
      }
    }

    return NextResponse.json({ ok: true, deliverable: updated });
  } catch (e: any) {
    console.error("PATCH staff deliverable error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}