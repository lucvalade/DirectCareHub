'use client';

import React, { useState } from 'react';
import { MapPin, Clock, ShieldCheck, CheckCircle2, Navigation } from 'lucide-react';

export function PswShiftClockInComponent() {
  const [clockedIn, setClockedIn] = useState(false);
  const [distance, setDistance] = useState(18); // 18m from residence

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#020617]/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6 text-white max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Haversine GPS Geofencing
          </div>
          <h2 className="text-2xl font-black text-white">Active Shift Clock-In Portal</h2>
          <p className="text-xs text-slate-400">Verifies location within 50 meters of client residence prior to shift authorization.</p>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-right">
          <span className="text-[10px] uppercase text-slate-400 font-mono block">Proximity Check</span>
          <span className="text-lg font-black font-mono text-cyan-400">{distance}m Radius</span>
          <span className="text-[10px] text-emerald-400 block font-bold">✓ Within 50m Perimeter</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase">Client Residence</span>
          <p className="text-sm font-bold text-white">Toronto Care Residence #DF-901</p>
          <p className="text-xs text-slate-400">Downtown Toronto, ON M5V 2T6</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase">Scheduled Shift</span>
          <p className="text-sm font-bold text-white">Morning Care & Hoyer Transfer (4.0 hrs)</p>
          <p className="text-xs text-slate-400">08:00 AM - 12:00 PM @ $23.50/hr</p>
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>IndexedDB Offline Geofence Buffer Active</span>
        </div>

        <button
          onClick={() => setClockedIn(!clockedIn)}
          className={`px-6 py-3.5 rounded-2xl font-black text-xs transition-all cursor-pointer shadow-lg flex items-center gap-2 ${
            clockedIn
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/50'
              : 'bg-[#0224bb] hover:bg-blue-800 text-white shadow-[0_0_20px_rgba(2,36,187,0.5)]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{clockedIn ? 'Clock Out of Shift' : 'Clock In (GPS Verified)'}</span>
        </button>
      </div>
    </div>
  );
}
