import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import Stripe from "stripe";

const resend = new Resend(process.env.RESEND_API_KEY!);

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
          // Create or update the user record in the custom users table
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

          // Create a Supabase Auth user so they can log in with email+password
          let passwordSetupLink = "https://www.grantcrafter.com/login";
          try {
            // Create auth user (email confirmed, random temp password)
            const { error: authError } = await supabaseAdmin.auth.admin.createUser({
              email,
              password: crypto.randomUUID(),
              email_confirm: true,
            });
            if (authError && !authError.message.includes("already been registered")) {
              console.error("Auth user creation error:", authError);
            }

            // Generate a password-setup link (recovery flow)
            const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
              type: "recovery",
              email,
              options: { redirectTo: "https://www.grantcrafter.com/set-password" },
            });
            if (linkError) {
              console.error("Link generation error:", linkError);
            } else {
              passwordSetupLink = linkData?.properties?.action_link ?? passwordSetupLink;
            }
          } catch (authErr) {
            console.error("Auth setup error:", authErr);
          }

          // Send signup confirmation email
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.grantcrafter.com";
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "reports@grantcrafter.com",
            to: email,
            subject: "Welcome to GrantCrafter — You're in!",
            text: `Welcome to GrantCrafter!\n\nYour 7-day free trial is now active. No charge until your trial ends.\n\nNext step: set your password to access your dashboard.\n\nSet your password: ${passwordSetupLink}\n\n---\nGrantCrafter · for informational purposes only · not a guarantee of award eligibility\nQuestions? Reply to this email.`,
            html: `
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;">
  <div style="background:#15803d;padding:32px 24px;text-align:center;">
    <div style="font-size:28px;font-weight:900;color:white;">Grant<span style="color:#bbf7d0;">Crafter</span></div>
    <div style="color:#bbf7d0;margin-top:8px;font-size:16px;">Your free trial has started</div>
  </div>
  <div style="background:white;padding:32px 24px;">
    <h1 style="color:#111827;font-size:22px;margin:0 0 12px;">You're in! 🎉</h1>
    <p style="color:#374151;margin:0 0 16px;line-height:1.6;">
      Thanks for signing up for GrantCrafter. Your 7-day free trial is now active — no charge until your trial ends.
    </p>
    <p style="color:#374151;margin:0 0 24px;line-height:1.6;">
      <strong>Next step:</strong> Complete your business profile so we can generate your personalized grant report. It only takes 2 minutes.
    </p>
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${passwordSetupLink}" style="background:#16a34a;color:white;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;display:inline-block;font-size:16px;">
        Set Your Password &amp; Get Started →
      </a>
    </div>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;font-size:14px;color:#166534;">
      ℹ️ Once your profile is submitted, we'll generate your first personalized grant report and deliver it to this email address.
    </div>
  </div>
  <div style="background:#1f2937;padding:20px 24px;text-align:center;">
    <p style="color:#9ca3af;font-size:12px;margin:0;">
      GrantCrafter · for informational purposes only · not a guarantee of award eligibility<br>
      Questions? Reply to this email.
    </p>
  </div>
</body>
</html>`,
          }).catch((err) => console.error("Confirmation email failed:", err));
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
