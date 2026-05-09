import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.RESEND_FROM_EMAIL || "hello@grantcrafter.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.grantcrafter.com";

// Runs daily at 10am ET — sends day-3 and day-7 welcome sequence emails
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results = { day3: { sent: 0, failed: 0 }, day7: { sent: 0, failed: 0 } };

  // ── Day 3 email ────────────────────────────────────────────────────────
  const day3Start = new Date(now);
  day3Start.setDate(day3Start.getDate() - 4);
  const day3End = new Date(now);
  day3End.setDate(day3End.getDate() - 3);

  const { data: day3Users } = await supabaseAdmin
    .from("users")
    .select("id, email, business_name")
    .eq("onboarding_completed", true)
    .gte("created_at", day3Start.toISOString())
    .lt("created_at", day3End.toISOString());

  for (const user of day3Users || []) {
    // Check if already sent
    const { data: existing } = await supabaseAdmin
      .from("sent_emails")
      .select("id")
      .eq("user_id", user.id)
      .eq("email_type", "welcome_day3")
      .maybeSingle();

    if (existing) continue;

    try {
      await resend.emails.send({
        from: FROM,
        to: user.email,
        subject: "Quick tip — how to read your grant report like a pro",
        html: buildDay3Email(user.business_name || "there"),
      });

      await supabaseAdmin.from("sent_emails").insert({
        user_id: user.id,
        email_type: "welcome_day3",
      });

      results.day3.sent++;
    } catch (err) {
      console.error(`Day-3 email failed for ${user.email}:`, err);
      results.day3.failed++;
    }
  }

  // ── Day 7 email ────────────────────────────────────────────────────────
  const day7Start = new Date(now);
  day7Start.setDate(day7Start.getDate() - 8);
  const day7End = new Date(now);
  day7End.setDate(day7End.getDate() - 7);

  const { data: day7Users } = await supabaseAdmin
    .from("users")
    .select("id, email, business_name")
    .eq("onboarding_completed", true)
    .gte("created_at", day7Start.toISOString())
    .lt("created_at", day7End.toISOString());

  for (const user of day7Users || []) {
    const { data: existing } = await supabaseAdmin
      .from("sent_emails")
      .select("id")
      .eq("user_id", user.id)
      .eq("email_type", "welcome_day7")
      .maybeSingle();

    if (existing) continue;

    try {
      await resend.emails.send({
        from: FROM,
        to: user.email,
        subject: "You've been a member for 1 week! 🎉",
        html: buildDay7Email(user.business_name || "there"),
      });

      await supabaseAdmin.from("sent_emails").insert({
        user_id: user.id,
        email_type: "welcome_day7",
      });

      results.day7.sent++;
    } catch (err) {
      console.error(`Day-7 email failed for ${user.email}:`, err);
      results.day7.failed++;
    }
  }

  console.log("Welcome sequence results:", results);
  return NextResponse.json({ success: true, results });
}

// ── Email HTML builders ────────────────────────────────────────────────────

function buildDay3Email(name: string): string {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:620px;margin:0 auto;">

  <!-- Header -->
  <div style="background:#15803d;padding:28px 32px;text-align:center;">
    <div style="font-size:26px;font-weight:900;color:white;letter-spacing:-0.5px;">
      Grant<span style="color:#bbf7d0;">Crafter</span>
    </div>
  </div>

  <!-- Body -->
  <div style="background:white;padding:36px 32px;">
    <h2 style="color:#111827;font-size:22px;margin:0 0 16px;font-weight:700;">Hey ${name} 👋 — quick tip to get the most out of your report</h2>

    <p style="color:#374151;line-height:1.7;margin:0 0 20px;">
      Your first grant report is in your dashboard. Before you dive in, here's how to read it like a pro so you don't leave money on the table.
    </p>

    <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px 20px;margin:24px 0;border-radius:0 8px 8px 0;">
      <p style="color:#166534;font-weight:700;margin:0 0 8px;font-size:15px;">📊 Understanding the Match Score</p>
      <p style="color:#15803d;line-height:1.6;margin:0;font-size:14px;">
        Every opportunity in your report has a match score (1–10). Focus on anything <strong>7 or higher first</strong> — these align most strongly with your business profile, location, and industry.
      </p>
    </div>

    <div style="background:#fefce8;border-left:4px solid #ca8a04;padding:16px 20px;margin:24px 0;border-radius:0 8px 8px 0;">
      <p style="color:#713f12;font-weight:700;margin:0 0 8px;font-size:15px;">📋 How to Prioritize Opportunities</p>
      <p style="color:#92400e;line-height:1.6;margin:0;font-size:14px;">
        Sort by: <strong>1) Match Score → 2) Deadline → 3) Award Size.</strong> Don't chase huge amounts with low match scores — a $5,000 grant you actually qualify for beats a $50,000 one that's a long shot.
      </p>
    </div>

    <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:16px 20px;margin:24px 0;border-radius:0 8px 8px 0;">
      <p style="color:#1e3a8a;font-weight:700;margin:0 0 8px;font-size:15px;">✍️ Writing a Strong Application Opening</p>
      <p style="color:#1d4ed8;line-height:1.6;margin:0;font-size:14px;">
        Lead with your impact, not your history. Instead of "We've been in business for 5 years," try: <em>"We serve 200 families in [City] with [what you do] — and this grant would let us double that reach."</em> Reviewers are looking for community impact.
      </p>
    </div>

    <p style="color:#374151;line-height:1.7;margin:24px 0 0;">
      Your dashboard is waiting — view your full report and start prioritizing.
    </p>

    <div style="text-align:center;margin:32px 0;">
      <a href="${APP_URL}/dashboard" style="background:#16a34a;color:white;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;display:inline-block;font-size:16px;">
        View My Grant Report →
      </a>
    </div>

    <p style="color:#6b7280;font-size:14px;line-height:1.6;">
      Questions? Just reply to this email — we read every one.
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#1f2937;padding:20px 32px;text-align:center;">
    <p style="color:#9ca3af;font-size:11px;margin:0;line-height:1.6;">
      GrantCrafter · For informational purposes only · Not financial or legal advice<br/>
      You're receiving this because you're a GrantCrafter member.
    </p>
  </div>

