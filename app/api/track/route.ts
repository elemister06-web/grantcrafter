import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { tool, event_type, source = "Direct" } = await req.json();
    if (!tool || !["view", "click"].includes(event_type)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    await supabase.from("page_events").insert({ site: "gc", tool: "grant-report", event_type, source });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
