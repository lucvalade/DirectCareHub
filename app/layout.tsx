import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import { InstallBanner } from "@/components/pwa/InstallBanner";
import { PwaServiceWorkerRegister } from "@/components/pwa/PwaServiceWorkerRegister";

export const metadata: Metadata = {
  title: "DirectCare Hub - Ontario Direct Funding Attendant Operations",
  description: "Comprehensive self-directed attendant care management platform for Direct Funding employers in Ontario: scheduling, ESA compliance, timesheets, itemized payroll, ambient voice handover, and emergency relief.",
  themeColor: "#020617",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/favicon-180x180.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "DirectCare Hub - Ontario Direct Funding Attendant Operations",
    description: "Comprehensive self-directed attendant care management platform for Direct Funding employers in Ontario.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen">
        <AuthProvider>
          <RouteGuard>
            <PwaServiceWorkerRegister />
            <InstallBanner />
            {children}
          </RouteGuard>
        </AuthProvider>
      </body>
    </html>
  );
}

