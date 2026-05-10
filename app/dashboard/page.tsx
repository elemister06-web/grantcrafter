"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { parseGrantsFromReport, ParsedGrant } from "@/lib/parse-grants";

interface GrantReport {
  id: string;
  month: string;
  report_content: string;
  sent_at: string;
}

interface Application {
  report_id: string;
  grant_slug: string;
}

interface Dismissal {
  report_id: string;
  grant_slug: string;
}

interface UserData {
  id: string;
  email: string;
  business_name: string;
  subscription_status: string;
  created_at: string;
  grant_reports: GrantReport[];
  applications: Application[];
  dismissals: Dismissal[];
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
    })}`;
  }
  const [year, m] = month.split("-");
  const date = new Date(parseInt(year), parseInt(m) - 1);
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return { label: "Active Member", classes: "bg-emerald-50 text-emerald-700 border border-emerald-200" };
    case "trialing":
      return { label: "Free Trial", classes: "bg-emerald-50 text-emerald-700 border border-emerald-200" };
    case "canceling":
      return { label: "Canceling", classes: "bg-amber-50 text-amber-700 border border-amber-200" };
    case "past_due":
      return { label: "Past Due", classes: "bg-red-50 text-red-700 border border-red-200" };
    case "canceled":
      return { label: "Canceled", classes: "bg-gray-100 text-gray-500 border border-gray-200" };
    default:
      return { label: status, classes: "bg-gray-100 text-gray-500 border border-gray-200" };
  }
};

const getMatchColor = (score: string) => {
  const lower = score.toLowerCase();
  if (lower.includes("high")) return { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" };
  if (lower.includes("medium") || lower.includes("mid")) return { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" };
  return { bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-400" };
};

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelState, setCancelState] = useState<"idle" | "confirming" | "loading" | "done">("idle");
  const [cancelBanner, setCancelBanner] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const [selectedReport, setSelectedReport] = useState<GrantReport | null>(null);
  const [appliedSet, setAppliedSet] = useState<Set<string>>(new Set());
  const [dismissedSet, setDismissedSet] = useState<Set<string>>(new Set());
  const [linkValidity, setLinkValidity] = useState<Record<string, boolean>>({});
  const [validatingLinks, setValidatingLinks] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "applied" | "dismissed">("all");
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard", { credentials: "include" })
      .then(async (res) => {
        if (res.status === 401 || !res.ok) {
          router.push("/login");
          return;
        }
        const data: UserData = await res.json();
        setUserData(data);
        setLoading(false);
        if (data.grant_reports?.length > 0) {
          setSelectedReport(data.grant_reports[0]);
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  // Sync applied + dismissed sets when selected report changes
  useEffect(() => {
    if (!userData || !selectedReport) return;
    setAppliedSet(new Set(
      (userData.applications || [])
        .filter((a) => a.report_id === selectedReport.id)
        .map((a) => a.grant_slug)
    ));
    setDismissedSet(new Set(
      (userData.dismissals || [])
        .filter((d) => d.report_id === selectedReport.id)
        .map((d) => d.grant_slug)
    ));
  }, [selectedReport, userData]);

  // Validate links after grants load
  const validateLinks = useCallback(async (grants: ParsedGrant[], reportId: string) => {
    const urls = grants.map((g) => g.applyUrl).filter(Boolean) as string[];
    if (urls.length === 0) return;
    setValidatingLinks(true);
    try {
      const res = await fetch("/api/validate-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });
      if (res.ok) {
        const { results } = await res.json();
        setLinkValidity((prev) => ({ ...prev, [reportId]: undefined, ...results }));
      }
    } catch {
      // Silent fail — show links anyway
    }
    setValidatingLinks(false);
  }, []);

  // Trigger link validation when report changes
  useEffect(() => {
    if (!selectedReport) return;
    const grants = parseGrantsFromReport(selectedReport.report_content || "");
    // Only validate if we haven't already
    const urls = grants.map((g) => g.applyUrl).filter(Boolean) as string[];
    const unchecked = urls.filter((u) => !(u in linkValidity));
    if (unchecked.length > 0) {
      validateLinks(grants, selectedReport.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReport?.id]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  };

  const handleCancelConfirm = async () => {
    setCancelState("loading");
    try {
      const res = await fetch("/api/cancel", { method: "POST", credentials: "include" });
      if (res.ok) {
        setCancelState("done");
        setCancelBanner("Your subscription has been canceled. You'll keep full access until your billing period ends.");
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

  const toggleApplied = async (grant: ParsedGrant, reportId: string) => {
    const isApplied = appliedSet.has(grant.slug);
    setAppliedSet((prev) => {
      const next = new Set(prev);
      if (isApplied) next.delete(grant.slug);
      else next.add(grant.slug);
      return next;
    });
    await fetch("/api/mark-applied", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, grantSlug: grant.slug, grantName: grant.name, applied: !isApplied }),
    });
  };

  const dismissGrant = async (grant: ParsedGrant, reportId: string) => {
    // Optimistic update
    setDismissedSet((prev) => new Set([...prev, grant.slug]));
    // If marked as applied, remove that too
    if (appliedSet.has(grant.slug)) {
      setAppliedSet((prev) => { const next = new Set(prev); next.delete(grant.slug); return next; });
    }
    await fetch("/api/dismiss-grant", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, grantSlug: grant.slug, dismiss: true }),
    });
  };

  const restoreGrant = async (grant: ParsedGrant, reportId: string) => {
    setDismissedSet((prev) => { const next = new Set(prev); next.delete(grant.slug); return next; });
    await fetch("/api/dismiss-grant", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, grantSlug: grant.slug, dismiss: false }),
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading your dashboard…</p>
        </div>
      </main>
    );
  }

  if (!userData) return null;

  const statusBadge = getStatusBadge(userData.subscription_status);
  const isSubscriptionActive = ["active", "trialing"].includes(userData.subscription_status);
  const grants: ParsedGrant[] = selectedReport
    ? parseGrantsFromReport(selectedReport.report_content || "")
    : [];

  const activeGrants = grants.filter((g) => !dismissedSet.has(g.slug));
  const appliedGrants = activeGrants.filter((g) => appliedSet.has(g.slug));
  const dismissedGrants = grants.filter((g) => dismissedSet.has(g.slug));

  const displayGrants =
    activeTab === "applied" ? appliedGrants :
    activeTab === "dismissed" ? dismissedGrants :
    activeGrants;

  return (
    <main className="min-h-screen" style={{ background: "#f8fafc" }}>
      {/* ── NAVBAR ── */}
      <nav style={{ background: "white", borderBottom: "1px solid #e5e7eb" }} className="sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0 select-none">
            <span className="text-xl font-black" style={{ color: "#15803d" }}>Grant</span>
            <span className="text-xl font-black text-gray-900">Crafter</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              My Profile
            </Link>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-sm text-gray-500 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
            >
              {signingOut ? "Signing out…" : "Sign Out"}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-5 py-8 space-y-6">

        {/* ── CANCEL BANNER ── */}
        {cancelBanner && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 text-emerald-800 text-sm font-medium flex items-center gap-3">
            <span>✅</span>
            <span>{cancelBanner}</span>
          </div>
        )}

        {/* ── WELCOME CARD ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #15803d 0%, #166534 100%)" }}>
          <div className="px-8 py-7 flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-emerald-200 text-sm font-medium mb-1">Welcome back</p>
              <h1 className="text-2xl font-bold text-white leading-tight">
                {userData.business_name || userData.email}
              </h1>
              <p className="text-emerald-300 text-sm mt-1">{userData.email}</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/20 text-white border border-white/30 backdrop-blur-sm">
              {statusBadge.label}
            </span>
          </div>
          {/* Stats bar */}
          {userData.grant_reports.length > 0 && (
            <div className="border-t border-white/10 px-8 py-4 flex items-center gap-8">
              <div>
                <p className="text-3xl font-black text-white">{activeGrants.length}</p>
                <p className="text-emerald-300 text-xs font-medium mt-0.5">Active Grants</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-3xl font-black text-white">{appliedGrants.length}</p>
                <p className="text-emerald-300 text-xs font-medium mt-0.5">Applied</p>
              </div>
            </div>
          )}
        </div>

        {/* ── REPORTS SECTION ── */}
        {userData.grant_reports.length > 0 ? (
          <div>
            {/* Report selector */}
            {userData.grant_reports.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
                {userData.grant_reports.map((report) => {
                  const isSelected = selectedReport?.id === report.id;
                  return (
                    <button
                      key={report.id}
                      onClick={() => { setSelectedReport(report); setActiveTab("all"); }}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                        isSelected
                          ? "text-white shadow-sm"
                          : "bg-white border border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-700"
                      }`}
                      style={isSelected ? { background: "#15803d" } : {}}
                    >
                      {formatReportPeriod(report.month)}
                    </button>
                  );
                })}
              </div>
            )}

            {selectedReport && (
              <div>
                {/* Section header */}
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {formatReportPeriod(selectedReport.month)}
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {grants.length} grant{grants.length !== 1 ? "s" : ""} found
                      {validatingLinks && <span className="ml-2 text-gray-300">· Checking links…</span>}
                    </p>
                  </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1 mb-5 bg-white border border-gray-200 rounded-xl p-1 w-fit">
                  {[
                    { key: "all", label: `All (${activeGrants.length})` },
                    { key: "applied", label: `Applied (${appliedGrants.length})` },
                    { key: "dismissed", label: `Dismissed (${dismissedGrants.length})` },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key as typeof activeTab)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === key
                          ? "bg-gray-900 text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Grant cards */}
                {displayGrants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayGrants.map((grant) => {
                      const isApplied = appliedSet.has(grant.slug);
                      const isDismissed = dismissedSet.has(grant.slug);
                      const matchColor = grant.matchScore ? getMatchColor(grant.matchScore) : null;
                      const urlValid = grant.applyUrl ? linkValidity[grant.applyUrl] ?? true : null;
                      const isExpanded = expandedSlug === grant.slug;
                      const borderColor = isDismissed ? "#e5e7eb" : isApplied ? "#6ee7b7" : matchColor?.dot === "bg-emerald-500" ? "#10b981" : matchColor?.dot === "bg-amber-500" ? "#f59e0b" : "#e5e7eb";

                      return (
                        <div
                          key={grant.slug}
                          className={`bg-white rounded-2xl shadow-sm flex flex-col transition-all overflow-hidden ${
                            isDismissed ? "opacity-50" : isExpanded ? "shadow-md" : "hover:shadow-md"
                          }`}
                          style={{ border: "1px solid #e5e7eb", borderLeft: `4px solid ${borderColor}` }}
                        >
                          {/* Card top — always visible */}
                          <button
                            className="px-5 pt-5 pb-4 text-left w-full"
                            onClick={() => setExpandedSlug(isExpanded ? null : grant.slug)}
                          >
                            {/* Top row: amount (prominent) + match badge */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                {matchColor && grant.matchScore && (
                                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${matchColor.bg} ${matchColor.text}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${matchColor.dot}`} />
                                    {grant.matchScore} Match
                                  </span>
                                )}
                                {grant.type && (
                                  <span className="text-xs text-gray-400 font-medium">{grant.type}</span>
                                )}
                              </div>
                              {isApplied && (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex-shrink-0">
                                  ✓ Applied
                                </span>
                              )}
                            </div>

                            {/* Grant name */}
                            <h3 className="text-base font-bold text-gray-900 leading-snug mb-1">
                              {grant.name}
                            </h3>

                            {/* Org */}
                            {grant.organization && (
                              <p className="text-xs text-gray-400 mb-3">{grant.organization}</p>
                            )}

                            {/* Amount + Deadline row */}
                            <div className="flex items-center gap-3 flex-wrap">
                              {grant.amount && (
                                <span className="text-sm font-black" style={{ color: "#15803d" }}>
                                  {grant.amount}
                                </span>
                              )}
                              {grant.amount && grant.deadline && <span className="text-gray-200 text-xs">/</span>}
                              {grant.deadline && (
                                <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                                  📅 {grant.deadline}
                                </span>
                              )}
                            </div>

                            {/* Summary — collapsed */}
                            {!isExpanded && grant.whatItFunds && (
                              <p className="text-sm text-gray-500 line-clamp-2 mt-3 leading-relaxed">
                                {grant.whatItFunds}
                              </p>
                            )}

                            {/* Expand toggle */}
                            <p className="text-xs text-gray-400 mt-3 font-medium">
                              {isExpanded ? "▲ Hide details" : "▼ View full details"}
                            </p>
                          </button>

                          {/* Expanded panel */}
                          {isExpanded && (
                            <div className="px-5 pb-1 space-y-4 border-t border-gray-50 pt-4">
                              {grant.whatItFunds && (
                                <div>
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">What It Funds</p>
                                  <p className="text-sm text-gray-700 leading-relaxed">{grant.whatItFunds}</p>
                                </div>
                              )}
                              {grant.howToApply && (
                                <div>
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">How to Apply</p>
                                  <p className="text-sm text-gray-700 leading-relaxed">{grant.howToApply}</p>
                                </div>
                              )}
                              {grant.proTip && (
                                <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-2">
                                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">💡 Pro Tip</p>
                                  <p className="text-sm text-amber-800 leading-relaxed">{grant.proTip}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Card footer */}
                          <div className="mt-auto px-5 py-4 flex items-center gap-3">
                            {/* Primary CTA */}
                            {isDismissed ? (
                              <button
                                onClick={() => restoreGrant(grant, selectedReport.id)}
                                className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-700 transition-colors"
                              >
                                Restore Grant
                              </button>
                            ) : (
                              <>
                                {grant.applyUrl && urlValid !== false ? (
                                  <a
                                    href={grant.applyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 text-center text-sm font-bold px-4 py-2.5 rounded-xl text-white transition-colors"
                                    style={{ background: "#15803d" }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Apply Now →
                                  </a>
                                ) : (
                                  <span className="flex-1 text-center text-xs text-gray-400 py-2.5 italic">
                                    {urlValid === false ? "Link unavailable" : "Search grant name to apply"}
                                  </span>
                                )}

                                {/* Secondary actions */}
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleApplied(grant, selectedReport.id); }}
                                  title={isApplied ? "Mark as not applied" : "Mark as applied"}
                                  className={`p-2.5 rounded-xl border transition-all ${
                                    isApplied
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                      : "border-gray-200 text-gray-400 hover:border-emerald-300 hover:text-emerald-600"
                                  }`}
                                  title={isApplied ? "Applied" : "Mark applied"}
                                >
                                  {isApplied ? "✓" : "✓"}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); dismissGrant(grant, selectedReport.id); }}
                                  title="Not interested"
                                  className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400 transition-all"
                                >
                                  ✕
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                    <div className="text-4xl mb-4">
                      {activeTab === "applied" ? "🏆" : activeTab === "dismissed" ? "🗑️" : "📋"}
                    </div>
                    <p className="text-gray-500 text-sm">
                      {activeTab === "applied"
                        ? "No grants marked as applied yet."
                        : activeTab === "dismissed"
                        ? "No dismissed grants."
                        : "No grants found for this period."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* No reports yet */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">📋</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Your first report is on its way</h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
              We&apos;re generating your personalized grant report now. It&apos;ll appear here — and in your inbox — shortly.
            </p>
          </div>
        )}

        {/* ── ACCOUNT & BILLING ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Subscription</h2>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-900 font-medium">{userData.email}</p>
              <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge.classes}`}>
                {statusBadge.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:border-gray-400 transition-colors"
              >
                Manage Profile
              </Link>
              {isSubscriptionActive && cancelState === "idle" && (
                <button
                  onClick={() => setCancelState("confirming")}
                  className="text-sm text-red-400 hover:text-red-600 transition-colors font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {(cancelState === "confirming" || cancelState === "loading") && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-5 max-w-sm">
              <p className="text-sm font-semibold text-gray-900 mb-1">Cancel your subscription?</p>
              <p className="text-sm text-gray-500 mb-4">You&apos;ll keep full access until the end of your billing period.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleCancelConfirm}
                  disabled={cancelState === "loading"}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                >
                  {cancelState === "loading" ? "Canceling…" : "Yes, cancel"}
                </button>
                <button
                  onClick={() => setCancelState("idle")}
                  disabled={cancelState === "loading"}
                  className="flex-1 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 rounded-xl border border-gray-200 transition-colors"
                >
                  Never mind
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
