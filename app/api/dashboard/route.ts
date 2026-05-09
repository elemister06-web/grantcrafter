import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select(
      "id, email, business_name, subscription_status, grant_reports(id, month, report_content, sent_at)"
    )
    .eq("email", email.toLowerCase())
    .single();

  if (error || !user) {
    return NextResponse.json(
      { error: "No account found for that email address." },
      { status: 404 }
    );
  }

  // Sort reports newest first
  if (user.grant_reports) {
    (user.grant_reports as { month: string }[]).sort((a, b) =>
      b.month.localeCompare(a.month)
    );
  }

  return NextResponse.json(user);
}
