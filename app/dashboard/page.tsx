"use client";

import { useState } from "react";
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
  stripe_current_period_end?: number;
  grant_reports: GrantReport[];
}

interface ParsedGrant {
  id: string;
  name: string;
  score: string;
  fields: Record<string, string>;
}

const formatMonth = (month: string) => {
  if (month.includes("-W")) {
    const [year, week] = month.split("-W");
    const jan4 = new Date(parseInt(year), 0, 4);
    const startOfWeek = new Date(jan4);
    startOfWeek.setDate(jan4.getDate() - (jan4.getDay() || 7) + 1 + (parseInt(week) - 1) * 7);
    return `Week of ${startOfWeek.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
  }
  const [year, m] = month.split("-");
  const date = new Date(parseInt(year), parseInt(m) - 1);
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
};

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseGrantsFromContent(content: string): ParsedGrant[] {
  const sections = content.split("\n## ");
  let targetSection = "";

  for (const s of sections) {
    if (s.toLowerCase().startsWith("all opportunit")) {
      targetSection = s;
      break;
    }
  }

  if (!targetSection) {
    for (const s of sections) {
      if (/\*\*[^*]+\*\*/.test(s)) {
        targetSection = s;
        break;
      }
    }
  }

  const grants: ParsedGrant[] = [];
  const blocks = targetSection.split(/\n(?=\*\*[^*\n]+\*\*\s*\n)/);

  for (const block of blocks) {
    const nameMatch = block.match(/^\*\*([^*\n]+)\*\*/m);
    if (!nameMatch) continue;

    const name = nameMatch[1].trim();
    const id = slugify(name);
    const fields: Record<string, string> = {};
    let score = "";

    const fieldLines = block.match(/^- ([^:\n]+): (.+)$/gm) || [];
    for (const line of fieldLines) {
      const fm = line.match(/^- ([^:]+): (.+)$/);
      if (fm) {
        const key = fm[1].trim();
        const val = fm[2].trim();
        if (key.toLowerCase().includes("match")) {
          score = val;
        } else {
          fields[key] = val;
        }
      }
    }

    if (name && (Object.keys(fields).length > 0 || score)) {
      grants.push({ id, name, score, fields });
    }
  }

  return grants;
}

function makeLinksClickable(text: string): React.ReactNode {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 underline break-all"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

const ORDERED_FIELDS = [
  "Organization",
  "Type",
  "Amount",
  "Deadline",
  "Who Qualifies",
  "What It Funds",
  "How to Apply",
  "Pro Tip",
];

function GrantCard({ grant }: { grant: ParsedGrant }) {
  const orderedKeys = ORDERED_FIELDS.filter((f) => grant.fields[f]);
  const extraKeys = Object.keys(grant.fields).filter(
    (k) => !ORDERED_FIELDS.includes(k)
  );
  const allKeys = [...orderedKeys, ...extraKeys];

  return (
    <div
      id={grant.id}
      className="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm scroll-mt-20"
    >
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <h3 className="text-base font-extrabold text-gray-900">{grant.name}</h3>
        {grant.score && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
              grant.score.toLowerCase().includes("high")
                ? "bg-green-100 text-green-800"
                : grant.score.toLowerCase().includes("medium")
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {grant.score.toLowerCase().includes("high") ? "⭐ " : ""}
            {grant.score}
          </span>
        )}
      </div>
      <div className="divide-y divide-gray-50">
        {allKeys.map((field) => {
          const val = grant.fields[field];
          if (!val) return null;
          return (
            <div key={field} className="flex py-2 gap-3">
              <span className="text-sm font-semibold text-gray-600 w-36 flex-shrink-0">
                {field}
              </span>
              <span
                className={`text-sm flex-1 ${
                  field === "Pro Tip"
                    ? "text-green-700 font-medium bg-green-50 px-2 py-1 rounded"
                    : "text-gray-700"
                }`}
              >
                {field === "How to Apply" ? makeLinksClickable(val) : val}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderBodyLines(body: string, isTopOpps: boolean) {
  const lines = body.split("\n").map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <h3
          key={i}
          className={`font-bold mt-4 mb-2 ${isTopOpps ? "text-green-900" : "text-gray-900"}`}
        >
          {line.replace(/\*\*/g, "")}
        </h3>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <li key={i} className="text-gray-700 mb-1 ml-4">
          {line.slice(2).replace(/\*\*(.+?)\*\*/g, "$1")}
        </li>
      );
    }
    if (line === "---")
      return (
        <hr key={i} className="border-gray-200 my-4" />
      );
    if (!line.trim()) return null;
    return (
      <p key={i} className="text-gray-700 mb-2">
        {line.replace(/\*\*(.+?)\*\*/g, "$1")}
      </p>
    );
  });
  return lines.filter(Boolean);
}

function ReportView({
  report,
  businessName,
}: {
  report: GrantReport;
  businessName: string;
}) {
  const content = report.report_content;
  const grants = parseGrantsFromContent(content);

  const rawSections = content.split("\n## ");
  const sections: { title: string; body: string }[] = rawSections.map(
    (s, i) => {
      if (i === 0) {
        return { title: "", body: s };
      }
      const nl = s.indexOf("\n");
      return {
        title: nl === -1 ? s.trim() : s.slice(0, nl).trim(),
        body: nl === -1 ? "" : s.slice(nl + 1),
      };
    }
  );

  return (
    <div>
      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800">
        <strong>Disclaimer:</strong> This report identifies grant opportunities
        based on your profile. Grant awards are determined solely by each
        granting organization. GrantCrafter is a research tool — we do not
        guarantee eligibility or award outcomes.
      </div>

      {/* Grant TOC chips */}
      {grants.length > 0 && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6">
          <div className="text-sm font-bold text-green-800 mb-3">
            Jump to a grant:
          </div>
          <div className="flex flex-wrap gap-2">
            {grants.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  document
                    .getElementById(g.id)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="bg-green-700 hover:bg-green-800 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Report Sections */}
      {sections.map((s, i) => {
        if (!s.title && !s.body.trim()) return null;
        const isAllOpps = s.title.toLowerCase().includes("all opportunit");
        const isTopOpps = s.title.toLowerCase().includes("top opportunit");

        return (
          <div key={i} className="mb-8">
            {s.title && (
              <h2 className="text-lg font-extrabold text-gray-900 mb-4 pb-2 border-b-2 border-gray-100">
                {s.title}
              </h2>
            )}

            {isAllOpps && grants.length > 0 ? (
              grants.map((g) => <GrantCard key={g.id} grant={g} />)
            ) : isTopOpps ? (
              <div className="border-l-4 border-green-600 bg-green-50 rounded-r-xl px-4 py-3">
                {renderBodyLines(s.body, true)}
              </div>
            ) : (
              renderBodyLines(s.body, false)
            )}
          </div>
        );
      })}

      {/* Business name attribution */}
      <div className="text-xs text-gray-400 mt-4">
        Report prepared for {businessName}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedReport, setSelectedReport] = useState<GrantReport | null>(
    null
  );
  const [error, setError] = useState("");
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState("");

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/dashboard?email=${encodeURIComponent(email)}`
      );
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
        const endDate = userData?.stripe_current_period_end
          ? new Date(
              userData.stripe_current_period_end * 1000
            ).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "the end of your billing period";
        setCancelSuccess(
          `Your subscription has been canceled. You keep access until ${endDate}.`
        );
        // Refresh user data
        const refreshRes = await fetch(
          `/api/dashboard?email=${encodeURIComponent(email)}`
        );
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setUserData(data);
        }
      } else {
        setError("Failed to cancel. Please email support@grantcrafter.com");
      }
    } catch {
      setError("Failed to cancel. Please email support@grantcrafter.com");
    }
    setCanceling(false);
  };

  // Login screen
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

  const isActive = ["active", "trialing"].includes(
    userData.subscription_status
  );
  const statusLabel =
    userData.subscription_status === "trialing"
      ? "Free Trial"
      : userData.subscription_status === "active"
      ? "Active"
      : userData.subscription_status === "canceling"
      ? "Canceling"
      : userData.subscription_status;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1 mr-2">
            <span className="text-xl font-black text-green-700">Grant</span>
            <span className="text-xl font-black text-gray-900">Crafter</span>
          </Link>
          <span className="text-gray-700 font-semibold text-sm truncate">
            {userData.business_name}
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
              isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-700"
            }`}
          >
            {statusLabel}
          </span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Cancel success banner */}
        {cancelSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 text-green-800 font-medium text-sm flex items-start gap-2">
            <span>✅</span>
            <span>{cancelSuccess}</span>
          </div>
        )}

        {/* Report tabs */}
        {userData.grant_reports.length > 0 ? (
          <>
            <div
              className="flex overflow-x-auto gap-2 pb-2 mb-6"
              style={{ scrollbarWidth: "none" }}
            >
              {userData.grant_reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                    selectedReport?.id === report.id
                      ? "bg-green-700 text-white border-green-700"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-green-50 hover:border-green-300"
                  }`}
                >
                  {formatMonth(report.month)}
                </button>
              ))}
            </div>

            {selectedReport && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="bg-green-700 text-white px-6 py-4">
                  <div className="font-bold text-lg">
                    {formatMonth(selectedReport.month)} Grant Report
                  </div>
                  <div className="text-green-200 text-sm">
                    {userData.business_name}
                  </div>
                </div>
                <div className="p-6">
                  <ReportView
                    report={selectedReport}
                    businessName={userData.business_name}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center mb-8">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Your first report is on its way
            </h3>
            <p className="text-gray-500">
              We&apos;re generating your personalized grant report now. You&apos;ll
              receive it by email shortly.
            </p>
          </div>
        )}

        {/* Account section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-gray-900 mb-4">
            Account
          </h2>
          <div className="space-y-2 mb-5 text-sm text-gray-600">
            <div>
              <span className="font-medium text-gray-700">Email:</span>{" "}
              {userData.email}
            </div>
            <div>
              <span className="font-medium text-gray-700">Subscription:</span>{" "}
              <span
                className={`font-semibold ${
                  isActive ? "text-green-700" : "text-red-600"
                }`}
              >
                {statusLabel}
              </span>
            </div>
          </div>

          {(userData.subscription_status === "active" ||
            userData.subscription_status === "trialing") && (
            <>
              {!cancelConfirm ? (
                <button
                  onClick={() => setCancelConfirm(true)}
                  className="text-sm text-red-500 hover:text-red-700 underline"
                >
                  Cancel subscription
                </button>
              ) : (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 max-w-sm">
                  <p className="text-sm text-red-700 font-medium mb-3">
                    Are you sure? You&apos;ll lose access at the end of your
                    billing period.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      disabled={canceling}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-bold py-2 rounded-lg transition-colors"
                    >
                      {canceling ? "Canceling..." : "Yes, cancel"}
                    </button>
                    <button
                      onClick={() => setCancelConfirm(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors"
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
