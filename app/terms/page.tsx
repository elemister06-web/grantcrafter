import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-1 mb-10">
          <span className="text-xl font-black text-green-700">Grant</span>
          <span className="text-xl font-black text-gray-900">Crafter</span>
        </Link>

        <h1 className="text-3xl font-black text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: May 2026</p>

        <div className="prose text-gray-700 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">1. Acceptance</h2>
            <p>
              By using GrantCrafter, you agree to these Terms. If you do not
              agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">2. Service Description</h2>
            <p>
              GrantCrafter is a subscription-based grant research and discovery
              service. We use artificial intelligence to identify grant
              opportunities that may match your business profile and deliver
              monthly reports to your email. We are a research tool only — not a
              grant-writing, legal, or financial advisory service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">3. Subscription and Billing</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Subscriptions are billed monthly at $49/month</li>
              <li>Your subscription renews automatically each month</li>
              <li>A 7-day free trial is offered to new members</li>
              <li>You may cancel anytime from your dashboard with no penalty</li>
              <li>Cancellation takes effect at the end of your current billing period</li>
              <li>We offer a 7-day money-back guarantee for your first charge</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">4. No Guarantee of Results</h2>
            <p>
              GrantCrafter does not guarantee that you will receive any grant,
              funding, or financial award. Our reports are for informational
              purposes only. All grant awards are determined by the granting
              organization, not by GrantCrafter.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">5. Accuracy</h2>
            <p>
              While we strive for accuracy, grant programs change frequently.
              GrantCrafter is not responsible for outdated, inaccurate, or
              incomplete information. Always verify grant details directly with
              the official granting organization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">6. Acceptable Use</h2>
            <p>
              You agree to use GrantCrafter only for lawful purposes and provide
              accurate information during onboarding. Misrepresenting your
              business profile to access grant information you would not
              otherwise qualify for may result in account termination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, GrantCrafter&apos;s liability
              to you for any claims arising from use of the service is limited
              to the amount you paid in the 30 days preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">8. Changes to Terms</h2>
            <p>
              We may update these Terms. We will notify you of material changes
              by email. Continued use after notice constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">9. Contact</h2>
            <p>
              <a href="mailto:support@grantcrafter.com" className="text-green-700 underline">
                support@grantcrafter.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 flex gap-6 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
          <Link href="/disclaimer" className="hover:text-gray-900">Disclaimer</Link>
          <Link href="/" className="hover:text-gray-900">Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
