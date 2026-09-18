"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserRole, UserProfile } from "@/types";
import { Shield, Key, Loader2, Mail, CheckCircle, ArrowLeft, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTab = searchParams?.get("tab") || "overview";

  const { signInWithEmail, registerCustomUser, loginAsDemoUser, signInWithProvider, loading } = useAuth();

  // Authentication mode: 'signin' | 'register'
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");

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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await signInWithEmail(email);
      setSuccessMessage("Logged in successfully! Redirecting...");
      setTimeout(() => {
        router.push(`/?tab=${redirectTab}&view=dashboard`);
      }, 800);
    } catch (err: any) {
      if (err.message === "profile_not_found") {
        setErrorMessage("Profile not found for this email. Please switch to the 'Register Custom Account' tab to create your profile.");
      } else {
        setErrorMessage("Sign-in failed. Please check your credentials or register a new custom account.");
      }
    }
  };

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
      }, 800);
    } catch (err) {
      setErrorMessage("Failed to create custom user profile. Please try again.");
    }
  };

  const handleSSOLogin = async (provider: "google" | "facebook") => {
    setErrorMessage(null);
    try {
      await signInWithProvider(provider);
      setSuccessMessage(`Authenticated with ${provider === "google" ? "Google" : "Facebook"}! Redirecting...`);
      setTimeout(() => {
        router.push(`/?tab=${redirectTab}&view=dashboard`);
      }, 800);
    } catch (err) {
      setErrorMessage("SSO Sign-in failed. Please try again.");
    }
  };

  const handleDemoClick = (demoRole: UserRole) => {
    loginAsDemoUser(demoRole);
    setSuccessMessage("Logged in with Demo Profile! Redirecting...");
    setTimeout(() => {
      router.push(`/?tab=${redirectTab}&view=dashboard`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Header Navigation back */}
      <div className="max-w-md w-full mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-800 min-h-[48px] px-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <main className="max-w-md w-full mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 bg-blue-600 rounded-2xl items-center justify-center text-white shadow-md mx-auto">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">DirectCare Hub</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Canadian Self-Managed Care Portal
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

        {/* Tab Selection Switch */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => { setAuthMode("signin"); setErrorMessage(null); }}
            className={`min-h-[40px] rounded-lg text-xs font-black transition cursor-pointer ${
              authMode === "signin" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode("register"); setErrorMessage(null); }}
            className={`min-h-[40px] rounded-lg text-xs font-black transition cursor-pointer ${
              authMode === "register" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Register Custom Account
          </button>
        </div>

        {/* Tab 1: Sign In form */}
        {authMode === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="signin-email" className="text-[11px] font-bold text-slate-600">Email Address</label>
              <div className="relative">
                <input
                  id="signin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lucgvalade@gmail.com"
                  className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-md cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <span>Sign In with Credentials</span>
              )}
            </button>
          </form>
        )}

        {/* Tab 2: Custom Onboarding / Register form */}
        {authMode === "register" && (
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
                  placeholder="lucgvalade@gmail.com"
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
                  placeholder="Luc Valade"
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
                <span>Register & Launch Dashboard</span>
              )}
            </button>
          </form>
        )}

        {/* Social Authentication Providers */}
        <div className="space-y-3 pt-2">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
              Or Sign Up With Providers
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSSOLogin("google")}
              disabled={loading}
              className="flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-xs font-bold text-slate-700 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 text-rose-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.745-.079-1.314-.176-1.879H12.24z"/>
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleSSOLogin("facebook")}
              disabled={loading}
              className="flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition text-xs font-bold text-slate-700 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
              </svg>
              <span>Facebook</span>
            </button>
          </div>
        </div>

        {/* One-Click Sandbox Profiles for Testers */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div className="flex items-center gap-1.5 p-2 bg-blue-50/50 rounded-xl border border-blue-100">
            <Key className="w-4.5 h-4.5 text-blue-600 shrink-0" />
            <p className="text-[10px] font-bold text-blue-900 leading-normal">
              Developer sandbox quick login shortcuts:
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoClick("employer")}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 text-center transition cursor-pointer min-h-[58px]"
            >
              <span className="text-[10px] font-black text-slate-900">Luc Valade</span>
              <span className="text-[9px] text-slate-500 font-bold">Employer</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick("attendant")}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/20 text-center transition cursor-pointer min-h-[58px]"
            >
              <span className="text-[10px] font-black text-slate-900">Elena PSW</span>
              <span className="text-[9px] text-slate-500 font-bold">Attendant</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick("bookkeeper")}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 text-center transition cursor-pointer min-h-[58px]"
            >
              <span className="text-[10px] font-black text-slate-900">Marcus CPA</span>
              <span className="text-[9px] text-slate-500 font-bold">Bookkeeper</span>
            </button>
          </div>
        </div>

      </main>

      <footer className="text-center text-[10px] text-slate-400 font-semibold tracking-wide mt-6">
        DirectCare Hub • High-Contrast AODA-Compliant Care Platform
      </footer>
    </div>
  );
}
