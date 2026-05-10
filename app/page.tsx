import Link from "next/link";
import Logo from "@/components/Logo";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* ── NAV ── */}
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium hidden md:block">
              How It Works
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium hidden md:block">
              Pricing
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium hidden md:block border border-gray-200 px-4 py-2 rounded-lg hover:border-gray-400 transition-colors">
              Log In
            </Link>
            <Link href="/signup" className="bg-green-700 hover:bg-green-800 text-white font-bold px-5 py-2.5 rounded-lg transition-colors">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="bg-gradient-to-b from-green-50 to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-green-100 text-green-800 font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            🤖 100% automated · New grants every Monday · Zero effort required
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
            Stop Missing Grants
            <br />
            <span className="text-green-700">Your Business Qualifies For</span>
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            Set up your profile once. Every Monday, GrantCrafter&apos;s AI automatically
            researches federal, state, local, and private grants — and drops a fresh,
            personalized list into <strong>your private dashboard</strong>.
          </p>
          <p className="text-lg text-gray-500 mb-6">
            No Googling. No grant consultants at $500/hour. No manual work — ever.
            Just log in, review your matches, and apply.
          </p>
          <p className="text-2xl font-black text-green-700 mb-10">
            Set it up once. Grants find you every week.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-green-700 hover:bg-green-800 text-white font-black text-xl px-10 py-5 rounded-xl transition-colors shadow-lg w-full sm:w-auto"
            >
              Get My First Grant Report →
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            $49/month · 7-day free trial · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── WHY GRANT RESEARCH IS HARD ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 text-center mb-4">
            Grant research is a full-time job.
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Most small business owners and nonprofits miss grants they qualify
            for — not because they don&apos;t need the money, but because they
            don&apos;t have time to find them.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                emoji: "⏱️",
                title: "Hours of research",
                body: "Finding and vetting grants takes 10–20 hours per month that you simply don't have.",
              },
              {
                emoji: "😤",
                title: "Generic results",
                body: "Search results return outdated lists that don't match your business type, location, or eligibility.",
              },
              {
                emoji: "💸",
                title: "Missed deadlines",
                body: "Grant windows close fast. By the time most people find an opportunity, it's already gone.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-red-50 border border-red-100 rounded-2xl p-6">
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-gray-50 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 text-center mb-4">
            How GrantCrafter Works
          </h2>
          <p className="text-xl text-gray-600 text-center mb-14">
            Set it up once. Get your report every week.
          </p>
          <div className="space-y-8">
            {[
              {
                step: "1",
                title: "Set up your profile once (5 minutes)",
                body: "Tell us about your business: type, industry, location, size, and ownership qualifiers (woman-owned, minority-owned, veteran-owned, etc.). You do this once — GrantCrafter handles everything after that.",
              },
              {
                step: "2",
                title: "AI runs automatically every Monday",
                body: "No action needed from you. Every Monday at 9am, our AI automatically scans federal programs (Grants.gov, SBA, USDA), state economic development funds, local grants, and private foundations — all matched against your exact profile.",
              },
              {
                step: "3",
                title: "Get notified, then log in to review",
                body: "You get a simple email: \"Your dashboard has been updated.\" Click in and see this week's fresh grant cards — each with the amount, deadline, match score, and a direct apply link. New opportunities every single week.",
              },
              {
                step: "4",
                title: "Track everything in one place",
                body: "Mark grants as applied, dismiss ones that don't fit, and watch your progress build over time. Your dashboard keeps a full history — every week's report, every grant you've tracked. All automatic. All organized.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="bg-green-700 text-white font-black text-xl w-12 h-12 rounded-full flex items-center justify-center shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SAMPLE REPORT PREVIEW ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 text-center mb-4">
            What Your Weekly Report Looks Like
          </h2>
          <p className="text-xl text-gray-600 text-center mb-4">
            Real grant programs. Real amounts. Real deadlines. Matched to your profile.
          </p>
          <p className="text-sm text-gray-400 text-center mb-12 italic">
            Sample report below is illustrative. Actual reports are generated based on your specific business profile and current grant availability.
          </p>
          <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
            <div className="bg-green-700 text-white px-6 py-4">
              <div className="font-bold text-lg">GrantCrafter — Sample Monthly Report</div>
              <div className="text-green-200 text-sm">
                Illustrative example · Food &amp; Beverage · Cincinnati, OH · Woman-Owned
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                {
                  name: "SBA Small Business Innovation Research (SBIR) Program",
                  amount: "Up to $275,000",
                  deadline: "Varies by agency",
                  type: "Federal",
                },
                {
                  name: "USDA Rural Business Development Grant",
                  amount: "$10,000 – $500,000",
                  deadline: "Annual — check Grants.gov",
                  type: "Federal",
                },
                {
                  name: "Ohio Women's Business Center Programs",
                  amount: "Varies by program",
                  deadline: "Rolling",
                  type: "State",
                },
                {
                  name: "Local Economic Development Funds",
                  amount: "Varies by city/county",
                  deadline: "Check local EDA",
                  type: "Local",
                },
              ].map((grant) => (
                <div key={grant.name} className="px-6 py-4 flex items-start gap-4">
                  <div className="shrink-0">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      grant.type === "Federal" ? "bg-blue-100 text-blue-700" :
                      grant.type === "State" ? "bg-purple-100 text-purple-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      {grant.type}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{grant.name}</div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      Award: <strong>{grant.amount}</strong> · Deadline: <strong>{grant.deadline}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 px-6 py-3 text-sm text-gray-500 text-center">
              Your actual report will include programs specific to your business profile, location, and qualifiers.
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">
            GrantCrafter identifies grant opportunities for informational purposes only. Grant awards are determined solely by the granting organization. Results vary based on your business profile and grant availability.
          </p>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 text-center mb-4">
            Built For You If You Are...
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            GrantCrafter works for any business or organization seeking funding.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "Small business owners (any industry)",
              "Nonprofits & 501(c)(3)s",
              "Woman-owned businesses",
              "Minority-owned businesses",
              "Veteran-owned businesses",
              "Rural & agricultural businesses",
              "Tech startups seeking SBIR/STTR",
              "Restaurants & food businesses",
              "Retail & brick-and-mortar shops",
              "Service businesses (plumbing, HVAC, etc.)",
              "Creative businesses & artists",
              "Community organizations",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-green-50 rounded-xl p-4">
                <span className="text-green-700 text-lg font-bold">✓</span>
                <span className="text-gray-800 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="bg-green-700 py-20 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-green-200 text-lg mb-10">One plan. Everything included. No hidden fees.</p>
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <div className="text-green-700 font-black text-2xl mb-1">GrantCrafter Pro</div>
            <div className="text-6xl font-black text-gray-900 mb-1">$49</div>
            <div className="text-gray-500 mb-8">per month · cancel anytime</div>
            <ul className="text-left space-y-3 mb-8">
              {[
                "Weekly personalized grant research report",
                "Federal, state, local & private grant sources",
                "Matched to your business profile & qualifiers",
                "Direct application links & deadlines",
                "Members-only dashboard — track, apply, and dismiss grants",
                "Update your business profile anytime for better matches",
                "7-day free trial",
                "Cancel anytime — no contracts",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="text-green-700 font-bold text-lg">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="block bg-green-700 hover:bg-green-800 text-white font-black text-xl px-8 py-5 rounded-xl transition-colors shadow-lg"
            >
              Start Your Free Trial →
            </Link>
            <p className="text-sm text-gray-400 mt-4">
              First report delivered within 24 hours of completing your profile. 7-day money-back guarantee on your first charge.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Does GrantCrafter guarantee I'll get a grant?",
                a: "No. GrantCrafter is a research and discovery tool. We identify grants you may qualify for based on your profile — but all grant awards are determined solely by the granting organization. We never guarantee eligibility or award outcomes.",
              },
              {
                q: "Are these real grants?",
                a: "Yes. We source from Grants.gov, SBA.gov, USDA programs, state economic development agencies, and vetted private foundations. Every opportunity includes the official source and application link so you can verify independently.",
              },
              {
                q: "How is this different from just Googling grants?",
                a: "Generic searches return outdated, one-size-fits-all lists. GrantCrafter cross-references your specific business profile — type, industry, location, size, ownership qualifiers — to surface programs more likely to match your situation. We also track new opportunities each week.",
              },
              {
                q: "What if the grants in my report don't fit my business?",
                a: "We offer a 7-day money-back guarantee. If your first report doesn't surface meaningful opportunities, email us at support@grantcrafter.com and we'll refund your first charge in full.",
              },
              {
                q: "How do I cancel?",
                a: "Log into your dashboard and click Cancel Subscription. No phone calls, no runaround. You'll keep access through the end of your billing period.",
              },
              {
                q: "Do you help me write the grant application?",
                a: "Not currently. GrantCrafter is a discovery and research tool — we identify opportunities, you apply directly through the granting organization.",
              },
            ].map((item) => (
              <div key={item.q} className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-gray-900 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">
            There Are Grants With Your Name On Them.
          </h2>
          <p className="text-gray-400 text-xl mb-4">
            Stop leaving funding on the table. Your first personalized report is ready within 24 hours of signup.
          </p>
          <p className="text-green-400 text-xl font-bold mb-10">Set it up once. Grants find you every week.</p>
          <Link
            href="/signup"
            className="inline-block bg-green-600 hover:bg-green-500 text-white font-black text-xl px-12 py-5 rounded-xl transition-colors shadow-lg"
          >
            Get My First Grant Report →
          </Link>
          <p className="text-gray-500 text-sm mt-4">
            $49/month · 7-day free trial · 7-day money-back guarantee · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-200 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Logo size="sm" href="/" />
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
            <Link href="/disclaimer" className="hover:text-gray-900">Disclaimer</Link>
            <Link href="mailto:support@grantcrafter.com" className="hover:text-gray-900">Contact</Link>
          </div>
          <div className="text-sm text-gray-400">© {new Date().getFullYear()} Warehouse Web Co. All rights reserved.</div>
        </div>
        <div className="max-w-6xl mx-auto mt-6 text-center text-xs text-gray-400">
          GrantCrafter is a grant research and discovery service operated by Warehouse Web Co. Information provided is for educational and informational purposes only. GrantCrafter does not guarantee grant eligibility or award outcomes. Grant decisions are made solely by each granting organization.
        </div>
      </footer>
    </main>
  );
}
