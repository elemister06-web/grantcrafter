import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-1 mb-10">
          <span className="text-xl font-black text-green-700">Grant</span>
          <span className="text-xl font-black text-gray-900">Crafter</span>
        </Link>

        <h1 className="text-3xl font-black text-gray-900 mb-2">Disclaimer</h1>
        <p className="text-gray-500 mb-8">Last updated: May 2026</p>

        <div className="prose text-gray-700 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Informational Purposes Only
            </h2>
            <p>
              GrantCrafter is a grant research and discovery service. The
              information provided through our platform — including grant
              reports, funding opportunities, eligibility guidance, and any
              other content — is for <strong>informational and educational
              purposes only</strong>.
            </p>
            <p>
              Nothing on GrantCrafter constitutes professional legal, financial,
              accounting, or grant-writing advice. Always consult qualified
              professionals for advice specific to your situation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No Guarantee of Grant Awards
            </h2>
            <p>
              GrantCrafter does <strong>not</strong> guarantee that you will
              receive any grant, funding, or financial award. Grant decisions
              are made solely by the granting organization (federal agency,
              state program, foundation, or other entity), not by GrantCrafter.
            </p>
            <p>
              Appearing on a GrantCrafter report does not mean you are
              guaranteed to qualify or receive funding. Eligibility requirements
              vary and are subject to change. Final determination of eligibility
              rests entirely with the granting organization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Accuracy of Information
            </h2>
            <p>
              We make reasonable efforts to provide accurate, current grant
              information. However, grant programs change frequently —
              deadlines move, funding runs out, eligibility criteria are
              revised, and programs are discontinued.
            </p>
            <p>
              GrantCrafter is not responsible for inaccuracies, outdated
              information, or changes to grant programs after our reports are
              generated. Always verify grant details directly with the official
              granting organization before applying.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              AI-Generated Content
            </h2>
            <p>
              Our grant reports are generated using artificial intelligence
              technology. While we use industry-leading AI models and
              carefully designed prompts, AI-generated content may occasionally
              contain errors, omissions, or outdated information.
            </p>
            <p>
              Do not rely solely on GrantCrafter reports for business decisions.
              Always independently verify any grant opportunity before investing
              time in an application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Not a Grant-Writing Service
            </h2>
            <p>
              GrantCrafter identifies funding opportunities. We do not write
              grant applications on your behalf, represent you to granting
              organizations, or guarantee application outcomes. The application
              process is your responsibility.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, GrantCrafter and its
              owners, employees, and affiliates are not liable for any direct,
              indirect, incidental, or consequential damages arising from your
              use of our service or reliance on information in our reports.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Contact
            </h2>
            <p>
              Questions about this disclaimer:{" "}
              <a
                href="mailto:support@grantcrafter.com"
                className="text-green-700 underline"
              >
                support@grantcrafter.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 flex gap-6 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-gray-900">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-gray-900">
            Terms of Service
          </Link>
          <Link href="/" className="hover:text-gray-900">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
