import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";
import { buildGrantPrompt, BusinessProfile } from "@/lib/prompt";
import { trackUsage } from "@/lib/track-usage";
import { Resend } from "resend";
import { validateAndCleanReport } from "@/lib/validate-grant-links";
import { fixKnownBadUrls } from "@/lib/known-good-urls";

export const maxDuration = 60; // Vercel max for Hobby plan

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // Fetch user profile
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check subscription is active
    if (!["active", "trialing"].includes(user.subscription_status)) {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 403 }
      );
    }

    const profile: BusinessProfile = {
      businessName: user.business_name || "Your Business",
      businessType: user.business_type || "small_business",
      industry: user.industry || "General",
      city: user.city || "",
      state: user.state || "",
      employeeCount: user.employee_count || "Unknown",
      annualRevenue: user.annual_revenue || "Unknown",
      yearsInBusiness: user.years_in_business || "Unknown",
      qualifiers: user.qualifiers || [],
      additionalContext: user.additional_context || "",
    };

    const prompt = buildGrantPrompt(profile);
    const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-05"

    // Generate AI report
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 6000,
      messages: [{ role: "user", content: prompt }],
    });

    const rawContent =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Track Claude usage for P&L
    trackUsage("grant-report", message.usage as unknown as Parameters<typeof trackUsage>[1]).catch(() => {});

    // Fix known-bad URLs first, then validate and strip any remaining dead links
    const fixedContent = fixKnownBadUrls(rawContent);
    const { cleanedContent: reportContent } = await validateAndCleanReport(fixedContent);

    // Save to database
    const { data: report, error: reportError } = await supabaseAdmin
      .from("grant_reports")
      .insert({
        user_id: userId,
        month: currentMonth,
        report_content: reportContent,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (reportError) {
      console.error("Report save error:", reportError);
    }

    const monthLabel = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
    const periodLabel = monthLabel;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.grantcrafter.com";

    // Send clean email — PDF available to download from dashboard
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "reports@grantcrafter.com",
      to: user.email,
      subject: `Your Grant Report is Ready — ${periodLabel}`,
      text: `Hi,\n\nYour GrantCrafter grant report for ${profile.businessName} is ready.\n\nLog in to view and download your report: ${appUrl}/dashboard\n\n---\nGrantCrafter · For informational purposes only`,
      html: buildSimpleEmail(profile.businessName, periodLabel, appUrl),
    });

    return NextResponse.json({ success: true, reportId: report?.id });
  } catch (err) {
    console.error("Generate report error:", err);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}

export function buildSimpleEmail(
  businessName: string,
  periodLabel: string,
  appUrl: string
): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;">
  <div style="background:#15803d;padding:28px 24px;text-align:center;">
    <div style="font-size:26px;font-weight:900;color:white;">Grant<span style="color:#bbf7d0;">Crafter</span></div>
  </div>
  <div style="background:white;padding:40px 32px;text-align:center;">
    <div style="font-size:44px;margin-bottom:20px;">✅</div>
    <h1 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 10px;">Your dashboard has been updated</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 8px;">New grant opportunities for <strong style="color:#111827;">${businessName}</strong> are ready to review.</p>
    <p style="color:#9ca3af;font-size:13px;margin:0 0 32px;">${periodLabel}</p>
    <a href="${appUrl}/dashboard" style="background:#15803d;color:white;padding:14px 32px;border-radius:10px;font-weight:700;text-decoration:none;display:inline-block;font-size:15px;">View My Dashboard →</a>
  </div>
  <div style="background:#1f2937;padding:20px 24px;text-align:center;">
    <p style="color:#9ca3af;font-size:12px;margin:0;">GrantCrafter · For informational purposes only · Not a guarantee of grant eligibility<br>
    <a href="${appUrl}/dashboard" style="color:#6b7280;">Manage subscription</a> · <a href="${appUrl}/privacy" style="color:#6b7280;">Privacy Policy</a></p>
  </div>
</body>
</html>`;
}
