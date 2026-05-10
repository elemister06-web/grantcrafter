"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface GrantReport {
  id: string;
  month: string;
  report_content: string;
  sent_at: string;
}

interface UserData {
  email: string;
  business_name: string;
  subscription_status: string;
  grant_reports: GrantReport[];
}

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedReport, setSelectedReport] = useState<GrantReport | null>(null);
  const [error, setError] = useState("");
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/dashboard?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No account found for that email.");
        setLoading(false);
        return;
      }

      setUserData(data);
      if (data.grant_reports?.length > 0) {
        setSelectedReport(data.grant_reports[0]);
      }
      setLoading(false);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setCanceling(true);
    try {
      const res = await fetch("/api/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setCancelConfirm(false);
        alert(
          "Your subscription will be canceled at the end of your current billing period. You keep access until then."
        );
        // Refresh data
        handleLookup(new Event("submit") as unknown as React.FormEvent);
      }
    } catch {
      alert("Failed to cancel. Please email support@grantcrafter.com");
    }
    setCanceling(false);
  };

  const formatMonth = (month: string) => {
    // Handle ISO week format "2026-W19" and legacy month format "2026-05"
    if (month.includes("-W")) {
      const [year, week] = month.split("-W");
      // Find the Monday of that ISO week
      const jan4 = new Date(parseInt(year), 0, 4);
      const startOfWeek = new Date(jan4);
      startOfWeek.setDate(jan4.getDate() - (jan4.getDay() || 7) + 1 + (parseInt(week) - 1) * 7);
      return `Week of ${startOfWeek.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
    }
    const [year, m] = month.split("-");
    const date = new Date(parseInt(year), parseInt(m) - 1);
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
  };

  const renderReport = (content: string) => {
    return content
      .split("\n")
      .map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <h2 key={i} className="text-xl font-black text-green-800 mt-8 mb-3">
              {line.replace("## ", "")}
            </h2>
          );
        }
        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <h3 key={i} className="text-lg font-bold text-gray-900 mt-5 mb-2">
              {line.replace(/\*\*/g, "")}
            </h3>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <li key={i} className="text-gray-700 ml-4 mb-1">
              {line.replace("- ", "").replace(/\*\*(.+?)\*\*/g, "$1")}
            </li>
          );
        }
        if (line === "---") {
          return <hr key={i} className="border-gray-200 my-6" />;
        }
        if (line.trim() === "") return <br key={i} />;
        return (
          <p key={i} className="text-gray-700 mb-2">
            {line.replace(/\*\*(.+?)\*\*/g, "$1")}
          </p>
        );
      });
  };

  if (!userData) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <Link href="/" className="flex items-center gap-1 mb-10">
          <span className="text-2xl font-black text-green-700">Grant</span>
          <span className="text-2xl font-black text-gray-900">Crafter</span>
        </Link>

        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            Member Dashboard
          </h1>
          <p className="text-gray-500 mb-6">
            Enter your email to access your grant reports.
          </p>

          <form onSubmit={handleLookup} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl transition-colors"
            >
              {loading ? "Looking up account..." : "Access My Dashboard →"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-xl font-black text-green-700">Grant</span>
            <span className="text-xl font-black text-gray-900">Crafter</span>
          </Link>
          <div className="text-sm text-gray-500">
            {userData.business_name} ·{" "}
            <span
              className={`font-semibold ${
                userData.subscription_status === "active" ||
                userData.subscription_status === "trialing"
                  ? "text-green-700"
                  : "text-red-600"
              }`}
            >
              {userData.subscription_status === "trialing"
                ? "Free Trial"
                : userData.subscription_status === "active"
                ? "Active"
                : userData.subscription_status}
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-3">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
            Your Reports
          </h2>
          {userData.grant_reports.length === 0 ? (
            <div className="text-sm text-gray-500 bg-white rounded-xl p-4 border border-gray-200">
              Your first report is being generated and will arrive by email shortly.
            </div>
          ) : (
            userData.grant_reports.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  selectedReport?.id === report.id
                    ? "bg-green-700 text-white"
                    : "bg-white text-gray-700 hover:bg-green-50 border border-gray-200"
                }`}
              >
                {formatMonth(report.month)}
              </button>
            ))
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
              Account
            </h2>
            <div className="text-sm text-gray-600 space-y-1 mb-4">
              <div>{userData.email}</div>
              <div className="text-gray-400">
                Status:{" "}
                <span className="font-medium">{userData.subscription_status}</span>
              </div>
            </div>

            {!cancelConfirm ? (
              <button
                onClick={() => setCancelConfirm(true)}
                className="text-sm text-red-500 hover:text-red-700 underline"
              >
                Cancel subscription
              </button>
            ) : (
              <div className="bg-red-50 rounded-xl p-4 space-y-3">
                <p className="text-sm text-red-700 font-medium">
                  Are you sure? You&apos;ll lose access at the end of your billing period.
                </p>
                <button
                  onClick={handleCancel}
                  disabled={canceling}
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 rounded-lg"
                >
                  {canceling ? "Canceling..." : "Yes, cancel"}
                </button>
                <button
                  onClick={() => setCancelConfirm(false)}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  Never mind
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="md:col-span-3">
          {selectedReport ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-green-700 text-white px-6 py-4">
                <div className="font-bold text-lg">
                  {formatMonth(selectedReport.month)} Grant Report
                </div>
                <div className="text-green-200 text-sm">
                  {userData.business_name}
                </div>
              </div>
              <div className="p-6">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
                  <strong>Disclaimer:</strong> This report identifies grant opportunities based on your profile. Grant awards are determined solely by each granting organization. GrantCrafter is a research tool — we do not guarantee eligibility or award outcomes.
                </div>
                <div className="prose max-w-none">
                  {renderReport(selectedReport.report_content)}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Your first report is on its way
              </h3>
              <p className="text-gray-500">
                We&apos;re generating your personalized grant report now. You&apos;ll receive it by email shortly.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
