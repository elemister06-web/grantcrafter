import type { Metadata } from "next";
import "./globals.css";
import AuthRedirect from "@/components/AuthRedirect";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.grantcrafter.com"),
  title: {
    default: "GrantCrafter — AI-Powered Grant Discovery for Small Businesses",
    template: "%s | GrantCrafter",
  },
  description:
    "Every month, GrantCrafter finds grants, funding programs, and opportunities your business actually qualifies for. Stop Googling. Start applying.",
  keywords:
    "small business grants, grant finder, business funding, nonprofit grants, monthly grant alerts, AI grant research, grant discovery",
  alternates: {
    canonical: "https://www.grantcrafter.com",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "GrantCrafter — Never Miss a Grant Again",
    description:
      "AI-powered monthly grant discovery for small businesses and nonprofits. $49/month. 7-day free trial. Cancel anytime.",
    url: "https://www.grantcrafter.com",
    siteName: "GrantCrafter",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://www.grantcrafter.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "GrantCrafter — AI-Powered Grant Discovery for Small Businesses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GrantCrafter — Never Miss a Grant Again",
    description:
      "AI-powered monthly grant discovery for small businesses and nonprofits. $49/month. 7-day free trial.",
    images: ["https://www.grantcrafter.com/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GrantCrafter",
  url: "https://www.grantcrafter.com",
  logo: "https://www.grantcrafter.com/icon-512.png",
  description:
    "GrantCrafter is an AI-powered monthly grant discovery service for small businesses and nonprofits, operated by Warehouse Web Co.",
  foundingLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cincinnati",
      addressRegion: "OH",
      addressCountry: "US",
    },
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@grantcrafter.com",
    contactType: "customer support",
    availableLanguage: "English",
  },
  sameAs: [],
  parentOrganization: {
    "@type": "Organization",
    name: "Warehouse Web Co",
    url: "https://warehousewebco.com",
  },
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "GrantCrafter",
  url: "https://www.grantcrafter.com",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "AI-powered monthly grant discovery for small businesses and nonprofits. Receive a personalized list of grants, funding programs, and opportunities every month, matched to your specific business profile.",
  screenshot: "https://www.grantcrafter.com/og-image.png",
  offers: {
    "@type": "Offer",
    price: "49.00",
    priceCurrency: "USD",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: 49.0,
      priceCurrency: "USD",
      billingDuration: "P1M",
      unitCode: "MON",
    },
    description: "Monthly subscription. 7-day free trial included. Cancel anytime.",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "Monthly personalized grant research report",
    "Federal, state, local & private grant sources",
    "Matched to your business profile and qualifiers",
    "Direct application links and deadlines",
    "Email delivery on the 1st of every month",
    "Members-only dashboard with past reports",
    "7-day free trial",
  ],
  provider: {
    "@type": "Organization",
    name: "Warehouse Web Co",
    url: "https://warehousewebco.com",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Does GrantCrafter guarantee I'll get a grant?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. GrantCrafter is a research and discovery tool. We identify grants you may qualify for based on your profile — but all grant awards are determined solely by the granting organization. We never guarantee eligibility or award outcomes.",
      },
    },
    {
      "@type": "Question",
      name: "Are these real grants?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We source from Grants.gov, SBA.gov, USDA programs, state economic development agencies, and vetted private foundations. Every opportunity includes the official source and application link so you can verify independently.",
      },
    },
    {
      "@type": "Question",
      name: "How is GrantCrafter different from just Googling grants?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Generic searches return outdated, one-size-fits-all lists. GrantCrafter cross-references your specific business profile — type, industry, location, size, ownership qualifiers — to surface programs more likely to match your situation. We also track new opportunities each month.",
      },
    },
    {
      "@type": "Question",
      name: "What if the grants in my report don't fit my business?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We offer a 7-day money-back guarantee. If your first report doesn't surface meaningful opportunities, email us at support@grantcrafter.com and we'll refund your first charge in full.",
      },
    },
    {
      "@type": "Question",
      name: "How do I cancel my GrantCrafter subscription?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Log into your dashboard and click Cancel Subscription. No phone calls, no runaround. You'll keep access through the end of your billing period.",
      },
    },
    {
      "@type": "Question",
      name: "Does GrantCrafter help me write the grant application?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not currently. GrantCrafter is a discovery and research tool — we identify opportunities, you apply directly through the granting organization.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18151623677"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-18151623677');
        `}} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body><AuthRedirect />{children}</body>
    </html>
  );
}
