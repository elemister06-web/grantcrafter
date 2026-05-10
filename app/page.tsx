"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Logo from "@/components/Logo";

function HomeContent() {
  const params = useSearchParams();
  const canceled = params.get("canceled");

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#111827" }}>

      {/* Nav */}
      <nav style={{ background: "#ffffff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <Logo size="md" href="/" />
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <a href="#how-it-works" style={{ color: "#6b7280", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}>How It Works</a>
            <a href="#pricing" style={{ color: "#6b7280", textDecoration: "none", fontSize: "14px", fontWeight: "500" }}>Pricing</a>
            <a href="/get-report" style={{ background: "#15803d", color: "#ffffff", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: "700" }}>Get My Report →</a>
          </div>
        </div>
      </nav>

      {/* Canceled notice */}
      {canceled && (
        <div style={{ background: "#fffbeb", borderBottom: "1px solid #fde68a", padding: "12px 24px", textAlign: "center", color: "#92400e", fontSize: "14px" }}>
          Your checkout was canceled. Ready when you are — <a href="/get-report" style={{ color: "#15803d", fontWeight: "700" }}>try again →</a>
        </div>
      )}

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #15803d 0%, #166534 100%)", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", color: "#ffffff", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", marginBottom: "24px", border: "1px solid rgba(255,255,255,0.25)" }}>
            One-time report · No subscription · No account required
          </div>
          <h1 style={{ color: "#ffffff", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: "900", margin: "0 0 20px", lineHeight: "1.15", letterSpacing: "-1px" }}>
            Find Grants Your Business<br />Actually Qualifies For
          </h1>
          <p style={{ color: "#bbf7d0", fontSize: "18px", lineHeight: "1.6", margin: "0 0 40px", maxWidth: "560px", marginLeft: "auto", marginRight: "auto" }}>
            Tell us about your business. Pay once. Get a personalized report of up to 20+ real grant opportunities in your inbox within minutes.
          </p>
          <a
            href="/get-report"
            style={{ display: "inline-block", background: "#ffffff", color: "#15803d", padding: "18px 40px", borderRadius: "12px", textDecoration: "none", fontSize: "18px", fontWeight: "900", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
          >
            Get My Grant Report — $19.99 →
          </a>
          <div style={{ color: "#86efac", fontSize: "14px", marginTop: "16px" }}>
            No subscription · No account · Delivered to your inbox
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: "80px 24px", background: "#f9fafb" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "32px", fontWeight: "800", margin: "0 0 48px", color: "#111827" }}>How It Works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
            {[
              { step: "1", icon: "📝", title: "Tell us about your business", desc: "Fill out a simple 2-minute form with your business details — industry, location, size, and ownership info." },
              { step: "2", icon: "💳", title: "Pay once — $19.99", desc: "One flat fee. No subscription, no recurring charges, no account to manage. Secure checkout via Stripe." },
              { step: "3", icon: "📬", title: "Get your report by email", desc: "Your personalized grant report lands in your inbox — usually within 2–3 minutes of payment." },
            ].map(item => (
              <div key={item.step} style={{ background: "#ffffff", borderRadius: "12px", padding: "32px 24px", textAlign: "center", border: "1px solid #e5e7eb" }}>
                <div style={{ width: "48px", height: "48px", background: "#15803d", color: "#ffffff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "800", margin: "0 auto 16px" }}>
                  {item.step}
                </div>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>{item.icon}</div>
                <div style={{ fontWeight: "700", fontSize: "17px", color: "#111827", marginBottom: "10px" }}>{item.title}</div>
                <div style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.6" }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's in the report */}
      <section style={{ padding: "80px 24px", background: "#ffffff" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "32px", fontWeight: "800", margin: "0 0 20px", color: "#111827", lineHeight: "1.2" }}>
              What's in your report
            </h2>
            <p style={{ color: "#6b7280", fontSize: "16px", lineHeight: "1.6", margin: "0 0 24px" }}>
              Not a generic list. A fully personalized report built from your business profile, powered by AI grant research.
            </p>
            <ul style={{ margin: "0", padding: "0", listStyle: "none" }}>
              {[
                "Up to 20+ grant opportunities matched to your profile",
                "Federal, state, local, and private foundation grants",
                "Award amounts, deadlines, and eligibility requirements",
                'Direct "Apply Now" links for each grant',
                "Pro tips specific to your business and location",
                "100% personalized — not a generic list",
              ].map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px", fontSize: "15px", color: "#374151" }}>
                  <span style={{ color: "#15803d", fontWeight: "700", marginTop: "1px", flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {/* Sample report preview */}
          <div style={{ background: "#f9fafb", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "24px", overflow: "hidden" }}>
            <div style={{ background: "#15803d", borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
              <div style={{ color: "#ffffff", fontWeight: "800", fontSize: "15px", marginBottom: "4px" }}>GrantCrafter Report</div>
              <div style={{ color: "#bbf7d0", fontSize: "12px" }}>Sample · Small Business · Cincinnati, OH</div>
            </div>
            {[
              { name: "USDA Rural Business Development Grant", amount: "Up to $500K", badge: "Federal", badgeColor: "#1d4ed8" },
              { name: "SBA Small Business Innovation Research", amount: "Up to $275K", badge: "Federal", badgeColor: "#1d4ed8" },
              { name: "Ohio TechCred Workforce Program", amount: "Up to $30K", badge: "State", badgeColor: "#7e22ce" },
            ].map((g, i) => (
              <div key={i} style={{ background: "#ffffff", borderRadius: "8px", padding: "12px 14px", marginBottom: "10px", border: "1px solid #e5e7eb" }}>
                <div style={{ fontWeight: "700", fontSize: "13px", color: "#111827", marginBottom: "4px" }}>{g.name}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "16px", fontWeight: "800", color: "#15803d" }}>{g.amount}</span>
                  <span style={{ background: g.badgeColor, color: "#fff", fontSize: "11px", padding: "2px 8px", borderRadius: "20px", fontWeight: "600" }}>{g.badge}</span>
                </div>
              </div>
            ))}
            <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "12px", paddingTop: "8px" }}>+ 5–7 more grants in your full report</div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: "80px 24px", background: "#f9fafb" }}>
        <div style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "800", margin: "0 0 12px", color: "#111827" }}>Simple, Transparent Pricing</h2>
          <p style={{ color: "#6b7280", fontSize: "16px", margin: "0 0 40px" }}>One report. One price. No surprises.</p>
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "2px solid #15803d", padding: "40px", boxShadow: "0 8px 32px rgba(21,128,61,0.12)" }}>
            <div style={{ fontSize: "48px", fontWeight: "900", color: "#15803d", lineHeight: "1" }}>$19.99</div>
            <div style={{ color: "#6b7280", fontSize: "16px", margin: "8px 0 32px" }}>one-time payment</div>
            <ul style={{ textAlign: "left", margin: "0 0 32px", padding: "0", listStyle: "none" }}>
              {[
                "Up to 20+ personalized grant opportunities",
                "Federal, state, local & private grants",
                "Award amounts & deadlines",
                "Direct Apply Now links",
                "Pro tips for your profile",
                "Delivered to your inbox in minutes",
              ].map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", fontSize: "15px", color: "#374151" }}>
                  <span style={{ color: "#15803d", fontWeight: "700" }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <a
              href="/get-report"
              style={{ display: "block", background: "#15803d", color: "#ffffff", padding: "16px", borderRadius: "10px", textDecoration: "none", fontSize: "17px", fontWeight: "800", marginBottom: "16px" }}
            >
              Get My Grant Report →
            </a>
            <div style={{ color: "#9ca3af", fontSize: "13px" }}>No subscription. No monthly fees. Pay once, get your report.</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "80px 24px", background: "#ffffff" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "32px", fontWeight: "800", margin: "0 0 48px", color: "#111827" }}>Frequently Asked Questions</h2>
          {[
            { q: "How long does it take?", a: "Usually 2–3 minutes after payment. We use AI to research and compile your report in real-time, so it's fast." },
            { q: "Do I need to create an account?", a: "No. Just your email address and business info. No login, no password, no dashboard." },
            { q: "Are these real grants?", a: "Yes. We research actual federal, state, local, and private foundation grants. Every grant includes a direct apply link." },
            { q: "Can I get another report later?", a: "Absolutely. Just come back and order again anytime — maybe after your business grows or your situation changes." },
            { q: "What if I don't receive my email?", a: "Check your spam folder first. If it's still not there after 10 minutes, email us at support@grantcrafter.com and we'll help." },
            { q: "Is my payment secure?", a: "Yes. We use Stripe for payment processing — the same platform used by millions of businesses. We never see your card details." },
          ].map((item, i) => (
            <div key={i} style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "20px", marginBottom: "20px" }}>
              <div style={{ fontWeight: "700", fontSize: "16px", color: "#111827", marginBottom: "8px" }}>{item.q}</div>
              <div style={{ color: "#6b7280", fontSize: "15px", lineHeight: "1.6" }}>{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: "linear-gradient(135deg, #15803d 0%, #166534 100%)", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto" }}>
          <h2 style={{ color: "#ffffff", fontSize: "36px", fontWeight: "900", margin: "0 0 16px", lineHeight: "1.2" }}>
            Ready to find your grants?
          </h2>
          <p style={{ color: "#bbf7d0", fontSize: "17px", margin: "0 0 40px", lineHeight: "1.6" }}>
            Get a personalized report in your inbox within minutes. $19.99, no subscription.
          </p>
          <a
            href="/get-report"
            style={{ display: "inline-block", background: "#ffffff", color: "#15803d", padding: "18px 48px", borderRadius: "12px", textDecoration: "none", fontSize: "18px", fontWeight: "900", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
          >
            Get My Grant Report — $19.99 →
          </a>
          <div style={{ color: "#86efac", fontSize: "14px", marginTop: "16px" }}>
            No subscription · No account · Instant delivery
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#111827", padding: "48px 24px", color: "#9ca3af" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "24px", marginBottom: "32px" }}>
            <div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#ffffff", marginBottom: "8px" }}>GrantCrafter</div>
              <div style={{ fontSize: "14px", lineHeight: "1.6", maxWidth: "280px" }}>AI-powered grant research for small businesses. Find real opportunities, fast.</div>
            </div>
            <div style={{ display: "flex", gap: "32px" }}>
              <div>
                <div style={{ color: "#ffffff", fontWeight: "600", fontSize: "14px", marginBottom: "12px" }}>Product</div>
                <a href="/get-report" style={{ display: "block", color: "#9ca3af", textDecoration: "none", fontSize: "14px", marginBottom: "8px" }}>Get a Report</a>
                <a href="#how-it-works" style={{ display: "block", color: "#9ca3af", textDecoration: "none", fontSize: "14px", marginBottom: "8px" }}>How It Works</a>
                <a href="#pricing" style={{ display: "block", color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>Pricing</a>
              </div>
              <div>
                <div style={{ color: "#ffffff", fontWeight: "600", fontSize: "14px", marginBottom: "12px" }}>Legal</div>
                <a href="/privacy" style={{ display: "block", color: "#9ca3af", textDecoration: "none", fontSize: "14px", marginBottom: "8px" }}>Privacy Policy</a>
                <a href="/terms" style={{ display: "block", color: "#9ca3af", textDecoration: "none", fontSize: "14px", marginBottom: "8px" }}>Terms of Service</a>
                <a href="/disclaimer" style={{ display: "block", color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>Disclaimer</a>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #374151", paddingTop: "24px", fontSize: "13px", lineHeight: "1.6" }}>
            <p style={{ margin: "0 0 12px" }}>
              <strong style={{ color: "#d1d5db" }}>Disclaimer:</strong> GrantCrafter provides grant research and information for educational purposes only. 
              We do not guarantee grant approval or funding. Grant availability, amounts, and deadlines are subject to change. 
              Always verify information directly with the granting organization. This is not legal or financial advice.
            </p>
            <p style={{ margin: "0" }}>© 2026 GrantCrafter. All rights reserved. · <a href="mailto:support@grantcrafter.com" style={{ color: "#15803d" }}>support@grantcrafter.com</a></p>
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
