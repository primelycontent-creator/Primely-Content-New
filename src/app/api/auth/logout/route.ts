import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });

  // kill role cookie used by middleware
  res.cookies.set("pc_role", "", {
    path: "/",
    maxAge: 0,
  });

  return res;
}
