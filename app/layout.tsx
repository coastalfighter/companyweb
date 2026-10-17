import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { AttributionTracker } from "@/components/layout/attribution-tracker";
import { MobileCtaBar } from "@/components/layout/mobile-cta-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { Atmosphere } from "@/components/motion/atmosphere";
import { DeferredEffects } from "@/components/motion/deferred-effects";
import { Preloader } from "@/components/motion/preloader";
import { RouteTransition } from "@/components/motion/route-transition";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { bootScript } from "@/lib/motion/boot";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} · Operations, handled`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} · Operations, handled`,
    description: siteConfig.description,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Decides the first frame before paint: motion on/off, preloader or not (lib/motion/boot.ts). */}
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <Preloader />
        <Atmosphere />
        <ScrollProgress />
        <SkipLink />
        <SiteHeader />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <SiteFooter />
        <MobileCtaBar />
        <ScrollReveal />
        <DeferredEffects />
        <RouteTransition />
        <AttributionTracker />
        <AnalyticsProvider />
      </body>
    </html>
  );
}
