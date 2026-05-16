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

function extractAiTips(rawReport: string): string[] {
  const lines = rawReport.split("\n");
  const tips: string[] = [];
  let inTips = false;
  for (const line of lines) {
    if (/^## .*(tips|strengthen)/i.test(line)) { inTips = true; continue; }
    if (inTips && /^## /.test(line)) break;
    if (inTips && /^[-•*]\s+/.test(line)) {
      const tip = line.replace(/^[-•*]\s+/, "").replace(/\*\*(.+?)\*\*/g, "$1").trim();
      if (tip) tips.push(tip);
    }
  }
  return tips;
}

function extractUpcomingDeadlines(rawReport: string): string[] {
  const lines = rawReport.split("\n");
  const items: string[] = [];
  let inDeadlines = false;
  for (const line of lines) {
    if (/^## .*(upcoming|deadline)/i.test(line)) { inDeadlines = true; continue; }
    if (inDeadlines && /^## /.test(line)) break;
    if (inDeadlines && /^[-•*]\s+/.test(line)) {
      const item = line.replace(/^[-•*]\s+/, "").replace(/\*\*(.+?)\*\*/g, "$1").trim();
      if (item) items.push(item);
    }
  }
  return items;
}

function buildEmail(grants: ReturnType<typeof parseGrantsFromReport>, businessName: string, email: string, rawReport: string): string {
  const top3 = grants.slice(0, 3);
  const allGrants = grants;
  const now = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const aiTips = extractAiTips(rawReport);
  const aiDeadlines = extractUpcomingDeadlines(rawReport);

  // Truncate long deadline text cleanly
  const fmtDeadline = (d: string) => d.length > 60 ? d.slice(0, 57).trimEnd() + "..." : d;

  // Top picks — clean cards, no emojis
  const topPicksHtml = top3.map(g => `
    <div style="background:#f0fdf4;border-radius:10px;padding:20px;margin-bottom:12px;border:1px solid #bbf7d0;border-left:4px solid #15803d;">
      <div style="font-size:15px;font-weight:700;color:#14532d;margin-bottom:4px;">${g.name}</div>
      <div style="color:#6b7280;font-size:13px;margin-bottom:8px;">${g.organization}</div>
      <div style="font-size:22px;font-weight:800;color:#15803d;margin-bottom:${g.deadline ? '4px' : '0'};">${g.amount}</div>
      ${g.deadline ? `<div style="color:#92400e;font-size:12px;font-weight:600;">${fmtDeadline(g.deadline)}</div>` : ""}
    </div>
  `).join("");

  // All grants — professional cards
  const allGrantsHtml = allGrants.map(g => {
    const badgeColor = getBadgeColor(g.type);
    const applyBtn = g.applyUrl
      ? `<a href="${g.applyUrl}" style="display:inline-block;background:#15803d;color:#ffffff;padding:10px 22px;border-radius:6px;text-decoration:none;font-weight:700;font-size:13px;margin-top:14px;">Apply Now</a>`
      : "";
    const eligBg = g.eligibilityAssessment.toLowerCase().includes("strong")
      ? "#f0fdf4" : g.eligibilityAssessment.toLowerCase().includes("good")
      ? "#eff6ff" : "#fffbeb";
    const eligColor = g.eligibilityAssessment.toLowerCase().includes("strong")
      ? "#15803d" : g.eligibilityAssessment.toLowerCase().includes("good")
      ? "#1d4ed8" : "#d97706";
    const eligBorder = g.eligibilityAssessment.toLowerCase().includes("strong")
      ? "#bbf7d0" : g.eligibilityAssessment.toLowerCase().includes("good")
      ? "#bfdbfe" : "#fde68a";
    return `
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;padding:22px;margin-bottom:14px;">
      <div style="font-size:16px;font-weight:800;color:#111827;margin-bottom:8px;">${g.name}</div>
      <div style="display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:10px;">
        <span style="color:#6b7280;font-size:13px;">${g.organization}</span>
        <span style="background:${badgeColor};color:#fff;font-size:11px;font-weight:600;padding:2px 8px;border-radius:4px;">${g.type}</span>
        ${g.eligibilityAssessment ? `<span style="background:${eligBg};color:${eligColor};font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;border:1px solid ${eligBorder};">${g.eligibilityAssessment}</span>` : ""}
      </div>
      <div style="font-size:22px;font-weight:800;color:#15803d;margin-bottom:6px;">${g.amount}</div>
      ${g.deadline ? `<div style="color:#92400e;font-size:13px;font-weight:600;margin-bottom:10px;">Deadline: ${g.deadline}</div>` : ""}
      <div style="color:#374151;font-size:14px;line-height:1.65;margin-bottom:12px;">${g.whatItFunds}</div>
      ${applyBtn}
      ${g.proTip ? `<div style="background:#f8f9fa;border-left:3px solid #15803d;padding:10px 14px;margin-top:14px;"><span style="color:#374151;font-size:13px;line-height:1.6;"><strong style="color:#14532d;">Note:</strong> ${g.proTip}</span></div>` : ""}
    </div>
  `;
  }).join("");

  const upcomingDeadlinesHtml = aiDeadlines.length > 0
    ? aiDeadlines.map(item => `<li style="margin-bottom:8px;color:#374151;font-size:14px;">${item}</li>`).join("")
    : allGrants
        .filter(g => g.deadline && g.deadline !== "Varies" && g.deadline !== "Rolling")
        .slice(0, 5)
        .map(g => `<li style="margin-bottom:8px;color:#374151;font-size:14px;"><strong>${g.name}</strong> &mdash; <span style="color:#92400e;">${g.deadline}</span></li>`)
        .join("");

  const tipsHtml = aiTips.length > 0
    ? aiTips.map(tip => `<li style="margin-bottom:8px;color:#374151;font-size:14px;line-height:1.65;">${tip}</li>`).join("")
    : `<li style="margin-bottom:8px;color:#374151;font-size:14px;">Have your EIN, business registration, and financial statements ready before applying</li>
       <li style="margin-bottom:8px;color:#374151;font-size:14px;">Apply early — many grants close before the official deadline when funds run out</li>
       <li style="margin-bottom:8px;color:#374151;font-size:14px;">Follow all instructions exactly; incomplete applications are typically disqualified without review</li>
       <li style="margin-bottom:8px;color:#374151;font-size:14px;">Consider applying for multiple programs simultaneously to increase your chances</li>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Your Grant Report &mdash; GrantCrafter</title>
<style>
  body { margin:0; padding:0; background:#f3f4f6; }
  @media only screen and (max-width:600px) {
    .email-body { padding: 12px !important; }
    .grant-card { padding: 16px !important; }
    .grant-amount { font-size: 18px !important; }
    .apply-btn { display: block !important; text-align: center !important; }
  }
</style>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#111827;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6;">
<tr><td align="center" style="padding:24px 16px;">
<table width="100%" style="max-width:620px;" cellpadding="0" cellspacing="0" border="0">

  <!-- Header -->
  <tr><td style="background:#15803d;border-radius:10px 10px 0 0;padding:32px 32px 28px;">
    <div style="font-size:11px;font-weight:700;color:#86efac;text-transform:uppercase;letter-spacing:0.14em;margin-bottom:10px;">GrantCrafter</div>
    <div style="font-size:24px;font-weight:800;color:#ffffff;line-height:1.2;margin-bottom:6px;">Your Grant Report is Ready</div>
    <div style="font-size:14px;color:#bbf7d0;">${businessName} &mdash; ${allGrants.length} opportunities matched</div>
  </td></tr>

  <!-- Body -->
  <tr><td class="email-body" style="background:#ffffff;padding:28px 32px;">

    <!-- Greeting -->
    <p style="font-size:16px;font-weight:700;color:#111827;margin:0 0 10px;">Hello, ${businessName},</p>
    <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 28px;">We researched federal, state, local, and private grant programs and found <strong style="color:#15803d;">${allGrants.length} opportunities</strong> that match your business profile. Your top picks are highlighted below, followed by the full list with apply links and pro tips for each program.</p>

    <!-- Divider -->
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 28px;">

    <!-- Top Picks -->
    <div style="margin-bottom:28px;">
      <div style="font-size:11px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:14px;">Top Matches</div>
      ${topPicksHtml}
    </div>

    <!-- Divider -->
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 28px;">

    <!-- All Grants -->
    <div style="margin-bottom:28px;">
      <div style="font-size:11px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:14px;">All Grant Opportunities</div>
      ${allGrantsHtml}
    </div>

    ${upcomingDeadlinesHtml ? `
    <!-- Divider -->
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 28px;">

    <!-- Deadlines -->
    <div style="margin-bottom:28px;">
      <div style="font-size:11px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:14px;">Upcoming Deadlines</div>
      <ul style="margin:0;padding-left:18px;">${upcomingDeadlinesHtml}</ul>
    </div>
    ` : ""}

    <!-- Divider -->
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 28px;">

    <!-- Tips -->
    <div style="margin-bottom:8px;">
      <div style="font-size:11px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:14px;">Tips to Strengthen Your Applications</div>
      <ul style="margin:0;padding-left:18px;">${tipsHtml}</ul>
    </div>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f8f9fa;border-radius:0 0 10px 10px;border-top:1px solid #e5e7eb;padding:22px 32px;">
    <p style="margin:0 0 8px;font-size:12px;color:#6b7280;line-height:1.7;">
      <strong style="color:#374151;">Disclaimer:</strong> This report is provided for informational purposes only and does not constitute legal or financial advice. Grant availability, eligibility requirements, award amounts, and deadlines are subject to change. Always verify information directly with the granting organization before applying.
    </p>
    <p style="margin:0;font-size:12px;color:#9ca3af;">GrantCrafter &middot; <a href="https://www.grantcrafter.com" style="color:#15803d;text-decoration:none;">grantcrafter.com</a> &middot; <a href="mailto:support@grantcrafter.com" style="color:#15803d;text-decoration:none;">support@grantcrafter.com</a></p>
  </td></tr>

</table>
</td></tr>
</table>

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

      // Idempotency check — if already processing or completed, skip (prevents Stripe retry duplicates)
      if (order.status === "processing" || order.status === "completed") {
        console.log(`Order ${orderId} already ${order.status} — skipping duplicate webhook`);
        return NextResponse.json({ received: true });
      }

      // Mark as processing immediately to block any concurrent retries
      await supabaseAdmin
        .from("report_orders")
        .update({ stripe_session_id: session.id, status: "processing" })
        .eq("id", orderId)
        .eq("status", "pending"); // only update if still pending (atomic guard)

      // Cancel any scheduled abandoned-cart recovery email (customer paid in time).
      if (order.recovery_email_id) {
        try {
          await resend.emails.cancel(order.recovery_email_id);
        } catch (err) {
          // Non-fatal — email may have already sent or been cancelled.
          console.warn("Recovery email cancel failed:", err);
        }
      }

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
