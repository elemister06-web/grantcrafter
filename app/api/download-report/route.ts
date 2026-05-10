import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { buildReportPDF } from "@/lib/pdf-report";

const formatPeriodLabel = (month: string): string => {
  if (month.includes("-W")) {
    const [year, week] = month.split("-W");
    const jan4 = new Date(parseInt(year), 0, 4);
    const startOfWeek = new Date(jan4);
    startOfWeek.setDate(
      jan4.getDate() - (jan4.getDay() || 7) + 1 + (parseInt(week) - 1) * 7
    );
    return `Week of ${startOfWeek.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })}`;
  }
  const [year, m] = month.split("-");
  const date = new Date(parseInt(year), parseInt(m) - 1);
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
};

export async function GET(req: NextRequest) {
  try {
    // Verify auth from cookie
    const token = req.cookies.get("gc_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get report ID from query
    const reportId = req.nextUrl.searchParams.get("reportId");
    if (!reportId) {
      return NextResponse.json({ error: "Report ID required" }, { status: 400 });
    }

    // Fetch the report and verify ownership
    const { data: report, error: reportError } = await supabaseAdmin
      .from("grant_reports")
      .select("id, month, report_content, user_id")
      .eq("id", reportId)
      .single();

    if (reportError || !report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Verify the report belongs to the authenticated user
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("id, business_name")
      .eq("email", user.email.toLowerCase())
      .single();

    if (!userData || report.user_id !== userData.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build the PDF
    const periodLabel = formatPeriodLabel(report.month);
    const pdfBytes = await buildReportPDF(
      report.report_content,
      userData.business_name || user.email,
      periodLabel
    );

    // Return as PDF download
    const filename = `grant-report-${report.month}.pdf`;
    const buffer = Buffer.from(pdfBytes);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (err) {
    console.error("Download report error:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
