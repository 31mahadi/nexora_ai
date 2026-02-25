import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

const SECRET = process.env.REVALIDATE_SECRET;

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!SECRET || secret !== SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }
  try {
    revalidatePath("/");
    return NextResponse.json({ revalidated: true });
  } catch (e) {
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
