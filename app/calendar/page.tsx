'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  ShieldCheck, 
  X,
  Filter,
  ArrowLeft
} from 'lucide-react';
import PswMobileNavHeader from '@/components/PswMobileNavHeader';

interface ShiftEvent {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  attendantName: string;
  attendantRole: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'sos_active';
  province: 'ON' | 'BC' | 'AB';
  programType: 'CILT' | 'CSIL' | 'SMC';
  type: 'shift' | 'stat_holiday' | 'payroll_cutoff';
  title?: string;
}

// Pre-seeded demo shifts & compliance milestones
const MOCK_EVENTS: ShiftEvent[] = [
  {
    id: 's1',
    date: '2026-09-19',
    startTime: '08:00',
    endTime: '16:00',
    attendantName: 'Sarah Jenkins, RPN',
    attendantRole: 'Primary PSW',
    status: 'in_progress',
    province: 'ON',
    programType: 'CILT',
    type: 'shift'
  },
  {
    id: 's2',
    date: '2026-09-20',
    startTime: '09:00',
    endTime: '15:00',
    attendantName: 'David Chen',
    attendantRole: 'Relief Attendant',
    status: 'scheduled',
    province: 'BC',
    programType: 'CSIL',
    type: 'shift'
  },
  {
    id: 's3',
    date: '2026-09-21',
    startTime: '16:00',
    endTime: '22:00',
    attendantName: 'Unassigned',
    attendantRole: 'Emergency Relief Needed',
    status: 'sos_active',
    province: 'ON',
    programType: 'CILT',
    type: 'shift'
  },
  {
    id: 's4',
    date: '2026-09-22',
    startTime: '08:00',
    endTime: '16:00',
    attendantName: 'Sarah Jenkins, RPN',
    attendantRole: 'Primary PSW',
    status: 'scheduled',
    province: 'ON',
    programType: 'CILT',
    type: 'shift'
  },
  {
    id: 's5',
    date: '2026-09-30',
    startTime: '00:00',
    endTime: '23:59',
    attendantName: 'CRA / WSIB Notice',
    attendantRole: 'Compliance System',
    status: 'completed',
    province: 'ON',
    programType: 'CILT',
    type: 'payroll_cutoff',
    title: 'Monthly Timesheet & Tax Remittance Deadline'
  },
  {
    id: 's6',
    date: '2026-09-30',
    startTime: '00:00',
    endTime: '23:59',
    attendantName: 'Statutary Holiday',
    attendantRole: 'National Day for Truth & Reconciliation',
    status: 'completed',
    province: 'BC',
    programType: 'CSIL',
    type: 'stat_holiday',
    title: 'Stat Holiday (1.5x Premium Rate Applicable)'
  }
];

