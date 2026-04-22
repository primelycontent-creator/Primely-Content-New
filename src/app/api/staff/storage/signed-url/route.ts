import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireStaff } from "@/lib/auth-server";

function decodeJwtPayload(token?: string) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "===".slice((b64.length + 3) % 4);
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function normalizePath(input: string) {
  let p = String(input ?? "");
  p = p.replace(/\r/g, "").replace(/\n/g, "");
  p = p.trim().replace(/^\/+/, "");
  p = p.replace(/\\/g, "/").replace(/\/{2,}/g, "/");
  if (!p) throw new Error("Missing path");
  if (p.includes("..")) throw new Error("Invalid path");
  if (p.length > 900) throw new Error("Path too long");
  return p;
}

function folderOf(path: string) {
  const idx = path.lastIndexOf("/");
  if (idx <= 0) return "";
  return path.slice(0, idx + 1);
}

export async function POST(req: Request) {
  const auth = await requireStaff(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  const bucket = String(body?.bucket ?? "").trim();
  const rawPath = String(body?.path ?? "");

  if (!bucket) return NextResponse.json({ error: "Missing bucket" }, { status: 400 });
  if (!SUPABASE_URL) return NextResponse.json({ error: "Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL" }, { status: 500 });
  if (!SERVICE_ROLE_KEY) return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });

  let path = rawPath;
  try {
    path = normalizePath(path);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Invalid path" }, { status: 400 });
  }

  // Diagnose: Projekt-Ref aus URL und aus ServiceRole-JWT
  const urlRef = (() => {
    try {
      const u = new URL(SUPABASE_URL);
      // z.B. https://<ref>.supabase.co
      return u.hostname.split(".")[0] || null;
    } catch {
      return null;
    }
  })();

  const servicePayload = decodeJwtPayload(SERVICE_ROLE_KEY);
  const serviceRef =
    servicePayload?.ref ||
    servicePayload?.project_ref ||
    (typeof servicePayload?.iss === "string" ? servicePayload.iss.split("/").pop() : null) ||
    null;

  console.log("SIGNED-URL request:", { bucket, path, urlRef, serviceRef });

  // 1) Signed URL
  const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, 60 * 10);

  if (error || !data?.signedUrl) {
    // 2) Folder listing (wichtig!)
    const folder = folderOf(path);
    let listed: string[] = [];
    if (folder) {
      const { data: listData, error: listErr } = await supabaseAdmin.storage.from(bucket).list(folder, { limit: 100 });
      if (!listErr && Array.isArray(listData)) listed = listData.map((x: any) => x?.name).filter(Boolean);
    }

    const statusCode = (error as any)?.statusCode;
    const isNotFound = statusCode === "404" || /not found/i.test(error?.message ?? "");

    const hint =
      listed.length === 0
        ? "listed ist leer ⇒ Server sieht in diesem Projekt/Bucket keine Dateien. Fast sicher: SUPABASE_SERVICE_ROLE_KEY passt NICHT zu SUPABASE_URL (anderes Supabase-Projekt/Environment)."
        : "Folder hat Dateien, aber nicht diese ⇒ path mismatch (stored path != object key).";

    console.log("SIGNED-URL error:", {
      bucket,
      path,
      folder,
      listed,
      msg: error?.message,
      statusCode,
      urlRef,
      serviceRef,
    });

    return NextResponse.json(
      {
        error: error?.message ?? "Failed to sign url",
        bucket,
        path,
        folder,
        listed,
        hint,
        urlRef,
        serviceRef,
      },
      { status: isNotFound ? 404 : 500 }
    );
  }

  return NextResponse.json({ signedUrl: data.signedUrl });
}