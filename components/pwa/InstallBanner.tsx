'use client';

import React from 'react';
import { Download, Monitor, X, Sparkles } from 'lucide-react';
import { usePwaInstall } from '@/hooks/usePwaInstall';

export function InstallBanner() {
  const { canInstall, promptInstall, dismissBanner } = usePwaInstall();

  if (!canInstall) return null;

  return (
    <aside
      aria-label="Install Desktop App"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl p-4 sm:p-5 rounded-3xl bg-[#020617]/95 border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl text-white transition-all animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: App Icon & Descriptor */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0224bb] to-[#7C3AED] p-0.5 border border-white/20 shadow-[0_0_15px_rgba(2,36,187,0.5)] flex flex-col items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-cyan-300" />
            <span className="text-[8px] font-black uppercase tracking-tight text-white/90">HUB</span>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white">Install SelfCareHub</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                Desktop App
              </span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-1">
              Add the <b>SelfCareHub</b> icon to your desktop for one-tap offline access.
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={promptInstall}
            className="px-4 py-2 rounded-xl bg-[#0224bb] hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(2,36,187,0.5)] border border-cyan-400/40 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-300" />
            <span>Install</span>
          </button>

          <button
            onClick={dismissBanner}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
