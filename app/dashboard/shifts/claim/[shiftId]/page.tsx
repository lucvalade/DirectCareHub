'use client';

import { use, useState } from 'react';
import { claimEmergencyShift } from '@/actions/claimEmergencyShift';
import { CheckCircle, XCircle, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ClaimShiftPage({ 
  params 
}: { 
  params: Promise<{ shiftId: string }> 
}) {
  const resolvedParams = use(params);
  const shiftId = resolvedParams.shiftId;
  const attendantId = 'attendant-demo-123'; // In production, retrieved from AuthContext

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'too_late' | 'error'>('idle');

  const handleClaim = async () => {
    setStatus('loading');
    
    const response = await claimEmergencyShift({ 
      shiftId, 
      attendantId 
    });

    if (response.success) {
      setStatus('success');
    } else if (response.error === 'already_claimed') {
      setStatus('too_late');
    } else {
      setStatus('error');
    }
  };

  return (
    <div id="claim-shift-page-container" className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-slate-100 flex flex-col items-center text-center">
        
        <Link href="/dashboard" className="self-start text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {status === 'idle' && (
          <>
            <div id="emergency-alert-icon" className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4 animate-bounce">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 id="emergency-shift-heading" className="text-2xl font-bold text-slate-900 mb-2">Emergency Shift Available</h1>
            <p className="text-sm text-slate-600 mb-6">
              This shift was broadcasted to multiple relief attendants. The first attendant to claim secures the coverage hours.
            </p>
            <div className="w-full bg-slate-50 p-4 rounded-xl text-left border border-slate-200 mb-6 space-y-1">
              <p className="text-xs text-slate-500">Shift ID: <span className="font-mono text-slate-700 font-semibold">{shiftId}</span></p>
              <p className="text-xs text-slate-500">Rate: <span className="font-semibold text-emerald-600">Standard Program Rate (1.5x Emergency)</span></p>
            </div>
            <button 
              id="claim-shift-now-button"
              onClick={handleClaim}
              className="w-full bg-[#0224bb] hover:bg-blue-800 text-white font-bold py-4 px-8 rounded-xl min-h-[56px] shadow-lg transition-all focus:ring-4 focus:ring-blue-300 active:scale-95"
            >
              Claim Shift Now
            </button>
          </>
        )}

        {status === 'loading' && (
          <div className="py-12 flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 animate-spin text-[#0224bb]" />
            <p className="text-sm font-semibold text-slate-600">Executing atomic lock transaction...</p>
          </div>
        )}

        {status === 'success' && (
          <>
            <div id="shift-success-icon" className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h1 id="shift-secured-heading" className="text-2xl font-bold text-slate-900 mb-2">Shift Secured!</h1>
            <p className="text-sm text-slate-600 mb-6">
              You were the first to respond. The employer has been notified that you are assigned and on your way.
            </p>
            <Link 
              href="/dashboard"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all"
            >
              Go to Shift Runbook
            </Link>
          </>
        )}

        {status === 'too_late' && (
          <>
            <div id="shift-claimed-icon" className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
              <XCircle className="w-10 h-10" />
            </div>
            <h1 id="shift-already-claimed-heading" className="text-2xl font-bold text-slate-900 mb-2">Shift Already Claimed</h1>
            <p className="text-sm text-slate-600 mb-6">
              Another attendant responded slightly faster and secured this shift. Thank you for being available for emergency relief!
            </p>
            <Link 
              href="/dashboard"
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-6 rounded-xl transition-all"
            >
              Return to Dashboard
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div id="shift-error-icon" className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-4">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Claim Attempt Failed</h1>
            <p className="text-sm text-slate-600 mb-6">An error occurred while attempting to secure the shift. Please try again.</p>
            <button 
              onClick={handleClaim}
              className="w-full bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl"
            >
              Retry Claim
            </button>
          </>
        )}

      </div>
    </div>
  );
}
