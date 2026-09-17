'use client';

import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, User, DollarSign, AlertCircle } from 'lucide-react';
import { saveWeeklyTimesheet } from '@/app/actions/timesheet';

interface WeeklyTimesheetGridProps {
  onSuccess?: () => void;
}

export default function WeeklyTimesheetGrid({ onSuccess }: WeeklyTimesheetGridProps) {
  const [attendantId, setAttendantId] = useState('att_01');
  const [attendantName, setAttendantName] = useState('Sarah Jenkins, PSW');
  const [hourlyRate] = useState(20.00);
  const [weekOffset, setWeekOffset] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 7 days of the week starting Monday
  const [days, setDays] = useState([
    { date: '2026-09-14', label: 'Mon', hours: '8.0', isStat: false, shiftType: 'Regular', notes: '' },
    { date: '2026-09-15', label: 'Tue', hours: '8.0', isStat: false, shiftType: 'Regular', notes: '' },
    { date: '2026-09-16', label: 'Wed', hours: '6.5', isStat: false, shiftType: 'Regular', notes: '' },
    { date: '2026-09-17', label: 'Thu', hours: '8.0', isStat: false, shiftType: 'Regular', notes: '' },
    { date: '2026-09-18', label: 'Fri', hours: '8.0', isStat: false, shiftType: 'Regular', notes: '' },
    { date: '2026-09-19', label: 'Sat', hours: '0.0', isStat: false, shiftType: 'Regular', notes: '' },
    { date: '2026-09-20', label: 'Sun', hours: '0.0', isStat: false, shiftType: 'Regular', notes: '' },
  ]);

  const handleHourChange = (index: number, val: string) => {
    const updated = [...days];
    updated[index].hours = val;
    setDays(updated);
  };

  const handleStatToggle = (index: number) => {
    const updated = [...days];
    updated[index].isStat = !updated[index].isStat;
    updated[index].shiftType = updated[index].isStat ? 'Stat Holiday' : 'Regular';
    setDays(updated);
  };

  const handleNotesChange = (index: number, val: string) => {
    const updated = [...days];
    updated[index].notes = val;
    setDays(updated);
  };

  // Calculations
  const totalWeekHours = days.reduce((sum, d) => sum + (parseFloat(d.hours) || 0), 0);
  const totalRegularHours = days.filter(d => !d.isStat).reduce((sum, d) => sum + (parseFloat(d.hours) || 0), 0);
  const totalStatHours = days.filter(d => d.isStat).reduce((sum, d) => sum + (parseFloat(d.hours) || 0), 0);

  const regularEarnings = totalRegularHours * hourlyRate;
  const statEarnings = totalStatHours * hourlyRate * 1.5;
  const subtotalEarnings = regularEarnings + statEarnings;
  const vacationPay = subtotalEarnings * 0.04; // 4% ESA minimum
  const totalEstimatedGross = subtotalEarnings + vacationPay;

  const handleSaveWeekly = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (totalWeekHours <= 0) {
      setErrorMessage('Please enter at least some working hours for the week.');
      return;
    }

    try {
      setIsSubmitting(true);
      const dailyEntries = days.map(d => ({
        date: d.date,
        hours: parseFloat(d.hours) || 0,
        isStatHoliday: d.isStat,
        shiftType: d.shiftType,
        notes: d.notes
      }));

      await saveWeeklyTimesheet(attendantId, '2026-09-14', dailyEntries);
      setSuccessMessage('Weekly timesheet successfully saved, verified, and queued for payroll!');
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMessage('Failed to save weekly timesheet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSaveWeekly} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Weekly Timesheet Matrix (Monday – Sunday)</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Quickly enter and verify daily hours across the entire week in a single view.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <select
              value={attendantId}
              onChange={(e) => {
                setAttendantId(e.target.value);
                setAttendantName(e.target.value === 'att_01' ? 'Sarah Jenkins, PSW' : 'Michael Chang, PSW');
              }}
              className="min-h-[40px] pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="att_01">Sarah Jenkins ($20.00/hr)</option>
              <option value="att_02">Michael Chang ($21.50/hr)</option>
            </select>
          </div>
        </div>
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

      {/* Week Navigator */}
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="min-h-[36px] px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center space-x-1 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Week</span>
        </button>
        <div className="text-xs font-bold text-slate-800 flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Week of Sep 14, 2026 – Sep 20, 2026</span>
        </div>
        <button
          type="button"
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="min-h-[36px] px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center space-x-1 transition cursor-pointer"
        >
          <span>Next Week</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Daily Matrix Grid */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {days.map((day, idx) => (
            <div key={day.date} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{day.label}</span>
                <span className="text-[10px] text-slate-500 font-mono">{day.date.slice(5)}</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Hours</label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="24"
                  value={day.hours}
                  onChange={(e) => handleHourChange(idx, e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-600">Stat Holiday (1.5x)</span>
                <input
                  type="checkbox"
                  checked={day.isStat}
                  onChange={() => handleStatToggle(idx)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Summary Footer Card */}
      <div className="p-6 bg-slate-900 text-slate-100 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">Weekly Timesheet Summary</span>
          <div className="text-xs text-slate-300 flex flex-wrap gap-4">
            <span>Total Hours: <strong className="text-white">{totalWeekHours.toFixed(2)} hrs</strong></span>
            <span>Regular: <strong className="text-white">{totalRegularHours.toFixed(2)} hrs</strong></span>
            <span>Stat Holiday: <strong className="text-white">{totalStatHours.toFixed(2)} hrs</strong></span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Estimated Gross + 4% Vacation</span>
            <span className="text-2xl font-bold text-emerald-400">${totalEstimatedGross.toFixed(2)}</span>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-[48px] px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Save Weekly Timesheet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
