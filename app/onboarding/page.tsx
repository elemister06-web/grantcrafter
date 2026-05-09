"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const INDUSTRIES = [
  "Food & Beverage / Restaurant",
  "Retail",
  "Construction & Contracting",
  "Healthcare / Medical",
  "Technology / Software",
  "Manufacturing",
  "Professional Services (Legal, Accounting, Consulting)",
  "Creative & Media",
  "Transportation & Logistics",
  "Agriculture & Farming",
  "Education & Childcare",
  "Nonprofit / Community Services",
  "Real Estate",
  "Beauty & Personal Care",
  "Auto & Transportation Services",
  "Other",
];

const QUALIFIERS = [
  "Woman-owned",
  "Minority-owned",
  "Veteran-owned",
  "Service-disabled veteran-owned",
  "LGBTQ+-owned",
  "Located in a low-income area",
  "Located in a rural area",
  "Native American-owned",
  "Disabled owner",
];

const STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming","Washington D.C.",
];

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    businessName: "",
    businessType: "small_business",
    industry: "",
    city: "",
    state: "",
    employeeCount: "",
    annualRevenue: "",
    yearsInBusiness: "",
    qualifiers: [] as string[],
    additionalContext: "",
  });

  useEffect(() => {
    if (!sessionId) {
      router.push("/signup");
    }
  }, [sessionId, router]);

  const update = (field: string, value: string | string[]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleQualifier = (q: string) => {
    setForm((prev) => ({
      ...prev,
      qualifiers: prev.qualifiers.includes(q)
        ? prev.qualifiers.filter((x) => x !== q)
        : [...prev.qualifiers, q],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, ...form }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/thank-you");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-green-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="flex items-center gap-1 mb-8">
          <span className="text-2xl font-black text-green-700">Grant</span>
          <span className="text-2xl font-black text-gray-900">Crafter</span>
        </Link>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s
                    ? "bg-green-700 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`h-1 w-16 rounded ${
                    step > s ? "bg-green-700" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
          <span className="ml-2 text-sm text-gray-500">
            Step {step} of 3 —{" "}
            {step === 1
              ? "Business Basics"
              : step === 2
              ? "Business Details"
              : "Qualifiers"}
          </span>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-black text-gray-900 mb-1">
                  Tell us about your business
                </h1>
                <p className="text-gray-500 text-sm">
                  This helps us find grants you actually qualify for.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => update("businessName", e.target.value)}
                  placeholder="e.g. Midwest Bakery LLC"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Business Type
                </label>
                <select
                  value={form.businessType}
                  onChange={(e) => update("businessType", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="small_business">Small Business</option>
                  <option value="nonprofit">Nonprofit / 501(c)(3)</option>
                  <option value="startup">Startup (under 2 years)</option>
                  <option value="solo">Sole Proprietor / Freelancer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Industry
                </label>
                <select
                  value={form.industry}
                  onChange={(e) => update("industry", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select your industry...</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!form.businessName || !form.industry}
                className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition-colors"
              >
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-black text-gray-900 mb-1">
                  Business Details
                </h1>
                <p className="text-gray-500 text-sm">
                  More detail = more relevant grants.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="Cincinnati"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    State
                  </label>
                  <select
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select state...</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Number of Employees
                </label>
                <select
                  value={form.employeeCount}
                  onChange={(e) => update("employeeCount", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select...</option>
                  <option value="Just me (solo)">Just me (solo)</option>
                  <option value="2-5">2–5 employees</option>
                  <option value="6-10">6–10 employees</option>
                  <option value="11-25">11–25 employees</option>
                  <option value="26-50">26–50 employees</option>
                  <option value="51-100">51–100 employees</option>
                  <option value="100+">100+ employees</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Annual Revenue (approximate)
                </label>
                <select
                  value={form.annualRevenue}
                  onChange={(e) => update("annualRevenue", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select...</option>
                  <option value="Pre-revenue">Pre-revenue / startup</option>
                  <option value="Under $50K">Under $50K</option>
                  <option value="$50K-$250K">$50K – $250K</option>
                  <option value="$250K-$1M">$250K – $1M</option>
                  <option value="$1M-$5M">$1M – $5M</option>
                  <option value="Over $5M">Over $5M</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Years in Business
                </label>
                <select
                  value={form.yearsInBusiness}
                  onChange={(e) => update("yearsInBusiness", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select...</option>
                  <option value="Under 1 year">Under 1 year</option>
                  <option value="1-2 years">1–2 years</option>
                  <option value="3-5 years">3–5 years</option>
                  <option value="6-10 years">6–10 years</option>
                  <option value="Over 10 years">Over 10 years</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!form.city || !form.state || !form.employeeCount}
                  className="flex-1 bg-green-700 hover:bg-green-800 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition-colors"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-black text-gray-900 mb-1">
                  Special Qualifiers
                </h1>
                <p className="text-gray-500 text-sm">
                  These unlock additional targeted grant opportunities. Select
                  all that apply.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {QUALIFIERS.map((q) => (
                  <button
                    key={q}
                    onClick={() => toggleQualifier(q)}
                    className={`text-left px-4 py-3 rounded-xl border-2 font-medium transition-colors ${
                      form.qualifiers.includes(q)
                        ? "border-green-600 bg-green-50 text-green-800"
                        : "border-gray-200 text-gray-700 hover:border-green-300"
                    }`}
                  >
                    {form.qualifiers.includes(q) ? "✓ " : "  "}
                    {q}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Anything else we should know? (optional)
                </label>
                <textarea
                  value={form.additionalContext}
                  onChange={(e) => update("additionalContext", e.target.value)}
                  placeholder="e.g. We focus on sustainable products, we're in a HUBZone, we serve a specific underserved community..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl transition-colors"
                >
                  {loading ? "Setting up your account..." : "Generate My Report →"}
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Your first report will be generated and emailed within 24 hours.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-green-50 flex items-center justify-center text-gray-500">Loading...</div>}>
      <OnboardingForm />
    </Suspense>
  );
}
