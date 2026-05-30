import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function asString(value: unknown) {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s.length ? s : null;
}

function asDate(value: unknown) {
  const s = asString(value);
  if (!s) return null;

  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function findBriefId(payload: any) {
  const direct =
    payload?.metadata?.briefId ||
    payload?.customInputs?.briefId ||
    payload?.responses?.briefId?.value ||
    payload?.responses?.briefId ||
    payload?.bookingFieldsResponses?.briefId?.value ||
    payload?.bookingFieldsResponses?.briefId ||
    null;

  if (direct) return asString(direct);

  const notes =
    payload?.metadata?.notes ||
    payload?.notes ||
    payload?.responses?.notes?.value ||
    payload?.responses?.notes ||
    payload?.description ||
    "";

  const match = String(notes).match(/(?:Kampagnen-ID|Briefing-ID|briefId|Brief-ID)\s*[:|]\s*([a-zA-Z0-9_-]+)/i);

  return match?.[1] ?? null;
}

function findBookingType(payload: any) {
  return (
    asString(payload?.metadata?.bookingType) ||
    asString(payload?.customInputs?.bookingType) ||
    asString(payload?.responses?.bookingType?.value) ||
    asString(payload?.responses?.bookingType) ||
    "INITIAL"
  );
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Cal webhook endpoint is alive." });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const payload = body?.payload ?? {};
    const triggerEvent = asString(body?.triggerEvent) || "UNKNOWN";

    console.log("CAL WEBHOOK RECEIVED:", JSON.stringify(body, null, 2));

    const uid =
      asString(payload?.uid) ||
      asString(payload?.bookingUid) ||
      asString(payload?.id) ||
      asString(payload?.bookingId);

    // Cal.com Pingtest sendet oft keinen echten Booking-Payload.
    // Deshalb nicht abbrechen, sondern sauber 200 zurückgeben.
    if (!uid) {
      console.log("CAL WEBHOOK PING/TEST RECEIVED:", JSON.stringify(body, null, 2));
      return NextResponse.json({ ok: true, test: true });
    }

    const attendee =
      Array.isArray(payload?.attendees) && payload.attendees.length > 0
        ? payload.attendees[0]
        : payload?.attendee || null;

    const briefId = findBriefId(payload);
    const bookingType = findBookingType(payload);

    const startTime = asDate(payload?.startTime || payload?.start);
    const endTime = asDate(payload?.endTime || payload?.end);

    const videoCallUrl =
      asString(payload?.videoCallData?.url) ||
      asString(payload?.videoCallUrl) ||
      asString(payload?.metadata?.videoCallUrl) ||
      asString(payload?.platformBookingUrl) ||
      asString(payload?.meetingUrl);

    await prisma.calendarBooking.upsert({
      where: { calUid: uid },
      update: {
        triggerEvent,
        status: asString(payload?.status),
        videoCallUrl,
        startTime,
        endTime,
        rawPayload: body,
      },
      create: {
        calUid: uid,
        calBookingId: asString(payload?.bookingId),
        triggerEvent,

        eventTypeId:
          typeof payload?.eventTypeId === "number"
            ? payload.eventTypeId
            : payload?.eventTypeId
            ? Number(payload.eventTypeId)
            : null,

        eventTitle: asString(payload?.eventTitle || payload?.title),
        bookingType,

        briefId,

        attendeeName: asString(attendee?.name),
        attendeeEmail: asString(attendee?.email),
        attendeePhone: asString(attendee?.phoneNumber || attendee?.phone),

        startTime,
        endTime,

        videoCallUrl,
        status: asString(payload?.status),

        rawPayload: body,
      },
    });

    if (briefId && triggerEvent !== "BOOKING_CANCELLED") {
      await prisma.brief.update({
        where: { id: briefId },
        data: {
          consultationBooked: true,
          consultationBookedAt: startTime,
          consultationEventType: bookingType,
          consultationBookingUid: uid,
          consultationBookingUrl: videoCallUrl,
          consultationAttendeeName: asString(attendee?.name),
          consultationAttendeeEmail: asString(attendee?.email),
        },
      });
    }

    if (briefId && triggerEvent === "BOOKING_CANCELLED") {
      await prisma.brief.update({
        where: { id: briefId },
        data: {
          consultationBooked: false,
          consultationBookedAt: null,
          consultationBookingUid: null,
          consultationBookingUrl: null,
          consultationAttendeeName: null,
          consultationAttendeeEmail: null,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      uid,
      briefId,
      bookingType,
      triggerEvent,
    });
  } catch (err: any) {
    console.error("CAL WEBHOOK ERROR:", err);
    return NextResponse.json(
      { error: err?.message ?? "Webhook error" },
      { status: 500 }
    );
  }
}