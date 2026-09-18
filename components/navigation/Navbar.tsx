"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Shield, 
  LayoutDashboard, 
  ClipboardList, 
  Banknote, 
  Users, 
  FolderLock, 
  AlertTriangle, 
  ChevronDown, 
  Settings, 
  Receipt, 
  Sparkles, 
  LogOut, 
  Menu, 
  X,
  Clock,
  UserCheck
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import EmergencySosButton from "./EmergencySosButton";

interface NavbarProps {
  userRole?: string;
  userName?: string;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onSignOut?: () => void;
  onRoleChange?: (role: "employer" | "attendant" | "bookkeeper") => void;
}

export default function Navbar({
  userRole: propUserRole,
  userName: propUserName,
  activeTab = "overview",
  onSelectTab,
  onSignOut: propOnSignOut,
  onRoleChange: propOnRoleChange
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, signOut, loginAsDemoUser } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [payrollDropdownOpen, setPayrollDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const payrollRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (payrollRef.current && !payrollRef.current.contains(event.target as Node)) {
        setPayrollDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine user identity
  const effectiveRole = propUserRole || userProfile?.role || "employer";
  const effectiveName = propUserName || userProfile?.displayName || "Direct Funding Employer";

  const isEmployer = effectiveRole === "employer";
  const isAttendant = effectiveRole === "attendant";
  const isBookkeeper = effectiveRole === "bookkeeper";

  const handleRoleChange = (newRole: "employer" | "attendant" | "bookkeeper") => {
    setProfileDropdownOpen(false);
    if (propOnRoleChange) {
      propOnRoleChange(newRole);
    } else {
      loginAsDemoUser(newRole);
    }
  };

  const handleSignOut = () => {
    setProfileDropdownOpen(false);
    if (propOnSignOut) {
      propOnSignOut();
    } else {
      signOut();
    }
  };

  const handleTabNavigation = (tabName: string) => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setPayrollDropdownOpen(false);
    if (pathname === "/" && onSelectTab) {
      onSelectTab(tabName);
    } else {
      router.push(`/?tab=${tabName}`);
    }
  };

  // Active states
  const isDashboardActive = pathname === "/" && (!activeTab || activeTab === "overview");
  const isProtocolsActive = pathname?.startsWith("/protocols");
  const isPayrollActive = pathname?.startsWith("/payroll") || pathname?.startsWith("/timesheets");
  const isAttendantsActive = pathname?.startsWith("/attendants");
  const isVaultActive = pathname?.startsWith("/vault");
  const isProfileActive = pathname?.startsWith("/profile");
  const isBillingActive = pathname?.startsWith("/settings/billing");
  const isPricingActive = pathname?.startsWith("/pricing");
  const isOnboardingActive = pathname?.startsWith("/onboarding");

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 w-full shadow-xs">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Left: Brand logo & ID */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden min-h-[48px] min-w-[48px] p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center justify-center cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 bg-blue-600 group-hover:bg-blue-700 rounded-xl flex items-center justify-center text-white shadow-md transition shrink-0">
              <Shield className="w-5.5 h-5.5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-black text-slate-900 leading-none">
                  DirectCare Hub
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full shrink-0">
                  Ontario DF
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase leading-none mt-1">
                Self-Managed Care
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Consolidated Primary Links (Desktop) */}
        <div className="hidden lg:flex items-center space-x-1">
          {/* 1. Dashboard */}
          <Link
            href="/"
            onClick={() => { if (pathname === "/") handleTabNavigation("overview"); }}
            className={`min-h-[48px] px-3.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              isDashboardActive
                ? "bg-blue-50 text-blue-700 font-extrabold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${isDashboardActive ? "text-blue-600" : "text-slate-500"}`} />
            <span>Dashboard</span>
          </Link>

          {/* 2. Care Protocols */}
          <Link
            href="/protocols/dashboard"
            className={`min-h-[48px] px-3.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              isProtocolsActive
                ? "bg-blue-50 text-blue-700 font-extrabold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <ClipboardList className={`w-4 h-4 ${isProtocolsActive ? "text-blue-600" : "text-slate-500"}`} />
            <span>Care Protocols</span>
          </Link>

          {/* 3. Time & Payroll Dropdown */}
          <div className="relative" ref={payrollRef}>
            <button
              onClick={() => setPayrollDropdownOpen(!payrollDropdownOpen)}
              className={`min-h-[48px] px-3.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                isPayrollActive
                  ? "bg-blue-50 text-blue-700 font-extrabold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Banknote className={`w-4 h-4 ${isPayrollActive ? "text-blue-600" : "text-slate-500"}`} />
              <span>Time & Payroll</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${payrollDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {payrollDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-3 z-50">
                <Link
                  href="/timesheets"
                  onClick={() => setPayrollDropdownOpen(false)}
                  className="px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-2"
                >
                  <Clock className="w-4 h-4 text-slate-400" /> Timesheet Verification
                </Link>
                <Link
                  href="/payroll/stubs"
                  onClick={() => setPayrollDropdownOpen(false)}
                  className="px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-2"
                >
                  <Banknote className="w-4 h-4 text-emerald-600" /> Wage Statements (T4/Paystub)
                </Link>
                <Link
                  href="/payroll/remittance"
                  onClick={() => setPayrollDropdownOpen(false)}
                  className="px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-2"
                >
                  <span className="w-4 text-center">🏛️</span> CRA Monthly Remittance
                </Link>
                <Link
                  href="/payroll/expenses"
                  onClick={() => setPayrollDropdownOpen(false)}
                  className="px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-2"
                >
                  <span className="w-4 text-center">🎟️</span> Expenses & Reimbursements
                </Link>
                <Link
                  href="/payroll/yearend"
                  onClick={() => setPayrollDropdownOpen(false)}
                  className="px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-2"
                >
                  <span className="w-4 text-center">📊</span> Year-End T4 & ROE Hub
                </Link>
              </div>
            )}
          </div>

          {/* 4. Attendants */}
          {isEmployer && (
            <Link
              href="/attendants"
              className={`min-h-[48px] px-3.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                isAttendantsActive
                  ? "bg-blue-50 text-blue-700 font-extrabold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Users className={`w-4 h-4 ${isAttendantsActive ? "text-blue-600" : "text-slate-500"}`} />
              <span>Attendants</span>
            </Link>
          )}

          {/* 5. Vault */}
          <Link
            href="/vault"
            className={`min-h-[48px] px-3.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              isVaultActive
                ? "bg-blue-50 text-blue-700 font-extrabold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <FolderLock className={`w-4 h-4 ${isVaultActive ? "text-blue-600" : "text-slate-500"}`} />
            <span>Vault</span>
          </Link>
        </div>

        {/* Right: Emergency SOS & Profile Dropdown */}
        <div className="flex items-center space-x-3 shrink-0">
          
          {/* Emergency SOS */}
          {(isEmployer || isAttendant) && (
            <EmergencySosButton
              reliefAttendantCount={3}
              onTriggerBroadcast={async () => {
                await new Promise((resolve) => setTimeout(resolve, 1500));
                handleTabNavigation("emergency");
              }}
            />
          )}

          {/* User Profile Popover Dropdown */}
          {userProfile ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="min-h-[44px] px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl transition flex items-center gap-2 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-black text-xs">
                  {effectiveName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-[11px] font-black text-slate-900 leading-tight">
                    {effectiveName}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase leading-tight mt-0.5">
                    {effectiveRole === "employer" ? "Self-Manager" : effectiveRole}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500 hidden md:block" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl py-3 z-50 text-xs font-bold">
                  
                  {/* Active user state banner */}
                  <div className="px-4 pb-3 border-b border-slate-100 flex flex-col space-y-1.5">
                    <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Active Workspace</p>
                    <p className="text-slate-900 font-black text-xs leading-none">{effectiveName}</p>
                    <span className="inline-flex w-fit items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                      <UserCheck className="w-3 h-3 text-amber-600" />
                      <span>Demo Role: {effectiveRole}</span>
                    </span>
                  </div>

                  {/* Switcher block inside profile dropdown (Replaces raw navbar selector elegantly) */}
                  <div className="p-3 bg-slate-50 border-b border-slate-100 space-y-1.5">
                    <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Simulate Demo Role</p>
                    <div className="grid grid-cols-3 gap-1">
                      {(["employer", "attendant", "bookkeeper"] as const).map((roleVal) => (
                        <button
                          key={roleVal}
                          onClick={() => handleRoleChange(roleVal)}
                          className={`py-1 text-[10px] rounded-lg transition font-black cursor-pointer ${
                            effectiveRole === roleVal
                              ? "bg-blue-600 text-white"
                              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {roleVal === "employer" ? "Employer" : roleVal === "attendant" ? "PSW" : "Auditor"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sub links list */}
                  <div className="py-2">
                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Household Profile & Settings</span>
                    </Link>
                    <Link
                      href="/settings/billing"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition"
                    >
                      <Receipt className="w-4 h-4 text-slate-400" />
                      <span>CILT Subscription & Billing</span>
                    </Link>
                    <Link
                      href="/pricing"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition"
                    >
                      <Shield className="w-4 h-4 text-slate-400" />
                      <span>Direct Funding Pricing plans</span>
                    </Link>
                    <Link
                      href="/onboarding"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="px-4 py-2.5 hover:bg-slate-50 text-amber-800 flex items-center gap-2.5 transition"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Setup Checklist & Onboarding</span>
                    </Link>
                  </div>

                  {/* Logout link */}
                  <div className="border-t border-slate-100 pt-2 px-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="min-h-[44px] px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl flex items-center justify-center transition shadow-md cursor-pointer whitespace-nowrap"
            >
              Log In
            </Link>
          )}

        </div>

      </div>

      {/* Mobile Drawer Slide-Out (when menu triggers) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-6 space-y-4 animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto">
          
          <div className="space-y-1.5 text-xs font-bold">
            
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">Primary Navigation</p>

            <Link
              href="/"
              onClick={() => {
                setMobileMenuOpen(false);
                if (pathname === "/") handleTabNavigation("overview");
              }}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition cursor-pointer ${
                isDashboardActive ? "bg-blue-50 text-blue-700 font-extrabold" : "bg-slate-50 hover:bg-slate-100 text-slate-800"
              }`}
            >
              <LayoutDashboard className="w-4.5 h-4.5 text-blue-600" />
              <span>Dashboard Overview</span>
            </Link>

            <Link
              href="/protocols/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition cursor-pointer ${
                isProtocolsActive ? "bg-blue-50 text-blue-700 font-extrabold" : "bg-slate-50 hover:bg-slate-100 text-slate-800"
              }`}
            >
              <ClipboardList className="w-4.5 h-4.5 text-blue-600" />
              <span>Care Protocols</span>
            </Link>

            <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-blue-600" />
                <span>Time & Payroll</span>
              </p>
              <div className="grid grid-cols-1 gap-1 pl-1">
                <Link
                  href="/timesheets"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-slate-900 text-slate-700 flex items-center gap-2"
                >
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Timesheets</span>
                </Link>
                <Link
                  href="/payroll/stubs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-slate-900 text-slate-700 flex items-center gap-2"
                >
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Wage Statements</span>
                </Link>
                <Link
                  href="/payroll/remittance"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-slate-900 text-slate-700 flex items-center gap-2"
                >
                  <span>🏛️</span>
                  <span>CRA Remittance</span>
                </Link>
                <Link
                  href="/payroll/expenses"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-slate-900 text-slate-700 flex items-center gap-2"
                >
                  <span>🎟️</span>
                  <span>Expenses</span>
                </Link>
                <Link
                  href="/payroll/yearend"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-slate-900 text-slate-700 flex items-center gap-2"
                >
                  <span>📊</span>
                  <span>Year-End Hub</span>
                </Link>
              </div>
            </div>

            {isEmployer && (
              <Link
                href="/attendants"
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition cursor-pointer ${
                  isAttendantsActive ? "bg-blue-50 text-blue-700 font-extrabold" : "bg-slate-50 hover:bg-slate-100 text-slate-800"
                }`}
              >
                <Users className="w-4.5 h-4.5 text-blue-600" />
                <span>Attendants Team</span>
              </Link>
            )}

            <Link
              href="/vault"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition cursor-pointer ${
                isVaultActive ? "bg-blue-50 text-blue-700 font-extrabold" : "bg-slate-50 hover:bg-slate-100 text-slate-800"
              }`}
            >
              <FolderLock className="w-4.5 h-4.5 text-blue-600" />
              <span>Secure Document Vault</span>
            </Link>

          </div>

          {/* Quick role changer banner in mobile menu */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-bold space-y-2">
            <p className="text-amber-800 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-amber-600" /> Switch Demo Role (Mobile)
            </p>
            <div className="grid grid-cols-3 gap-1">
              {(["employer", "attendant", "bookkeeper"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleRoleChange(r);
                  }}
                  className={`py-2 text-[10px] rounded-lg transition font-black cursor-pointer ${
                    effectiveRole === r
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {r === "employer" ? "Employer" : r === "attendant" ? "PSW" : "Auditor"}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

    </nav>
  );
}
