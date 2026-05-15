import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      business_name,
      business_type,
      industry,
      city,
      state,
      employee_count,
      annual_revenue,
      years_in_business,
      qualifiers,
      additional_context,
    } = body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // Insert into report_orders table
    const { data: order, error: insertError } = await supabaseAdmin
      .from("report_orders")
      .insert({
        email,
        business_name,
        business_type,
        industry,
        city,
        state,
        employee_count,
        annual_revenue,
        years_in_business,
        qualifiers: qualifiers || [],
        additional_context,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !order) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.grantcrafter.com";

    // Create Stripe Checkout session (one-time payment)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // payment_method_types: automatic — Link disabled at account level, Google Pay + Apple Pay show via express checkout
      line_items: [
        {
          price: process.env.STRIPE_REPORT_PRICE_ID!,
          quantity: 1,
        },
      ],
      // automatic_tax requires business address in Stripe Dashboard (Settings → Tax)
      // automatic_tax: { enabled: true },
      payment_intent_data: {
        statement_descriptor: "GRANTCRAFTER",
        description: "GrantCrafter - Business Grant Report",
      },
      custom_text: {
        submit: { message: "🔒 Secured by Stripe · 7-day money-back guarantee · Your grant report delivered by email within 2–3 minutes" },
      },
      customer_email: email,
      success_url: `${appUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?canceled=true`,
      metadata: {
        order_id: order.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
