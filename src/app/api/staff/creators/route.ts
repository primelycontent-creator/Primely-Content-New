import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/auth-server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function safeStr(v: string | null) {
  return String(v ?? "").trim();
}

async function createSignedUrl(bucket: string, path: string) {
  if (!bucket || !path) return null;

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function GET(req: Request) {
  const auth = await requireStaff(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);

  const q = safeStr(searchParams.get("q"));
  const nicheGroup = safeStr(searchParams.get("nicheGroup"));
  const country = safeStr(searchParams.get("country"));
  const workMode = safeStr(searchParams.get("workMode"));
  const approvalStatus = safeStr(searchParams.get("approvalStatus"));
  const onlyVerified = safeStr(searchParams.get("onlyVerified")) === "true";
  const sort = safeStr(searchParams.get("sort")) || "newest";

  const creators = await prisma.user.findMany({
    where: {
      role: "CREATOR",
      creatorProfile: {
        is: {
          ...(nicheGroup ? { nicheGroup } : {}),
          ...(country ? { country: { contains: country, mode: "insensitive" } } : {}),
          ...(workMode === "FULL_TIME" || workMode === "PART_TIME"
            ? { workMode: workMode as any }
            : {}),
          ...(approvalStatus === "PENDING" || approvalStatus === "APPROVED" || approvalStatus === "REJECTED"
            ? { approvalStatus: approvalStatus as any }
            : {}),
          ...(q
            ? {
                OR: [
                  { fullName: { contains: q, mode: "insensitive" } },
                  { nicheGroup: { contains: q, mode: "insensitive" } },
                  { niches: { has: q } },
                  { bio: { contains: q, mode: "insensitive" } },
                  { city: { contains: q, mode: "insensitive" } },
                  { country: { contains: q, mode: "insensitive" } },
                ],
              }
            : {}),
        },
      },
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              {
                creatorProfile: {
                  is: {
                    OR: [
                      { fullName: { contains: q, mode: "insensitive" } },
                      { nicheGroup: { contains: q, mode: "insensitive" } },
                      { bio: { contains: q, mode: "insensitive" } },
                      { city: { contains: q, mode: "insensitive" } },
                      { country: { contains: q, mode: "insensitive" } },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      creatorProfile: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          city: true,
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
          profileImageAssetId: true,
          approvalStatus: true,
          approvedAt: true,
          approvedByUserId: true,
          rejectionReason: true,
          profileImageAsset: {
            select: {
              bucket: true,
              path: true,
              fileName: true,
            },
          },
        },
      },
      _count: {
        select: {
          assignedBriefs: true,
          deliverables: true,
        },
      },
    },
  });

  const withMeta = await Promise.all(
    creators.map(async (creator) => {
      const image = creator.creatorProfile?.profileImageAsset;
      const profileImageUrl =
        image?.bucket && image?.path
          ? await createSignedUrl(image.bucket, image.path)
          : null;

      const { data: supabaseUserData } = await supabaseAdmin.auth.admin.getUserById(creator.id);
      const emailConfirmed = !!supabaseUserData?.user?.email_confirmed_at;

      const approval = creator.creatorProfile?.approvalStatus === "APPROVED";
      const isVerified = approval && emailConfirmed;

      return {
        ...creator,
        profileImageUrl,
        emailConfirmed,
        isVerified,
      };
    })
  );

  let filtered = [...withMeta];

  if (onlyVerified) {
    filtered = filtered.filter((x) => x.isVerified);
  }

  if (sort === "updated") {
    filtered.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  } else if (sort === "name_asc") {
    filtered.sort((a, b) =>
      (a.creatorProfile?.fullName || a.email).localeCompare(
        b.creatorProfile?.fullName || b.email
      )
    );
  } else if (sort === "name_desc") {
    filtered.sort((a, b) =>
      (b.creatorProfile?.fullName || b.email).localeCompare(
        a.creatorProfile?.fullName || a.email
      )
    );
  } else if (sort === "price_asc") {
    filtered.sort(
      (a, b) =>
        (a.creatorProfile?.price30sCents ?? Number.MAX_SAFE_INTEGER) -
        (b.creatorProfile?.price30sCents ?? Number.MAX_SAFE_INTEGER)
    );
  } else if (sort === "price_desc") {
    filtered.sort(
      (a, b) =>
        (b.creatorProfile?.price30sCents ?? -1) -
        (a.creatorProfile?.price30sCents ?? -1)
    );
  } else {
    filtered.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }

  return NextResponse.json({
    ok: true,
    creators: filtered,
  });
}