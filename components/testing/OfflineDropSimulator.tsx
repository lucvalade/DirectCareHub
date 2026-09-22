'use client';

import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Database } from 'lucide-react';

export function OfflineDropSimulator() {
  const [isOnline, setIsOnline] = useState(true);
  const [bufferedLogs] = useState([
    { id: '1', type: 'Haversine GPS Clock-In', time: '08:00 AM', status: 'Buffered in IndexedDB' },
    { id: '2', type: 'Hoyer Transfer Runbook Check', time: '08:45 AM', status: 'Buffered in IndexedDB' }
  ]);

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#020617]/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6 text-white max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase font-bold text-amber-400 font-mono">Dev-Tools & Diagnostic Sandbox</span>
          <h2 className="text-2xl font-black text-white">Offline Drop & Sync Simulator</h2>
          <p className="text-xs text-slate-400">Simulate network disconnections in remote client homes and test IndexedDB shift log buffering.</p>
        </div>

        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all ${
            isOnline
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}
        >
          {isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-rose-400" />}
          <span>{isOnline ? 'Online Mode' : 'Simulating Offline Drop'}</span>
        </button>
      </div>

      <div className="space-y-3">
        <span className="text-xs uppercase font-mono font-bold text-slate-400 block">IndexedDB Offline Sync Queue</span>
        <div className="space-y-2">
          {bufferedLogs.map((log) => (
            <div key={log.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-bold">{log.type}</span>
                <span className="text-slate-400">@{log.time}</span>
              </div>
              <span className="text-amber-400 font-bold">{isOnline ? 'Synced to Cloud Firestore' : log.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
