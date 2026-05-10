import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/profile — returns full user profile
export async function GET(req: NextRequest) {
  const token = req.cookies.get("gc_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: userData, error } = await supabaseAdmin
    .from("users")
    .select("id, email, business_name, business_type, industry, city, state, employee_count, annual_revenue, years_in_business, qualifiers, additional_context, subscription_status, created_at")
    .eq("email", user.email.toLowerCase())
    .single();

  if (error || !userData) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(userData);
}

// PATCH /api/profile — update profile fields
export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("gc_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Only allow safe fields to be updated
  const allowed = ["business_name", "business_type", "industry", "city", "state", "employee_count", "annual_revenue", "years_in_business", "qualifiers", "additional_context"];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("users")
    .update(update)
    .eq("email", user.email.toLowerCase());

  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  return NextResponse.json({ success: true });
}
