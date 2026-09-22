'use client';

import React, { useState } from 'react';
import { Sparkles, ShieldCheck, CheckCircle2, X } from 'lucide-react';

export type UserRole = 'employer' | 'psw' | 'auditor';

interface OnboardingModalProps {
  userId: string;
  userRole: UserRole;
  forceOpen?: boolean;
  onDismissCallback?: () => void;
}

export function PersistentRoleOnboardingModal({
  userRole,
  forceOpen = false,
  onDismissCallback,
}: OnboardingModalProps) {
  const [open, setOpen] = useState(forceOpen);

  if (!open && !forceOpen) return null;

  const handleClose = () => {
    setOpen(false);
    if (onDismissCallback) onDismissCallback();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#020617] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(34,211,238,0.2)] text-white">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Console Orientation • {userRole.toUpperCase()} DESK
          </div>

          <h2 className="text-2xl font-black text-white">
            Welcome to DirectCare Hub
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed">
            {userRole === 'employer' && 'Manage your self-directed care roster, CPA 005 EFT direct deposit wage runs, and CILT allocation budgets in real-time.'}
            {userRole === 'psw' && 'Clock in with 50m Haversine GPS verification, view equipment transfer checklists, and review your itemized CRA paystubs.'}
            {userRole === 'auditor' && 'Audit CILT quarterly burn rates, review batch CPA 005 direct deposit files, and inspect multi-tenant employer ledgers.'}
          </p>

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Payments Canada Standard 005 Certified</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>CRA Source Deductions & T4 IFT Schema Verified</span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#0224bb] hover:bg-blue-800 text-white font-bold text-xs shadow-[0_0_20px_rgba(2,36,187,0.5)] transition-all cursor-pointer mt-4"
          >
            Enter {userRole.toUpperCase()} Console
          </button>
        </div>
      </div>
    </div>
  );
}
