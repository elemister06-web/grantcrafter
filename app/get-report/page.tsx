"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

const QUALIFIERS = [
  { value: "woman-owned", label: "Woman-owned" },
  { value: "minority-owned", label: "Minority-owned" },
  { value: "veteran-owned", label: "Veteran-owned" },
  { value: "lgbtq-owned", label: "LGBTQ+-owned" },
  { value: "rural-business", label: "Rural business" },
  { value: "none", label: "None of the above" },
];

export default function GetReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    business_name: "",
    business_type: "",
    industry: "",
    city: "",
    state: "",
    employee_count: "",
    annual_revenue: "",
    years_in_business: "",
    qualifiers: [] as string[],
    additional_context: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleQualifier(value: string) {
    setForm(prev => {
      const q = prev.qualifiers.includes(value)
        ? prev.qualifiers.filter(v => v !== value)
        : [...prev.qualifiers, value];
      return { ...prev, qualifiers: q };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: "#ffffff", borderBottom: "1px solid #e5e7eb", padding: "0 24px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <a href="/" style={{ textDecoration: "none" }}><Logo size="md" /></a>
          <a href="/" style={{ color: "#6b7280", textDecoration: "none", fontSize: "14px" }}>← Back to Home</a>
        </div>
      </nav>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #15803d 0%, #166534 100%)", padding: "48px 24px", textAlign: "center" }}>
        <h1 style={{ color: "#ffffff", fontSize: "32px", fontWeight: "900", margin: "0 0 12px", lineHeight: "1.2" }}>
          Get Your Grant Report
        </h1>
        <p style={{ color: "#bbf7d0", fontSize: "16px", margin: "0", maxWidth: "480px", marginLeft: "auto", marginRight: "auto" }}>
          Tell us about your business and we'll find real grant opportunities matched to your profile.
        </p>
      </div>

      {/* Form */}
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 16px" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ background: "#ffffff", borderRadius: "12px", padding: "32px", border: "1px solid #e5e7eb", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 24px" }}>Business Profile</h2>

            {/* Email */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontWeight: "600", color: "#374151", marginBottom: "6px", fontSize: "14px" }}>
                Email Address <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box", outline: "none" }}
              />
              <div style={{ color: "#6b7280", fontSize: "12px", marginTop: "4px" }}>Your report will be sent here</div>
            </div>

            {/* Business Name */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontWeight: "600", color: "#374151", marginBottom: "6px", fontSize: "14px" }}>
                Business Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                name="business_name"
                required
                value={form.business_name}
                onChange={handleChange}
                placeholder="Acme Roofing LLC"
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box" }}
              />
            </div>

            {/* Business Type */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontWeight: "600", color: "#374151", marginBottom: "6px", fontSize: "14px" }}>
                Business Type <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                name="business_type"
                required
                value={form.business_type}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box", background: "#fff" }}
              >
                <option value="">Select type...</option>
                <option value="Small Business">Small Business</option>
                <option value="Startup">Startup</option>
                <option value="Nonprofit">Nonprofit</option>
                <option value="Freelancer/Solo">Freelancer / Solo</option>
              </select>
            </div>

            {/* Industry */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontWeight: "600", color: "#374151", marginBottom: "6px", fontSize: "14px" }}>
                Industry <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                name="industry"
                required
                value={form.industry}
                onChange={handleChange}
                placeholder="e.g. Construction, Food & Beverage, Technology..."
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box" }}
              />
            </div>

            {/* City + State */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "600", color: "#374151", marginBottom: "6px", fontSize: "14px" }}>
                  City <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Cincinnati"
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: "600", color: "#374151", marginBottom: "6px", fontSize: "14px" }}>
                  State <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  value={form.state}
                  onChange={handleChange}
                  placeholder="OH"
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {/* Employees */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontWeight: "600", color: "#374151", marginBottom: "6px", fontSize: "14px" }}>
                Number of Employees
              </label>
              <select
                name="employee_count"
                value={form.employee_count}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box", background: "#fff" }}
              >
                <option value="">Select...</option>
                <option value="Just me">Just me</option>
                <option value="2-5">2–5</option>
                <option value="6-10">6–10</option>
                <option value="11-50">11–50</option>
                <option value="50+">50+</option>
              </select>
            </div>

            {/* Annual Revenue */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontWeight: "600", color: "#374151", marginBottom: "6px", fontSize: "14px" }}>
                Annual Revenue
              </label>
              <select
                name="annual_revenue"
                value={form.annual_revenue}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box", background: "#fff" }}
              >
                <option value="">Select...</option>
                <option value="Pre-revenue">Pre-revenue</option>
                <option value="Under $100K">Under $100K</option>
                <option value="$100K-$500K">$100K – $500K</option>
                <option value="$500K-$1M">$500K – $1M</option>
                <option value="$1M+">$1M+</option>
              </select>
            </div>

            {/* Years in Business */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontWeight: "600", color: "#374151", marginBottom: "6px", fontSize: "14px" }}>
                Years in Business
              </label>
              <select
                name="years_in_business"
                value={form.years_in_business}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box", background: "#fff" }}
              >
                <option value="">Select...</option>
                <option value="Less than 1 year">Less than 1 year</option>
                <option value="1-3 years">1–3 years</option>
                <option value="3-5 years">3–5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
            </div>

            {/* Ownership Qualifiers */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontWeight: "600", color: "#374151", marginBottom: "10px", fontSize: "14px" }}>
                Ownership Qualifiers
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {QUALIFIERS.map(q => (
                  <label key={q.value} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", color: "#374151", padding: "8px 12px", border: `1px solid ${form.qualifiers.includes(q.value) ? "#15803d" : "#e5e7eb"}`, borderRadius: "8px", background: form.qualifiers.includes(q.value) ? "#f0fdf4" : "#fff" }}>
                    <input
                      type="checkbox"
                      checked={form.qualifiers.includes(q.value)}
                      onChange={() => handleQualifier(q.value)}
                      style={{ accentColor: "#15803d" }}
                    />
                    {q.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Context */}
            <div style={{ marginBottom: "8px" }}>
              <label style={{ display: "block", fontWeight: "600", color: "#374151", marginBottom: "6px", fontSize: "14px" }}>
                Anything else? <span style={{ fontWeight: "400", color: "#9ca3af" }}>(optional)</span>
              </label>
              <textarea
                name="additional_context"
                value={form.additional_context}
                onChange={handleChange}
                rows={3}
                placeholder="Anything that might help us find better grants for you — e.g. specific programs you're targeting, recent awards, certifications..."
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", resize: "vertical" }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px 16px", color: "#dc2626", fontSize: "14px", marginBottom: "16px" }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "18px", background: loading ? "#86efac" : "#15803d", color: "#ffffff", fontSize: "18px", fontWeight: "800", border: "none", borderRadius: "12px", cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s" }}
          >
            {loading ? "Redirecting to checkout..." : "Get My Grant Report — $19.99 →"}
          </button>

          <div style={{ textAlign: "center", marginTop: "12px", color: "#6b7280", fontSize: "14px" }}>
            You'll be taken to secure checkout. Report delivered to your email within minutes.
          </div>
          <div style={{ textAlign: "center", marginTop: "8px", color: "#9ca3af", fontSize: "13px" }}>
            🔒 Secured by Stripe · No subscription · No account required
          </div>
        </form>
      </div>
    </div>
  );
}
