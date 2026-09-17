'use client';

import React, { useState } from 'react';
import NavigationHeader from '@/components/NavigationHeader';
import { 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Download, 
  ShieldCheck, 
  FileCheck,
  AlertCircle,
  ChevronDown
} from 'lucide-react';

interface TimesheetEntry {
  id: string;
  attendantName: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  rate: number;
  status: 'submitted' | 'approved' | 'disputed';
  signature?: string;
  tasksDone: string;
}

const INITIAL_TIMESHEETS: TimesheetEntry[] = [
  {
    id: 'ts1',
    attendantName: 'Elena Rostova',
    date: '2026-09-15',
    startTime: '08:00 AM',
    endTime: '04:00 PM',
    hours: 8.0,
    rate: 23.50,
    status: 'approved',
    signature: 'Elena Rostova (Signed)',
    tasksDone: 'Morning routine, Hoyer transfer, Range of motion, lunch meal prep'
  },
  {
    id: 'ts2',
    attendantName: 'Elena Rostova',
    date: '2026-09-16',
    startTime: '08:00 AM',
    endTime: '04:00 PM',
    hours: 8.0,
    rate: 23.50,
    status: 'submitted',
    tasksDone: 'Morning transfer, skin check, hydration logging, afternoon positioning'
  },
  {
    id: 'ts3',
    attendantName: 'Kavita Patel',
    date: '2026-09-16',
    startTime: '05:00 PM',
    endTime: '09:00 PM',
    hours: 4.0,
    rate: 23.50,
    status: 'submitted',
    tasksDone: 'Evening dinner prep, Hoyer transfer to bed, evening personal care'
  }
];

export default function TimesheetsPage() {
  const [entries, setEntries] = useState<TimesheetEntry[]>(INITIAL_TIMESHEETS);
  const [selectedPayPeriod, setSelectedPayPeriod] = useState('Sept 1 - Sept 15, 2026');

  const approveTimesheet = (id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'approved' } : e))
    );
  };

  const totalHours = entries.reduce((acc, curr) => acc + curr.hours, 0);
  const totalWages = entries.reduce((acc, curr) => acc + curr.hours * curr.rate, 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <NavigationHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-sm">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Timesheet Verification & Approval</h1>
              <p className="text-xs font-medium text-slate-500">
                Direct Funding audit-ready attendant hour tracking and electronic employer signatures
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedPayPeriod}
              onChange={(e) => setSelectedPayPeriod(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 shadow-xs cursor-pointer"
            >
              <option value="Sept 1 - Sept 15, 2026">Sept 1 - Sept 15, 2026</option>
              <option value="Aug 16 - Aug 31, 2026">Aug 16 - Aug 31, 2026</option>
            </select>
          </div>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-400 uppercase">Period Attendant Hours</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalHours.toFixed(1)} hrs</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-400 uppercase">Total Wages Payable</p>
            <p className="text-2xl font-black text-slate-900 mt-1">${totalWages.toFixed(2)}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-400 uppercase">Approval Status</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {entries.filter((e) => e.status === 'approved').length} of {entries.length} Approved
            </p>
          </div>
        </div>

        {/* Timesheets List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Timesheet Logs</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {entries.map((ts) => (
              <div key={ts.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-slate-900">{ts.attendantName}</span>
                    <span className="text-xs text-slate-400">• {ts.date}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      ts.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ts.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold">{ts.startTime} - {ts.endTime}</span> ({ts.hours} hrs @ ${ts.rate.toFixed(2)}/hr)
                  </p>
                  <p className="text-xs text-slate-500 italic mt-1">"{ts.tasksDone}"</p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right mr-2">
                    <p className="text-base font-black text-slate-900">${(ts.hours * ts.rate).toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Gross Amount</p>
                  </div>

                  {ts.status !== 'approved' ? (
                    <button
                      onClick={() => approveTimesheet(ts.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Sign</span>
                    </button>
                  ) : (
                    <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <ShieldCheck className="w-4 h-4 mr-1" />
                      Employer Signed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
