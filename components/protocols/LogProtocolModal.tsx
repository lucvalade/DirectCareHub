'use client';

import React, { useState } from 'react';
import { X, Save, Shield, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ProtocolCategory, ProtocolLog } from '@/types/protocols';

interface LogProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (logData: Partial<ProtocolLog>) => void;
}

export default function LogProtocolModal({ isOpen, onClose, onSave }: LogProtocolModalProps) {
  const [protocolTitle, setProtocolTitle] = useState('Morning Ceiling Lift Transfer (Bed to Power Chair)');
  const [category, setCategory] = useState<ProtocolCategory>('transfer');
  const [scheduledTime, setScheduledTime] = useState('09:00 AM');
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [assistType, setAssistType] = useState<'1-person-assist' | '2-person-assist'>('1-person-assist');
  const [status, setStatus] = useState<'completed' | 'partially_completed' | 'skipped' | 'postponed'>('completed');
  
  // Equipment
  const [deviceName, setDeviceName] = useState('Arjo Maxi Sky 440 Ceiling Lift');
  const [slingSize, setSlingSize] = useState('Medium Mesh High-Back');
  const [strapLoops, setStrapLoops] = useState('Green Shoulder / Yellow Legs, Crossed');
  const [powerChairOff, setPowerChairOff] = useState(true);

  // Vitals & Physical
  const [skinChecked, setSkinChecked] = useState(true);
  const [skinCondition, setSkinCondition] = useState<'intact' | 'redness_noted' | 'breakdown_suspected'>('intact');
  const [skinNotes, setSkinNotes] = useState('Skin intact, no breakdown.');
  const [comfortRating, setComfortRating] = useState(5);
  const [spasms, setSpasms] = useState(false);

  const [attendantNotes, setAttendantNotes] = useState('');
  const [exceptionReason, setExceptionReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      protocol_id: `proto_${Date.now()}`,
      protocol_title: protocolTitle,
      category,
      scheduled_time: scheduledTime,
      completed_at: new Date().toISOString(),
      duration_minutes: Number(durationMinutes),
      performed_by_id: 'attendant_1',
      performed_by_name: 'Sarah Jenkins',
      assist_type: assistType,
      status,
      equipment_used: {
        device_name: deviceName,
        sling_model_size: slingSize,
        strap_loop_settings: strapLoops,
        power_chair_powered_off: powerChairOff
      },
      vital_and_physical_checks: {
        skin_check_performed: skinChecked,
        skin_condition: skinCondition,
        skin_notes: skinNotes,
        comfort_rating: Number(comfortRating),
        spasms_experienced: spasms
      },
      exception_reason: status !== 'completed' ? exceptionReason : undefined,
      attendant_notes: attendantNotes,
      employer_acknowledged: false
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">Log Care Protocol Job</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Protocol Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Care Protocol</label>
              <select
                value={protocolTitle}
                onChange={e => setProtocolTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600"
              >
                <option value="Morning Ceiling Lift Transfer (Bed to Power Chair)">Morning Ceiling Lift Transfer (Bed to Power Chair)</option>
                <option value="Intermittent Catheterization & Bladder Care">Intermittent Catheterization & Bladder Care</option>
                <option value="Bowel Routine & Commode Transfer">Bowel Routine & Commode Transfer</option>
                <option value="2-Hour Pressure Relief Turn & Repositioning">2-Hour Pressure Relief Turn & Repositioning</option>
                <option value="Range-of-Motion & Spasticity Exercises">Range-of-Motion & Spasticity Exercises</option>
                <option value="Evening Bedtime Transfer & Skin Prep">Evening Bedtime Transfer & Skin Prep</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ProtocolCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 capitalize"
              >
                <option value="transfer">Transfer</option>
                <option value="hygiene">Hygiene</option>
                <option value="positioning">Positioning</option>
                <option value="exercises">Exercises</option>
                <option value="medical_care">Medical Care</option>
                <option value="domestic">Domestic</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600"
              >
                <option value="completed">Completed</option>
                <option value="partially_completed">Partially Completed</option>
                <option value="skipped">Skipped</option>
                <option value="postponed">Postponed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assist Type</label>
              <select
                value={assistType}
                onChange={e => setAssistType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600"
              >
                <option value="1-person-assist">1-Person Assist</option>
                <option value="2-person-assist">2-Person Assist</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration (Mins)</label>
              <input
                type="number"
                min="5"
                max="120"
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {status !== 'completed' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <label className="block text-xs font-bold text-amber-800 uppercase mb-1">Exception / Deferral Reason</label>
              <input
                type="text"
                required
                value={exceptionReason}
                onChange={e => setExceptionReason(e.target.value)}
                placeholder="e.g. Employer requested delay due to fatigue"
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs"
              />
            </div>
          )}

          {/* Equipment Details */}
          <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-2xl space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-900">Equipment & Lift Settings Used</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Device Name</label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={e => setDeviceName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Sling Model & Size</label>
                <input
                  type="text"
                  value={slingSize}
                  onChange={e => setSlingSize(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Strap & Loop Settings</label>
                <input
                  type="text"
                  value={strapLoops}
                  onChange={e => setStrapLoops(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <div className="flex items-center space-x-2 pt-5">
                <input
                  type="checkbox"
                  id="chair_off"
                  checked={powerChairOff}
                  onChange={e => setPowerChairOff(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded-sm border-slate-300"
                />
                <label htmlFor="chair_off" className="text-xs font-bold text-slate-800">
                  Power Chair / Equipment Locked & Off
                </label>
              </div>
            </div>
          </div>

          {/* Vitals & Physical Checks */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">Skin Integrity & Comfort Attestation</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Skin Condition</label>
                <select
                  value={skinCondition}
                  onChange={e => setSkinCondition(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  <option value="intact">Intact (Normal)</option>
                  <option value="redness_noted">Redness Noted</option>
                  <option value="breakdown_suspected">Breakdown Suspected</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Comfort Rating (1-5)</label>
                <select
                  value={comfortRating}
                  onChange={e => setComfortRating(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  <option value={5}>5 - Optimal Comfort</option>
                  <option value={4}>4 - Minor Discomfort</option>
                  <option value={3}>3 - Moderate Pain / Tension</option>
                  <option value={2}>2 - Significant Pain</option>
                  <option value={1}>1 - Severe Discomfort / Crisis</option>
                </select>
              </div>
              <div className="flex items-center space-x-2 pt-5">
                <input
                  type="checkbox"
                  id="spasms"
                  checked={spasms}
                  onChange={e => setSpasms(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300"
                />
                <label htmlFor="spasms" className="text-xs font-bold text-slate-800">
                  Spasms Experienced
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Skin & Comfort Observations</label>
              <input
                type="text"
                value={skinNotes}
                onChange={e => setSkinNotes(e.target.value)}
                placeholder="e.g. Minor redness on left heel, offloaded with pillow"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Attendant General Notes</label>
            <textarea
              rows={2}
              value={attendantNotes}
              onChange={e => setAttendantNotes(e.target.value)}
              placeholder="Any additional notes regarding shift execution..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[48px] px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center space-x-2 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Protocol Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
