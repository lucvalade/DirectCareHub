'use client';

import React from 'react';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

export default function AuditorBurnRateTrackingPage() {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#020617]/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6 text-white max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" /> CILT Allocation Burn-Rate Console
          </div>
          <h2 className="text-2xl font-black text-white">Q3 Direct Funding Allocation Variance</h2>
          <p className="text-xs text-slate-400">Auditor oversight for monthly CILT/CSIL grant expenditures vs. authorized caregiver hours.</p>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-right">
          <span className="text-[10px] uppercase text-slate-400 font-mono block">CILT Client ID</span>
          <span className="text-sm font-black font-mono text-cyan-400">DF-ON-2026-901</span>
          <span className="text-[10px] text-emerald-400 block font-bold">✓ Audit Clearance Valid</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Monthly Approved Grant</span>
          <span className="text-2xl font-black font-mono text-white">$4,230.00</span>
          <span className="text-[10px] text-slate-400 block">180.0 Allocated Hours</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Wages & Admin Consumed</span>
          <span className="text-2xl font-black font-mono text-purple-300">$2,220.75</span>
          <span className="text-[10px] text-purple-400 block">94.5 Hours Claimed</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Unspent Allocation</span>
          <span className="text-2xl font-black font-mono text-emerald-400">$2,009.25</span>
          <span className="text-[10px] text-emerald-400 block">85.5 Hours Surplus</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Burn rate is on schedule (52.5% consumed at day 15 of 30). Zero deficit risk.</span>
        </div>
        <span className="font-mono font-bold">Category 3 Admin Approved</span>
      </div>
    </div>
  );
}
