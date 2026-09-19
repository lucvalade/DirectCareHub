"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Lock } from "lucide-react";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/pricing",
  "/privacy",
  "/terms",
  "/robots.txt",
  "/sitemap.xml"
];

function isPublicPath(path: string): boolean {
  if (PUBLIC_PATHS.includes(path)) return true;
  if (path.startsWith("/provinces/")) return true;
  return false;
}

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, loading } = useAuth();
  const [authorized, setAuthorized] = useState(true);

  const isPublic = isPublicPath(pathname || "/");

  useEffect(() => {
    if (!isPublic && !userProfile && !loading) {
      setAuthorized(false);
      router.push(`/login?redirect=${encodeURIComponent(pathname || "/")}`);
    } else {
      setAuthorized(true);
    }
  }, [pathname, userProfile, loading, router, isPublic]);

  // Public paths bypass session verification completely
  if (isPublic) {
    return <>{children}</>;
  }

  // Non-public path and loading authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Verifying Session Authorization...</p>
      </div>
    );
  }

  if (!authorized || !userProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900">Restricted Access</h2>
        <p className="text-xs text-slate-500 max-w-sm">
          Please log in to your DirectCare Hub workspace to view secure clinical timesheets, receipts, and handovers.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
