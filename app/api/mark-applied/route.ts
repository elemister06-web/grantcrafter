import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("gc_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reportId, grantSlug, grantName, applied } = await req.json();

  const { data: userData } = await supabaseAdmin
    .from("users").select("id").eq("email", user.email.toLowerCase()).single();
  if (!userData) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (applied) {
    await supabaseAdmin.from("grant_applications").upsert(
      { user_id: userData.id, report_id: reportId, grant_slug: grantSlug, grant_name: grantName },
      { onConflict: "user_id,report_id,grant_slug" }
    );
  } else {
    await supabaseAdmin.from("grant_applications")
      .delete()
      .eq("user_id", userData.id)
      .eq("report_id", reportId)
      .eq("grant_slug", grantSlug);
  }

  return NextResponse.json({ success: true });
}
