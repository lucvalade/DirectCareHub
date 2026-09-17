'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  Clipboard, 
  Mic, 
  Clock, 
  Users, 
  AlertTriangle, 
  Settings, 
  DollarSign, 
  Sparkles, 
  ChevronDown,
  LayoutDashboard,
  Radio,
  FileCheck2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavigationHeaderProps {
  userRole?: string;
  userName?: string;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onSignOut?: () => void;
  onRoleChange?: (role: 'employer' | 'attendant' | 'bookkeeper') => void;
}

export default function NavigationHeader({
  userRole: propUserRole,
  userName: propUserName,
  activeTab = 'overview',
  onSelectTab,
  onSignOut: propOnSignOut,
  onRoleChange: propOnRoleChange
}: NavigationHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, signOut, loginAsDemoUser } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine user identity
  const effectiveRole = propUserRole || userProfile?.role || 'employer';
  const effectiveName = propUserName || userProfile?.displayName || 'Direct Funding Employer';

  const isEmployer = effectiveRole === 'employer';
  const isAttendant = effectiveRole === 'attendant';
  const isBookkeeper = effectiveRole === 'bookkeeper';

  const handleRoleChange = (newRole: 'employer' | 'attendant' | 'bookkeeper') => {
    if (propOnRoleChange) {
      propOnRoleChange(newRole);
    } else {
      loginAsDemoUser(newRole);
    }
  };

  const handleSignOut = () => {
    if (propOnSignOut) {
      propOnSignOut();
    } else {
      signOut();
    }
  };

  const handleTabNavigation = (tabName: string) => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
    if (pathname === '/' && onSelectTab) {
      onSelectTab(tabName);
    } else {
      router.push(`/?tab=${tabName}`);
    }
  };

  // Active state indicators
  const isDashboardActive = pathname === '/' && (!activeTab || activeTab === 'overview');
  const isProtocolsActive = pathname?.startsWith('/protocols');
  const isShiftsActive = pathname?.startsWith('/shifts');
  const isTimesheetsActive = pathname?.startsWith('/timesheets');
  const isPayrollActive = pathname?.startsWith('/payroll');
  const isAttendantsActive = pathname?.startsWith('/attendants');
  const isProfileActive = pathname?.startsWith('/profile');
  const isOnboardingActive = pathname?.startsWith('/onboarding');
  const isVaultActive = pathname?.startsWith('/vault');

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs" ref={dropdownRef}>
      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden min-h-[44px] min-w-[44px] p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center justify-center cursor-pointer"
            aria-label="Toggle Navigation Menu"
            title="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link 
            href="/" 
            className="flex items-center space-x-2.5 group cursor-pointer"
            title="DirectCare Hub Home Dashboard"
          >
            <div className="w-9 h-9 bg-blue-700 group-hover:bg-blue-800 rounded-xl flex items-center justify-center text-white shadow-sm transition">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-extrabold text-slate-900 leading-tight">
                  DirectCare
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded-md">
                  Ontario DF
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                {isAttendant ? 'Attendant Care & Shift Hub' : isBookkeeper ? 'Payroll & CRA Auditing Portal' : 'Self-Managed Attendant Care'}
              </p>
            </div>
          </Link>
        </div>

        {/* Central Direct Navigation Links (Desktop & Tablet) */}
        <nav className="hidden md:flex items-center space-x-0.5 lg:space-x-1 flex-1 justify-center max-w-4xl overflow-x-auto py-1">
          {/* 1. Dashboard / Overview */}
          <Link
            href="/"
            onClick={() => {
              if (pathname === '/' && onSelectTab) onSelectTab('overview');
            }}
            className={`px-2.5 lg:px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              isDashboardActive
                ? 'bg-blue-50 text-blue-700 font-extrabold'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-blue-600" />
            <span>Dashboard</span>
          </Link>

          {/* 2. Attendant Primary Portal: Today's Shift & Agenda */}
          {isAttendant && (
            <Link
              href="/shifts"
              className={`px-2.5 lg:px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                isShiftsActive
                  ? 'bg-purple-50 text-purple-700 font-extrabold border border-purple-200'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Radio className="w-4 h-4 text-purple-600" />
              <span>Today's Shift</span>
            </Link>
          )}

          {/* 3. Protocols & Daily Care Log (Employer & Attendant) with Dropdown */}
          {(isEmployer || isAttendant) && (
            <div className="relative">
              <div className="flex items-center">
                <Link
                  href="/protocols/dashboard"
                  className={`px-2.5 lg:px-3 py-2 rounded-l-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                    isProtocolsActive
                      ? 'bg-blue-50 text-blue-700 font-extrabold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Clipboard className="w-4 h-4 text-emerald-600" />
                  <span>Protocols</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'protocols' ? null : 'protocols')}
                  className={`p-2 rounded-r-xl text-xs transition cursor-pointer ${
                    isProtocolsActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                  aria-label="Toggle protocols menu"
                  title="Protocols submenu"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'protocols' ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {openDropdown === 'protocols' && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                  <Link
                    href="/protocols/dashboard"
                    onClick={() => setOpenDropdown(null)}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center space-x-2.5 transition block cursor-pointer"
                  >
                    <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">🛡️</span>
                    <div>
                      <p className="font-bold text-slate-900">Protocols & Safety Dashboard</p>
                      <p className="text-[10px] text-slate-500">Live transfers & clinical safety</p>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleTabNavigation('runbook')}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center space-x-2.5 transition cursor-pointer"
                  >
                    <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">📋</span>
                    <div>
                      <p className="font-bold text-slate-900">Care Runbook Checklists</p>
                      <p className="text-[10px] text-slate-500">Hygiene, morning & night tasks</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabNavigation('handover')}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center space-x-2.5 transition cursor-pointer"
                  >
                    <span className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">🎙️</span>
                    <div>
                      <p className="font-bold text-slate-900">Ambient Voice Handover</p>
                      <p className="text-[10px] text-slate-500">Gemini 3.5 Flash shift audio log</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. Timesheets & Hours (All Roles) */}
          <Link
            href="/timesheets"
            className={`px-2.5 lg:px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              isTimesheetsActive
                ? 'bg-blue-50 text-blue-700 font-extrabold'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Timesheets</span>
          </Link>

          {/* 5. Payroll & Wage Stubs (Employer & Bookkeeper) with Dropdown */}
          {(isEmployer || isBookkeeper) && (
            <div className="relative">
              <div className="flex items-center">
                <Link
                  href="/payroll/stubs"
                  className={`px-2.5 lg:px-3 py-2 rounded-l-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                    isPayrollActive
                      ? 'bg-blue-50 text-blue-700 font-extrabold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Payroll</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'payroll' ? null : 'payroll')}
                  className={`p-2 rounded-r-xl text-xs transition cursor-pointer ${
                    isPayrollActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                  aria-label="Toggle payroll menu"
                  title="Payroll submenu"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'payroll' ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {openDropdown === 'payroll' && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                  <Link
                    href="/payroll/stubs"
                    onClick={() => setOpenDropdown(null)}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center space-x-2.5 transition block cursor-pointer"
                  >
                    <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">📄</span>
                    <div>
                      <p className="font-bold text-slate-900">Pay Stubs & Wage Statements</p>
                      <p className="text-[10px] text-slate-500">ESA itemized deductions & stubs</p>
                    </div>
                  </Link>
                  <Link
                    href="/payroll/remittance"
                    onClick={() => setOpenDropdown(null)}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center space-x-2.5 transition block cursor-pointer"
                  >
                    <span className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">🏛️</span>
                    <div>
                      <p className="font-bold text-slate-900">CRA Remittance (PD7A)</p>
                      <p className="text-[10px] text-slate-500">Monthly Receiver General report</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 6. Attendant Team Roster (Employer Only) */}
          {isEmployer && (
            <Link
              href="/attendants"
              className={`px-2.5 lg:px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                isAttendantsActive
                  ? 'bg-blue-50 text-blue-700 font-extrabold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-purple-600" />
              <span>Attendants</span>
            </Link>
          )}

          {/* 7. Document Vault Command Center (Employer & Attendant) */}
          <Link
            href="/vault"
            className={`px-2.5 lg:px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              isVaultActive
                ? 'bg-blue-50 text-blue-700 font-extrabold border border-blue-200'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-blue-600" />
            <span>Vault</span>
          </Link>

          {/* 8. Onboarding Setup Wizard */}
          <Link
            href="/onboarding"
            className={`px-2.5 lg:px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              isOnboardingActive
                ? 'bg-amber-100 text-amber-900 font-extrabold'
                : 'text-amber-800 bg-amber-50/80 hover:bg-amber-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="hidden xl:inline">Onboarding</span>
          </Link>

          {/* 9. Profile / Household Settings */}
          <Link
            href="/profile"
            className={`px-2.5 lg:px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              isProfileActive
                ? 'bg-blue-50 text-blue-700 font-extrabold'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>{isEmployer ? 'Household' : 'Profile'}</span>
          </Link>
        </nav>

        {/* Right Header Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Emergency SOS Quick Button */}
          {(isEmployer || isAttendant) && (
            <button
              type="button"
              onClick={() => handleTabNavigation('emergency')}
              className="min-h-[38px] px-2.5 sm:px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition cursor-pointer animate-pulse"
              title="Emergency Relief SOS Broadcast"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Emergency SOS</span>
            </button>
          )}

          {/* Role Switcher */}
          <div className="flex items-center space-x-1 px-1.5 sm:px-2 py-1 bg-amber-50 border border-amber-200 rounded-xl text-xs">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider hidden 2xl:inline">Role:</span>
            <select
              value={effectiveRole}
              onChange={(e) => handleRoleChange(e.target.value as any)}
              className="bg-white border border-amber-300 rounded-lg px-1.5 sm:px-2 py-1 text-xs font-bold text-slate-900 cursor-pointer focus:ring-2 focus:ring-amber-500"
              title="Switch Active Demo Role"
            >
              <option value="employer">Employer</option>
              <option value="attendant">Attendant (PSW)</option>
              <option value="bookkeeper">Bookkeeper</option>
            </select>
          </div>

          {/* User Badge */}
          <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="font-bold text-slate-800 max-w-[110px] truncate">{effectiveName}</span>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            className="min-h-[38px] min-w-[38px] p-2 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span className="hidden xl:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-xl py-4 px-4 space-y-3 transition animate-in slide-in-from-top duration-200 z-50 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Navigation Menu</span>
            <button 
              type="button"
              onClick={() => setMobileMenuOpen(false)} 
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1">
            {/* Dashboard Link */}
            <Link
              href="/"
              onClick={() => {
                setMobileMenuOpen(false);
                if (pathname === '/' && onSelectTab) onSelectTab('overview');
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3 transition cursor-pointer ${
                isDashboardActive ? 'bg-blue-50 text-blue-700 font-extrabold' : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-blue-600" />
              <span>Operations Dashboard</span>
            </Link>

            {/* Attendant Shifts Portal */}
            {isAttendant && (
              <Link
                href="/shifts"
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3 transition cursor-pointer ${
                  isShiftsActive ? 'bg-purple-50 text-purple-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                }`}
              >
                <Radio className="w-4 h-4 text-purple-600" />
                <span>Today's Shift & Agenda</span>
              </Link>
            )}

            {/* Protocols */}
            {(isEmployer || isAttendant) && (
              <>
                <Link
                  href="/protocols/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3 transition cursor-pointer ${
                    isProtocolsActive ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <Clipboard className="w-4 h-4 text-emerald-600" />
                  <span>Protocols & Clinical Safety</span>
                </Link>

                <button
                  type="button"
                  onClick={() => handleTabNavigation('runbook')}
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3 transition cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-800"
                >
                  <span>📋</span>
                  <span>Care Runbook Checklists</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabNavigation('handover')}
                  className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3 transition cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-800"
                >
                  <Mic className="w-4 h-4 text-purple-600" />
                  <span>Ambient Voice Handover (Gemini)</span>
                </button>
              </>
            )}

            {/* Timesheets */}
            <Link
              href="/timesheets"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3 transition cursor-pointer ${
                isTimesheetsActive ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Timesheets & Verification</span>
            </Link>

            {/* Payroll Stubs */}
            {(isEmployer || isBookkeeper) && (
              <>
                <Link
                  href="/payroll/stubs"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3 transition cursor-pointer ${
                    isPayrollActive ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Payroll & Wage Statements</span>
                </Link>
                <Link
                  href="/payroll/remittance"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-800 flex items-center space-x-3 cursor-pointer"
                >
                  <span>🏛️</span>
                  <span>CRA Monthly Remittance Report</span>
                </Link>
              </>
            )}

            {/* Attendants */}
            {isEmployer && (
              <Link
                href="/attendants"
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3 transition cursor-pointer ${
                  isAttendantsActive ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                }`}
              >
                <Users className="w-4 h-4 text-purple-600" />
                <span>Attendant Team Roster</span>
              </Link>
            )}

            {/* Document Vault Command Center */}
            <Link
              href="/vault"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3 transition cursor-pointer ${
                isVaultActive ? 'bg-blue-50 text-blue-700 font-extrabold' : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span>Document Vault & Compliance</span>
            </Link>

            {/* Onboarding Wizard */}
            <Link
              href="/onboarding"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left px-4 py-3 bg-amber-50 hover:bg-amber-100 rounded-xl text-xs font-bold text-amber-900 flex items-center space-x-3 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Onboarding Setup Wizard</span>
            </Link>

            {/* Profile */}
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3 transition cursor-pointer ${
                isProfileActive ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>{isEmployer ? 'Household Settings' : 'My Profile'}</span>
            </Link>

            {/* Emergency SOS in Mobile Menu */}
            {(isEmployer || isAttendant) && (
              <button
                type="button"
                onClick={() => handleTabNavigation('emergency')}
                className="w-full text-left px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center space-x-3 transition cursor-pointer mt-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Emergency SOS Alert Broadcast</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
