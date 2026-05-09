import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { buildGrantPrompt, BusinessProfile } from "@/lib/prompt";
import { trackUsage } from "@/lib/track-usage";

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

    // Send welcome + first report email
    const monthLabel = new Date().toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    const htmlReport = reportContent
      .replace(/^## (.+)$/gm, "<h2 style='color:#15803d;margin-top:24px;'>$1</h2>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/^- (.+)$/gm, "<li style='margin-bottom:4px;'>$1</li>")
      .replace(/^---$/gm, "<hr style='border:1px solid #e5e7eb;margin:20px 0;'>")
      .replace(/\n\n/g, "</p><p style='margin:0 0 12px;'>")
      .replace(/\n/g, "<br>");

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "reports@grantcrafter.com",
      to: email,
      subject: `Welcome to GrantCrafter — Your First Grant Report Is Ready`,
      html: `
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:680px;margin:0 auto;background:#f9fafb;">
  <div style="background:#15803d;padding:32px 24px;text-align:center;">
    <div style="font-size:28px;font-weight:900;color:white;">Grant<span style="color:#bbf7d0;">Crafter</span></div>
    <div style="color:#bbf7d0;margin-top:8px;font-size:16px;">Welcome — Your First Report Is Ready</div>
  </div>
  <div style="background:white;padding:32px 24px;">
    <h1 style="color:#111827;font-size:22px;margin:0 0 8px;">Welcome to GrantCrafter! 🎉</h1>
    <p style="color:#6b7280;margin:0 0 20px;">
      We got your profile and immediately ran your first grant search. Here's your 
      <strong>${monthLabel} Grant Report</strong> for <strong>${profile.businessName}</strong>.
    </p>
    <p style="color:#6b7280;margin:0 0 20px;">
      Going forward, a new report will arrive in your inbox on the 1st of every month.
    </p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:24px;font-size:14px;color:#166534;">
      ℹ️ <strong>Reminder:</strong> This report identifies opportunities based on your profile. Grant awards are always determined by the granting organization. We recommend applying to every opportunity that looks like a strong fit.
    </div>
    <div style="color:#374151;line-height:1.7;font-size:15px;">
      <p style="margin:0 0 12px;">${htmlReport}</p>
    </div>
  </div>
  <div style="background:#1f2937;padding:24px;text-align:center;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background:#16a34a;color:white;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none;display:inline-block;margin-bottom:16px;">
      View Your Dashboard →
    </a>
    <p style="color:#6b7280;font-size:11px;margin:8px 0 0;">
      GrantCrafter · for informational purposes only · not a guarantee of award eligibility
    </p>
  </div>
</body>
</html>`,
    });
  } catch (err) {
    console.error("First report generation failed:", err);
  }
}
