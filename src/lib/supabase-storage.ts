import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "product-images";
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const globalForSupabase = globalThis as unknown as {
  supabaseClient?: SupabaseClient;
  bucketEnsured?: boolean;
};

// Uses the service role key (server-only, never exposed to the client) so
// uploads don't need a Storage RLS policy — every upload goes through
// uploadProductImageAction, which already checks admin role.
function getSupabaseClient(): SupabaseClient {
  if (!globalForSupabase.supabaseClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set.");
    }
    globalForSupabase.supabaseClient = createClient(url, key);
  }
  return globalForSupabase.supabaseClient;
}

// Self-provisioning: creates the bucket (public read) on first use instead
// of requiring a manual dashboard step. Cached per server instance so this
// doesn't round-trip on every upload.
async function ensureBucket(supabase: SupabaseClient): Promise<void> {
  if (globalForSupabase.bucketEnsured) return;

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_FILE_BYTES,
  });
  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw error;
  }
  globalForSupabase.bucketEnsured = true;
}

export type UploadResult = { ok: true; url: string } | { ok: false; message: string };

export async function uploadProductImage(file: File): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, message: "Only JPG, PNG, or WEBP images are allowed." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, message: "Image must be under 5MB." };
  }

  let supabase: SupabaseClient;
  try {
    supabase = getSupabaseClient();
    await ensureBucket(supabase);
  } catch (err) {
    console.error("Supabase Storage not configured:", err);
    return { ok: false, message: "Image uploads aren't configured yet — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    console.error("Supabase Storage upload failed:", error);
    return { ok: false, message: "Upload failed — please try again." };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
