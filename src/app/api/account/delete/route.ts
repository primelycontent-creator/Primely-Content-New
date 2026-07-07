import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function getToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

export async function DELETE(req: Request) {
  try {
    const token = getToken(req);

    if (!token) {
      return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user?.id || !data.user?.email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const supabaseUserId = data.user.id;
    const email = data.user.email.toLowerCase();

    const dbUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (dbUser) {
      await prisma.user.delete({
        where: { id: dbUser.id },
      });
    }

    await supabaseAdmin.auth.admin.deleteUser(supabaseUserId);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/account/delete error:", e);

    return NextResponse.json(
      { error: e?.message ?? "Account konnte nicht gelöscht werden." },
      { status: 500 }
    );
  }
}