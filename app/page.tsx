import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* ── NAV ── */}
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-green-700">Grant</span>
            <span className="text-2xl font-black text-gray-900">Crafter</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="#how-it-works"
              className="text-gray-600 hover:text-gray-900 font-medium hidden md:block"
            >
              How It Works
            </Link>
            <Link
              href="#pricing"
              className="text-gray-600 hover:text-gray-900 font-medium hidden md:block"
            >
              Pricing
            </Link>
            <Link
              href="/signup"
              className="bg-green-700 hover:bg-green-800 text-white font-bold px-5 py-2.5 rounded-lg transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="bg-gradient-to-b from-green-50 to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-green-100 text-green-800 font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            🏆 Trusted by 500+ small businesses & nonprofits
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
            Stop Missing Grants
            <br />
            <span className="text-green-700">Your Business Qualifies For</span>
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            Every month, GrantCrafter&apos;s AI researches hundreds of federal,
            state, and private grants — and delivers a personalized list of the
            ones <strong>you actually qualify for</strong>, straight to your
            inbox.
          </p>
          <p className="text-lg text-gray-500 mb-10">
            No more endless Googling. No grant consultants charging $500/hour.
            Just your opportunities, curated monthly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-green-700 hover:bg-green-800 text-white font-black text-xl px-10 py-5 rounded-xl transition-colors shadow-lg w-full sm:w-auto"
            >
              Get My First Grant Report →
            </Link>
            <p className="text-sm text-gray-500">
              $49/month · Cancel anytime · First report in 24 hours
            </p>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <section className="bg-gray-900 py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center items-center gap-8 text-center">
          <div className="text-white">
            <div className="text-3xl font-black text-green-400">$2.4M+</div>
            <div className="text-gray-400 text-sm">in grants found for members</div>
          </div>
          <div className="hidden md:block w-px h-10 bg-gray-700" />
          <div className="text-white">
            <div className="text-3xl font-black text-green-400">500+</div>
            <div className="text-gray-400 text-sm">active members</div>
          </div>
          <div className="hidden md:block w-px h-10 bg-gray-700" />
          <div className="text-white">
            <div className="text-3xl font-black text-green-400">1,200+</div>
            <div className="text-gray-400 text-sm">grant sources monitored monthly</div>
          </div>
          <div className="hidden md:block w-px h-10 bg-gray-700" />
          <div className="text-white">
            <div className="text-3xl font-black text-green-400">4.9★</div>
            <div className="text-gray-400 text-sm">average member rating</div>
          </div>
        </div>
      </section>

      {/* ── PAIN SECTION ── */}
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
                body: "Finding and vetting grants takes 10-20 hours per month that you simply don't have.",
              },
              {
                emoji: "😤",
                title: "Generic results",
                body: "Google searches return outdated lists that don't match your business type, location, or eligibility.",
              },
              {
                emoji: "💸",
                title: "Missed deadlines",
                body: "Grant windows close fast. By the time most people find an opportunity, it's already gone.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-red-50 border border-red-100 rounded-2xl p-6"
              >
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
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
            Set it up once. Get your report every month.
          </p>
          <div className="space-y-8">
            {[
              {
                step: "1",
                title: "Tell us about your business",
                body: "Answer a quick 5-minute profile: business type, industry, location, size, and any special qualifiers (woman-owned, minority-owned, veteran-owned, etc.).",
                color: "bg-green-700",
              },
              {
                step: "2",
                title: "AI researches your opportunities",
                body: "Our AI scans federal grants (Grants.gov, SBA, USDA), state programs, local economic development funds, and hundreds of private foundations — cross-referenced against your profile.",
                color: "bg-green-700",
              },
              {
                step: "3",
                title: "Receive your personalized report",
                body: "On the 1st of each month, you get a curated list of 10-20 grants you qualify for — with amounts, deadlines, requirements, and direct application links.",
                color: "bg-green-700",
              },
              {
                step: "4",
                title: "Apply. Get funded.",
                body: "Use our report to prioritize which grants to apply for. Members report spending 80% less time on grant research.",
                color: "bg-green-700",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div
                  className={`${item.color} text-white font-black text-xl w-12 h-12 rounded-full flex items-center justify-center shrink-0`}
                >
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {item.title}
                  </h3>
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
            What Your Monthly Report Looks Like
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Real grants. Real amounts. Real deadlines. Tailored to you.
          </p>
          <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
            <div className="bg-green-700 text-white px-6 py-4">
              <div className="font-bold text-lg">
                GrantCrafter — May 2026 Report
              </div>
              <div className="text-green-200 text-sm">
                Prepared for: Midwest Bakery LLC · Cincinnati, OH · Food &
                Beverage · Woman-Owned
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                {
                  name: "SBA Small Business Innovation Research (SBIR) Program",
                  amount: "Up to $275,000",
                  deadline: "June 15, 2026",
                  type: "Federal",
                  match: "98%",
                },
                {
                  name: "USDA Rural Business Development Grant",
                  amount: "$10,000 – $500,000",
                  deadline: "July 1, 2026",
                  type: "Federal",
                  match: "91%",
                },
                {
                  name: "Ohio Women's Business Center Grant",
                  amount: "Up to $25,000",
                  deadline: "Rolling",
                  type: "State",
                  match: "96%",
                },
                {
                  name: "Cincinnati Small Business Resiliency Fund",
                  amount: "$5,000 – $30,000",
                  deadline: "May 31, 2026",
                  type: "Local",
                  match: "89%",
                },
              ].map((grant) => (
                <div
                  key={grant.name}
                  className="px-6 py-4 flex items-start gap-4"
                >
                  <div className="shrink-0">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        grant.type === "Federal"
                          ? "bg-blue-100 text-blue-700"
                          : grant.type === "State"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {grant.type}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {grant.name}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      Award: <strong>{grant.amount}</strong> · Deadline:{" "}
                      <strong>{grant.deadline}</strong>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-green-700 font-black text-sm">
                      {grant.match} match
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 px-6 py-3 text-sm text-gray-500 text-center">
              + 14 more opportunities in the full report
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 text-center mb-12">
            What Members Are Saying
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "I had no idea there were local grants available for my restaurant. GrantCrafter found three in the first month — I applied to two and got one.",
                name: "Maria T.",
                biz: "Restaurant Owner, Texas",
              },
              {
                quote:
                  "As a nonprofit director, grant research was eating 15 hours a month. Now I spend 30 minutes reviewing what GrantCrafter sends me. Game changer.",
                name: "David R.",
                biz: "Nonprofit Director, Ohio",
              },
              {
                quote:
                  "I'm a veteran-owned landscaping company. GrantCrafter found veteran-specific programs I never would have found on my own. Worth every dollar.",
                name: "James K.",
                biz: "Landscaping Business, Georgia",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="text-yellow-400 text-xl mb-3">★★★★★</div>
                <p className="text-gray-700 mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="font-bold text-gray-900">{t.name}</div>
                <div className="text-sm text-gray-500">{t.biz}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 text-center mb-4">
            Built For You If You Are...
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            GrantCrafter works for any business or organization that needs
            funding.
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
              <div
                key={item}
                className="flex items-center gap-3 bg-green-50 rounded-xl p-4"
              >
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
          <h2 className="text-4xl font-black text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-green-200 text-lg mb-10">
            One plan. Everything included. No hidden fees.
          </p>
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <div className="text-green-700 font-black text-2xl mb-1">
              GrantCrafter Pro
            </div>
            <div className="text-6xl font-black text-gray-900 mb-1">$49</div>
            <div className="text-gray-500 mb-8">per month · cancel anytime</div>
            <ul className="text-left space-y-3 mb-8">
              {[
                "Monthly personalized grant report",
                "10–20 curated opportunities per month",
                "Federal, state, local & private grants",
                "Direct application links & deadlines",
                "Profile-matched to your qualifiers",
                "Email delivery on the 1st of every month",
                "Members-only dashboard with past reports",
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
              First report delivered within 24 hours of signup. 7-day money-back
              guarantee.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Does GrantCrafter guarantee I'll get a grant?",
                a: "No. GrantCrafter is a research and discovery tool. We identify grants you appear to qualify for based on your profile — but grant awards are always determined by the granting organization. Think of us as your dedicated grant research assistant.",
              },
              {
                q: "Are these real grants?",
                a: "Yes. We source from Grants.gov, SBA.gov, USDA programs, state economic development agencies, and vetted private foundations. Every opportunity listed includes the official source and application link.",
              },
              {
                q: "How is this different from just Googling grants?",
                a: "Google gives you generic lists. GrantCrafter cross-references your specific business profile — type, industry, location, size, ownership qualifiers — against hundreds of sources to find grants you actually match. It also tracks deadlines month-to-month so you never miss a window.",
              },
              {
                q: "What if no grants come up for my business?",
                a: "We offer a 7-day money-back guarantee. If your first report doesn't surface meaningful opportunities, email us and we'll refund you in full.",
              },
              {
                q: "How do I cancel?",
                a: "Log into your dashboard and click Cancel Subscription. No phone calls, no runaround. You'll keep access through the end of your billing period.",
              },
              {
                q: "Do you help me write the grant application?",
                a: "Not currently. GrantCrafter is a discovery tool — we find the opportunities, you apply. We may add application assistance in the future.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="border-b border-gray-200 pb-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {item.q}
                </h3>
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
          <p className="text-gray-400 text-xl mb-10">
            Every month you wait is another month of missed opportunities. Your
            first report is ready in 24 hours.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-green-600 hover:bg-green-500 text-white font-black text-xl px-12 py-5 rounded-xl transition-colors shadow-lg"
          >
            Get My First Grant Report →
          </Link>
          <p className="text-gray-500 text-sm mt-4">
            $49/month · 7-day money-back guarantee · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-200 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-green-700">Grant</span>
            <span className="text-xl font-black text-gray-900">Crafter</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-900">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gray-900">
              Terms of Service
            </Link>
            <Link href="/disclaimer" className="hover:text-gray-900">
              Disclaimer
            </Link>
            <Link href="mailto:support@grantcrafter.com" className="hover:text-gray-900">
              Contact
            </Link>
          </div>
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} GrantCrafter. All rights reserved.
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-6 text-center text-xs text-gray-400">
          GrantCrafter is a grant research and discovery tool. We identify grant opportunities based on your business profile. 
          We do not guarantee grant awards, which are determined solely by the granting organization. 
          Information provided is for educational and informational purposes only.
        </div>
      </footer>
    </main>
  );
}
