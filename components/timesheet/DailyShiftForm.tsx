'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, User, FileText, CheckCircle2, AlertCircle, DollarSign, Save } from 'lucide-react';
import { logSingleShift } from '@/app/actions/timesheet';

interface DailyShiftFormProps {
  onSuccess?: () => void;
}

export default function DailyShiftForm({ onSuccess }: DailyShiftFormProps) {
  const [attendantId, setAttendantId] = useState('att_01');
  const [attendantName, setAttendantName] = useState('Sarah Jenkins, PSW');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('14:00');
  const [totalHours, setTotalHours] = useState('6.00');
  const [shiftType, setShiftType] = useState('Regular');
  const [hourlyRate, setHourlyRate] = useState(20.00);
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [autoSaveToast, setAutoSaveToast] = useState(false);

  // Refs for date/time input pickers (Requirement 5)
  const dateInputRef = useRef<HTMLInputElement>(null);
  const startTimeInputRef = useRef<HTMLInputElement>(null);
  const endTimeInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideToastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedDraft = localStorage.getItem('care_direct_daily_shift_draft');
      if (savedDraft) {
        const d = JSON.parse(savedDraft);
        if (d.attendantId) setAttendantId(d.attendantId);
        if (d.attendantName) setAttendantName(d.attendantName);
        if (d.date) setDate(d.date);
        if (d.startTime) setStartTime(d.startTime);
        if (d.endTime) setEndTime(d.endTime);
        if (d.totalHours) setTotalHours(d.totalHours);
        if (d.shiftType) setShiftType(d.shiftType);
        if (d.hourlyRate) setHourlyRate(d.hourlyRate);
        if (d.notes) setNotes(d.notes);
      }
    } catch (e) {
      console.error('Failed to parse draft', e);
    }
  }, []);

  // Auto-save draft on changes with leak-free timeout cleanup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const draftData = { attendantId, attendantName, date, startTime, endTime, totalHours, shiftType, hourlyRate, notes };
        localStorage.setItem('care_direct_daily_shift_draft', JSON.stringify(draftData));
      } catch (e) {
        console.warn('Failed to auto-save draft to storage:', e);
      }
    }
    
    // Clear any existing timers
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (hideToastTimerRef.current) clearTimeout(hideToastTimerRef.current);

    autoSaveTimerRef.current = setTimeout(() => {
      setAutoSaveToast(true);
      hideToastTimerRef.current = setTimeout(() => {
        setAutoSaveToast(false);
      }, 2500);
    }, 1000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      if (hideToastTimerRef.current) clearTimeout(hideToastTimerRef.current);
    };
  }, [attendantId, attendantName, date, startTime, endTime, totalHours, shiftType, hourlyRate, notes]);

  // Recalculate hours when start or end time changes (Requirement 3 & 6)
  const handleTimeChange = (newStart: string, newEnd: string) => {
    setStartTime(newStart);
    setEndTime(newEnd);
    if (newStart && newEnd) {
      const [sH, sM] = newStart.split(':').map(Number);
      const [eH, eM] = newEnd.split(':').map(Number);
      let diff = (eH + eM / 60) - (sH + sM / 60);
      if (diff < 0) diff += 24; // overnight shift
      setTotalHours(diff.toFixed(2));
    }
  };

  // Live Wage Calculation (Requirement 3)
  const hoursNum = parseFloat(totalHours) || 0;
  const rateMultiplier = shiftType === 'Stat Holiday' ? 1.5 : 1.0;
  const baseEarnings = hoursNum * hourlyRate * rateMultiplier;
  const vacationPay = baseEarnings * 0.04;
  const estimatedGross = baseEarnings + vacationPay;

  const handleAttendantChange = (id: string) => {
    setAttendantId(id);
    if (id === 'att_01') {
      setAttendantName('Sarah Jenkins, PSW');
      setHourlyRate(20.00);
    } else {
      setAttendantName('Michael Chang, PSW');
      setHourlyRate(21.50);
    }
  };

  // Requirement 4: First letter of the first word capitalized in Shift Notes
  const handleNotesChange = (val: string) => {
    if (!val || typeof val !== 'string' || val.length === 0) {
      setNotes('');
      return;
    }
    const firstChar = val.charAt(0);
    const capitalized = (firstChar ? firstChar.toUpperCase() : '') + val.slice(1);
    setNotes(capitalized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (hoursNum <= 0) {
      setErrorMessage('Please enter valid working hours greater than 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      await logSingleShift({
        attendantId,
        attendantName,
        date,
        startTime,
        endTime,
        totalHours: hoursNum,
        shiftType,
        notes
      });

      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('care_direct_daily_shift_draft');
        } catch {}
      }
      setSuccessMessage('Shift logged and verified successfully! Feed ready for payroll run.');
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMessage('Failed to save shift. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 relative">
      {/* Auto-save toast notification */}
      {autoSaveToast && (
        <div className="absolute top-4 right-4 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-md flex items-center space-x-1.5 animate-in fade-in duration-200 z-10">
          <Save className="w-3.5 h-3.5 text-emerald-400" />
          <span>Draft auto-saved securely</span>
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold text-slate-900">Daily Quick-Entry Shift Logger</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Log individual PSW shifts manually with automatic start/end time hours calculation and wage rate adjustments.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendant Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Select Attendant (PSW)
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
            <select
              value={attendantId}
              onChange={(e) => handleAttendantChange(e.target.value)}
              className="w-full min-h-[48px] pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="att_01">Sarah Jenkins, PSW (Default: $20.00/hr)</option>
              <option value="att_02">Michael Chang, PSW (Default: $21.50/hr)</option>
            </select>
          </div>
        </div>

        {/* Date Picker (Requirement 5: click anywhere in area opens picker) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Shift Date
          </label>
          <div 
            onClick={() => dateInputRef.current?.showPicker?.()} 
            className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-500 transition px-3.5 min-h-[48px]"
          >
            <Calendar className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <input
              ref={dateInputRef}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Start Time (Requirement 5: click anywhere in area opens picker) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Start Time
          </label>
          <div 
            onClick={() => startTimeInputRef.current?.showPicker?.()} 
            className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-500 transition px-3.5 min-h-[48px]"
          >
            <Clock className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <input
              ref={startTimeInputRef}
              type="time"
              value={startTime}
              onChange={(e) => handleTimeChange(e.target.value, endTime)}
              className="w-full bg-transparent text-sm font-medium text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* End Time (Requirement 5: click anywhere in area opens picker) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            End Time
          </label>
          <div 
            onClick={() => endTimeInputRef.current?.showPicker?.()} 
            className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-500 transition px-3.5 min-h-[48px]"
          >
            <Clock className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <input
              ref={endTimeInputRef}
              type="time"
              value={endTime}
              onChange={(e) => handleTimeChange(startTime, e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Total Worked Hours (Requirement 6: Read-only, calculated from Start & End times only) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Total Worked Hours</span>
            <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold">Calculated from Times</span>
          </label>
          <div className="relative">
            <input
              type="text"
              readOnly
              value={`${totalHours} hrs`}
              className="w-full min-h-[48px] px-4 bg-slate-100 border border-slate-200 rounded-xl text-sm font-extrabold text-slate-900 cursor-not-allowed"
            />
          </div>
          <p className="text-[11px] text-slate-500">Automatically computed from Start Time and End Time.</p>
        </div>

        {/* Hourly Rate Override / Adjustment Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Hourly Pay Rate ($ / hr)</span>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">Adjustable Rate</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="number"
              step="0.25"
              min="10"
              max="100"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
              className="w-full min-h-[48px] pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <p className="text-[11px] text-slate-500">Edit this rate if pay has changed or for special shift adjustments.</p>
        </div>

        {/* Shift Classification */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Shift Classification (Ontario ESA)
          </label>
          <select
            value={shiftType}
            onChange={(e) => setShiftType(e.target.value)}
            className="w-full min-h-[48px] px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="Regular">Regular Hours (Standard rate)</option>
            <option value="Stat Holiday">Statutory Holiday (1.5x Premium)</option>
            <option value="Training">Training / Shadowing</option>
            <option value="Relief">Emergency Relief</option>
          </select>
        </div>

        {/* Notes (Requirement 4: First letter of first word capitalized) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Shift Notes / Handover Tag
          </label>
          <input
            type="text"
            placeholder="e.g. Morning personal care routine completed"
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            className="w-full min-h-[48px] px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Live Estimated Gross Pay Card (Requirement 3: Synced in real time) */}
      <div className="p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">Live Estimated Gross Pay</span>
          <span className="text-xs text-slate-600">
            {hoursNum.toFixed(2)} hrs @ ${hourlyRate.toFixed(2)}/hr {shiftType === 'Stat Holiday' ? '(1.5x Stat Premium)' : ''} + 4% Vacation Pay
          </span>
        </div>
        <div className="text-2xl font-extrabold text-emerald-900 bg-white px-5 py-2.5 rounded-xl border border-emerald-200 shadow-xs">
          ${estimatedGross.toFixed(2)}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-[48px] px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving & Verifying...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Save & Verify Shift</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
