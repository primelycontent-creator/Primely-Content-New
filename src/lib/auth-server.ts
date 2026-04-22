import { createClient } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function getToken(req: Request) {
  const h = req.headers.get("authorization") || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
}

export async function getDbUserFromToken(req: Request) {
  const token = getToken(req);

  if (!token) {
    return {
      ok: false as const,
      status: 401 as const,
      error: "Missing bearer token",
    };
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data?.user?.email) {
    return {
      ok: false as const,
      status: 401 as const,
      error: "Invalid token",
    };
  }

  const email = data.user.email.toLowerCase().trim();

  const dbUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  if (!dbUser) {
    return {
      ok: false as const,
      status: 404 as const,
      error: "User not found in DB",
    };
  }

  return {
    ok: true as const,
    userId: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
  };
}

export async function requireUser(req: Request) {
  return getDbUserFromToken(req);
}

export async function requireBrand(req: Request) {
  const u = await getDbUserFromToken(req);
  if (!u.ok) return u;

  if (u.role !== "BRAND") {
    return {
      ok: false as const,
      status: 403 as const,
      error: "Forbidden",
    };
  }

  return u;
}

export async function requireCreator(req: Request) {
  const u = await getDbUserFromToken(req);
  if (!u.ok) return u;

  if (u.role !== "CREATOR") {
    return {
      ok: false as const,
      status: 403 as const,
      error: "Forbidden",
    };
  }

  return u;
}

export async function requireStaff(req: Request) {
  const u = await getDbUserFromToken(req);
  if (!u.ok) return u;

  if (u.role !== "STAFF") {
    return {
      ok: false as const,
      status: 403 as const,
      error: "Forbidden",
    };
  }

  return u;
}