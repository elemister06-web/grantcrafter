import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.RESEND_FROM_EMAIL || "hello@grantcrafter.com";

// Runs every hour — sends recovery email to users who canceled 1–24h ago
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const results = { sent: 0, failed: 0, skipped: 0 };

  // Find users who canceled between 1 and 24 hours ago
  const { data: canceledUsers, error } = await supabaseAdmin
    .from("users")
    .select("id, email, business_name, canceled_at")
    .eq("subscription_status", "canceled")
    .gte("canceled_at", twentyFourHoursAgo.toISOString())
    .lt("canceled_at", oneHourAgo.toISOString());

  if (error) {
    console.error("Cancellation recovery query error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  for (const user of canceledUsers || []) {
    // Check if recovery email already sent
    const { data: existing } = await supabaseAdmin
      .from("sent_emails")
      .select("id")
      .eq("user_id", user.id)
      .eq("email_type", "cancellation_recovery")
      .maybeSingle();

    if (existing) {
      results.skipped++;
      continue;
    }

    try {
      await resend.emails.send({
        from: FROM,
        to: user.email,
        subject: "We're sorry to see you go — one last thing",
        html: buildCancellationRecoveryEmail(user.business_name || "there"),
      });

      await supabaseAdmin.from("sent_emails").insert({
        user_id: user.id,
        email_type: "cancellation_recovery",
      });

      results.sent++;
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error(`Cancellation recovery failed for ${user.email}:`, err);
      results.failed++;
    }
  }

  console.log("Cancellation recovery results:", results);
  return NextResponse.json({ success: true, results });
}

function buildCancellationRecoveryEmail(name: string): string {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:600px;margin:0 auto;">

  <!-- Header -->
  <div style="background:#15803d;padding:28px 32px;text-align:center;">
    <div style="font-size:26px;font-weight:900;color:white;letter-spacing:-0.5px;">
      Grant<span style="color:#bbf7d0;">Crafter</span>
    </div>
  </div>

  <!-- Body -->
  <div style="background:white;padding:40px 36px;">
    <h2 style="color:#111827;font-size:21px;margin:0 0 20px;font-weight:700;line-height:1.3;">
      ${name}, we're sorry to see you go.
    </h2>

    <p style="color:#374151;line-height:1.8;margin:0 0 18px;font-size:15px;">
      Your subscription has been canceled, and we respect that decision completely. No hard feelings — running a business is hard, and every dollar counts.
    </p>

    <p style="color:#374151;line-height:1.8;margin:0 0 18px;font-size:15px;">
      But before we part ways, I wanted to reach out personally with one offer.
    </p>

    <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:12px;padding:24px 28px;margin:28px 0;">
      <p style="color:#15803d;font-weight:700;font-size:16px;margin:0 0 12px;">🎁 A personal offer from our team</p>
      <p style="color:#374151;line-height:1.8;margin:0 0 14px;font-size:15px;">
        If you didn't find what you were looking for — whether the grants didn't feel like a fit, or you weren't sure how to proceed — <strong>reply to this email and tell us</strong>.
      </p>
      <p style="color:#374151;line-height:1.8;margin:0;font-size:15px;">
        We'll personally review your business profile and send you a <strong>custom grant report at no charge</strong>. Human eyes, not just an algorithm. Just a team that genuinely wants your business to find funding.
      </p>
    </div>

    <p style="color:#374151;line-height:1.8;margin:0 0 18px;font-size:15px;">
      There's no catch. If we can help, we will. If not — we'll wish you well and that'll be that.
    </p>

    <p style="color:#374151;line-height:1.8;margin:0;font-size:15px;">
      Just hit reply. We'll take it from there.
    </p>

    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin-top:32px;">
      Take care,<br/>
      <strong>The GrantCrafter Team</strong><br/>
      <a href="mailto:support@grantcrafter.com" style="color:#16a34a;">support@grantcrafter.com</a>
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#1f2937;padding:20px 32px;text-align:center;">
    <p style="color:#9ca3af;font-size:11px;margin:0;line-height:1.6;">
      GrantCrafter · For informational purposes only · Not financial or legal advice<br/>
      You're receiving this because you recently had a GrantCrafter membership.
    </p>
  </div>

</div>
</body>
</html>`;
}