</div>
</body>
</html>`;
}

function buildDay7Email(name: string): string {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:620px;margin:0 auto;">

  <!-- Header -->
  <div style="background:#15803d;padding:28px 32px;text-align:center;">
    <div style="font-size:26px;font-weight:900;color:white;letter-spacing:-0.5px;">
      Grant<span style="color:#bbf7d0;">Crafter</span>
    </div>
  </div>

  <!-- Body -->
  <div style="background:white;padding:36px 32px;">
    <h2 style="color:#111827;font-size:22px;margin:0 0 16px;font-weight:700;">🎉 You've been with GrantCrafter for one whole week, ${name}!</h2>

    <p style="color:#374151;line-height:1.7;margin:0 0 20px;">
      That's worth celebrating. You took the first step — and that's the hardest one.
    </p>

    <p style="color:#374151;line-height:1.7;margin:0 0 20px;">
      Now here's what I want you to do this week:
    </p>

    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin:24px 0;">
      <p style="color:#111827;font-weight:700;font-size:16px;margin:0 0 16px;">Your 3-grant challenge 🎯</p>

      <div style="display:flex;align-items:flex-start;margin-bottom:14px;">
        <div style="background:#16a34a;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;margin-right:12px;line-height:28px;text-align:center;">1</div>
        <div>
          <p style="color:#111827;font-weight:600;margin:0 0 4px;">Open your report and pick your top 3</p>
          <p style="color:#6b7280;font-size:14px;margin:0;">Use match score 7+ as your filter. Three is doable. Ten is overwhelming.</p>
        </div>
      </div>

      <div style="display:flex;align-items:flex-start;margin-bottom:14px;">
        <div style="background:#16a34a;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;margin-right:12px;line-height:28px;text-align:center;">2</div>
        <div>
          <p style="color:#111827;font-weight:600;margin:0 0 4px;">Visit each grant's official page</p>
          <p style="color:#6b7280;font-size:14px;margin:0;">Confirm the deadline and eligibility requirements directly from the source.</p>
        </div>
      </div>

      <div style="display:flex;align-items:flex-start;">
        <div style="background:#16a34a;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;margin-right:12px;line-height:28px;text-align:center;">3</div>
        <div>
          <p style="color:#111827;font-weight:600;margin:0 0 4px;">Start your first application</p>
          <p style="color:#6b7280;font-size:14px;margin:0;">Even just writing down your impact statement is progress. Done beats perfect.</p>
        </div>
      </div>
    </div>

    <p style="color:#374151;line-height:1.7;margin:0 0 20px;">
      If you have any questions — about your report, how to word something, whether you qualify — just reply to this email. I'll personally take a look.
    </p>

    <div style="text-align:center;margin:32px 0;">
      <a href="${APP_URL}/dashboard" style="background:#16a34a;color:white;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;display:inline-block;font-size:16px;">
        Open My Dashboard →
      </a>
    </div>

    <p style="color:#6b7280;font-size:14px;line-height:1.6;">
      Rooting for you,<br/>
      <strong>The GrantCrafter Team</strong><br/>
      <a href="mailto:support@grantcrafter.com" style="color:#16a34a;">support@grantcrafter.com</a>
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#1f2937;padding:20px 32px;text-align:center;">
    <p style="color:#9ca3af;font-size:11px;margin:0;line-height:1.6;">
      GrantCrafter · For informational purposes only · Not financial or legal advice<br/>
      You're receiving this because you're a GrantCrafter member.
    </p>
  </div>

</div>
</body>
</html>`;
}
