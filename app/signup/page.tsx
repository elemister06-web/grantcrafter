"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-green-50 flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-1 mb-10">
        <span className="text-2xl font-black text-green-700">Grant</span>
        <span className="text-2xl font-black text-gray-900">Crafter</span>
      </Link>

      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Start Your Free Trial
        </h1>
        <p className="text-gray-500 mb-8">
          7 days free, then $49/month. Cancel anytime.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourbusiness.com"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-black text-lg py-4 rounded-xl transition-colors"
          >
            {loading ? "Redirecting to payment..." : "Continue to Payment →"}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          {[
            "🔒 Secure checkout via Stripe",
            "📋 First report delivered within 24 hours",
            "❌ Cancel anytime from your dashboard",
            "💰 7-day money-back guarantee",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center max-w-sm">
        By signing up, you agree to our{" "}
        <Link href="/terms" className="underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>
        .
      </p>
    </main>
  );
}
