import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDbUserFromToken } from "@/lib/auth-server";
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

export async function GET(req: Request) {
  try {
    const auth = await getDbUserFromToken(req);

    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,

        brandProfile: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            contactEmail: true,
            contactPhone: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            postalCode: true,
            country: true,
          },
        },

        creatorProfile: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            postalCode: true,
            country: true,
            workMode: true,
            nicheGroup: true,
            niches: true,
            portfolioUrl: true,
            bio: true,
            instagram: true,
            tiktok: true,
            equipment: true,
            price30sCents: true,
            introVideoAssetId: true,
            approvalStatus: true,
            approvedAt: true,
            approvedByUserId: true,
            rejectionReason: true,
          },
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in DB" },
        { status: 404 }
      );
    }

    const token = getToken(req);
    let emailConfirmed = false;

    if (token) {
      const { data: supabaseUserData, error: supabaseUserErr } =
        await supabaseAdmin.auth.getUser(token);

      if (!supabaseUserErr && supabaseUserData?.user?.email_confirmed_at) {
        emailConfirmed = true;
      }
    }

    return NextResponse.json({
      ok: true,
      user: {
        ...dbUser,
        emailConfirmed,
      },
    });
  } catch (e: any) {
    console.error("api/me GET error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}