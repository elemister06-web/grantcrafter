import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-1 mb-10">
          <span className="text-xl font-black text-green-700">Grant</span>
          <span className="text-xl font-black text-gray-900">Crafter</span>
        </Link>

        <h1 className="text-3xl font-black text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: May 2026</p>

        <div className="prose text-gray-700 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Information We Collect</h2>
            <p>We collect information you provide when signing up and completing your business profile, including:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Email address</li>
              <li>Business name, type, and industry</li>
              <li>Business location (city and state)</li>
              <li>Business size and revenue range</li>
              <li>Ownership qualifiers you self-report</li>
              <li>Payment information (processed securely by Stripe — we never store card numbers)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">How We Use Your Information</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>To generate your personalized monthly grant reports</li>
              <li>To deliver reports to your email address</li>
              <li>To manage your subscription and billing</li>
              <li>To improve our service and AI models</li>
              <li>To send service-related communications (reports, receipts, updates)</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Third-Party Services</h2>
            <p>We use the following trusted third-party services:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Stripe</strong> — payment processing</li>
              <li><strong>Supabase</strong> — secure database storage</li>
              <li><strong>Anthropic Claude</strong> — AI report generation</li>
              <li><strong>Resend</strong> — email delivery</li>
            </ul>
            <p>Each provider has their own privacy policy and data practices.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Data Security</h2>
            <p>
              We take reasonable steps to protect your information using
              industry-standard security measures. Your payment data is handled
              entirely by Stripe and is never stored on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your Rights</h2>
            <p>You may request to:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Delete your account and associated data</li>
              <li>Update your business profile at any time</li>
            </ul>
            <p>
              To exercise these rights, email{" "}
              <a href="mailto:support@grantcrafter.com" className="text-green-700 underline">
                support@grantcrafter.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Contact</h2>
            <p>
              <a href="mailto:support@grantcrafter.com" className="text-green-700 underline">
                support@grantcrafter.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 flex gap-6 text-sm text-gray-500">
          <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
          <Link href="/disclaimer" className="hover:text-gray-900">Disclaimer</Link>
          <Link href="/" className="hover:text-gray-900">Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
