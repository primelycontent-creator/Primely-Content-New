import { NextResponse, type NextRequest } from "next/server";

export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/brand/:path*", "/creator/:path*", "/staff/:path*"],
};