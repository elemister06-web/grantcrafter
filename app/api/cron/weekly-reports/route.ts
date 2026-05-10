import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { buildGrantPrompt, BusinessProfile } from "@/lib/prompt";
import { trackUsage } from "@/lib/track-usage";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const resend = new Resend(process.env.RESEND_API_KEY!);

function getISOWeekString(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

// This endpoint is called by Vercel Cron every Monday at 9am ET
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentWeek = getISOWeekString(new Date());
  const results = { success: 0, failed: 0, skipped: 0 };

  try {
    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .in("subscription_status", ["active", "trialing"])
      .not("business_name", "is", null);

    if (error) throw error;

    console.log(`Processing ${users?.length || 0} active subscribers for week ${currentWeek}`);

    for (const user of users || []) {
      try {
        // Skip if report already sent this week
        const { data: existing } = await supabaseAdmin
          .from("grant_reports")
          .select("id")
          .eq("user_id", user.id)
          .eq("month", currentWeek)
          .single();

        if (existing) {
          results.skipped++;
          continue;
        }

        const profile: BusinessProfile = {
          businessName: user.business_name,
          businessType: user.business_type,
          industry: user.industry,
          city: user.city,
          state: user.state,
          employeeCount: user.employee_count,
          annualRevenue: user.annual_revenue,
          yearsInBusiness: user.years_in_business,
          qualifiers: user.qualifiers || [],
          additionalContext: user.additional_context || "",
        };

        const prompt = buildGrantPrompt(profile);

        const message = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 8000,
          messages: [{ role: "user", content: prompt }],
        });

        const reportContent =
          message.content[0].type === "text" ? message.content[0].text : "";

        trackUsage("grant-report-weekly", message.usage as unknown as Parameters<typeof trackUsage>[1]).catch(() => {});

        await supabaseAdmin.from("grant_reports").insert({
          user_id: user.id,
          month: currentWeek,
          report_content: reportContent,
          sent_at: new Date().toISOString(),
        });

        const weekLabel = new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "reports@grantcrafter.com",
          to: user.email,
          subject: `Your Weekly Grant Report — Week of ${weekLabel}`,
          text: `Your Weekly Grant Report — Week of ${weekLabel}\n\nPrepared for ${user.business_name}.\n\n${reportContent}\n\n---\nGrantCrafter · for informational purposes only · not a guarantee of award eligibility\nView dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          html: buildWeeklyEmailHTML(reportContent, user.business_name, weekLabel),
        });

        results.success++;

        // Rate limit: 1 second between users
        await new Promise((r) => setTimeout(r, 1000));
      } catch (userErr) {
        console.error(`Failed for user ${user.id}:`, userErr);
        results.failed++;
      }
    }

    console.log("Weekly cron results:", results);
    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("Weekly cron job failed:", err);
    return NextResponse.json({ error: "Cron failed", results }, { status: 500 });
  }
}

function buildWeeklyEmailHTML(
  reportContent: string,
  businessName: string,
  weekLabel: string
): string {
  const html = reportContent
    .replace(/^## (.+)$/gm, "<h2 style='color:#15803d;margin-top:24px;'>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3 style='color:#1f2937;'>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, "<li style='margin-bottom:4px;'>$1</li>")
    .replace(/^---$/gm, "<hr style='border:1px solid #e5e7eb;margin:20px 0;'>")
    .replace(/\n\n/g, "</p><p style='margin:0 0 12px;'>")
    .replace(/\n/g, "<br>");

  return `
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:680px;margin:0 auto;background:#f9fafb;">
  <div style="background:#15803d;padding:32px 24px;text-align:center;">
    <div style="font-size:28px;font-weight:900;color:white;">Grant<span style="color:#bbf7d0;">Crafter</span></div>
    <div style="color:#bbf7d0;margin-top:8px;">Weekly Grant Report — ${weekLabel}</div>
  </div>
  <div style="background:white;padding:32px 24px;">
    <h1 style="color:#111827;font-size:22px;margin:0 0 16px;">Your Weekly Grant Opportunities</h1>
    <p style="color:#6b7280;">Prepared for <strong>${businessName}</strong>. Fresh opportunities for this week.</p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;margin:20px 0;font-size:14px;color:#166534;">
      ℹ️ This report identifies opportunities based on your profile. Awards are determined by each granting organization.
    </div>
    <div style="color:#374151;line-height:1.7;">${html}</div>
  </div>
  <div style="background:#1f2937;padding:24px;text-align:center;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
       style="background:#16a34a;color:white;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none;display:inline-block;margin-bottom:16px;">
      View in Dashboard →
    </a>
    <p style="color:#9ca3af;font-size:12px;margin:0;">
      GrantCrafter · Weekly grant research for small businesses<br>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color:#6b7280;">Manage subscription</a> ·
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy" style="color:#6b7280;">Privacy Policy</a>
    </p>
    <p style="color:#6b7280;font-size:11px;margin:12px 0 0;">
      This report is for informational purposes only. GrantCrafter does not guarantee grant awards.
    </p>
  </div>
</body>
</html>`;
}
