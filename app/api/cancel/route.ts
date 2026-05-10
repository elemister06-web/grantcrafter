import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    // Verify auth from cookie
    const token = req.cookies.get("gc_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("id, stripe_subscription_id")
      .eq("email", user.email.toLowerCase())
      .single();

    if (!userData?.stripe_subscription_id) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    await stripe.subscriptions.update(userData.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    await supabaseAdmin
      .from("users")
      .update({ subscription_status: "canceling" })
      .eq("id", userData.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Cancel error:", err);
    return NextResponse.json({ error: "Failed to cancel" }, { status: 500 });
  }
}
