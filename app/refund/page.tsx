"use client";

import { useState } from "react";
import Logo from "@/components/Logo";

const REASONS = [
  "Too few grant opportunities in my report",
  "Grants weren't relevant to my business or industry",
  "Apply links were broken or didn't work",
  "Report was too generic — not personalized enough",
  "I found the information I needed elsewhere",
  "Technical issue — report never arrived",
  "Other",
];

export default function RefundPage() {
  const [form, setForm] = useState({
    email: "",
    reason: "",
    grantCount: "",
    improvement: "",
  });
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setState("done");
      } else {
        setState("error");
        setMessage(data.error || "Something went wrong. Please email support@grantcrafter.com directly.");
      }
    } catch {
      setState("error");
      setMessage("Network error. Please email support@grantcrafter.com directly.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <nav style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", height: "64px", display: "flex", alignItems: "center" }}>
          <Logo href="/" size="md" />
        </div>
      </nav>

      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "48px 24px" }}>

        {state === "done" ? (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "48px 32px", textAlign: "center", border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", margin: "0 0 12px" }}>Refund submitted</h1>
            <p style={{ color: "#6b7280", fontSize: "16px", lineHeight: "1.6", margin: "0 0 8px" }}>
              Your refund will be processed within 5–7 business days back to your original payment method.
            </p>
            <p style={{ color: "#6b7280", fontSize: "15px", lineHeight: "1.6" }}>
              Thank you for your feedback — we read every response and use it to improve GrantCrafter.
            </p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "32px" }}>
              <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#111827", margin: "0 0 8px" }}>Request a Refund</h1>
              <p style={{ color: "#6b7280", fontSize: "16px", margin: "0" }}>
                We&apos;re sorry the report didn&apos;t meet your expectations. Tell us what happened — your feedback directly shapes how we improve.
              </p>
            </div>

            {state === "error" && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px", color: "#dc2626", fontSize: "14px" }}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", border: "1px solid #e5e7eb" }}>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontWeight: "600", color: "#374151", marginBottom: "6px", fontSize: "14px" }}>
                    Email address used for your order <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontWeight: "600", color: "#374151", marginBottom: "6px", fontSize: "14px" }}>
                    Primary reason for your refund <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    required
                    value={form.reason}
                    onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box", background: "#fff" }}
                  >
                    <option value="">Select a reason…</option>
                    {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontWeight: "600", color: "#374151", marginBottom: "6px", fontSize: "14px" }}>
                    How many grant opportunities were in your report?
                  </label>
                  <select
                    value={form.grantCount}
                    onChange={e => setForm(f => ({ ...f, grantCount: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box", background: "#fff" }}
                  >
                    <option value="">Select…</option>
                    <option value="0-5">0–5 grants</option>
                    <option value="6-10">6–10 grants</option>
                    <option value="11-15">11–15 grants</option>
                    <option value="16-20">16–20 grants</option>
                    <option value="20+">20+ grants</option>
                  </select>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontWeight: "600", color: "#374151", marginBottom: "6px", fontSize: "14px" }}>
                    What would have made your report more useful?
                    <span style={{ color: "#9ca3af", fontWeight: "400" }}> (optional — but very helpful)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={form.improvement}
                    onChange={e => setForm(f => ({ ...f, improvement: e.target.value }))}
                    placeholder="e.g. More grants for my specific industry, better links, more local opportunities..."
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box", resize: "vertical" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={state === "loading"}
                  style={{ width: "100%", padding: "14px", background: state === "loading" ? "#9ca3af" : "#15803d", color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: state === "loading" ? "not-allowed" : "pointer" }}
                >
                  {state === "loading" ? "Processing…" : "Submit & Request Refund"}
                </button>
                <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "13px", marginTop: "12px" }}>
                  Refunds are processed within 5–7 business days.
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
