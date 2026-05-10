import { NextRequest, NextResponse } from "next/server";
export const maxDuration = 60;
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { buildGrantPrompt, BusinessProfile } from "@/lib/prompt";
import { trackUsage } from "@/lib/track-usage";
import { buildReportPDF } from "@/lib/pdf-report";
import { buildSimpleEmail } from "@/app/api/generate-report/route";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, ...profileData } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    // Look up the Stripe checkout session to get the customer email
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    const email = checkoutSession.customer_email;
    const customerId = checkoutSession.customer as string;

    if (!email) {
      return NextResponse.json({ error: "Session email not found" }, { status: 400 });
    }

    // Update user profile in Supabase
    const { data: user, error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        business_name: profileData.businessName,
        business_type: profileData.businessType,
        industry: profileData.industry,
        city: profileData.city,
        state: profileData.state,
        employee_count: profileData.employeeCount,
        annual_revenue: profileData.annualRevenue,
        years_in_business: profileData.yearsInBusiness,
        qualifiers: profileData.qualifiers,
        additional_context: profileData.additionalContext,
        onboarding_completed: true,
      })
      .eq("stripe_customer_id", customerId)
      .select()
      .single();

    if (updateError || !user) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
    }

    // Kick off first grant report generation (async — don't await)
    generateFirstReport(user.id, {
      businessName: profileData.businessName,
      businessType: profileData.businessType,
      industry: profileData.industry,
      city: profileData.city,
      state: profileData.state,
      employeeCount: profileData.employeeCount,
      annualRevenue: profileData.annualRevenue,
      yearsInBusiness: profileData.yearsInBusiness,
      qualifiers: profileData.qualifiers,
      additionalContext: profileData.additionalContext,
    }, email).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Onboarding error:", err);
    return NextResponse.json({ error: "Onboarding failed" }, { status: 500 });
  }
}

async function generateFirstReport(userId: string, profile: BusinessProfile, email: string) {
  try {
    const prompt = buildGrantPrompt(profile);
    const currentMonth = new Date().toISOString().slice(0, 7);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    const reportContent =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Track Claude usage for P&L
    trackUsage("grant-report-onboarding", message.usage as unknown as Parameters<typeof trackUsage>[1]).catch(() => {});

    // Save to database
    await supabaseAdmin.from("grant_reports").insert({
      user_id: userId,
      month: currentMonth,
      report_content: reportContent,
      sent_at: new Date().toISOString(),
    });

    const monthLabel = new Date().toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
    const periodLabel = monthLabel;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

    // Build PDF
    const pdfBytes = await buildReportPDF(reportContent, profile.businessName, periodLabel);
    const slugifiedPeriod = periodLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    // Welcome email body — simple format with welcome intro
    const welcomeHtml = `<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;">
  <div style="background:#15803d;padding:28px 24px;text-align:center;">
    <div style="font-size:26px;font-weight:900;color:white;">Grant<span style="color:#bbf7d0;">Crafter</span></div>
  </div>
  <div style="background:white;padding:36px 32px;text-align:center;">
    <div style="font-size:40px;margin-bottom:16px;">🎉</div>
    <h1 style="color:#111827;font-size:22px;margin:0 0 12px;">Welcome to GrantCrafter!</h1>
    <p style="color:#6b7280;font-size:16px;margin:0 0 8px;">Prepared for <strong style="color:#111827;">${profile.businessName}</strong></p>
    <p style="color:#9ca3af;font-size:14px;margin:0 0 28px;">${periodLabel}</p>
    <p style="color:#374151;font-size:16px;margin:0 0 16px;">Your first grant report is attached as a PDF. Open it to see all the opportunities we found for your business.</p>
    <p style="color:#374151;font-size:15px;margin:0 0 28px;">Going forward, a fresh report arrives every Monday.</p>
    <a href="${appUrl}/dashboard" style="background:#15803d;color:white;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;display:inline-block;font-size:16px;">View Dashboard →</a>
  </div>
  <div style="background:#1f2937;padding:20px 24px;text-align:center;">
    <p style="color:#9ca3af;font-size:12px;margin:0;">GrantCrafter · For informational purposes only · Not a guarantee of grant eligibility<br>
    <a href="${appUrl}/dashboard" style="color:#6b7280;">Manage subscription</a> · <a href="${appUrl}/privacy" style="color:#6b7280;">Privacy Policy</a></p>
  </div>
</body>
</html>`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "reports@grantcrafter.com",
      to: email,
      subject: "Welcome to GrantCrafter — Your First Report is Attached",
      text: `Welcome to GrantCrafter!\n\nYour first grant report for ${profile.businessName} is attached as a PDF.\n\nPeriod: ${periodLabel}\n\nGoing forward, a fresh report arrives every Monday.\n\nView your dashboard: ${appUrl}/dashboard\n\n---\nGrantCrafter · For informational purposes only`,
      html: welcomeHtml,
      attachments: [
        {
          filename: `GrantCrafter-Report-${slugifiedPeriod}.pdf`,
          content: Buffer.from(pdfBytes).toString("base64"),
          contentType: "application/pdf",
        },
      ],
    });
  } catch (err) {
    console.error("First report generation failed:", err);
  }
}
