"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ThankYouContent() {
  const params = useSearchParams();
  // We don't have the email here without fetching — keep it generic
  const sessionId = params.get("session_id");

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>

      {/* Card */}
      <div style={{ background: "#ffffff", borderRadius: "16px", padding: "48px 40px", maxWidth: "560px", width: "100%", textAlign: "center", border: "1px solid #e5e7eb", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

        {/* Icon */}
        <div style={{ fontSize: "72px", marginBottom: "16px" }}>✅</div>

        <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#111827", margin: "0 0 12px", lineHeight: "1.2" }}>
          Your report is being generated!
        </h1>

        <p style={{ color: "#6b7280", fontSize: "16px", lineHeight: "1.6", margin: "0 0 32px" }}>
          Your personalized grant report will arrive in your inbox within <strong style={{ color: "#111827" }}>2–3 minutes</strong>. Check your spam folder if you don't see it.
        </p>

        {/* While you wait */}
        <div style={{ background: "#f0fdf4", borderRadius: "12px", padding: "24px", textAlign: "left", marginBottom: "32px", border: "1px solid #bbf7d0" }}>
          <div style={{ fontWeight: "700", color: "#15803d", fontSize: "16px", marginBottom: "12px" }}>
            💡 While you wait...
          </div>
          <ul style={{ margin: "0", padding: "0 0 0 20px", color: "#374151", lineHeight: "1.8", fontSize: "14px" }}>
            <li>Locate your EIN and business registration documents</li>
            <li>Gather your most recent financial statements</li>
            <li>Note any certifications your business holds (DBE, WOSB, etc.)</li>
            <li>Prepare a brief description of what you'd use grant funds for</li>
            <li>Review your business bank account statements (some grants require them)</li>
          </ul>
        </div>

        {/* What to expect in report */}
        <div style={{ background: "#fffbeb", borderRadius: "12px", padding: "20px", textAlign: "left", marginBottom: "32px", border: "1px solid #fde68a" }}>
          <div style={{ fontWeight: "700", color: "#92400e", fontSize: "15px", marginBottom: "10px" }}>
            📋 What's in your report
          </div>
          <ul style={{ margin: "0", padding: "0 0 0 20px", color: "#78350f", lineHeight: "1.8", fontSize: "14px" }}>
            <li>8–10 grant opportunities matched to your profile</li>
            <li>Award amounts and application deadlines</li>
            <li>Direct "Apply Now" links for each grant</li>
            <li>Pro tips specific to your industry and location</li>
          </ul>
        </div>

        <a
          href="/"
          style={{ display: "inline-block", background: "#15803d", color: "#ffffff", padding: "14px 32px", borderRadius: "10px", textDecoration: "none", fontWeight: "700", fontSize: "16px" }}
        >
          ← Back to GrantCrafter
        </a>

        <div style={{ marginTop: "20px", color: "#9ca3af", fontSize: "13px" }}>
          Questions? <a href="mailto:support@grantcrafter.com" style={{ color: "#15803d" }}>support@grantcrafter.com</a>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", color: "#6b7280" }}>
        Loading...
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
