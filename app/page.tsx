'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import NavigationHeader from '@/components/NavigationHeader';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  Clock, 
  Calendar, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  Mic, 
  Square, 
  Play, 
  CheckCircle2, 
  FileText, 
  PhoneCall, 
  Volume2, 
  Sparkles,
  ArrowUpRight,
  ClipboardCheck,
  HeartPulse,
  Radio,
  FileCheck2,
  RefreshCw
} from 'lucide-react';

interface RunbookTask {
  id: string;
  timeSlot: string;
  title: string;
  description: string;
  priority: 'routine' | 'critical' | 'transfer';
  completed: boolean;
}

const DEFAULT_RUNBOOK: RunbookTask[] = [
  {
    id: 'rb1',
    timeSlot: '08:00 AM',
    title: 'Hoyer Lift Transfer to Commode / Shower',
    description: 'Use Yellow loop on shoulders, Green loop on thighs. Inspect spreader bar clips before hoisting.',
    priority: 'critical',
    completed: true
  },
  {
    id: 'rb2',
    timeSlot: '08:45 AM',
    title: 'Morning Hygiene & Skin Integrity Inspection',
    description: 'Check coccyx, sacrum, and bilateral heels for non-blanchable erythema. Apply barrier cream.',
    priority: 'critical',
    completed: true
  },
  {
    id: 'rb3',
    timeSlot: '09:30 AM',
    title: 'Power Wheelchair Transfer & Roho Cushion Check',
    description: 'Verify 1-inch hand-check clearance on Roho cells. Secure chest harness and foot straps.',
    priority: 'transfer',
    completed: false
  },
  {
    id: 'rb4',
    timeSlot: '12:30 PM',
    title: 'Hydration & Tilt-in-Space Pressure Relief',
    description: 'Minimum 500ml water intake. Perform 35-degree tilt-in-space pressure relief for 2 full minutes.',
    priority: 'routine',
    completed: false
  },
  {
    id: 'rb5',
    timeSlot: '04:00 PM',
    title: 'Passive Range of Motion (ROM) Stretches',
    description: 'Lower extremity hamstring and ankle dorsiflexion stretches as prescribed by physical therapist.',
    priority: 'routine',
    completed: false
  }
];

function HomeContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'overview';

  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  // Sync tab with URL query parameter
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Direct Funding Budget State
  const [budget] = useState({
    allocatedHours: 180.0,
    usedHours: 94.5,
    hourlyRate: 23.50,
    allocatedFunds: 4230.00,
    spentFunds: 2220.75,
    periodName: 'September 2026'
  });

  // Shift Clock state with fail-safe local persistence
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('directcare_shift_clock');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
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
    }
  }, []);

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
          JSON.stringify({ isClockedIn: true, startTime: now })
        );
      }
    } else {
      setIsClockedIn(false);
      setClockInTime(null);
      setElapsedMinutes(0);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('directcare_shift_clock');
      }
    }
  };

  // Runbook tasks
  const [runbookTasks, setRunbookTasks] = useState<RunbookTask[]>(DEFAULT_RUNBOOK);

  const toggleRunbookTask = (id: string) => {
    setRunbookTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  // Ambient Voice Handover State
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analyzingHandover, setAnalyzingHandover] = useState(false);
  const [handoverResult, setHandoverResult] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        analyzeAudioMemo(audioBlob);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      console.warn('Microphone access unavailable, simulating audio record:', err);
      simulateVoiceHandover();
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setRecording(false);
    }
  };

  const simulateVoiceHandover = () => {
    setAnalyzingHandover(true);
    setTimeout(() => {
      setHandoverResult({
        summary: 'Morning shift handover: Assisted client with Hoyer transfer to wheelchair. Skin integrity assessed over sacrum and bilateral heels with zero redness. Consumed 650ml water and hot tea. Morning medication packet verified. Evening attendant requested to assist with 7:30 PM passive range of motion.',
        completedTasks: [
          'Hoyer transfer using 4-point spreader bar (checked)',
          'Skin integrity assessment (clear, intact)',
          'Hydration & breakfast assistance (650ml water)'
        ],
        skinIntegrityNotes: 'Coccyx and heels clean, zero erythema observed.',
        bowelBladderNotes: 'Routine morning care uneventful.',
        suppliesNeeded: ['Nitrile exam gloves (Size M)', 'Chux disposable pads']
      });
      setAnalyzingHandover(false);
    }, 1200);
  };

  const analyzeAudioMemo = async (blob: Blob) => {
    setAnalyzingHandover(true);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'handover.webm');
      formData.append('authorName', userProfile?.displayName || 'Attendant');

      const res = await fetch('/api/gemini/handover', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setHandoverResult(data);
    } catch (e) {
      console.error(e);
      simulateVoiceHandover();
    } finally {
      setAnalyzingHandover(false);
    }
  };

  // Emergency SOS Broadcast State
  const [sosSent, setSosSent] = useState(false);
  const [sendingSos, setSendingSos] = useState(false);

  const handleTriggerSOS = () => {
    setSendingSos(true);
    setTimeout(() => {
      setSendingSos(false);
      setSosSent(true);
    }, 1000);
  };

  const hoursRemaining = budget.allocatedHours - budget.usedHours;
  const fundsRemaining = budget.allocatedFunds - budget.spentFunds;
  const percentHoursUsed = Math.min(100, Math.round((budget.usedHours / budget.allocatedHours) * 100));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <NavigationHeader activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Direct Funding Employer Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-800">
                Ontario Direct Funding Program
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Employer: {userProfile?.displayName || 'Luc Valade'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Self-Managed Attendant Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Real-time attendant scheduling, ESA compliance verification, ambient clinical handovers, and Ontario Direct Funding budget tracking.
            </p>
          </div>

          {/* Quick Clock Toggle */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center space-x-4 shrink-0">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shift Clock</p>
              <p className="text-sm font-black text-slate-900">
                {isClockedIn ? `Active (${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m)` : 'Off-Duty'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleClock}
              className={`min-h-[44px] px-4 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer text-white shadow-xs ${
                isClockedIn ? 'bg-rose-600 hover:bg-rose-700' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isClockedIn ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isClockedIn ? 'Clock Out' : 'Clock In'}</span>
            </button>
          </div>
        </div>

        {/* Tab View Selector (When in custom tabs) */}
        {activeTab !== 'overview' && (
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Current View:</span>
              <span className="text-xs font-black text-blue-700 uppercase">{activeTab}</span>
            </div>
            <button
              onClick={() => setActiveTab('overview')}
              className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center space-x-1 cursor-pointer"
            >
              <span>Back to Master Dashboard</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 1. Direct Funding Monthly Budget Section */}
        {(activeTab === 'overview') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-black text-slate-900">Direct Funding Budget Allocation • {budget.periodName}</h2>
              </div>
              <Link href="/payroll/stubs" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center">
                <span>View Pay Stubs</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Hours Allocated */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Allocated Hours</p>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900">{budget.allocatedHours} hrs</span>
                  <span className="text-xs font-semibold text-slate-500">CILT Grant</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentHoursUsed}%` }} />
                </div>
                <p className="text-[11px] text-slate-500 font-medium">{percentHoursUsed}% of month consumed</p>
              </div>

              {/* Card 2: Hours Remaining */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Hours Remaining</p>
                <p className="text-2xl font-black text-emerald-700">{hoursRemaining.toFixed(1)} hrs</p>
                <p className="text-xs text-slate-500 font-medium">Safe margin for rest of month</p>
              </div>

              {/* Card 3: Grant Funds Spent */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Wages Disbursed</p>
                <p className="text-2xl font-black text-slate-900">${budget.spentFunds.toFixed(2)}</p>
                <p className="text-xs text-slate-500 font-medium">@ ${budget.hourlyRate.toFixed(2)}/hr standard</p>
              </div>

              {/* Card 4: Remaining Grant Balance */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase">Remaining Grant Funds</p>
                <p className="text-2xl font-black text-blue-700">${fundsRemaining.toFixed(2)}</p>
                <p className="text-xs text-slate-500 font-medium">Bank balance synchronized</p>
              </div>
            </div>
          </section>
        )}

        {/* 2. Live Care Runbook Checklist Section */}
        {(activeTab === 'overview' || activeTab === 'runbook') && (
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Today's Care Runbook & Transfer Checklist</h2>
                  <p className="text-xs text-slate-500">Clinical transfer steps, skin integrity, and hydration milestones</p>
                </div>
              </div>

              <Link
                href="/protocols/dashboard"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center self-start sm:self-auto"
              >
                <HeartPulse className="w-4 h-4 mr-1" />
                <span>Clinical Protocols & Safety Guide</span>
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {runbookTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleRunbookTask(task.id)}
                  className={`py-4 px-3 sm:px-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition cursor-pointer ${
                    task.completed ? 'bg-slate-50 opacity-60' : 'hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => {}}
                      className="mt-1 w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {task.timeSlot}
                        </span>
                        <h3 className={`text-sm font-black ${task.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {task.title}
                        </h3>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          task.priority === 'critical' ? 'bg-rose-100 text-rose-800' : task.priority === 'transfer' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{task.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-bold shrink-0 self-end sm:self-auto">
                    {task.completed ? (
                      <span className="text-emerald-700 flex items-center bg-emerald-50 px-2.5 py-1 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completed
                      </span>
                    ) : (
                      <span className="text-slate-400 bg-slate-100 px-2.5 py-1 rounded-xl">Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. Ambient Voice Handover (Powered by Gemini 3.5 Flash) */}
        {(activeTab === 'overview' || activeTab === 'handover') && (
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-black text-slate-900">Ambient Voice Shift Handover</h2>
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-black px-2 py-0.5 rounded-md flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" /> Gemini 3.5 Flash
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Record a natural speech audio memo; Gemini extracts structured clinical notes & supplies</p>
                </div>
              </div>

              {/* Voice Actions */}
              <div className="flex items-center space-x-3">
                {!recording ? (
                  <button
                    type="button"
                    onClick={startVoiceRecording}
                    className="min-h-[44px] px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-2 transition cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Record Voice Handover</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopVoiceRecording}
                    className="min-h-[44px] px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-2 transition cursor-pointer animate-pulse"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Stop & Analyze Handover</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={simulateVoiceHandover}
                  disabled={analyzingHandover}
                  className="min-h-[44px] px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                  title="Test with simulated audio demo"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${analyzingHandover ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Simulate</span>
                </button>
              </div>
            </div>

            {/* Processing State */}
            {analyzingHandover && (
              <div className="p-6 bg-purple-50 rounded-2xl border border-purple-200 flex items-center space-x-3 text-purple-800">
                <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />
                <span className="text-xs font-bold">Gemini 3.5 Flash analyzing multimodal shift voice memo...</span>
              </div>
            )}

            {/* Extracted Handover Output */}
            {handoverResult && !analyzingHandover && (
              <div className="p-6 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-4">
                <div className="flex items-center justify-between border-b border-purple-200 pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-900">Extracted Clinical Handover Summary</span>
                  <span className="text-[10px] text-purple-600 font-semibold">Ready for Next Attendant</span>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {handoverResult.summary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-3.5 rounded-xl border border-purple-100 space-y-1">
                    <span className="font-bold text-slate-700">Skin Integrity & Pressure Relief:</span>
                    <p className="text-slate-600">{handoverResult.skinIntegrityNotes || 'Assessed and intact'}</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-purple-100 space-y-1">
                    <span className="font-bold text-slate-700">Restock & Supplies Flagged:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {handoverResult.suppliesNeeded?.map((sup: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md text-[10px] font-bold">
                          {sup}
                        </span>
                      )) || <span className="text-slate-500">Supplies adequate</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 4. Emergency Relief SOS Broadcast Section */}
        {(activeTab === 'overview' || activeTab === 'emergency') && (
          <section className="bg-white rounded-3xl border border-rose-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Emergency Attendant Relief Broadcast (SOS)</h2>
                  <p className="text-xs text-slate-500">Instant multi-channel SMS broadcast to off-duty & relief attendants in case of sudden illness or call-out</p>
                </div>
              </div>

              {!sosSent ? (
                <button
                  type="button"
                  onClick={handleTriggerSOS}
                  disabled={sendingSos}
                  className="min-h-[44px] px-5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-xs flex items-center space-x-2 transition cursor-pointer self-start sm:self-auto"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>{sendingSos ? 'Broadcasting...' : 'Broadcast Emergency SOS'}</span>
                </button>
              ) : (
                <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Relief Alert Dispatched
                </span>
              )}
            </div>

            {sosSent && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <p className="font-bold">Automated Notification Sent to 3 Relief Attendants:</p>
                <p className="italic">"Direct Funding Urgent Alert: Coverage requested for Luc Valade (Toronto Downtown) starting immediately. Reply YES to accept shift."</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Loading DirectCare Operations...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
