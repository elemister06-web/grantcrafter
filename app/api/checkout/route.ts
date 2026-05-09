import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.grantcrafter.com";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          source: "grantcrafter_web",
        },
      },
      metadata: {
        email,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
