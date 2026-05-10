import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Resend inbound email payload structure
    const emailData = body?.data || body;
    const fromEmail: string = emailData?.from || emailData?.sender || "";
    const fromName: string = emailData?.from_name || fromEmail.split("<")[0].trim() || "Customer";
    const subject: string = emailData?.subject || "Support Request";
    const emailBody: string =
      emailData?.text || emailData?.plain_text || emailData?.html || "";
    const toEmail: string = emailData?.to?.[0] || "support@grantcrafter.com";

    // Only respond to emails sent to support@grantcrafter.com
    if (!toEmail.includes("grantcrafter.com")) {
      return NextResponse.json({ received: true });
    }

    // Skip auto-replies to avoid loops
    const subjectLower = subject.toLowerCase();
    if (
      subjectLower.includes("auto-reply") ||
      subjectLower.includes("out of office") ||
      subjectLower.includes("no-reply") ||
      subjectLower.includes("noreply") ||
      fromEmail.includes("noreply") ||
      fromEmail.includes("no-reply")
    ) {
      return NextResponse.json({ received: true, skipped: "auto-reply" });
    }

    // Detect refund requests — send the refund page link directly
    const bodyLower = (emailBody + subject).toLowerCase();
    const isRefundRequest = [
      "refund", "money back", "cancel", "charge back", "chargeback",
      "not satisfied", "not happy", "disappointed", "didn't work", "doesn't work",
    ].some(kw => bodyLower.includes(kw));

    let replyText: string;

    if (isRefundRequest) {
      replyText = `Hi ${fromName},\n\nThank you for reaching out. We're sorry the report didn't meet your expectations — we want to make this right.\n\nTo process your refund, please use our quick refund form here:\n\nhttps://www.grantcrafter.com/refund\n\nIt takes about 60 seconds. Your feedback also helps us improve the product for future customers, so we genuinely appreciate it.\n\nYour refund will be processed within 5–7 business days once submitted.\n\nThe GrantCrafter Team`;
    } else {
      // Generate AI response with Claude for all other support emails
      const aiResponse = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `You are a friendly, professional customer support agent for GrantCrafter (grantcrafter.com) — an AI-powered grant research service for small businesses. The service is $19.99 per report, one-time payment, no subscription or account required. Reports are delivered by email within 2-3 minutes of payment.\n\nA customer named "${fromName}" sent this support email:\n\nSubject: ${subject}\n\nMessage:\n${emailBody}\n\nWrite a helpful, warm, and concise support reply. Key information:\n- GrantCrafter delivers up to 25 personalized grant opportunities matched to the customer's business profile\n- Report is delivered by email within 2-3 minutes of payment\n- 7-day money-back guarantee — \n- We do NOT guarantee grant awards — we are a research/discovery service\n\nKeep your reply under 200 words. Be warm but professional. Sign off as "The GrantCrafter Team".\n\nDo not include a subject line — just write the email body.`,
          },
        ],
      });
      replyText = aiResponse.content[0].type === "text"
        ? aiResponse.content[0].text
        : "Thank you for reaching out! Our team will get back to you shortly.";
    }

    // Send the reply
    await resend.emails.send({
      from: "GrantCrafter Support <support@grantcrafter.com>",
      to: fromEmail,
      replyTo: "support@grantcrafter.com",
      subject: `Re: ${subject}`,
      html: `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;color:#374151;line-height:1.6;font-size:15px;">
  ${replyText.replace(/\n\n/g, "</p><p style='margin:0 0 12px;'>").replace(/\n/g, "<br>")}
  <hr style="border:1px solid #e5e7eb;margin:24px 0;">
  <p style="color:#9ca3af;font-size:12px;margin:0;">
    GrantCrafter · AI-Powered Grant Discovery<br>
    <a href="https://www.grantcrafter.com" style="color:#15803d;">grantcrafter.com</a> · 
    <a href="https://www.grantcrafter.com/dashboard" style="color:#15803d;">Your Dashboard</a>
  </p>
</div>`,
      text: replyText,
    });

    // Log to console for monitoring
    console.log(`Support email handled: from=${fromEmail}, subject=${subject}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Support email handler error:", err);
    // Always return 200 so Resend doesn't retry infinitely
    return NextResponse.json({ received: true, error: "handler_failed" });
  }
}
