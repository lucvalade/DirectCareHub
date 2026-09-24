// Developed by VertexAgent.io
// Project: DirectCare Hub - Master Dashboard Suite with Integrated Burn-Rate Console
// Consolidated Layout Shell with Role Navigation & In-Memory View Switcher

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  Users, 
  FileText, 
  CreditCard, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Receipt, 
  BarChart3, 
  HelpCircle, 
  Bell, 
  ChevronDown, 
  Sparkles, 
  LogOut,
  Compass,
  CheckCircle2,
  Menu,
  X,
  Wrench,
  DollarSign,
  FileCheck,
  TrendingUp,
  Code2
} from 'lucide-react';
import { 
  PersistentRoleOnboardingModal, 
  UserRole 
} from '@/components/onboarding/PersistentRoleOnboardingModal';
import { PswShiftClockInComponent } from '@/components/shift/PswShiftClockInComponent';
import { PricingSectionComponent } from '@/components/pricing/PricingSectionComponent';
import { OfflineDropSimulator } from '@/components/testing/OfflineDropSimulator';
import AuditorBurnRateTrackingPage from '@/app/dashboard/auditor/burn-rate/page';
import { generateCPA005DirectDepositFileAction, generateServiceCanadaRoeXmlAction } from '@/lib/serverActions';
import { MOCK_MASTER_STATEMENTS, MOCK_ROE_DATA } from '@/lib/mockComplianceData';

// ============================================================================
// 1. NAVIGATION TAXONOMY BY ROLE
// ============================================================================
type DashboardView = 'clockin' | 'payroll' | 'burnrate' | 'pricing' | 'devtools';

interface NavItem {
  label: string;
  viewId: DashboardView;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const ROLE_NAV_CONFIG: Record<UserRole, NavItem[]> = {
  employer: [
    { label: 'Care Runbook & Shifts', viewId: 'clockin', href: '/dashboard/employer/runbook', icon: Compass },
    { label: 'Payroll & CPA 005 EFT', viewId: 'payroll', href: '/dashboard/employer/payroll', icon: CreditCard },
    { label: 'Allocation Burn-Rate', viewId: 'burnrate', href: '/dashboard/auditor/burn-rate', icon: BarChart3, badge: 'CILT' },
    { label: 'Plans & Pricing', viewId: 'pricing', href: '/dashboard/pricing', icon: DollarSign },
  ],
  psw: [
    { label: 'Active Shift Clock-In', viewId: 'clockin', href: '/dashboard/psw/clock-in', icon: MapPin, badge: '50m GPS' },
    { label: 'My Wage Statements', viewId: 'payroll', href: '/dashboard/psw/paystubs', icon: FileText },
    { label: 'Plans & Pricing', viewId: 'pricing', href: '/dashboard/pricing', icon: DollarSign },
  ],
  auditor: [
    { label: 'Allocation Burn-Rate', viewId: 'burnrate', href: '/dashboard/auditor/burn-rate', icon: BarChart3, badge: 'Q3 Audit' },
    { label: 'Batch CPA 005 EFT', viewId: 'payroll', href: '/dashboard/auditor/eft-batch', icon: CreditCard },
    { label: 'Active Shift Monitor', viewId: 'clockin', href: '/dashboard/psw/clock-in', icon: MapPin },
    { label: 'Dev-Tools & Sync Sandbox', viewId: 'devtools', href: '/dashboard/auditor/dev-tools', icon: Wrench, badge: 'Diag' },
    { label: 'Plans & Pricing', viewId: 'pricing', href: '/dashboard/pricing', icon: DollarSign },
  ],
};

// ============================================================================
// 2. MASTER DASHBOARD SUITE LAYOUT
// ============================================================================
export default function MasterDashboardSuiteLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Active session and navigation states
  const [currentRole, setCurrentRole] = useState<UserRole>('auditor');
  const [userId] = useState('usr-luc-valade');
  const [userName] = useState('Luc Valade');
  const [reopenOnboarding, setReopenOnboarding] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>('burnrate');

  const navItems = ROLE_NAV_CONFIG[currentRole] || ROLE_NAV_CONFIG.auditor;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col antialiased selection:bg-cyan-500 selection:text-black">
      
      {/* ---------------------------------------------------------------------
          A. PERSISTENT ONBOARDING MODAL
      --------------------------------------------------------------------- */}
      <PersistentRoleOnboardingModal
        key={`${userId}-${currentRole}-${reopenOnboarding}`}
        userId={userId}
        userRole={currentRole}
        forceOpen={reopenOnboarding}
        onDismissCallback={() => setReopenOnboarding(false)}
      />

