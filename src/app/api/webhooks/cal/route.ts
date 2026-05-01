import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function getResponseValue(payload: any, key: string) {
  return payload?.responses?.[key]?.value ?? null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = body?.payload ?? {};

    const calBookingId = payload?.bookingId ? String(payload.bookingId) : null;
    const calUid = payload?.uid ? String(payload.uid) : null;

    const attendee = payload?.attendees?.[0] ?? null;

    const attendeeName =
      attendee?.name ??
      getResponseValue(payload, "name") ??
      null;

    const attendeeEmail =
      attendee?.email ??
      getResponseValue(payload, "email") ??
      null;

    const attendeePhone =
      attendee?.phoneNumber ??
      getResponseValue(payload, "attendeePhoneNumber") ??
      null;

    const videoCallUrl =
      payload?.metadata?.videoCallUrl ??
      payload?.videoCallData?.url ??
      null;

    const eventTitle =
      payload?.eventTitle ??
      payload?.title ??
      null;

    const startTime = payload?.startTime ? new Date(payload.startTime) : null;
    const endTime = payload?.endTime ? new Date(payload.endTime) : null;

    const bookingType = String(eventTitle ?? "")
      .toLowerCase()
      .includes("nachtermin")
      ? "FOLLOW_UP"
      : "NEW_BRIEFING";

    const savedBooking = await prisma.CalendarBooking.upsert({
      where: {
        calUid: calUid ?? `missing-${Date.now()}`,
      },
      update: {
        calBookingId,
        triggerEvent: body?.triggerEvent ?? "UNKNOWN",
        eventTypeId: payload?.eventTypeId ?? null,
        eventTitle,
        bookingType,
        attendeeName,
        attendeeEmail,
        attendeePhone,
        startTime,
        endTime,
        videoCallUrl,
        status: payload?.status ?? null,
        rawPayload: body,
      },
      create: {
        calBookingId,
        calUid,
        triggerEvent: body?.triggerEvent ?? "UNKNOWN",
        eventTypeId: payload?.eventTypeId ?? null,
        eventTitle,
        bookingType,
        attendeeName,
        attendeeEmail,
        attendeePhone,
        startTime,
        endTime,
        videoCallUrl,
        status: payload?.status ?? null,
        rawPayload: body,
      },
    });

    console.log("CAL BOOKING SAVED:", savedBooking.id);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("CAL WEBHOOK ERROR:", e);
    return NextResponse.json(
      { error: e?.message ?? "Webhook error" },
      { status: 500 }
    );
  }
}