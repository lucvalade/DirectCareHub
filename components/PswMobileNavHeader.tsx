'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, CloudUpload, User, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  attendantName: string;
  isGpsActive?: boolean;
  distanceToClient?: number;
}

export default function PswMobileNavHeader({ attendantName, isGpsActive = true, distanceToClient }: HeaderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    // Set initial network state
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      
      // Check localStorage queue for pending offline handovers
      try {
        const stored = localStorage.getItem('directcare_pending_handovers');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setPendingSyncCount(parsed.length);
          }
        }
      } catch (e) {
        console.error('Error reading offline queue:', e);
      }
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header id="psw-mobile-nav-header" className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 text-white">
      <div id="psw-mobile-nav-container" className="max-w-md mx-auto flex items-center justify-between">
        
        {/* Left: Branding & Attendant Identity */}
        <div id="psw-identity-section" className="flex items-center gap-3">
          <div id="psw-avatar-badge" className="w-10 h-10 rounded-xl bg-[#0224bb]/30 border border-[#0224bb] flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 id="psw-attendant-name" className="text-sm font-bold truncate max-w-[130px] sm:max-w-xs">{attendantName}</h1>
            <p id="psw-[#verified-badge]" className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified PSW
            </p>
          </div>
        </div>

        {/* Right: Status Indicators & Sync Badges */}
        <div id="psw-status-badges" className="flex items-center gap-2">
          
          {/* GPS Geofence Status Pill */}
          <div id="psw-gps-pill" className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold border ${
            isGpsActive 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isGpsActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{distanceToClient !== undefined ? `${distanceToClient}m away` : 'GPS Active'}</span>
          </div>

          {/* Offline Sync Badge */}
          {pendingSyncCount > 0 ? (
            <div id="psw-offline-queue-badge" className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-purple-500/20 border border-purple-500/30 text-purple-300 animate-pulse">
              <CloudUpload className="w-3.5 h-3.5" />
              <span>{pendingSyncCount} Queued</span>
            </div>
          ) : null}

          {/* Network Connectivity Badge */}
          <div id="psw-network-badge" className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-colors ${
            isOnline 
              ? 'bg-white/5 border-white/10 text-cyan-400' 
              : 'bg-red-500/20 border-red-500/40 text-red-400'
          }`} title={isOnline ? "Connected to DirectCare Cloud" : "Offline Mode (IndexedDB / Local Queue Active)"}>
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          </div>

        </div>
      </div>
    </header>
  );
}