export default function SharedCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // Sept 2026
  const [selectedEvent, setSelectedEvent] = useState<ShiftEvent | null>(null);
  const [filterProvince, setFilterProvince] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return MOCK_EVENTS.filter(e => {
      if (filterProvince !== 'all' && e.province !== filterProvince) return false;
      if (filterStatus !== 'all' && e.status !== filterStatus) return false;
      return true;
    });
  }, [filterProvince, filterStatus]);

  // Map events to date strings "YYYY-MM-DD"
  const eventsByDate = useMemo(() => {
    const map: Record<string, ShiftEvent[]> = {};
    filteredEvents.forEach(evt => {
      if (!map[evt.date]) map[evt.date] = [];
      map[evt.date].push(evt);
    });
    return map;
  }, [filteredEvents]);

  // Calendar grid cells
  const calendarCells = useMemo(() => {
    const cells = [];
    // Padding for previous month days
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(null);
    }
    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        day,
        dateStr,
        events: eventsByDate[dateStr] || []
      });
    }
    return cells;
  }, [year, month, firstDayOfWeek, daysInMonth, eventsByDate]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* PSW Mobile Top Navigation Header */}
      <PswMobileNavHeader attendantName="Sarah Jenkins, RPN" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Page Title & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
              <Link href="/dashboard" className="hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
              </Link>
              <span>/</span>
              <span className="text-slate-500">Care Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-[#0224bb]" />
              Shared Care Calendar
            </h1>
            <p className="text-sm text-slate-600">
              Synchronized scheduling, attendant shifts, and provincial compliance milestones (ON CILT & BC CSIL).
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#0224bb] hover:bg-blue-800 text-white font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-sm transition-all focus:ring-4 focus:ring-blue-300 min-h-[48px]"
            >
              <Plus className="w-4 h-4" /> Schedule Care Shift
            </button>
          </div>
        </div>

        {/* Month Navigation & Filters Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Month Stepper */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous Month"
              className="p-2.5 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors focus:ring-2 focus:ring-blue-500"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            <h2 className="text-lg font-bold text-slate-900 min-w-[180px] text-center">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={handleNextMonth}
              aria-label="Next Month"
              className="p-2.5 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors focus:ring-2 focus:ring-blue-500"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
            <button
              onClick={handleToday}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100"
            >
              Today
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Filter className="w-4 h-4" /> Filters:
            </div>
            
            <select
              value={filterProvince}
              onChange={(e) => setFilterProvince(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Provinces (ON / BC / AB)</option>
              <option value="ON">Ontario (CILT)</option>
              <option value="BC">British Columbia (CSIL)</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Shift Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="sos_active">🚨 SOS Relief Active</option>
            </select>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Month Days */}
          <div className="grid grid-cols-7 auto-rows-fr gap-px bg-slate-200">
            {calendarCells.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="bg-slate-50/50 min-h-[110px]" />;
              }

              const isToday = cell.day === 19 && month === 8 && year === 2026;

              return (
                <div
                  key={cell.dateStr}
                  className={`bg-white min-h-[110px] p-2 flex flex-col justify-between transition-colors hover:bg-slate-50/80 ${
                    isToday ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                        isToday ? 'bg-[#0224bb] text-white' : 'text-slate-700'
                      }`}
                    >
                      {cell.day}
                    </span>
                    {cell.events.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {cell.events.length}
                      </span>
                    )}
                  </div>

                  {/* Event Badges inside Cell */}
                  <div className="space-y-1 overflow-y-auto max-h-[80px]">
                    {cell.events.map((evt) => {
                      if (evt.type === 'payroll_cutoff') {
                        return (
                          <button
                            key={evt.id}
                            onClick={() => setSelectedEvent(evt)}
                            className="w-full text-left p-1 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium truncate flex items-center gap-1 hover:bg-amber-100"
                          >
                            <DollarSign className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">{evt.title}</span>
                          </button>
                        );
                      }

                      if (evt.type === 'stat_holiday') {
                        return (
                          <button
                            key={evt.id}
                            onClick={() => setSelectedEvent(evt)}
                            className="w-full text-left p-1 rounded bg-purple-50 border border-purple-200 text-purple-900 text-[11px] font-medium truncate flex items-center gap-1 hover:bg-purple-100"
                          >
                            <ShieldCheck className="w-3 h-3 text-purple-600 shrink-0" />
                            <span className="truncate">{evt.title}</span>
                          </button>
                        );
                      }

                      const isSos = evt.status === 'sos_active';
                      const isInProgress = evt.status === 'in_progress';

                      return (
                        <button
                          key={evt.id}
                          onClick={() => setSelectedEvent(evt)}
                          className={`w-full text-left p-1 rounded text-[11px] font-semibold truncate flex items-center justify-between gap-1 border transition-all ${
                            isSos
                              ? 'bg-rose-50 border-rose-300 text-rose-800 animate-pulse hover:bg-rose-100'
                              : isInProgress
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                              : 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100'
                          }`}
                        >
                          <span className="truncate">
                            {isSos ? '🚨 SOS: Relief' : evt.attendantName.split(',')[0]}
                          </span>
                          <span className="text-[10px] font-normal opacity-80 shrink-0">
                            {evt.startTime}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shared Calendar Legend */}
        <div className="mt-6 bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-6 flex-wrap text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" /> Scheduled Care Shift
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" /> In-Progress Active Shift
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" /> 🚨 Emergency SOS Relief Broadcast
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" /> CRA Payroll & Timesheet Cutoff
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500" /> Provincial Stat Holiday (ON/BC 1.5x)
          </div>
        </div>

      </main>

      {/* Shift Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase mb-2">
              <span>{selectedEvent.province} {selectedEvent.programType} Program</span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 mb-4">
              {selectedEvent.title || `${selectedEvent.attendantName} - Care Shift`}
            </h3>

            <div className="space-y-3 text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Date & Time: <strong>{selectedEvent.date}</strong> ({selectedEvent.startTime} - {selectedEvent.endTime})</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span>Assigned: <strong>{selectedEvent.attendantName}</strong> ({selectedEvent.attendantRole})</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                <span>Status: <span className="font-bold uppercase text-blue-600">{selectedEvent.status}</span></span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {selectedEvent.status === 'sos_active' ? (
                <Link
                  href={`/dashboard/shifts/claim/${selectedEvent.id}`}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-xl text-center shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" /> Claim Emergency Shift Now
                </Link>
              ) : (
                <Link
                  href="/shifts"
                  className="w-full bg-[#0224bb] hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl text-center shadow-md transition-all"
                >
                  Open Shift Runbook
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Care Shift Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" /> Schedule New Care Shift
            </h3>

            <form onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); alert('Care shift scheduled successfully!'); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Attendant</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm">
                  <option>Sarah Jenkins, RPN (Primary PSW)</option>
                  <option>David Chen (Relief Attendant)</option>
                  <option>Broadcast Emergency SOS (Unassigned)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shift Date</label>
                  <input type="date" defaultValue="2026-09-22" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Program</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm">
                    <option>ON CILT</option>
                    <option>BC CSIL</option>
                    <option>AB SMC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                  <input type="time" defaultValue="08:00" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
                  <input type="time" defaultValue="16:00" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0224bb] hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl shadow-md transition-all mt-2"
              >
                Save Shift to Shared Calendar
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
