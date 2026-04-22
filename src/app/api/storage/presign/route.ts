import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

export async function POST(req: Request) {
  try {
    if (!url || !serviceKey) {
      return NextResponse.json(
        { error: "Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 }
      );
    }

    // ✅ Bearer Token vom Client (damit auth.uid() in Storage-RLS stimmt)
    const authHeader = req.headers.get("authorization") || "";
    const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!jwt) {
      return NextResponse.json({ error: "Missing Authorization Bearer token" }, { status: 401 });
    }

    // ✅ User aus JWT holen
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(jwt);
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = (await req.json()) as { bucket?: string; path?: string };

    const bucket = (body.bucket?.trim() || "ugc").trim();
    const path = body.path?.trim();

    if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

    // ✅ Supabase RLS in storage.objects soll auf auth.uid() prüfen.
    // Dafür müssen wir als "User" signieren -> createSignedUploadUrl mit user JWT Kontext.
    // Trick: wir erstellen einen Client, der den JWT als Auth Header nutzt.
    const supabaseUser = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false },
    });

    const { data, error } = await supabaseUser.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Presign failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      bucket,
      path: data.path,
      token: data.token,
      signedUrl: data.signedUrl,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}