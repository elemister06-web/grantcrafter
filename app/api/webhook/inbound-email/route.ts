import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const resend = new Resend(process.env.RESEND_API_KEY!);

async function sendTelegramAlert(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_GROUP_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
    });
  } catch (err) {
    console.error("Telegram alert failed:", err);
  }
}

// This endpoint receives inbound email webhooks from Resend
// Webhook URL: https://grantcrafter.com/api/webhook/inbound-email
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeEmailField(v: any): { email: string; name: string } {
  if (!v) return { email: "", name: "" };
  if (typeof v === "string") {
    const m = v.match(/^\s*(.*?)\s*<(.+?)>\s*$/);
    if (m) return { email: m[2], name: m[1] };
    return { email: v, name: "" };
  }
  if (typeof v === "object") {
    return { email: v.address || v.email || "", name: v.name || "" };
  }
  return { email: "", name: "" };
}

export async function POST(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let raw: any;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Resend wraps inbound as { type: "email.received", data: {...} }
  const eventType: string = raw?.type || "";
  if (eventType && eventType !== "email.received") {
    return NextResponse.json({ received: true, skipped: `unsupported event ${eventType}` });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payload: any = raw?.data && typeof raw.data === "object" ? raw.data : raw;

  // Resend's webhook payload only contains metadata (email_id, from, to, subject).
  // Fetch the full body via GET /emails/receiving/{id}.
  if (payload?.email_id && (!payload.text || payload.text.length === 0)) {
    try {
      const fetchRes = await fetch(`https://api.resend.com/emails/receiving/${payload.email_id}`, {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      });
      if (fetchRes.ok) {
        const full = await fetchRes.json();
        payload = { ...payload, ...full };
      } else {
        console.warn("GC inbound: could not fetch full body", fetchRes.status);
      }
    } catch (err) {
      console.error("GC inbound: fetch body failed", err);
    }
  }

  // Domain gate — only handle emails addressed to this site
  const toRawCheck = payload.to ?? payload.recipient ?? [];
  const toCheckStr = JSON.stringify(toRawCheck).toLowerCase();
  if (!toCheckStr.includes("grantcrafter.com")) {
    return NextResponse.json({ received: true, skipped: "not for this domain" });
  }

  function prettyNameFromEmail(email: string): string {
    const local = (email.split("@")[0] || "").replace(/[._\-]+/g, " ").trim();
    if (!local) return "there";
    return local.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  }
  const fromInfo = normalizeEmailField(payload.from || payload.sender);
  const fromEmail = fromInfo.email || "unknown";
  const rawNameCandidate = payload.from_name || fromInfo.name || "";
  const fromName: string = rawNameCandidate && !rawNameCandidate.includes("@")
    ? rawNameCandidate.replace(/^"|"$/g, "").trim()
    : prettyNameFromEmail(fromEmail);
  const subject: string = payload.subject || "(no subject)";
  // Prefer plain text. If only HTML exists, strip it cleanly so Claude can read the actual message.
  const rawText: string = payload.text || payload.plain || "";
  const rawHtml: string = payload.html || "";
  const htmlAsText: string = rawHtml
    ? String(rawHtml)
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    : "";
  const body: string = (rawText && rawText.trim().length > 0) ? rawText : htmlAsText;
  const excerpt = body.slice(0, 300);
  const toArr = payload.to ?? payload.recipient ?? [];
  const toFirst = Array.isArray(toArr) ? toArr[0] : toArr;
  const toInfo = normalizeEmailField(toFirst);
  const toEmail: string = toInfo.email;

  // ── Skip auto-replies to avoid loops ──────────────────────────────────
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

  const isSupportEmail = toEmail.toLowerCase().includes("support@");

  // ── Look up business name from report_orders ──────────────────────────
  let businessName = "Unknown";
  try {
    const emailMatch = fromEmail.match(/<(.+?)>/) || [null, fromEmail];
    const cleanEmail = emailMatch[1] || fromEmail;

    const { data: order } = await supabaseAdmin
      .from("report_orders")
      .select("business_name")
      .eq("email", cleanEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (order?.business_name) {
      businessName = order.business_name;
    }
  } catch {
    // Not found — keep default
  }

  // ── Always notify on Telegram ─────────────────────────────────────────
  const telegramMsg = isSupportEmail
    ? `📨 <b>Support Email — GrantCrafter</b>\n<b>From:</b> ${fromEmail}\n<b>Business:</b> ${businessName}\n<b>Subject:</b> ${subject}\n<b>Message:</b>\n${excerpt}${body.length > 300 ? "…" : ""}`
    : `📬 <b>Customer Reply — GrantCrafter</b>\n<b>From:</b> ${fromEmail}\n<b>Business:</b> ${businessName}\n<b>Subject:</b> ${subject}\n<b>Message:</b>\n${excerpt}${body.length > 300 ? "…" : ""}`;

  await sendTelegramAlert(telegramMsg);

  // ── If support@ email: run AI auto-reply ─────────────────────────────
  if (isSupportEmail) {
    try {
      const bodyLower = (body + subject).toLowerCase();
      const isRefundRequest = [
        "refund", "money back", "cancel", "charge back", "chargeback",
        "not satisfied", "not happy", "disappointed", "didn't work", "doesn't work",
      ].some(kw => bodyLower.includes(kw));

      let replyText: string;

      if (isRefundRequest) {
        replyText = `Hi ${fromName},\n\nThank you for reaching out. We're sorry the report didn't meet your expectations — we want to make this right.\n\nTo process your refund, please use our quick refund form here:\n\nhttps://www.grantcrafter.com/refund\n\nIt takes about 60 seconds. Your feedback also helps us improve the product for future customers, so we genuinely appreciate it.\n\nYour refund will be processed within 5–7 business days once submitted.\n\nThe GrantCrafter Team`;
      } else {
        const aiResponse = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `You are a friendly, professional customer support agent for GrantCrafter (grantcrafter.com) — an AI-powered grant research service for small businesses. The service is $19.99 per report, one-time payment, no subscription or account required. Reports are delivered by email within 2-3 minutes of payment.\n\nA customer named "${fromName}" sent this support email:\n\nSubject: ${subject}\n\nMessage:\n${body || "(no message body provided)"}\n\nProduct facts:\n- GrantCrafter delivers up to 25 personalized grant opportunities matched to the customer's business profile\n- Report is delivered by email within 2-3 minutes of payment\n- 7-day money-back guarantee\n- We do NOT guarantee grant awards — we are a research/discovery service\n\nImportant rules:\n- Keep your reply under 200 words\n- Write in plain text (NO markdown formatting, NO asterisks, NO bold, NO bullet points using "-" or "*")\n- If you want emphasis, use natural language only\n- Sign off as "The GrantCrafter Team"\n- Do not include a subject line\n- If the message body is empty or unclear, ask politely what they need help with rather than assuming\n- Always address the customer directly and respond to what they actually wrote`,
            },
          ],
        });
        replyText = aiResponse.content[0].type === "text"
          ? aiResponse.content[0].text
          : "Thank you for reaching out! Our team will get back to you shortly.";
      }

      // Convert basic markdown -> HTML for the email body, and produce a clean plain-text version
      const replyHtmlBody = replyText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/(^|[\s])\*(?!\s)([^*\n]+?)\*(?=[\s.,!?]|$)/g, "$1<em>$2</em>")
        .replace(/\n\n/g, "</p><p style='margin:0 0 12px;'>")
        .replace(/\n/g, "<br>");
      const replyTextClean = replyText
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/(^|[\s])\*(?!\s)([^*\n]+?)\*(?=[\s.,!?]|$)/g, "$1$2");

      await resend.emails.send({
        from: "GrantCrafter Support <support@grantcrafter.com>",
        to: fromEmail,
        replyTo: "support@grantcrafter.com",
        subject: `Re: ${subject}`,
        html: `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;color:#374151;line-height:1.6;font-size:15px;">
  <p style='margin:0 0 12px;'>${replyHtmlBody}</p>
  <hr style="border:1px solid #e5e7eb;margin:24px 0;">
  <p style="color:#9ca3af;font-size:12px;margin:0;">
    GrantCrafter · AI-Powered Grant Discovery<br>
    <a href="https://www.grantcrafter.com" style="color:#15803d;">grantcrafter.com</a>
  </p>
</div>`,
        text: replyTextClean,
      });

      console.log(`GC support auto-reply sent: from=${fromEmail}, subject=${subject}, bodyLen=${body.length}`);
      return NextResponse.json({ success: true, support: true, telegramNotified: true });
    } catch (err) {
      console.error("GC support auto-reply error:", err);
      // Return success anyway — Telegram already notified, don't cause Resend retries
      return NextResponse.json({ received: true, error: "auto_reply_failed", telegramNotified: true });
    }
  }

  return NextResponse.json({ received: true, telegramNotified: true });
}
