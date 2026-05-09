import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_email || session.metadata?.email;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (email) {
          // Create or update the user record
          const { error } = await supabaseAdmin.from("users").upsert(
            {
              email,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              subscription_status: "trialing",
              created_at: new Date().toISOString(),
            },
            { onConflict: "email" }
          );

          if (error) {
            console.error("Supabase upsert error:", error);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await supabaseAdmin
          .from("users")
          .update({
            subscription_status: sub.status,
            stripe_subscription_id: sub.id,
          })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        // Mark as canceled and record cancellation time for recovery email cron
        await supabaseAdmin
          .from("users")
          .update({
            subscription_status: "canceled",
            canceled_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await supabaseAdmin
          .from("users")
          .update({ subscription_status: "past_due" })
          .eq("stripe_customer_id", customerId);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
