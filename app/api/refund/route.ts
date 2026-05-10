import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { email, reason, grantCount, improvement } = await req.json();

    if (!email || !reason) {
      return NextResponse.json({ error: "Email and reason are required" }, { status: 400 });
    }

    // Find the most recent completed order for this email (within 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: order } = await supabaseAdmin
      .from("report_orders")
      .select("id, email, stripe_session_id, status, created_at")
      .eq("email", email.toLowerCase())
      .eq("status", "completed")
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!order) {
      return NextResponse.json({
        error: "No eligible order found for this email within the 7-day refund window. Please contact support@grantcrafter.com.",
      }, { status: 404 });
    }

    // Find the Stripe PaymentIntent via the checkout session
    let stripeRefundId: string | null = null;
    try {
      if (order.stripe_session_id) {
        const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
        const paymentIntentId = session.payment_intent as string;
        if (paymentIntentId) {
          const refund = await stripe.refunds.create({ payment_intent: paymentIntentId });
          stripeRefundId = refund.id;
        }
      }
    } catch (stripeErr) {
      console.error("Stripe refund error:", stripeErr);
      // Still save feedback even if Stripe refund fails — handle manually
    }

    // Save feedback to Supabase
    await supabaseAdmin.from("refund_feedback").insert({
      email: email.toLowerCase(),
      order_id: order.id,
      site: "grantcrafter",
      reason,
      grant_count_received: grantCount ? parseInt(grantCount.replace("+", "").split("-")[0]) : null,
      improvement_text: improvement || null,
      stripe_refund_id: stripeRefundId,
    });

    // Mark order as refunded
    await supabaseAdmin
      .from("report_orders")
      .update({ status: "refunded" })
      .eq("id", order.id);

    console.log(`Refund processed for ${email} — reason: ${reason}`);

    return NextResponse.json({
      success: true,
      refundId: stripeRefundId,
      message: stripeRefundId
        ? "Refund processed. You'll see it on your statement in 5–7 business days."
        : "Refund request received. Our team will process it within 1 business day.",
    });
  } catch (err) {
    console.error("Refund error:", err);
    return NextResponse.json({ error: "Failed to process refund. Please email support@grantcrafter.com." }, { status: 500 });
  }
}
