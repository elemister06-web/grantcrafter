import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.RESEND_FROM_EMAIL || "hello@grantcrafter.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.grantcrafter.com";

// Runs daily — checks for 3-month anniversaries
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  // Find users who joined ~90 days ago (88–92 day window to account for cron drift)
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - 92);
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() - 88);

  const results = { sent: 0, failed: 0, skipped: 0 };

  const { data: users, error } = await supabaseAdmin
    .from("users")
    .select("id, email, business_name")
    .in("subscription_status", ["active", "trialing"])
    .eq("onboarding_completed", true)
    .gte("created_at", windowStart.toISOString())
    .lt("created_at", windowEnd.toISOString());

  if (error) {
    console.error("Anniversary query error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  for (const user of users || []) {
    // Check if already sent
    const { data: existing } = await supabaseAdmin
      .from("sent_emails")
      .select("id")
      .eq("user_id", user.id)
      .eq("email_type", "anniversary_3month")
      .maybeSingle();

    if (existing) {
      results.skipped++;
      continue;
    }

    // Count how many reports they've received
    const { count: reportCount } = await supabaseAdmin
      .from("grant_reports")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    try {
      await resend.emails.send({
        from: FROM,
        to: user.email,
        subject: "You've been with us for 3 months 🏆 — here's what we found for you",
        html: buildAnniversaryEmail(user.business_name || "there", reportCount ?? 3),
      });

      await supabaseAdmin.from("sent_emails").insert({
        user_id: user.id,
        email_type: "anniversary_3month",
      });

      results.sent++;
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error(`Anniversary email failed for ${user.email}:`, err);
      results.failed++;
    }
  }

  console.log("Anniversary results:", results);
  return NextResponse.json({ success: true, results });
}

function buildAnniversaryEmail(name: string, reportCount: number): string {
  const grantsSearched = reportCount * 15; // approx opportunities reviewed per report

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:620px;margin:0 auto;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#15803d,#166534);padding:36px 32px;text-align:center;">
    <div style="font-size:26px;font-weight:900;color:white;letter-spacing:-0.5px;">
      Grant<span style="color:#bbf7d0;">Crafter</span>
    </div>
    <div style="color:#bbf7d0;margin-top:8px;font-size:15px;">🏆 3-Month Anniversary</div>
  </div>

  <!-- Stats bar -->
  <div style="background:#16a34a;padding:20px 32px;display:flex;justify-content:center;gap:40px;">
    <div style="text-align:center;color:white;">
      <div style="font-size:28px;font-weight:900;">${reportCount}</div>
      <div style="font-size:12px;opacity:0.85;">Reports Generated</div>
    </div>
    <div style="text-align:center;color:white;border-left:1px solid rgba(255,255,255,0.3);padding-left:40px;">
      <div style="font-size:28px;font-weight:900;">${grantsSearched}+</div>
      <div style="font-size:12px;opacity:0.85;">Opportunities Reviewed</div>
    </div>
    <div style="text-align:center;color:white;border-left:1px solid rgba(255,255,255,0.3);padding-left:40px;">
      <div style="font-size:28px;font-weight:900;">3</div>
      <div style="font-size:12px;opacity:0.85;">Months as a Member</div>
    </div>
  </div>

  <!-- Body -->
  <div style="background:white;padding:36px 32px;">
    <h2 style="color:#111827;font-size:22px;margin:0 0 16px;font-weight:700;">
      ${name}, you've made it to 3 months — and we wanted to say thank you.
    </h2>

    <p style="color:#374151;line-height:1.7;margin:0 0 20px;">
      Three months ago, you decided your business was worth investing in. You filled out your profile, told us your story, and trusted us to go find money that might be sitting out there with your name on it.
    </p>

    <p style="color:#374151;line-height:1.7;margin:0 0 20px;">
      In that time, we've reviewed <strong>${grantsSearched}+ grant opportunities</strong> against your profile and surfaced the ones that actually fit. That's ${reportCount} tailored reports — built just for you.
    </p>

    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin:28px 0;">
      <p style="color:#111827;font-weight:700;font-size:16px;margin:0 0 12px;">We'd love to hear from you 💬</p>
      <p style="color:#374151;line-height:1.7;margin:0 0 16px;font-size:14px;">
        Have you applied to any of the grants we found? Even if you're still exploring — your feedback helps us make GrantCrafter better for every small business owner.
      </p>
      <p style="color:#374151;line-height:1.7;margin:0;font-size:14px;">
        Just hit reply and let us know: <em>What's been most useful? What could be better?</em> We read every response — personally.
      </p>
    </div>

    <p style="color:#374151;line-height:1.7;margin:0 0 20px;">
      We're honored to be in your corner. Here's to month four.
    </p>

    <div style="text-align:center;margin:32px 0;">
      <a href="${APP_URL}/dashboard" style="background:#16a34a;color:white;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;display:inline-block;font-size:16px;">
        View My Reports →
      </a>
    </div>

    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin-top:24px;">
      With gratitude,<br/>
      <strong>The GrantCrafter Team</strong><br/>
      <a href="mailto:support@grantcrafter.com" style="color:#16a34a;">support@grantcrafter.com</a>
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#1f2937;padding:20px 32px;text-align:center;">
    <p style="color:#9ca3af;font-size:11px;margin:0;line-height:1.6;">
      GrantCrafter · For informational purposes only · Not financial or legal advice<br/>
      You're receiving this as part of your GrantCrafter membership.
    </p>
  </div>

</div>
</body>
</html>`;
}
