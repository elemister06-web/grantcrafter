import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrantCrafter — AI-Powered Grant Discovery for Small Businesses",
  description:
    "Every month, GrantCrafter finds grants, funding programs, and opportunities your business actually qualifies for. Stop Googling. Start applying.",
  keywords:
    "small business grants, grant finder, business funding, nonprofit grants, monthly grant alerts",
  openGraph: {
    title: "GrantCrafter — Never Miss a Grant Again",
    description:
      "AI-powered monthly grant discovery for small businesses and nonprofits. $49/month. Cancel anytime.",
    url: "https://www.grantcrafter.com",
    siteName: "GrantCrafter",
    type: "website",
  },
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
      </head>
      <body>{children}</body>
    </html>
  );
}
