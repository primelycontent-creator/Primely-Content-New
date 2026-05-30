import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = body?.payload ?? {};

    console.log("CAL WEBHOOK RECEIVED:", JSON.stringify(body, null, 2));

    const uid = payload?.uid ? String(payload.uid) : null;
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

    const attendee = payload?.attendees?.[0];

    const briefId =
      payload?.metadata?.briefId ||
      payload?.customInputs?.briefId ||
      payload?.responses?.briefId?.value ||
      null;

    const bookingType =
      payload?.metadata?.bookingType ||
      payload?.customInputs?.bookingType ||
      "INITIAL";

    const startTime = payload?.startTime ? new Date(payload.startTime) : null;
    const endTime = payload?.endTime ? new Date(payload.endTime) : null;
    const videoCallUrl =
      payload?.videoCallData?.url ||
      payload?.metadata?.videoCallUrl ||
      payload?.platformBookingUrl ||
      null;

    await prisma.calendarBooking.upsert({
      where: { calUid: uid },
      update: {
        triggerEvent: body?.triggerEvent || "UNKNOWN",
        status: payload?.status || null,
        videoCallUrl,
        startTime,
        endTime,
        rawPayload: body,
      },
      create: {
        calUid: uid,
        calBookingId: payload?.bookingId ? String(payload.bookingId) : null,
        triggerEvent: body?.triggerEvent || "UNKNOWN",
        eventTypeId: payload?.eventTypeId ?? null,
        eventTitle: payload?.eventTitle || payload?.title || null,
        bookingType,
        briefId,
        attendeeName: attendee?.name || null,
        attendeeEmail: attendee?.email || null,
        attendeePhone: attendee?.phoneNumber || null,
        startTime,
        endTime,
        videoCallUrl,
        status: payload?.status || null,
        rawPayload: body,
      },
    });

    if (briefId && body?.triggerEvent !== "BOOKING_CANCELLED") {
      await prisma.brief.update({
        where: { id: briefId },
        data: {
          consultationBooked: true,
          consultationBookedAt: startTime,
          consultationEventType: bookingType,
          consultationBookingUid: uid,
          consultationBookingUrl: videoCallUrl,
          consultationAttendeeName: attendee?.name || null,
          consultationAttendeeEmail: attendee?.email || null,
        },
      });
    }

    if (briefId && body?.triggerEvent === "BOOKING_CANCELLED") {
      await prisma.brief.update({
        where: { id: briefId },
        data: {
          consultationBooked: false,
          consultationBookedAt: null,
          consultationBookingUid: null,
          consultationBookingUrl: null,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("CAL WEBHOOK ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Webhook error" },
      { status: 500 }
    );
  }
}