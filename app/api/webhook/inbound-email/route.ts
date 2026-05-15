import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  let payload: {
    from?: string;
    subject?: string;
    text?: string;
    html?: string;
  };

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const fromEmail = payload.from || "unknown";
  const subject = payload.subject || "(no subject)";
  const body = payload.text || payload.html?.replace(/<[^>]+>/g, " ").trim() || "";
  const excerpt = body.slice(0, 300);

  // Look up business name from report_orders
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

  // Send Telegram notification
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const groupId = process.env.TELEGRAM_GROUP_ID;

  if (!botToken || !groupId) {
    console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_GROUP_ID");
    return NextResponse.json({ received: true, warning: "Telegram not configured" });
  }

  const message = `📩 *Customer Reply — GrantCrafter*\n*From:* ${fromEmail}\n*Business:* ${businessName}\n*Subject:* ${subject}\n*Message:* ${excerpt}${body.length > 300 ? "…" : ""}`;

  const telegramRes = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: groupId,
        text: message,
        parse_mode: "Markdown",
      }),
    }
  );

  if (!telegramRes.ok) {
    const err = await telegramRes.text();
    console.error("Telegram send failed:", err);
  }

  return NextResponse.json({ received: true });
}
