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

    // Generate AI response with Claude
    const aiResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `You are a friendly, professional customer support agent for GrantCrafter (grantcrafter.com) — an AI-powered monthly grant discovery service for small businesses and nonprofits. The service costs $49/month with a 7-day free trial and can be cancelled anytime.

A customer named "${fromName}" sent this support email:

Subject: ${subject}

Message:
${emailBody}

Write a helpful, warm, and concise support reply. Key information:
- GrantCrafter delivers personalized monthly grant reports based on the customer's business profile
- Reports are sent on the 1st of each month via email
- Customers can view all past reports in their dashboard at grantcrafter.com/dashboard
- For billing/cancellation: they can cancel anytime from the dashboard
- 7-day money-back guarantee on first charge
- We do NOT guarantee grant awards — we are a research/discovery service
- If they have account issues, they can reply to this email

Keep your reply under 200 words. Be warm but professional. Do not make up specific grant details. Sign off as "The GrantCrafter Team".

Do not include a subject line — just write the email body.`,
        },
      ],
    });

    const replyText =
      aiResponse.content[0].type === "text"
        ? aiResponse.content[0].text
        : "Thank you for reaching out! Our team will get back to you shortly.";

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
