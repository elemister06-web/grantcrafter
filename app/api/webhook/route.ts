import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { buildGrantPrompt } from "@/lib/prompt";
import { fixKnownBadUrls } from "@/lib/known-good-urls";
import { validateAndCleanReport } from "@/lib/validate-grant-links";
import { parseGrantsFromReport } from "@/lib/parse-grants";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import Stripe from "stripe";

export const maxDuration = 300;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const resend = new Resend(process.env.RESEND_API_KEY!);

function getBadgeColor(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("federal")) return "#1d4ed8";
  if (t.includes("state")) return "#7e22ce";
  if (t.includes("local")) return "#c2410c";
  if (t.includes("private") || t.includes("foundation")) return "#0f766e";
  return "#374151";
}

function buildEmail(grants: ReturnType<typeof parseGrantsFromReport>, businessName: string, email: string, rawReport: string): string {
  const top3 = grants.slice(0, 3);
  const allGrants = grants;
  const now = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const topPicksHtml = top3.map(g => `
    <div style="background:#dcfce7;border-radius:10px;padding:20px;margin-bottom:16px;border:1px solid #bbf7d0;">
      <div style="font-size:18px;font-weight:700;color:#15803d;margin-bottom:4px;">⭐ ${g.name}</div>
      <div style="color:#374151;font-size:14px;margin-bottom:8px;">${g.organization}</div>
      <div style="font-size:22px;font-weight:800;color:#15803d;">${g.amount}</div>
      ${g.deadline ? `<div style="color:#d97706;font-size:13px;margin-top:4px;">📅 Deadline: ${g.deadline}</div>` : ""}
    </div>
  `).join("");

  const allGrantsHtml = allGrants.map(g => {
    const badgeColor = getBadgeColor(g.type);
    const applyBtn = g.applyUrl
      ? `<a href="${g.applyUrl}" style="display:inline-block;background:#15803d;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin-top:16px;">Apply Now →</a>`
      : "";
    return `
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:20px;">
      <div style="font-size:20px;font-weight:800;color:#111827;margin-bottom:8px;">${g.name}</div>
      <div style="margin-bottom:10px;">
        <span style="color:#6b7280;font-size:14px;">${g.organization}</span>
        &nbsp;
        <span style="background:${badgeColor};color:#fff;font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px;">${g.type}</span>
      </div>
      <div style="font-size:26px;font-weight:800;color:#15803d;margin-bottom:6px;">${g.amount}</div>
      ${g.deadline ? `<div style="color:#d97706;font-size:14px;font-weight:600;margin-bottom:8px;">📅 Deadline: ${g.deadline}</div>` : ""}
      ${g.matchScore ? `<div style="display:inline-block;background:#f0fdf4;color:#15803d;font-size:13px;font-weight:700;padding:4px 12px;border-radius:20px;border:1px solid #bbf7d0;margin-bottom:12px;">Match: ${g.matchScore}</div>` : ""}
      <div style="color:#374151;font-size:15px;line-height:1.6;margin-bottom:12px;"><strong>What It Funds:</strong> ${g.whatItFunds}</div>
      ${applyBtn}
      ${g.proTip ? `<div style="background:#fffbeb;border-left:4px solid #d97706;padding:12px 16px;border-radius:0 8px 8px 0;margin-top:16px;"><strong style="color:#92400e;">💡 Pro Tip:</strong> <span style="color:#78350f;font-size:14px;">${g.proTip}</span></div>` : ""}
    </div>
  `;
  }).join("");

  const upcomingDeadlines = allGrants
    .filter(g => g.deadline && g.deadline !== "Varies" && g.deadline !== "Rolling")
    .slice(0, 5)
    .map(g => `<li style="margin-bottom:8px;color:#374151;"><strong>${g.name}</strong> — <span style="color:#d97706;">${g.deadline}</span></li>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your Grant Report — GrantCrafter</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <!-- Header -->
  <div style="background:#15803d;padding:32px 24px;text-align:center;">
    <div style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">🌿 GrantCrafter</div>
    <div style="color:#bbf7d0;font-size:16px;margin-top:8px;font-weight:500;">Your Grant Report is Ready</div>
  </div>

  <!-- Main content -->
  <div style="max-width:640px;margin:0 auto;padding:24px 16px;">

    <!-- Intro -->
    <div style="background:#ffffff;border-radius:12px;padding:24px;margin-bottom:20px;border:1px solid #e5e7eb;">
      <div style="font-size:22px;font-weight:800;color:#111827;margin-bottom:6px;">Hi there! 👋</div>
      <div style="color:#6b7280;font-size:15px;line-height:1.6;">
        Here's your personalized grant report for <strong style="color:#111827;">${businessName}</strong>, generated on ${now}.
        We found <strong>${allGrants.length} grant opportunities</strong> matched to your business profile.
      </div>
    </div>

    <!-- Top Picks -->
    <div style="margin-bottom:20px;">
      <div style="font-size:20px;font-weight:800;color:#111827;margin-bottom:16px;">⭐ Your Top Picks</div>
      ${topPicksHtml}
    </div>

    <!-- All Grants -->
    <div style="margin-bottom:20px;">
      <div style="font-size:20px;font-weight:800;color:#111827;margin-bottom:16px;">📋 All Grant Opportunities</div>
      ${allGrantsHtml}
    </div>

    ${upcomingDeadlines ? `
    <!-- Upcoming Deadlines -->
    <div style="background:#ffffff;border-radius:12px;padding:24px;margin-bottom:20px;border:1px solid #e5e7eb;">
      <div style="font-size:18px;font-weight:700;color:#111827;margin-bottom:16px;">📅 Upcoming Deadlines</div>
      <ul style="margin:0;padding-left:20px;">
        ${upcomingDeadlines}
      </ul>
    </div>
    ` : ""}

    <!-- Tips -->
    <div style="background:#ffffff;border-radius:12px;padding:24px;margin-bottom:20px;border:1px solid #e5e7eb;">
      <div style="font-size:18px;font-weight:700;color:#111827;margin-bottom:16px;">🚀 Tips to Strengthen Your Applications</div>
      <ul style="margin:0;padding-left:20px;color:#374151;line-height:1.8;font-size:14px;">
        <li>Have your EIN, business registration, and financial statements ready before applying</li>
        <li>Start with grants that match the most criteria in your profile</li>
        <li>Apply early — many grants close before the deadline when funds run out</li>
        <li>Follow the instructions exactly; incomplete applications are disqualified</li>
        <li>Consider applying for multiple grants simultaneously to increase your chances</li>
      </ul>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:24px 0;color:#9ca3af;font-size:12px;line-height:1.6;">
      <div>© 2026 GrantCrafter. All rights reserved.</div>
      <div style="margin-top:8px;">Questions? <a href="mailto:support@grantcrafter.com" style="color:#15803d;">support@grantcrafter.com</a></div>
      <div style="margin-top:12px;max-width:480px;margin-left:auto;margin-right:auto;">
        <strong>Disclaimer:</strong> This report is for informational purposes only and does not constitute legal or financial advice. 
        Grant availability, amounts, and deadlines may change. Always verify information directly with the granting organization before applying.
      </div>
    </div>

  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;

      if (!orderId) {
        console.error("No order_id in session metadata");
        return NextResponse.json({ error: "No order_id" }, { status: 400 });
      }

      // Fetch the full profile from report_orders
      const { data: order, error: fetchError } = await supabaseAdmin
        .from("report_orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (fetchError || !order) {
        console.error("Failed to fetch order:", fetchError);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Update with Stripe session ID
      await supabaseAdmin
        .from("report_orders")
        .update({ stripe_session_id: session.id, status: "processing" })
        .eq("id", orderId);

      // Build profile for prompt
      const profile = {
        businessName: order.business_name || "",
        businessType: order.business_type || "",
        industry: order.industry || "",
        city: order.city || "",
        state: order.state || "",
        employeeCount: order.employee_count || "",
        annualRevenue: order.annual_revenue || "",
        yearsInBusiness: order.years_in_business || "",
        qualifiers: order.qualifiers || [],
        additionalContext: order.additional_context || "",
      };

      // Generate prompt
      const prompt = buildGrantPrompt(profile);

      // Call Claude
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 6000,
        messages: [{ role: "user", content: prompt }],
      });

      let reportContent = response.content[0].type === "text" ? response.content[0].text : "";

      // Fix known bad URLs
      reportContent = fixKnownBadUrls(reportContent);

      // Validate and clean report
      const validated = await validateAndCleanReport(reportContent);
      reportContent = validated.cleanedContent;

      // Parse grants
      const grants = parseGrantsFromReport(reportContent);

      // Build and send rich HTML email
      const emailHtml = buildEmail(grants, order.business_name || "Your Business", order.email, reportContent);

      const { error: emailError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "reports@grantcrafter.com",
        to: order.email,
        subject: `Your GrantCrafter Report is Ready — ${order.business_name || "Your Business"}`,
        html: emailHtml,
      });

      if (emailError) {
        console.error("Email send error:", emailError);
      }

      // Mark order as completed
      await supabaseAdmin
        .from("report_orders")
        .update({ status: "completed" })
        .eq("id", orderId);

      console.log(`Report generated and emailed for order ${orderId}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
