'use client';

import React, { useState, useEffect } from 'react';
import NavigationHeader from '@/components/NavigationHeader';
import GeofenceArrivalTracker from '@/components/GeofenceArrivalTracker';
import ShiftBiddingCard from '@/components/ShiftBiddingCard';
import EmployerBidReview from '@/components/EmployerBidReview';
import AudioHandoverRecorder from '@/components/AudioHandoverRecorder';
import { useAuth } from '@/context/AuthContext';
import { 
  Radio, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Square, 
  Calendar, 
  ListChecks,
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react';

interface ShiftTask {
  id: string;
  time: string;
  title: string;
  category: 'hygiene' | 'transfer' | 'nutrition' | 'exercise';
  completed: boolean;
}

const DEFAULT_TASKS: ShiftTask[] = [
  { id: 't1', time: '08:00 AM', title: 'Morning Hoyer transfer to commode / shower chair', category: 'transfer', completed: false },
  { id: 't2', time: '08:30 AM', title: 'Personal hygiene, oral care, and skin integrity check', category: 'hygiene', completed: false },
  { id: 't3', time: '09:00 AM', title: 'Dressing & Hoyer transfer into power wheelchair with Roho cushion', category: 'transfer', completed: false },
  { id: 't4', time: '09:30 AM', title: 'Breakfast setup, hydration assistance (minimum 500ml water)', category: 'nutrition', completed: false },
  { id: 't5', time: '11:00 AM', title: 'Passive range of motion (ROM) lower extremity stretches', category: 'exercise', completed: false },
  { id: 't6', time: '12:30 PM', title: 'Lunch prep & tilt-in-space pressure relief (35° for 2 min)', category: 'transfer', completed: false }
];

export default function ShiftsPage() {
  const { userProfile } = useAuth();
  const [tasks, setTasks] = useState<ShiftTask[]>(DEFAULT_TASKS);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [offlineStatus, setOfflineStatus] = useState(false);

  // Fail-Safe Offline Clock persistence
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedClock = localStorage.getItem('directcare_shift_clock');
      if (savedClock) {
        try {
          const parsed = JSON.parse(savedClock);
          if (parsed.isClockedIn) {
            setIsClockedIn(true);
            setClockInTime(parsed.startTime);
            const diff = Math.floor((Date.now() - new Date(parsed.startTime).getTime()) / 60000);
            setElapsedMinutes(Math.max(0, diff));
          }
        } catch (e) {
          console.error(e);
        }
      }

      const handleOnline = () => setOfflineStatus(false);
      const handleOffline = () => setOfflineStatus(true);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Timer tick
  useEffect(() => {
    let interval: any;
    if (isClockedIn && clockInTime) {
      interval = setInterval(() => {
        const diff = Math.floor((Date.now() - new Date(clockInTime).getTime()) / 60000);
        setElapsedMinutes(Math.max(0, diff));
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [isClockedIn, clockInTime]);

  const handleToggleClock = () => {
    if (!isClockedIn) {
      const now = new Date().toISOString();
      setIsClockedIn(true);
      setClockInTime(now);
      setElapsedMinutes(0);
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'directcare_shift_clock',
          JSON.stringify({ isClockedIn: true, startTime: now, attendantId: userProfile?.uid })
        );
      }
    } else {
      const now = new Date().toISOString();
      setIsClockedIn(false);
      setClockInTime(null);
      setElapsedMinutes(0);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('directcare_shift_clock');
      }
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <NavigationHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Shift Status & Clock */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-800">
                Today's Shift
              </span>
              <span className="flex items-center text-xs font-semibold text-slate-500">
                {offlineStatus ? (
                  <span className="flex items-center text-amber-600"><WifiOff className="w-3.5 h-3.5 mr-1" /> Offline Cache Active</span>
                ) : (
                  <span className="flex items-center text-emerald-600"><Wifi className="w-3.5 h-3.5 mr-1" /> Network Synced</span>
                )}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {userProfile?.displayName || 'Attendant Shift'}
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Direct Funding Day Schedule • Ontario ESA Verified Rest Breaks
            </p>
          </div>

          {/* Clock In / Out Action */}
          <div className="flex items-center space-x-4">
            {isClockedIn && (
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase">Active Duration</p>
                <p className="text-xl font-black text-purple-700">
                  {Math.floor(elapsedMinutes / 60)}h {elapsedMinutes % 60}m
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleToggleClock}
              className={`min-h-[48px] px-6 rounded-2xl font-black text-sm flex items-center space-x-2 shadow-sm transition cursor-pointer ${
                isClockedIn
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isClockedIn ? (
                <>
                  <Square className="w-5 h-5 fill-current" />
                  <span>Clock Out & End Shift</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Clock In for Shift</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live GPS Geofence Arrival Tracker */}
        {!isClockedIn && (
          <GeofenceArrivalTracker 
            shiftId="demo_active_shift_1"
            attendantId={userProfile?.uid || "psw_1"}
            employerCoords={{ lat: 43.2557, lng: -79.8711 }} // Hamilton, ON coordinate
          />
        )}

        {/* Open Relief Shifts Bidding Pool */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Open Relief Shifts • Open for Bidding</h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              Approved Relief Pool
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ShiftBiddingCard 
              shiftId="shift_bidding_open_01"
              attendantId={userProfile?.uid || "psw_1"}
              date="Friday, Sep 25, 2026"
              timeRange="08:00 AM - 04:00 PM (8.0 hrs)"
              hourlyRate={28.50}
            />
            <ShiftBiddingCard 
              shiftId="shift_bidding_open_02"
              attendantId={userProfile?.uid || "psw_1"}
              date="Saturday, Sep 26, 2026"
              timeRange="04:00 PM - 11:00 PM (7.0 hrs)"
              hourlyRate={30.00}
            />
          </div>
        </div>

        {/* Employer Shift Bid Review Panel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Employer Bid Management • Accept Relief Bids</h2>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Live Bid Queue
            </span>
          </div>
          <EmployerBidReview shiftId="shift_bidding_open_01" />
        </div>

        {/* End-of-Shift Offline Voice Handover Recorder */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">End-of-Shift Voice Handover • Offline Ready</h2>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              IndexedDB Local Storage
            </span>
          </div>
          <AudioHandoverRecorder shiftId="shift_bidding_open_01" />
        </div>

        {/* Shift Tasks Agenda */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ListChecks className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-black text-slate-900">Shift Care Runbook Checklist</h2>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {completedCount} of {tasks.length} Completed
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`py-3.5 px-4 rounded-xl flex items-center justify-between cursor-pointer transition ${
                  task.completed ? 'bg-slate-50 opacity-60' : 'hover:bg-purple-50/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => {}} // handled by parent div
                    className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <div>
                    <p className={`text-sm font-bold ${task.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {task.title}
                    </p>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {task.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{task.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
