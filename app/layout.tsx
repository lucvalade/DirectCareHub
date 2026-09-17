import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "DirectCare Hub - Ontario Direct Funding Attendant Operations",
  description: "Comprehensive self-directed attendant care management platform for Direct Funding employers in Ontario: scheduling, ESA compliance, timesheets, itemized payroll, ambient voice handover, and emergency relief.",
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
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
