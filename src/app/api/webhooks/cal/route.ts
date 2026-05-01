import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("CAL WEBHOOK RECEIVED:", JSON.stringify(body, null, 2));

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("CAL WEBHOOK ERROR:", e);
    return NextResponse.json(
      { error: e?.message ?? "Webhook error" },
      { status: 500 }
    );
  }
}