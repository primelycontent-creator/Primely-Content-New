import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function uploadBriefFile(file: File) {
  // 1) path bauen
  const ext = file.name.split(".").pop() || "file";
  const safeName = file.name.replace(/\s+/g, "-");
  const path = `briefs/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

  // 2) presign holen
  const presignRes = await fetch("/api/storage/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bucket: "briefs", path }),
  });

  const presignText = await presignRes.text();
  if (!presignRes.ok) {
    throw new Error(`Presign failed: ${presignText}`);
  }

  const presign = JSON.parse(presignText) as {
    bucket: string;
    path: string;
    token: string;
    signedUrl?: string;
  };

  // 3) Upload über Supabase signed upload
  const { data, error } = await supabase.storage
    .from(presign.bucket)
    .uploadToSignedUrl(presign.path, presign.token, file, {
      contentType: file.type,
    });

  if (error) throw new Error(error.message);

  // data enthält i.d.R. { path: '...' }
  return {
    bucket: presign.bucket,
    path: presign.path,
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  };
}
