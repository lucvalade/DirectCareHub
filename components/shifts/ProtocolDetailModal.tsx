'use client';

import React, { useState } from 'react';
import { 
  CareProtocolRoutine 
} from '@/types/attendantSchedule';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Settings, 
  ListOrdered, 
  Clock, 
  User, 
  Check, 
  RotateCcw
} from 'lucide-react';

interface ProtocolDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  protocol: CareProtocolRoutine | null;
  onToggleComplete: (protocolId: string, currentStatus: boolean, notes?: string) => void;
}

export default function ProtocolDetailModal({
  isOpen,
  onClose,
  protocol,
  onToggleComplete
}: ProtocolDetailModalProps) {
  const [note, setNote] = useState('');

  if (!isOpen || !protocol) return null;

  const isCompleted = protocol.isCompleted;

  const handleToggle = () => {
    onToggleComplete(protocol.id, isCompleted, note || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 text-white">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {protocol.categoryLabel}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {protocol.scheduledTime} ({protocol.durationMinutes} min)
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white leading-snug">
              {protocol.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-400" />
              Assistance: <strong className="text-slate-200">{protocol.assistType}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition min-w-[48px] min-h-[48px] flex items-center justify-center"
            title="Close Protocol Details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Equipment & Positioning Matrix */}
        {protocol.equipment && (
          <div className="mt-5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
              <Settings className="w-4 h-4" />
              Equipment & Hookup Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold">DEVICE / HOIST:</span>
                <span className="text-slate-200 font-bold">{protocol.equipment.deviceName}</span>
              </div>
              {protocol.equipment.slingModelSize && (
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-semibold">SLING SIZE & MODEL:</span>
                  <span className="text-slate-200 font-bold">{protocol.equipment.slingModelSize}</span>
                </div>
              )}
              {protocol.equipment.shoulderLoop && (
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-semibold">SHOULDER LOOP SETTING:</span>
                  <span className="text-emerald-300 font-bold">{protocol.equipment.shoulderLoop}</span>
                </div>
              )}
              {protocol.equipment.legLoop && (
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-semibold">LEG LOOP STRAP:</span>
                  <span className="text-cyan-300 font-bold">{protocol.equipment.legLoop}</span>
                </div>
              )}
              {protocol.equipment.carryBar && (
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-semibold">CARRY / SPREADER BAR:</span>
                  <span className="text-slate-200 font-bold">{protocol.equipment.carryBar}</span>
                </div>
              )}
              {protocol.equipment.transferPath && (
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-semibold">TRANSFER PATH:</span>
                  <span className="text-purple-300 font-bold">{protocol.equipment.transferPath}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step-by-Step Instructions */}
        {protocol.steps && protocol.steps.length > 0 && (
          <div className="mt-5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <ListOrdered className="w-4 h-4 text-purple-400" />
              Step-by-Step Procedure
            </h3>
            <ol className="space-y-2 text-xs">
              {protocol.steps.map((step, idx) => (
                <li key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="text-slate-200 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Clinical Precautions */}
        {protocol.precautions && protocol.precautions.length > 0 && (
          <div className="mt-5 p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Safety Precautions & Red Flags
            </h3>
            <ul className="space-y-1.5 text-xs text-rose-200/90">
              {protocol.precautions.map((p, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Emergency notes if any */}
        {protocol.emergencyNotes && (
          <div className="mt-4 p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span><strong>Emergency Fallback:</strong> {protocol.emergencyNotes}</span>
          </div>
        )}

        {/* Optional Attendant Note */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Shift Note / Clinical Observation (Optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Skin completely intact; transfer tolerated comfortably."
            className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Action Controls */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="min-h-[48px] px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-semibold text-xs transition cursor-pointer"
          >
            Back to Agenda
          </button>
          
          <button
            onClick={handleToggle}
            className={`min-h-[48px] px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer active:scale-95 shadow-lg ${
              isCompleted
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25'
            }`}
          >
            {isCompleted ? (
              <>
                <RotateCcw className="w-4 h-4" />
                Mark as Incomplete (Undo)
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Confirm Routine Completed
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
