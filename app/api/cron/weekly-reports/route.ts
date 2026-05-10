import { NextRequest, NextResponse } from "next/server";
export const maxDuration = 60;
import { supabaseAdmin } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { buildGrantPrompt, BusinessProfile } from "@/lib/prompt";
import { trackUsage } from "@/lib/track-usage";
import { buildSimpleEmail } from "@/app/api/generate-report/route";

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
          max_tokens: 4000,
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
        const periodLabel = `Week of ${weekLabel}`;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "reports@grantcrafter.com",
          to: user.email,
          subject: `Your Weekly Grant Report is Ready — ${periodLabel}`,
          text: `Hi,\n\nYour GrantCrafter grant report for ${user.business_name} is ready.\n\nLog in to view and download it: ${appUrl}/login\n\n---\nGrantCrafter · For informational purposes only`,
          html: buildSimpleEmail(user.business_name, periodLabel, appUrl),
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
