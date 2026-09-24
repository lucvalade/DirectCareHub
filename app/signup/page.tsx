"use client";

export const dynamic = 'force-dynamic';

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserRole, UserProfile } from "@/types";
import { Shield, Loader2, Mail, CheckCircle, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTab = searchParams?.get("tab") || "overview";

  const { registerCustomUser, signInWithProvider, loading } = useAuth();

  // Form Fields
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<UserRole>("employer");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("Ontario");
  const [hourlyRate, setHourlyRate] = useState("23.50");
  const [ciltId, setCiltId] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !displayName) {
      setErrorMessage("Please supply at least a valid Email and your Full Name.");
      return;
    }

    const rateNum = parseFloat(hourlyRate) || 23.50;

    const profile: UserProfile = {
      uid: `custom_${Math.random().toString(36).substr(2, 9)}`,
      email,
      displayName,
      role,
      phone: phone || "416-555-0100",
      hourlyRate: rateNum,
      emergencyContact: ciltId ? `CILT Account ID: ${ciltId}` : "Not Assigned"
    };

    try {
      await registerCustomUser(profile);
      setSuccessMessage("Account registered successfully! Redirecting...");
      setTimeout(() => {
        router.push(`/?tab=${redirectTab}&view=dashboard`);
      }, 600);
    } catch (err: any) {
      const msg = typeof err === "string" ? err : err?.message || "Failed to create user profile.";
      setErrorMessage(msg);
    }
  };

  const handleSSOLogin = async (provider: "google" | "facebook") => {
    setErrorMessage(null);
    try {
      await signInWithProvider(provider);
      setSuccessMessage(`Authenticated with ${provider === "google" ? "Google" : "Facebook"}! Redirecting...`);
      setTimeout(() => {
        router.push(`/?tab=${redirectTab}&view=dashboard`);
      }, 600);
    } catch (err: any) {
      const msg = typeof err === "string" ? err : err?.message || "SSO Registration failed.";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Navigation back */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-800 min-h-[48px] px-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <span className="text-xs text-slate-500 font-semibold">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Log In
          </Link>
        </span>
      </div>

      <main className="max-w-md w-full mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 bg-blue-600 rounded-2xl items-center justify-center text-white shadow-md mx-auto">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create an Account</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            DirectCare Hub • Canadian Self-Managed Care
          </p>
        </div>

        {/* Action Status Feedbacks */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 flex gap-2.5 items-start">
            <AlertCircle className="w-4.5 h-4.5 text-rose-600 mt-0.5 shrink-0" />
            <p className="font-semibold leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex gap-2.5 items-start">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-600 mt-0.5 shrink-0" />
            <p className="font-semibold leading-relaxed">{successMessage}</p>
          </div>
        )}

        {/* SSO Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSSOLogin("google")}
            disabled={loading}
            className="w-full min-h-[48px] bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 rounded-lg px-4 flex items-center justify-center gap-3 transition shadow-xs cursor-pointer text-slate-800 font-medium text-sm"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Sign up with Google</span>
          </button>
        </div>

        <div className="text-center py-1">
          <span className="text-xs font-medium text-slate-500">or register with email</span>
        </div>

        {/* Custom Register form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="reg-email" className="text-[11px] font-bold text-slate-600">Email Address</label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="reg-name" className="text-[11px] font-bold text-slate-600">Full Name</label>
              <input
                id="reg-name"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Full Name"
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="reg-role" className="text-[11px] font-bold text-slate-600">Assigned Role</label>
              <select
                id="reg-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="employer">Employer / Self-Manager</option>
                <option value="attendant">PSW Attendant</option>
                <option value="bookkeeper">CILT / DF Auditor</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="reg-province" className="text-[11px] font-bold text-slate-600">Province Location</label>
              <select
                id="reg-province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Ontario">Ontario (DF/CILT)</option>
                <option value="British Columbia">British Columbia (CSIL)</option>
                <option value="Alberta">Alberta (SMC)</option>
                <option value="Manitoba">Manitoba (DFO)</option>
                <option value="Nova Scotia">Nova Scotia (DFS)</option>
                <option value="Saskatchewan">Saskatchewan (IF)</option>
                <option value="Newfoundland">Newfoundland (PHSP)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="reg-rate" className="text-[11px] font-bold text-slate-600">Hourly Rate (CAD)</label>
              <input
                id="reg-rate"
                type="number"
                step="0.01"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="reg-id" className="text-[11px] font-bold text-slate-600">CILT Account / Client ID</label>
              <input
                id="reg-id"
                type="text"
                value={ciltId}
                onChange={(e) => setCiltId(e.target.value)}
                placeholder="DF-9910-ON"
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="reg-phone" className="text-[11px] font-bold text-slate-600">Contact Number</label>
            <input
              id="reg-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="416-555-0192"
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-md cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            ) : (
              <span>Register Account</span>
            )}
          </button>
        </form>

      </main>

      <footer className="text-center text-[10px] text-slate-400 font-semibold tracking-wide mt-6">
        DirectCare Hub • High-Contrast AODA-Compliant Care Platform
      </footer>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Loading Sign Up...</p>
        </div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
