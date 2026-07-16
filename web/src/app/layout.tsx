import { SplashScreenWrapper } from "@/components/shared/splash-screen-wrapper";
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { BusinessProvider } from "@/components/providers/business-provider";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { Suspense } from "react";
import { GlobalThemeToggle } from "@/components/shared/global-theme-toggle";
import { InstallPWA } from "@/components/shared/install-pwa";
import { Toaster } from "@/components/ui/sonner";

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
        <link rel="apple-touch-icon" href="/images/PA.png" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
        >
          <AuthProvider>
            <Suspense>
              <LoadingProvider>
                <BusinessProvider>
                  <SplashScreenWrapper>
                    {children}
                  </SplashScreenWrapper>
                </BusinessProvider>
              </LoadingProvider>
            </Suspense>
            <GlobalThemeToggle />
            <InstallPWA />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
