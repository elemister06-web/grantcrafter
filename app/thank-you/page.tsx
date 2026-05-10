import Link from "next/link";
import Script from "next/script";

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-green-50 flex flex-col items-center justify-center px-4">
      <Script id="gtag-conversion" strategy="afterInteractive">
        {`gtag('event', 'conversion', { 'send_to': 'AW-18151623677' });`}
      </Script>
      <div className="max-w-lg w-full text-center">
        <Link href="/" className="flex items-center justify-center gap-1 mb-10">
          <span className="text-2xl font-black text-green-700">Grant</span>
          <span className="text-2xl font-black text-gray-900">Crafter</span>
        </Link>

        <div className="bg-white rounded-3xl shadow-xl p-10">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">
            You&apos;re all set!
          </h1>
          <p className="text-gray-600 mb-6">
            We&apos;re generating your first grant report right now. You&apos;ll
            receive it by email within 24 hours.
          </p>

          <div className="bg-green-50 rounded-2xl p-5 mb-8 text-left space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-lg font-bold">✓</span>
              <div>
                <div className="font-semibold text-gray-900">
                  Check your inbox
                </div>
                <div className="text-sm text-gray-500">
                  Your first report arrives in the next 24 hours
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-lg font-bold">✓</span>
              <div>
                <div className="font-semibold text-gray-900">
                  Weekly reports every Monday
                </div>
                <div className="text-sm text-gray-500">
                  Fresh opportunities every week, automatically
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-lg font-bold">✓</span>
              <div>
                <div className="font-semibold text-gray-900">
                  Access your dashboard anytime
                </div>
                <div className="text-sm text-gray-500">
                  View all past reports and manage your subscription
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="block bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-xl transition-colors"
          >
            Go to Dashboard →
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Questions? Email{" "}
          <a
            href="mailto:support@grantcrafter.com"
            className="underline hover:text-gray-600"
          >
            support@grantcrafter.com
          </a>
        </p>
      </div>
    </main>
  );
}
