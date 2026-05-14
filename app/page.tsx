"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Logo from "@/components/Logo";

function HomeContent() {
  const params = useSearchParams();
  const canceled = params.get("canceled");

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#111827" }}>
      <style>{`
        @media (max-width: 768px) {
          .gc-solution-grid { grid-template-columns: 1fr !important; }
          .gc-footer-flex { flex-direction: column !important; gap: 32px !important; }
          .gc-footer-links { flex-direction: row !important; gap: 32px !important; }
          .gc-hero h1 { font-size: 36px !important; letter-spacing: -0.5px !important; }
          .gc-trust-bar { gap: 16px !important; }
          .gc-how-grid { grid-template-columns: 1fr !important; }
          .gc-problem-grid { grid-template-columns: 1fr !important; }
          .gc-section { padding: 56px 20px !important; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ background: "#ffffff", borderBottom: "1px solid #e5e7eb", padding: "0 16px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
          <Logo size="md" href="/" />
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <a href="#how-it-works" style={{ color: "#6b7280", textDecoration: "none", fontSize: "14px", fontWeight: "500", whiteSpace: "nowrap" }} className="hidden-mobile">How It Works</a>
            <a href="#pricing" style={{ color: "#6b7280", textDecoration: "none", fontSize: "14px", fontWeight: "500", whiteSpace: "nowrap" }} className="hidden-mobile">Pricing</a>
            <a href="/get-report" style={{ background: "#15803d", color: "#ffffff", padding: "9px 16px", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: "700", whiteSpace: "nowrap" }}>Get My Report →</a>
          </div>
        </div>
      </nav>

      {/* Canceled banner */}
      {canceled && (
        <div style={{ background: "#fffbeb", borderBottom: "1px solid #fde68a", padding: "12px 24px", textAlign: "center", color: "#92400e", fontSize: "14px" }}>
          Your checkout was canceled. Ready when you are — <a href="/get-report" style={{ color: "#15803d", fontWeight: "700" }}>try again →</a>
        </div>
      )}

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #15803d 0%, #166534 100%)", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div className="gc-hero">
            <h1 style={{ color: "#ffffff", fontSize: "clamp(34px, 5vw, 56px)", fontWeight: "900", margin: "0 0 20px", lineHeight: "1.1", letterSpacing: "-1.5px" }}>
              Your Personalized<br />Grant List — In Minutes
            </h1>
          </div>
          <p style={{ color: "#bbf7d0", fontSize: "19px", lineHeight: "1.65", margin: "0 0 40px", maxWidth: "580px", marginLeft: "auto", marginRight: "auto" }}>
            Tell us about your business. We research up to 25 real grants you may qualify for — federal, state, local, and private — and deliver them straight to your inbox.
          </p>
          <a
            href="/get-report"
            style={{ display: "inline-block", background: "#ffffff", color: "#15803d", padding: "18px 44px", borderRadius: "12px", textDecoration: "none", fontSize: "19px", fontWeight: "900", boxShadow: "0 6px 24px rgba(0,0,0,0.18)" }}
          >
            Get My Grant Report — $19.99 →
          </a>
          <div style={{ color: "#86efac", fontSize: "13px", marginTop: "14px" }}>
            🔒 Secure checkout · 7-day money-back guarantee · Delivered in 2 minutes
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div style={{ background: "#f0fdf4", borderBottom: "1px solid #bbf7d0", padding: "16px 24px" }}>
        <div className="gc-trust-bar" style={{ maxWidth: "900px", margin: "0 auto", display: "flex", justifyContent: "center", alignItems: "center", gap: "40px", flexWrap: "wrap" }}>
          {[
            { icon: "⚡", text: "Report in 2 minutes" },
            { icon: "🏛️", text: "Federal, state & local grants" },
            { icon: "🎯", text: "Personalized to your business" },
            { icon: "📋", text: "Up to 25 matched grants" },
            { icon: "✅", text: "7-day money-back guarantee" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600", color: "#166534" }}>
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* The Problem */}
      <section className="gc-section" style={{ padding: "80px 24px", background: "#ffffff" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "34px", fontWeight: "800", margin: "0 0 16px", color: "#111827" }}>
            Finding grants is a full-time job you don't have.
          </h2>
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "17px", margin: "0 0 48px", lineHeight: "1.6" }}>
            Most grant tools are built for nonprofits. The free databases require you to search manually. Consultants charge $300/hour. And half the results you find don't even apply to your business.
          </p>
          <div className="gc-problem-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
            {[
              { emoji: "⏱️", title: "Hours of manual research", body: "Grants.gov alone lists 1,000+ programs. Sorting through them to find what you actually qualify for takes days." },
              { emoji: "📋", title: "Tools built for nonprofits", body: "Instrumentl, GrantStation, Candid — all designed for 501(c)(3)s. If you're a for-profit small business, you're an afterthought." },
              { emoji: "💸", title: "Consultants charge a fortune", body: "Grant writers charge $200–$500/hour. Even a basic research engagement runs thousands of dollars." },
            ].map((item, i) => (
              <div key={i} style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "28px" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>{item.emoji}</div>
                <div style={{ fontWeight: "700", fontSize: "17px", color: "#111827", marginBottom: "8px" }}>{item.title}</div>
                <div style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.6" }}>{item.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution / What you get */}
      <section className="gc-section" style={{ padding: "80px 24px", background: "#f9fafb" }}>
        <div className="gc-solution-grid" style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "56px", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-block", background: "#dcfce7", color: "#15803d", fontSize: "13px", fontWeight: "700", padding: "5px 14px", borderRadius: "20px", marginBottom: "20px" }}>
              The GrantCrafter Difference
            </div>
            <h2 style={{ fontSize: "34px", fontWeight: "800", margin: "0 0 20px", color: "#111827", lineHeight: "1.2" }}>
              Your personalized shortlist — in minutes, not days
            </h2>
            <p style={{ color: "#6b7280", fontSize: "16px", lineHeight: "1.7", margin: "0 0 28px" }}>
              Tell us about your business. Our AI researches every relevant federal, state, local, and private grant program and returns a curated report of the ones you're most likely to qualify for.
            </p>
            <ul style={{ margin: "0", padding: "0", listStyle: "none" }}>
              {[
                { icon: "🏛️", text: "Federal grants (SBA, USDA, NSF, EDA, DOE)" },
                { icon: "🏠", text: "State and local economic development programs" },
                { icon: "🏢", text: "Private foundations and corporate grant programs" },
                { icon: "🎯", text: "Matched to your specific industry, location, and size" },
                { icon: "🔗", text: "Direct apply links — no dead ends" },
                { icon: "💡", text: "Pro tips tailored to your exact business profile" },
              ].map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px", fontSize: "15px", color: "#374151" }}>
                  <span style={{ fontSize: "18px" }}>{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sample report card */}
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
            {/* Card header */}
            <div style={{ background: "#15803d", padding: "18px 22px" }}>
              <div style={{ color: "#ffffff", fontWeight: "800", fontSize: "15px", marginBottom: "3px" }}>Your GrantCrafter Report</div>
              <div style={{ color: "#bbf7d0", fontSize: "13px" }}>Acme Bakery · Cincinnati, OH · Food &amp; Beverage</div>
              <div style={{ color: "#86efac", fontSize: "12px", marginTop: "4px" }}>20 grants matched · Generated in 2 min</div>
            </div>

            {/* Top picks label */}
            <div style={{ background: "#f0fdf4", padding: "10px 22px", borderBottom: "1px solid #dcfce7" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#15803d", textTransform: "uppercase", letterSpacing: "0.08em" }}>Top Matches for You</span>
            </div>

            {/* Grant cards */}
            {[
              { name: "SBA Small Business Grant", amount: "Up to $250,000", badge: "Federal", color: "#1d4ed8", match: "Strong match" },
              { name: "Ohio TechCred Program", amount: "Up to $30,000", badge: "State", color: "#7e22ce", match: "Strong match" },
              { name: "USDA Rural Business Dev", amount: "Up to $500,000", badge: "Federal", color: "#1d4ed8", match: "Good match" },
              { name: "Hello Alice Small Biz Grant", amount: "$10,000", badge: "Private", color: "#0f766e", match: "Strong match" },
              { name: "Verizon Digital Ready", amount: "$10,000", badge: "Corporate", color: "#0f766e", match: "Good match" },
            ].map((g, i) => (
              <div key={i} style={{ padding: "12px 22px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: "700", fontSize: "13px", color: "#111827", marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.name}</div>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "#15803d" }}>{g.amount}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                  <span style={{ background: g.color, color: "#fff", fontSize: "10px", padding: "2px 8px", borderRadius: "20px", fontWeight: "700" }}>{g.badge}</span>
                  <span style={{ background: "#f0fdf4", color: "#15803d", fontSize: "10px", padding: "2px 8px", borderRadius: "20px", fontWeight: "600", border: "1px solid #bbf7d0" }}>{g.match}</span>
                </div>
              </div>
            ))}

            {/* Footer */}
            <div style={{ padding: "14px 22px", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "#9ca3af", fontSize: "12px", fontStyle: "italic" }}>+ 15 more grants in your report</span>
              <span style={{ background: "#15803d", color: "#ffffff", fontSize: "12px", fontWeight: "700", padding: "5px 14px", borderRadius: "8px" }}>View Full Report →</span>
            </div>
          </div>
        </div>
      </section>

      {/* vs. Alternatives */}
      <section id="vs" className="gc-section" style={{ padding: "80px 24px", background: "#ffffff" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "34px", fontWeight: "800", margin: "0 0 12px", color: "#111827" }}>How We Compare</h2>
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "17px", margin: "0 0 40px" }}>There&apos;s no other service that does exactly what we do.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { name: "GrantCrafter", cost: "$19.99 once", personal: true, biz: true, speed: "2 min", highlight: true },
              { name: "Grant Consultant", cost: "$200–$500/hr", personal: true, biz: true, speed: "Days–weeks", highlight: false },
              { name: "Instrumentl", cost: "$299–$999/mo", personal: true, biz: false, speed: "Ongoing", highlight: false },
              { name: "GrantWatch", cost: "$49/mo", personal: false, biz: null, speed: "DIY", highlight: false },
              { name: "Grants.gov", cost: "Free", personal: false, biz: null, speed: "DIY hours", highlight: false },
              { name: "Hello Alice", cost: "Free", personal: false, biz: true, speed: "Ongoing", highlight: false },
            ].map((row, i) => (
              <div key={i} style={{
                background: row.highlight ? "#f0fdf4" : "#ffffff",
                border: row.highlight ? "2px solid #15803d" : "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "18px 22px",
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}>
                {/* Name + cost */}
                <div style={{ flex: "1 1 160px", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                    {row.highlight && (
                      <span style={{ background: "#15803d", color: "#fff", fontSize: "11px", padding: "2px 8px", borderRadius: "4px", fontWeight: "700", flexShrink: 0 }}>YOU</span>
                    )}
                    <span style={{ fontWeight: row.highlight ? "800" : "600", fontSize: "15px", color: row.highlight ? "#15803d" : "#111827" }}>{row.name}</span>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: row.highlight ? "700" : "400", color: row.highlight ? "#15803d" : "#6b7280" }}>{row.cost}</div>
                </div>
                {/* Attributes */}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", flexShrink: 0 }}>
                  <div style={{ textAlign: "center", minWidth: "90px" }}>
                    <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "3px", fontWeight: "500" }}>Personalized?</div>
                    <div style={{ fontSize: "16px" }}>{row.personal ? "✅" : "❌"}</div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: "90px" }}>
                    <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "3px", fontWeight: "500" }}>For-profit biz?</div>
                    <div style={{ fontSize: "16px" }}>{row.biz === true ? "✅" : row.biz === false ? "❌" : "⚠️"}</div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: "80px" }}>
                    <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "3px", fontWeight: "500" }}>Speed</div>
                    <div style={{ fontSize: "13px", fontWeight: row.highlight ? "700" : "400", color: row.highlight ? "#15803d" : "#374151" }}>{row.speed}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "12px", marginTop: "12px" }}>Pricing and features based on publicly available information. All trademarks belong to their respective owners.</p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="gc-section" style={{ padding: "80px 24px", background: "#f9fafb" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "34px", fontWeight: "800", margin: "0 0 12px", color: "#111827" }}>How It Works</h2>
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "17px", margin: "0 0 48px" }}>Three steps. Two minutes. Done.</p>
          <div className="gc-how-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
            {[
              { step: "1", icon: "📝", title: "Tell us about your business", desc: "Fill out a simple form — business type, industry, location, size, and any ownership qualifiers. Takes about 2 minutes." },
              { step: "2", icon: "💳", title: "Pay $19.99 — one time", desc: "No recurring charges, no account to manage. Secure checkout via Stripe. Pay once, that's it." },
              { step: "3", icon: "📬", title: "Your report hits your inbox", desc: "Within 2 minutes, a personalized report with up to 25 real grant opportunities lands in your email. Ready to act on immediately." },
            ].map(item => (
              <div key={item.step} style={{ background: "#ffffff", borderRadius: "16px", padding: "32px 24px", textAlign: "center", border: "1px solid #e5e7eb" }}>
                <div style={{ width: "52px", height: "52px", background: "#15803d", color: "#ffffff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "900", margin: "0 auto 16px" }}>
                  {item.step}
                </div>
                <div style={{ fontSize: "34px", marginBottom: "14px" }}>{item.icon}</div>
                <div style={{ fontWeight: "700", fontSize: "17px", color: "#111827", marginBottom: "10px" }}>{item.title}</div>
                <div style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.65" }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="gc-section" style={{ padding: "80px 24px", background: "#ffffff" }}>
        <div style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "34px", fontWeight: "800", margin: "0 0 12px", color: "#111827" }}>Simple Pricing</h2>
          <p style={{ color: "#6b7280", fontSize: "17px", margin: "0 0 40px" }}>One report. One price. No surprises ever.</p>
          <div style={{ background: "#ffffff", borderRadius: "20px", border: "2px solid #15803d", padding: "40px", boxShadow: "0 12px 40px rgba(21,128,61,0.15)" }}>
            <div style={{ fontSize: "52px", fontWeight: "900", color: "#15803d", lineHeight: "1", letterSpacing: "-2px" }}>$19.99</div>
            <div style={{ color: "#6b7280", fontSize: "16px", margin: "8px 0 8px" }}>one-time payment</div>
            <div style={{ color: "#15803d", fontSize: "14px", fontWeight: "600", margin: "0 0 32px" }}>7-day money-back guarantee</div>
            <ul style={{ textAlign: "left", margin: "0 0 32px", padding: "0", listStyle: "none" }}>
              {[
                "Up to 25 personalized grant opportunities",
                "Federal, state, local & private grants",
                "Award amounts & application deadlines",
                "Direct Apply Now links — verified",
                "Pro tips tailored to your profile",
                "Delivered to your inbox in 2 minutes",
                "One-time payment. No recurring charges.",
              ].map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "11px", fontSize: "15px", color: "#374151" }}>
                  <span style={{ color: "#15803d", fontWeight: "700", flexShrink: 0 }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <a
              href="/get-report"
              style={{ display: "block", background: "#15803d", color: "#ffffff", padding: "17px", borderRadius: "10px", textDecoration: "none", fontSize: "17px", fontWeight: "800", marginBottom: "14px" }}
            >
              Get My Grant Report →
            </a>
            <div style={{ color: "#9ca3af", fontSize: "13px" }}>🔒 Secured by Stripe · Not satisfied? We'll refund you.</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="gc-section" style={{ padding: "80px 24px", background: "#f9fafb" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "34px", fontWeight: "800", margin: "0 0 48px", color: "#111827" }}>Questions</h2>
          {[
            { q: "Are these real grants?", a: "Yes. Every grant in your report is a real, documented program from federal agencies (SBA, USDA, NSF, EDA), state economic development offices, local funds, or verified private foundations. We include the direct source URL for every listing so you can verify independently." },
            { q: "Are the grants current?", a: "We research programs that are active, recurring, or have open application windows at the time of your report. Some programs are rolling (no fixed deadline), others are annual. We clearly note the deadline status for each grant — if a window is currently closed, we say so." },
            { q: "I'm a for-profit business, not a nonprofit. Is this for me?", a: "Yes — and this is actually where we stand out. Most grant tools are built for nonprofits. GrantCrafter specifically researches programs available to for-profit small businesses, including SBA programs, state economic development grants, and corporate programs that serve businesses of all types." },
            { q: "How long does it take?", a: "Usually 2–3 minutes after payment. Our AI researches and compiles your report in real-time." },
            { q: "Do I need to create an account?", a: "No. Just your email address and business details. No login, no password, no dashboard to manage." },
            { q: "How many grants will be in my report?", a: "Most reports include 15–25 grant opportunities. The exact number depends on your business profile — location, industry, size, and ownership qualifiers all affect how many programs you qualify for. Niche industries or very rural areas may yield fewer matches than urban businesses with broader eligibility. Every grant listed is a real program we believe you may qualify for — we never pad reports with irrelevant results." },
            { q: "What if I\'m not happy with my report?", a: "Email us at support@grantcrafter.com within 7 days and we\'ll refund your payment in full." },
            { q: "Can I order another report later?", a: "Absolutely. Come back anytime — especially if your business situation changes or you want updated results." },
          ].map((item, i) => (
            <div key={i} style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "22px", marginBottom: "22px" }}>
              <div style={{ fontWeight: "700", fontSize: "16px", color: "#111827", marginBottom: "8px" }}>{item.q}</div>
              <div style={{ color: "#6b7280", fontSize: "15px", lineHeight: "1.65" }}>{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: "linear-gradient(135deg, #15803d 0%, #166534 100%)", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ color: "#ffffff", fontSize: "38px", fontWeight: "900", margin: "0 0 16px", lineHeight: "1.15", letterSpacing: "-1px" }}>
            There are grants with your name on them.
          </h2>
          <p style={{ color: "#bbf7d0", fontSize: "18px", margin: "0 0 40px", lineHeight: "1.6" }}>
            Stop leaving money on the table. Get your personalized report in 2 minutes. $19.99 — pay once, done.
          </p>
          <a
            href="/get-report"
            style={{ display: "inline-block", background: "#ffffff", color: "#15803d", padding: "18px 48px", borderRadius: "12px", textDecoration: "none", fontSize: "19px", fontWeight: "900", boxShadow: "0 6px 24px rgba(0,0,0,0.18)" }}
          >
            Get My Grant Report — $19.99 →
          </a>
          <div style={{ color: "#86efac", fontSize: "14px", marginTop: "16px" }}>
            🔒 Secure checkout · 7-day money-back guarantee · No account required
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#111827", padding: "48px 24px", color: "#9ca3af" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div className="gc-footer-flex" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "24px", marginBottom: "32px" }}>
            <div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#ffffff", marginBottom: "8px" }}>GrantCrafter</div>
              <div style={{ fontSize: "14px", lineHeight: "1.6", maxWidth: "280px" }}>AI-powered grant research for small businesses. Real opportunities, delivered fast.</div>
            </div>
            <div className="gc-footer-links" style={{ display: "flex", gap: "40px" }}>
              <div>
                <div style={{ color: "#ffffff", fontWeight: "600", fontSize: "14px", marginBottom: "12px" }}>Product</div>
                {[["Get a Report", "/get-report"], ["How It Works", "#how-it-works"], ["Pricing", "#pricing"], ["vs. Alternatives", "#vs"]].map(([label, href]) => (
                  <a key={label} href={href} style={{ display: "block", color: "#9ca3af", textDecoration: "none", fontSize: "14px", marginBottom: "8px" }}>{label}</a>
                ))}
              </div>
              <div>
                <div style={{ color: "#ffffff", fontWeight: "600", fontSize: "14px", marginBottom: "12px" }}>Legal</div>
                {[["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Disclaimer", "/disclaimer"], ["Contact", "mailto:support@grantcrafter.com"]].map(([label, href]) => (
                  <a key={label} href={href} style={{ display: "block", color: "#9ca3af", textDecoration: "none", fontSize: "14px", marginBottom: "8px" }}>{label}</a>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #374151", paddingTop: "24px", fontSize: "13px", lineHeight: "1.7" }}>
            <p style={{ margin: "0 0 10px" }}>
              <strong style={{ color: "#d1d5db" }}>Disclaimer:</strong> GrantCrafter provides AI-generated grant research for informational purposes only. We do not guarantee grant approval, funding, or award outcomes. Grant availability, amounts, and deadlines are subject to change. Always verify information directly with the granting organization before applying. This is not legal or financial advice. GrantCrafter is operated by Warehouse Web Co.
            </p>
            <p style={{ margin: "0" }}>© 2026 GrantCrafter · Warehouse Web Co · <a href="mailto:support@grantcrafter.com" style={{ color: "#15803d" }}>support@grantcrafter.com</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div />}>
      <HomeContent />
    </Suspense>
  );
}
