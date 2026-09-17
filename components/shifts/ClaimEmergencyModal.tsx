'use client';

import React, { useState } from 'react';
import { EmergencyShift } from '@/types/attendantSchedule';
import { 
  X, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  Clock, 
  MapPin, 
  Check, 
  Loader2, 
  ShieldCheck 
} from 'lucide-react';

interface ClaimEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: EmergencyShift | null;
  attendantId: string;
  attendantName: string;
  onClaimConfirmed: (shiftId: string) => Promise<void>;
}

export default function ClaimEmergencyModal({
  isOpen,
  onClose,
  shift,
  attendantId,
  attendantName,
  onClaimConfirmed
}: ClaimEmergencyModalProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [acknowledgedSkill, setAcknowledgedSkill] = useState(false);

  if (!isOpen || !shift) return null;

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      await onClaimConfirmed(shift.id);
      onClose();
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-rose-500/40 rounded-3xl shadow-2xl shadow-rose-950/50 p-6 md:p-8 text-white">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white">Claim Emergency Relief Shift</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  SOS Relief
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Broadcasted by {shift.employerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition min-w-[48px] min-h-[48px] flex items-center justify-center"
            title="Close Claim Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shift Details */}
        <div className="mt-5 space-y-3 text-xs">
          {/* Reason */}
          <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-900/40 text-rose-200">
            <p className="font-bold text-rose-300 mb-1">Reason for Urgent Callout:</p>
            <p>{shift.reason}</p>
          </div>

          {/* Timing & Pay Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-slate-400 text-[10px] font-semibold flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-cyan-400" />
                DATE & TIME
              </div>
              <p className="font-bold text-slate-200">{shift.dayOfWeek}, {shift.date}</p>
              <p className="text-cyan-300 font-semibold">{shift.displayTimeRange} ({shift.totalHours} hrs)</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30">
              <div className="text-slate-400 text-[10px] font-semibold flex items-center gap-1 mb-1">
                <DollarSign className="w-3 h-3 text-emerald-400" />
                DF EMERGENCY RATE
              </div>
              <p className="text-lg font-extrabold text-emerald-400">${shift.totalRate.toFixed(2)}/hr</p>
              <p className="text-[10px] text-emerald-300/80">+${shift.emergencyBonusRate.toFixed(2)}/hr relief bonus</p>
            </div>
          </div>

          {/* Location */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-300">Employer Address:</p>
              <p className="text-slate-400">{shift.location}</p>
            </div>
          </div>

          {/* Required Competencies */}
          {shift.requiredSkills.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <p className="font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Required Clinical Competencies:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {shift.requiredSkills.map((skill, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-cyan-300 border border-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Attendant Confirmation Checkbox */}
          <label className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3 cursor-pointer min-h-[48px]">
            <input
              type="checkbox"
              checked={acknowledgedSkill}
              onChange={(e) => setAcknowledgedSkill(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700 cursor-pointer"
            />
            <span className="text-[11px] text-slate-300 leading-snug">
              I confirm I am trained in the required ceiling hoist & continence care protocols for {shift.employerName} and commit to arriving on time.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="min-h-[48px] px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-semibold text-xs transition cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            onClick={handleClaim}
            disabled={!acknowledgedSkill || isClaiming}
            className="min-h-[48px] px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            {isClaiming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Claiming Shift...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Confirm & Claim Shift
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
