import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  // Read the auth token from the httpOnly cookie
  const token = req.cookies.get("gc_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify the token with Supabase
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = user.email.toLowerCase();

  // Look up the user in our custom table
  const { data: userData, error } = await supabaseAdmin
    .from("users")
    .select(
      "id, email, business_name, subscription_status, created_at, grant_reports(id, month, report_content, sent_at)"
    )
    .eq("email", email)
    .single();

  if (error || !userData) {
    return NextResponse.json(
      { error: "No account found." },
      { status: 404 }
    );
  }

  // Sort reports newest first
  if (userData.grant_reports) {
    (userData.grant_reports as { month: string }[]).sort((a, b) =>
      b.month.localeCompare(a.month)
    );
  }

  // Also fetch grant applications for this user
  const { data: applications } = await supabaseAdmin
    .from("grant_applications")
    .select("report_id, grant_slug")
    .eq("user_id", userData.id);

  return NextResponse.json({ ...userData, applications: applications || [] });
}
