import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { Resend } from "resend";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { buildRecoveryEmail, getRecoveryEmailSubject } from "@/lib/abandoned-cart-email";

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
        // Statement descriptor on the customer's card statement.
        // Max 22 chars; combined with the account-level shortened descriptor on issuer apps.
        statement_descriptor: "GRANTCRAFTER.COM",
        statement_descriptor_suffix: "GRANT REPORT",
        description: "GrantCrafter — Business Grant Report",
      },
      return_url: `${appUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        order_id: order.id,
      },
    });

    // Schedule abandoned-cart recovery email for exactly 1 hour later.
    // If the customer pays before then, the webhook will cancel this email.
    after(async () => {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY!);
        const businessName = business_name || "your business";
        const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        const { data, error: resendError } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "reports@grantcrafter.com",
          to: email,
          subject: getRecoveryEmailSubject(businessName),
          html: buildRecoveryEmail(businessName, appUrl),
          scheduledAt,
        });
        if (resendError) {
          console.error("Schedule recovery email error:", resendError);
          return;
        }
        if (data?.id) {
          await supabaseAdmin
            .from("report_orders")
            .update({ recovery_email_id: data.id })
            .eq("id", order.id);
        }
      } catch (err) {
        console.error("Failed to schedule recovery email:", err);
      }
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
