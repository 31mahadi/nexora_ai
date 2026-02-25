import { createClient } from "@/lib/supabase-server";
import { requireTenantAdmin } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireTenantAdmin();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: "File too large (max 5MB)" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ message: "Invalid file type" }, { status: 400 });
    }
    const supabase = await createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${ctx.tenantId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { data, error } = await supabase.storage
      .from("portfolio-images")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });
    if (error) {
      if (error.message?.includes("Bucket not found") || error.message?.includes("not found")) {
        return NextResponse.json(
          { message: "Image storage not configured. Use URL instead or configure Supabase Storage bucket 'portfolio-images'." },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    const { data: urlData } = supabase.storage.from("portfolio-images").getPublicUrl(data.path);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
