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

    // Create Stripe Checkout session — EMBEDDED mode
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: "payment",
      line_items: [
        {
          price: process.env.STRIPE_REPORT_PRICE_ID!,
          quantity: 1,
        },
      ],
      payment_intent_data: {
        statement_descriptor: "GRANTCRAFTER",
        description: "GrantCrafter - Business Grant Report",
      },
      return_url: `${appUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        order_id: order.id,
      },
    });

    return NextResponse.json({
      clientSecret: session.client_secret,
      orderId: order.id,
    });
  } catch (err) {
    console.error("Checkout embedded error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