      {/* ---------------------------------------------------------------------
          B. GLOBAL HEADER BAR
      --------------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Platform Subtitle */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer"
              aria-label="Toggle navigation drawer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#0224bb] to-[#7C3AED] flex items-center justify-center shadow-[0_0_20px_rgba(2,36,187,0.5)] border border-white/20">
                <Sparkles className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-white block leading-none">
                  DirectCare<span className="text-cyan-400">Hub</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono tracking-wider">VertexAgent.io</span>
              </div>
            </Link>
          </div>

          {/* Role Switcher Pills */}
          <div className="hidden md:flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 text-xs">
            {(['employer', 'psw', 'auditor'] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => {
                  setCurrentRole(role);
                  if (role === 'auditor') setActiveView('burnrate');
                  if (role === 'psw') setActiveView('clockin');
                  if (role === 'employer') setActiveView('burnrate');
                }}
                className={`px-3.5 py-1.5 rounded-xl font-bold capitalize transition-all cursor-pointer ${
                  currentRole === role
                    ? 'bg-[#0224bb] text-white shadow-[0_0_15px_rgba(2,36,187,0.4)] border border-cyan-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {role === 'psw' ? 'Attendant / PSW' : role === 'auditor' ? 'Auditor / Bookkeeper' : 'Employer'}
              </button>
            ))}
          </div>

          {/* Right Header Navigation Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setReopenOnboarding(true)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white font-semibold flex items-center gap-1.5 transition-all shadow-sm group cursor-pointer"
              title="Revisit role orientation guide"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Orientation</span>
            </button>

            <div className="relative">
              <button 
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
              </button>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            </div>

            <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-purple-800 flex items-center justify-center font-bold text-xs border border-white/15">
                LV
              </div>
              <div className="text-left text-xs">
                <span className="font-bold text-white block leading-tight">{userName}</span>
                <span className="text-[10px] text-slate-400 capitalize">{currentRole} Desk</span>
              </div>
            </div>
          </div>

        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#020617] px-4 py-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-mono text-slate-400">Switch Console Role:</span>
              <div className="flex items-center gap-1">
                {(['employer', 'psw', 'auditor'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setCurrentRole(r);
                      if (r === 'auditor') setActiveView('burnrate');
                      if (r === 'psw') setActiveView('clockin');
                      if (r === 'employer') setActiveView('burnrate');
                      setMobileMenuOpen(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize cursor-pointer ${
                      currentRole === r ? 'bg-[#0224bb] text-white' : 'text-slate-400'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeView === item.viewId;

                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      setActiveView(item.viewId);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#0224bb] text-white border border-cyan-400/40' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-cyan-400" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] bg-white/10 text-cyan-300 font-bold uppercase">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* ---------------------------------------------------------------------
          C. MAIN DASHBOARD CONTENT AREA & PERSISTENT SIDEBAR
      --------------------------------------------------------------------- */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-8">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 space-y-4">
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1 text-xs backdrop-blur-xl">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 px-3 block mb-1">
              Active Console: {currentRole.toUpperCase()}
            </span>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeView === item.viewId;

                return (
                  <button
                    key={item.label}
                    onClick={() => setActiveView(item.viewId)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0224bb]/40 border border-cyan-400/50 text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                        item.badge === 'CILT' || item.badge === 'Q3 Audit'
                          ? 'bg-[#7C3AED]/20 border-[#7C3AED]/40 text-purple-300'
                          : item.badge === 'Diag'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                          : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick System Verification Card */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-[11px] text-slate-400">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block">System Verification</span>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>CPA 005 (1464-byte): Active</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>CRA PD7A & T4 XML: Validated</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>CILT Allocation Engine: Active</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>IndexedDB Geofence Sync: Ready</span>
            </div>
          </div>
        </aside>

        {/* Dynamic Route & View Render Surface */}
        <main className="flex-1 w-full overflow-hidden">
          {activeView === 'burnrate' && <AuditorBurnRateTrackingPage />}
          {activeView === 'clockin' && <PswShiftClockInComponent />}
          {activeView === 'payroll' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="p-6 rounded-3xl bg-[#020617] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl">
                <div>
                  <span className="text-xs uppercase font-bold text-cyan-400 block font-mono">CPA Standard 005 Suite</span>
                  <h2 className="text-2xl font-black text-white">Direct Deposit & Remittances</h2>
                  <p className="text-xs text-slate-400">1464-byte EFT direct deposit batch transmission with Transaction Code 201 reversal support.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => generateCPA005DirectDepositFileAction(MOCK_MASTER_STATEMENTS)}
                    className="px-4 py-2.5 rounded-xl bg-[#0224bb] hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(2,36,187,0.4)] transition-all"
                  >
                    <CreditCard className="w-4 h-4 text-cyan-400" /> Export CPA 005
                  </button>
                  <button
                    onClick={() => generateServiceCanadaRoeXmlAction(MOCK_ROE_DATA)}
                    className="px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all"
                  >
                    <Code2 className="w-4 h-4 text-purple-300" /> Export ROE XML
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 font-mono text-xs text-slate-300 flex items-center justify-between">
                <span>Active Payroll Run ID: PR-2026-09-A • Payee: Sarah Jenkins • Take-Home: $1,781.12</span>
                <span className="text-emerald-400 font-bold">Payments Canada Certified</span>
              </div>
            </div>
          )}
          {activeView === 'pricing' && <PricingSectionComponent />}
          {activeView === 'devtools' && <OfflineDropSimulator />}
          {children}
        </main>
      </div>

    </div>
  );
}
