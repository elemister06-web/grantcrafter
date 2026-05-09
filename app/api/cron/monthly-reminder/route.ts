import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.RESEND_FROM_EMAIL || "hello@grantcrafter.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.grantcrafter.com";

// Runs on the 28th of each month at 10am ET
// Lets subscribers know their monthly report is coming in ~3 days
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const upcomingMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthLabel = upcomingMonth.toLocaleString("en-US", { month: "long", year: "numeric" });
  const reminderKey = `monthly_reminder_${upcomingMonth.toISOString().slice(0, 7)}`;

  const results = { sent: 0, failed: 0, skipped: 0 };

  // Get all active subscribers who completed onboarding
  const { data: users, error } = await supabaseAdmin
    .from("users")
    .select("id, email, business_name")
    .in("subscription_status", ["active", "trialing"])
    .not("business_name", "is", null);

  if (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  for (const user of users || []) {
    // Check if reminder already sent for this month
    const { data: existing } = await supabaseAdmin
      .from("sent_emails")
      .select("id")
      .eq("user_id", user.id)
      .eq("email_type", reminderKey)
      .maybeSingle();

    if (existing) {
      results.skipped++;
      continue;
    }

    try {
      await resend.emails.send({
        from: FROM,
        to: user.email,
        subject: `Your ${monthLabel} grant report arrives in 3 days 📬`,
        html: buildMonthlyReminderEmail(user.business_name || "there", monthLabel),
      });

      await supabaseAdmin.from("sent_emails").insert({
        user_id: user.id,
        email_type: reminderKey,
      });

      results.sent++;
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error(`Monthly reminder failed for ${user.email}:`, err);
      results.failed++;
    }
  }

  console.log("Monthly reminder results:", results);
  return NextResponse.json({ success: true, results, monthLabel });
}

function buildMonthlyReminderEmail(name: string, monthLabel: string): string {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:620px;margin:0 auto;">

  <!-- Header -->
  <div style="background:#15803d;padding:28px 32px;text-align:center;">
    <div style="font-size:26px;font-weight:900;color:white;letter-spacing:-0.5px;">
      Grant<span style="color:#bbf7d0;">Crafter</span>
    </div>
    <div style="color:#bbf7d0;margin-top:6px;font-size:14px;">Monthly Report Preview</div>
  </div>

  <!-- Body -->
  <div style="background:white;padding:36px 32px;">
    <h2 style="color:#111827;font-size:22px;margin:0 0 16px;font-weight:700;">
      ${name} — your ${monthLabel} report is almost ready 🚀
    </h2>

    <p style="color:#374151;line-height:1.7;margin:0 0 20px;">
      In <strong>3 days</strong>, your freshly generated ${monthLabel} grant report will land in your dashboard. We run these on the 1st of each month, specifically for your business profile.
    </p>

    <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">📋</div>
      <p style="color:#15803d;font-weight:700;font-size:16px;margin:0 0 8px;">Before your report drops — quick checklist</p>
      <p style="color:#166534;font-size:14px;line-height:1.6;margin:0;">
        Make sure your profile is current so we can match you accurately.<br/>
        Updated your revenue, employee count, or location recently?<br/>
        <strong>Now's the time to update it.</strong>
      </p>
    </div>

    <p style="color:#374151;line-height:1.7;margin:0 0 20px;">
      Grant opportunities move fast — deadlines come and go. A fresh report means fresh chances. We're building yours right now.
    </p>

    <div style="text-align:center;margin:32px 0;">
      <a href="${APP_URL}/dashboard" style="background:#16a34a;color:white;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;display:inline-block;font-size:16px;">
        Review My Profile →
      </a>
    </div>

    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin-top:24px;">
      See you in 3 days with your ${monthLabel} report!<br/>
      <strong>The GrantCrafter Team</strong>
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#1f2937;padding:20px 32px;text-align:center;">
    <p style="color:#9ca3af;font-size:11px;margin:0;line-height:1.6;">
      GrantCrafter · For informational purposes only · Not financial or legal advice<br/>
      You're receiving this because you're an active GrantCrafter member.
    </p>
  </div>

</div>
</body>
</html>`;
}
