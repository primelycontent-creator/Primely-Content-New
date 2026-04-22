import { NextResponse } from "next/server";

function mask(v?: string | null) {
  if (!v) return null;
  const s = String(v);
  return `${s.slice(0, 6)}...${s.slice(-6)} (len:${s.length})`;
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;

  // nur Domain anzeigen (kein Secret)
  const host = url ? new URL(url).host : null;

  return NextResponse.json({
    supabaseUrlHost: host,
    supabaseAnonMasked: mask(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serviceRoleMasked: mask(process.env.SUPABASE_SERVICE_ROLE_KEY),
    nodeEnv: process.env.NODE_ENV ?? null,
  });
}