"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface GrantReport {
  id: string;
  month: string;
  report_content: string;
  sent_at: string;
}

interface UserData {
  id: string;
  email: string;
  business_name: string;
  subscription_status: string;
  created_at: string;
  grant_reports: GrantReport[];
}

const formatReportPeriod = (month: string): string => {
  if (month.includes("-W")) {
    const [year, week] = month.split("-W");
    const jan4 = new Date(parseInt(year), 0, 4);
    const startOfWeek = new Date(jan4);
    startOfWeek.setDate(
      jan4.getDate() - (jan4.getDay() || 7) + 1 + (parseInt(week) - 1) * 7
    );
    return `Week of ${startOfWeek.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })}`;
  }
  const [year, m] = month.split("-");
  const date = new Date(parseInt(year), parseInt(m) - 1);
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
};

const formatMemberSince = (isoDate: string): string => {
  try {
    return new Date(isoDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return { label: "Active", classes: "bg-green-100 text-green-800" };
    case "trialing":
      return { label: "Free Trial", classes: "bg-green-100 text-green-800" };
    case "canceling":
      return { label: "Canceling", classes: "bg-amber-100 text-amber-800" };
    case "past_due":
      return { label: "Past Due", classes: "bg-red-100 text-red-800" };
    case "canceled":
      return { label: "Canceled", classes: "bg-gray-100 text-gray-600" };
    default:
      return { label: status, classes: "bg-gray-100 text-gray-600" };
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelState, setCancelState] = useState<"idle" | "confirming" | "loading" | "done">("idle");
  const [cancelBanner, setCancelBanner] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard", { credentials: "include" })
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUserData(data);
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  };

  const handleCancelConfirm = async () => {
    setCancelState("loading");
    try {
      const res = await fetch("/api/cancel", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setCancelState("done");
        setCancelBanner(
          "Your subscription has been canceled. You'll keep full access until your billing period ends."
        );
        // Refresh user data
        const refreshRes = await fetch("/api/dashboard", { credentials: "include" });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setUserData(data);
        }
      } else {
        setCancelState("idle");
      }
    } catch {
      setCancelState("idle");
    }
  };

  const handleDownload = async (report: GrantReport) => {
    setDownloadingId(report.id);
    try {
      const res = await fetch(`/api/download-report?reportId=${report.id}`, {
        credentials: "include",
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `grant-report-${report.month}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Download failed:", err);
    }
    setDownloadingId(null);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f8fafc" }}>
        <div className="text-gray-400 text-sm">Loading your dashboard...</div>
      </main>
    );
  }

  if (!userData) return null;

  const statusBadge = getStatusBadge(userData.subscription_status);
  const isSubscriptionActive = ["active", "trialing"].includes(userData.subscription_status);

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      {/* ── STICKY NAV ── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0">
            <span className="text-xl font-black text-green-700">Grant</span>
            <span className="text-xl font-black text-gray-900">Crafter</span>
          </Link>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="text-sm text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-4 py-1.5 rounded-full font-medium transition-colors disabled:opacity-50"
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* ── CANCEL SUCCESS BANNER ── */}
        {cancelBanner && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 text-green-800 text-sm font-medium flex items-start gap-3">
            <span className="text-lg">✅</span>
            <span>{cancelBanner}</span>
          </div>
        )}

        {/* ── HERO / WELCOME CARD ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">👋 Welcome back,</p>
              <h1 className="text-2xl font-black text-gray-900">
                {userData.business_name || userData.email}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {userData.email}
                {userData.created_at && (
                  <> · Member since {formatMemberSince(userData.created_at)}</>
                )}
              </p>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusBadge.classes}`}>
              {statusBadge.label}
            </span>
          </div>
        </div>

        {/* ── REPORTS SECTION ── */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Grant Reports</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              A new report lands every Monday morning.
            </p>
          </div>

          {userData.grant_reports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userData.grant_reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col"
                >
                  {/* Document icon */}
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-2xl">
                      📄
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {formatReportPeriod(report.month)}
                  </h3>

                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full self-start mb-4">
                    <span>✓</span> Delivered
                  </span>

                  <div className="mt-auto">
                    <button
                      onClick={() => handleDownload(report)}
                      disabled={downloadingId === report.id}
                      className="w-full bg-green-700 hover:bg-green-800 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      {downloadingId === report.id ? (
                        <>
                          <span className="animate-spin">⟳</span>
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <span>↓</span>
                          Download PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                📋
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Your first report is on its way
              </h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                We&apos;re generating your personalized grant report right now. You&apos;ll receive
                it by email — and it&apos;ll appear here — shortly.
              </p>
            </div>
          )}
        </div>

        {/* ── ACCOUNT & BILLING SECTION ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Account &amp; Billing</h2>
          <div className="space-y-2 text-sm mb-5">
            <div className="flex gap-3">
              <span className="text-gray-500 w-20 flex-shrink-0">Email</span>
              <span className="text-gray-900 font-medium">{userData.email}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-gray-500 w-20 flex-shrink-0">Status</span>
              <span className={`font-semibold ${isSubscriptionActive ? "text-green-700" : "text-gray-600"}`}>
                {statusBadge.label}
              </span>
            </div>
          </div>

          {/* Cancel subscription */}
          {isSubscriptionActive && cancelState !== "done" && (
            <>
              {cancelState === "idle" && (
                <button
                  onClick={() => setCancelState("confirming")}
                  className="text-sm text-red-500 hover:text-red-700 underline transition-colors"
                >
                  Cancel subscription
                </button>
              )}

              {(cancelState === "confirming" || cancelState === "loading") && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 max-w-sm">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Are you sure you want to cancel?
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    You&apos;ll keep access until the end of your billing period.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelConfirm}
                      disabled={cancelState === "loading"}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                    >
                      {cancelState === "loading" ? "Canceling..." : "Yes, cancel my subscription"}
                    </button>
                    <button
                      onClick={() => setCancelState("idle")}
                      disabled={cancelState === "loading"}
                      className="flex-1 bg-white hover:bg-gray-100 text-gray-700 text-sm font-medium py-2.5 rounded-xl border border-gray-200 transition-colors"
                    >
                      Never mind
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
