import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireBrand } from "@/lib/auth-server";

function safeStr(v: any) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireBrand(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id: briefId } = await ctx.params;
    if (!briefId) {
      return NextResponse.json({ error: "Missing brief id" }, { status: 400 });
    }

    const existing = await prisma.brief.findFirst({
      where: {
        id: briefId,
        brandId: auth.userId,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));

    const bookingUid =
      safeStr(body?.uid) ||
      safeStr(body?.bookingUid) ||
      safeStr(body?.bookingId) ||
      `manual-${briefId}-${Date.now()}`;

    const bookingUrl =
      safeStr(body?.bookingUrl) ||
      safeStr(body?.videoCallUrl) ||
      safeStr(body?.meetingUrl);

    const attendeeName = safeStr(body?.attendeeName);
    const attendeeEmail = safeStr(body?.attendeeEmail);

    const updated = await prisma.brief.update({
      where: { id: briefId },
      data: {
        consultationBooked: true,
        consultationBookedAt: new Date(),
        consultationEventType: "INITIAL",
        consultationBookingUid: bookingUid,
        consultationBookingUrl: bookingUrl,
        consultationAttendeeName: attendeeName,
        consultationAttendeeEmail: attendeeEmail,
      },
      select: {
        id: true,
        consultationBooked: true,
        consultationBookedAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      brief: updated,
    });
  } catch (e: any) {
    console.error("POST consultation confirm error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}