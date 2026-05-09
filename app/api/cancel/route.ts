import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("stripe_subscription_id, email")
      .eq("id", userId)
      .single();

    if (!user?.stripe_subscription_id) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    // Cancel at period end (not immediately — they keep access)
    await stripe.subscriptions.update(user.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    await supabaseAdmin
      .from("users")
      .update({ subscription_status: "canceling" })
      .eq("id", userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Cancel error:", err);
    return NextResponse.json({ error: "Failed to cancel" }, { status: 500 });
  }
}
