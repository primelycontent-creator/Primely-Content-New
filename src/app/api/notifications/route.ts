import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function getToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

async function getAuthedUser(req: Request) {
  const token = getToken(req);
  if (!token) return { ok: false as const, status: 401, error: "Missing bearer token" };

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData?.user?.email) {
    return { ok: false as const, status: 401, error: "Invalid token" };
  }

  const email = userData.user.email.toLowerCase();

  const dbUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, email: true },
  });

  if (!dbUser) {
    return { ok: false as const, status: 404, error: "User not found" };
  }

  return { ok: true as const, userId: dbUser.id, role: dbUser.role, email: dbUser.email };
}

export async function GET(req: Request) {
  try {
    const auth = await getAuthedUser(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unread = notifications.filter((n) => !n.read).length;

    return NextResponse.json({
      notifications,
      unread,
    });
  } catch (e: any) {
    console.error("GET /api/notifications error:", e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}