import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("CAL WEBHOOK RECEIVED:", JSON.stringify(body, null, 2));

    const payload = body.payload;

    const uid = payload?.uid;
    const calBookingId = String(payload?.bookingId || "");

    // 🔑 Wichtig: customInput für BriefId
    const briefId = payload?.metadata?.briefId || null;

    const attendee = payload?.attendees?.[0];

    await prisma.calendarBooking.upsert({
      where: {
        calUid: uid,
      },
      update: {
        status: payload?.status,
        videoCallUrl: payload?.videoCallData?.url,
      },
      create: {
        calUid: uid,
        calBookingId,
        triggerEvent: body.triggerEvent,

        eventTypeId: payload?.eventTypeId,
        eventTitle: payload?.eventTitle,

        bookingType: briefId ? "FOLLOW_UP" : "INITIAL",

        briefId,

        attendeeName: attendee?.name,
        attendeeEmail: attendee?.email,
        attendeePhone: attendee?.phoneNumber,

        startTime: payload?.startTime ? new Date(payload.startTime) : null,
        endTime: payload?.endTime ? new Date(payload.endTime) : null,

        videoCallUrl: payload?.videoCallData?.url,
        status: payload?.status,

        rawPayload: body,
      },
    });

    // 🔥 OPTIONAL: Brief automatisch updaten
    if (briefId) {
      await prisma.brief.update({
        where: { id: briefId },
        data: {
          consultationBooked: true,
          consultationBookedAt: payload?.startTime ? new Date(payload.startTime) : null,
          consultationBookingUid: uid,
          consultationBookingUrl: payload?.videoCallData?.url,
          consultationAttendeeName: attendee?.name,
          consultationAttendeeEmail: attendee?.email,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("CAL WEBHOOK ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}