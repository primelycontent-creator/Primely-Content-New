import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const secret = req.headers.get("x-cal-secret");

    if (process.env.CAL_WEBHOOK_SECRET && secret !== process.env.CAL_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
    }

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