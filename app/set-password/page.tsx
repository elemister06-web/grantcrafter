"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Supabase sends the token in the URL hash or as a query param
    // Use the browser client to pick up the session from the URL
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Listen for auth state change - Supabase will exchange the code/token automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        if (session) {
          setSessionReady(true);
        }
      }
    });

    // Also try to get the current session (in case already exchanged)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message || "Failed to set password.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Give them a moment to see success, then redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#f8fafc" }}
    >
      <div
        className="w-full rounded-2xl shadow-lg p-10"
        style={{ maxWidth: 420, backgroundColor: "white" }}
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-0.5">
            <span className="text-2xl font-black text-green-700">Grant</span>
            <span className="text-2xl font-black text-gray-900">Crafter</span>
          </Link>
          <p className="text-sm text-gray-500 mt-2">Set your password</p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Password set!</h2>
            <p className="text-sm text-gray-500">
              Taking you to your dashboard...
            </p>
          </div>
        ) : !sessionReady ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm mb-4">
              Verifying your link...
            </div>
            <div className="text-xs text-gray-400">
              If this takes too long,{" "}
              <Link href="/forgot-password" className="text-green-700 underline">
                request a new link
              </Link>
              .
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                New password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
                className="border border-gray-200 rounded-xl px-4 py-3 w-full text-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                autoComplete="new-password"
                className="border border-gray-200 rounded-xl px-4 py-3 w-full text-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none transition"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
            >
              {loading ? "Setting password..." : "Set Password & Go to Dashboard"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
