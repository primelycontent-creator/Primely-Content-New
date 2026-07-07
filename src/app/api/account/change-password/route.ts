import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

function getToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

export async function POST(req: Request) {
  try {
    const token = getToken(req);

    if (!token) {
      return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    const currentPassword = String(body?.currentPassword ?? "");
    const newPassword = String(body?.newPassword ?? "");

    if (!currentPassword) {
      return NextResponse.json({ error: "Aktuelles Passwort fehlt." }, { status: 400 });
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Das neue Passwort muss mindestens 6 Zeichen lang sein." },
        { status: 400 }
      );
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !userData.user?.id || !userData.user?.email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = userData.user.id;
    const email = userData.user.email;

    const loginCheck = await supabaseAnon.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (loginCheck.error) {
      return NextResponse.json(
        { error: "Das aktuelle Passwort ist falsch." },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message ?? "Passwort konnte nicht geändert werden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("POST /api/account/change-password error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Passwort konnte nicht geändert werden." },
      { status: 500 }
    );
  }
}