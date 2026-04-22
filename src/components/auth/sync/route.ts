import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Role = "BRAND" | "CREATOR" | "STAFF";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      id: string;
      email: string;
      role: Role;
    };

    const { id, email, role } = body;

    if (!id || !email || !role) {
      return NextResponse.json(
        { error: "Missing id/email/role" },
        { status: 400 }
      );
    }

    // Staff is not selectable in UI, but might be created manually later.
    if (!["BRAND", "CREATOR", "STAFF"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Upsert user
    const user = await prisma.user.upsert({
      where: { id },
      update: { email, role },
      create: { id, email, role },
    });

    // Ensure profile exists
    if (role === "BRAND") {
      await prisma.brandProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      });
    }

    if (role === "CREATOR") {
      await prisma.creatorProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
