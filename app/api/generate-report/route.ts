import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";
import { buildGrantPrompt, BusinessProfile } from "@/lib/prompt";
import { trackUsage } from "@/lib/track-usage";
import { Resend } from "resend";

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
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const reportContent =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Track Claude usage for P&L
    trackUsage("grant-report", message.usage as unknown as Parameters<typeof trackUsage>[1]).catch(() => {});

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

    // Send email
    const monthLabel = new Date().toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "reports@grantcrafter.com",
      to: user.email,
      subject: `Your ${monthLabel} Grant Report — GrantCrafter`,
      html: buildEmailHTML(reportContent, profile.businessName, monthLabel),
    });

    return NextResponse.json({ success: true, reportId: report?.id });
  } catch (err) {
    console.error("Generate report error:", err);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}

function buildEmailHTML(
  reportContent: string,
  businessName: string,
  monthLabel: string
): string {
  // Convert markdown to basic HTML
  const html = reportContent
    .replace(/^## (.+)$/gm, "<h2 style='color:#15803d;margin-top:24px;'>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3 style='color:#1f2937;'>$1</h3>")
    .replace(/^\*\*(.+)\*\*$/gm, "<strong>$1</strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, "<li style='margin-bottom:4px;'>$1</li>")
    .replace(/^---$/gm, "<hr style='border:1px solid #e5e7eb;margin:20px 0;'>")
    .replace(/\n\n/g, "</p><p style='margin:0 0 12px;'>")
    .replace(/\n/g, "<br>");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:680px;margin:0 auto;padding:0;background:#f9fafb;">
  <div style="background:#15803d;padding:32px 24px;text-align:center;">
    <div style="font-size:28px;font-weight:900;color:white;letter-spacing:-0.5px;">
      Grant<span style="color:#bbf7d0;">Crafter</span>
    </div>
    <div style="color:#bbf7d0;margin-top:8px;font-size:16px;">
      ${monthLabel} Grant Report
    </div>
  </div>
  
  <div style="background:white;padding:32px 24px;">
    <h1 style="color:#111827;font-size:22px;margin:0 0 8px;">
      Your ${monthLabel} Grant Opportunities
    </h1>
    <p style="color:#6b7280;margin:0 0 24px;">
      Prepared for <strong>${businessName}</strong>. Here are the funding opportunities our AI identified for you this month.
    </p>
    
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:24px;font-size:14px;color:#166534;">
      ℹ️ <strong>Important:</strong> This report identifies grant opportunities based on your profile. Grant awards are determined solely by the granting organization. Apply to every opportunity that fits — the more you apply, the better your odds.
    </div>
    
    <div style="color:#374151;line-height:1.7;font-size:15px;">
      <p style="margin:0 0 12px;">${html}</p>
    </div>
  </div>
  
  <div style="background:#1f2937;padding:24px;text-align:center;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
       style="background:#16a34a;color:white;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none;display:inline-block;margin-bottom:16px;">
      View in Dashboard →
    </a>
    <p style="color:#9ca3af;font-size:12px;margin:0;">
      GrantCrafter · grant research and discovery for small businesses<br>
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
