"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProfileData {
  id: string;
  email: string;
  business_name: string;
  business_type: string;
  industry: string;
  city: string;
  state: string;
  employee_count: string;
  annual_revenue: string;
  years_in_business: string;
  qualifiers: string[];
  additional_context: string;
  subscription_status: string;
  created_at: string;
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "active": return "Active Member";
    case "trialing": return "Free Trial";
    case "canceling": return "Canceling";
    case "past_due": return "Past Due";
    case "canceled": return "Canceled";
    default: return status;
  }
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [form, setForm] = useState({
    business_name: "",
    industry: "",
    city: "",
    state: "",
    additional_context: "",
  });

  useEffect(() => {
    fetch("/api/profile", { credentials: "include" })
      .then(async (res) => {
        if (res.status === 401 || !res.ok) {
          router.push("/login");
          return;
        }
        const data: ProfileData = await res.json();
        setProfile(data);
        setForm({
          business_name: data.business_name || "",
          industry: data.industry || "",
          city: data.city || "",
          state: data.state || "",
          additional_context: data.additional_context || "",
        });
        setLoading(false);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaveMessage("Changes saved.");
        setProfile((prev) => prev ? { ...prev, ...form } : prev);
      } else {
        setSaveMessage("Failed to save. Please try again.");
      }
    } catch {
      setSaveMessage("Network error. Please try again.");
    }
    setSaving(false);
    setTimeout(() => setSaveMessage(""), 4000);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading profile…</p>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  return (
    <main className="min-h-screen" style={{ background: "#f8fafc" }}>
      {/* Nav */}
      <nav style={{ background: "white", borderBottom: "1px solid #e5e7eb" }} className="sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0 select-none">
            <span className="text-xl font-black" style={{ color: "#15803d" }}>Grant</span>
            <span className="text-xl font-black text-gray-900">Crafter</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ← Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-5 py-8 space-y-6">

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your business details and account settings</p>
        </div>

        {/* Save message */}
        {saveMessage && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
            saveMessage.includes("saved") ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {saveMessage}
          </div>
        )}

        {/* Account info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b border-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-700">Email Address</p>
                <p className="text-sm text-gray-400 mt-0.5">{profile.email}</p>
              </div>
              <span className="text-xs text-gray-400">Cannot be changed</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Subscription</p>
                <p className="text-sm text-gray-400 mt-0.5">{getStatusLabel(profile.subscription_status)}</p>
              </div>
              <Link
                href="/dashboard"
                className="text-sm font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:border-gray-400 transition-colors"
              >
                Manage
              </Link>
            </div>
          </div>
        </div>

        {/* Business info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">Business Details</h2>
          <p className="text-sm text-gray-400 mb-5">
            We use this to find the best grant matches for your business. Keep it up to date for better results.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Name</label>
              <input
                type="text"
                value={form.business_name}
                onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="Your business name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Industry</label>
              <input
                type="text"
                value={form.industry}
                onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="e.g. Retail, Technology, Construction"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  placeholder="Cincinnati"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  placeholder="OH"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Additional Context
                <span className="ml-1 text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={form.additional_context}
                onChange={(e) => setForm((f) => ({ ...f, additional_context: e.target.value }))}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                placeholder="Anything else that might help us find better grants — certifications, goals, recent milestones, etc."
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-gray-400">Changes take effect on your next report</p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-colors"
              style={{ background: "#15803d" }}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">Password</h2>
          <p className="text-sm text-gray-400 mb-4">We&apos;ll send a reset link to your email address.</p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:border-gray-400 transition-colors"
          >
            Send Password Reset Email
          </Link>
        </div>

      </div>
    </main>
  );
}
