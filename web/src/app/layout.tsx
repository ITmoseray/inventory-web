import { SplashScreenWrapper } from "@/components/shared/splash-screen-wrapper";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { BusinessProvider } from "@/components/providers/business-provider";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { CurrencyProvider } from "@/components/providers/currency-provider";
import { Suspense } from "react";
import { GlobalThemeToggle } from "@/components/shared/global-theme-toggle";
import { InstallPWA } from "@/components/shared/install-pwa";
import { Toaster } from "@/components/ui/sonner";
import { ClickSoundProvider } from "@/components/shared/click-sound-provider";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Protech Assist | Enterprise OS",
  description: "Advanced Retail Intelligence and Inventory Management System.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Protech Assist",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: import("next").Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#4f46e5",
};

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" href="/images/logo-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/logo-192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/images/logo-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/images/logo-512.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/images/logo-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/images/logo-512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Enterprise OS" />
        <meta name="application-name" content="Enterprise OS" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #protech-splash-screen {
                position: fixed !important;
                inset: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                height: 100dvh !important;
                background-color: #000000 !important;
                z-index: 2147483647 !important;
                display: flex !important;
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-full flex flex-col antialiased relative`}>
        <SplashScreenWrapper />
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
        >
          <AuthProvider>
            <CurrencyProvider>
              <Suspense>
              <LoadingProvider>
                <BusinessProvider>
                  {children}
                </BusinessProvider>
              </LoadingProvider>
              <Toaster />
            </Suspense>
            <GlobalThemeToggle />
            <InstallPWA />
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>
        <ClickSoundProvider />
      </body>
    </html>
  );
}
