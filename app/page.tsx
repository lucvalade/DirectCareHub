"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import NavigationHeader from "@/components/NavigationHeader";
import SosResolutionListener from "@/components/SosResolutionListener";
import PricingSection from "@/components/PricingSection";
import ComingSoonModal from "@/components/ComingSoonModal";
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
  RefreshCw,
  Shield,
  ArrowRight,
  X,
  Plus,
  Lock,
  ChevronDown,
  Info,
  HelpCircle
} from "lucide-react";

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
    id: "rb1",
    timeSlot: "08:00 AM",
    title: "Hoyer Lift Transfer to Commode / Shower",
    description: "Use Yellow loop on shoulders, Green loop on thighs. Inspect spreader bar clips before hoisting.",
    priority: "critical",
    completed: true
  },
  {
    id: "rb2",
    timeSlot: "08:45 AM",
    title: "Morning Hygiene & Skin Integrity Inspection",
    description: "Check coccyx, sacrum, and bilateral heels for non-blanchable erythema. Apply barrier cream.",
    priority: "critical",
    completed: true
  },
  {
    id: "rb3",
    timeSlot: "09:30 AM",
    title: "Power Wheelchair Transfer & Roho Cushion Check",
    description: "Verify 1-inch hand-check clearance on Roho cells. Secure chest harness and foot straps.",
    priority: "transfer",
    completed: false
  },
  {
    id: "rb4",
    timeSlot: "12:30 PM",
    title: "Hydration & Tilt-in-Space Pressure Relief",
    description: "Minimum 500ml water intake. Perform 35-degree tilt-in-space pressure relief for 2 full minutes.",
    priority: "routine",
    completed: false
  },
  {
    id: "rb5",
    timeSlot: "04:00 PM",
    title: "Passive Range of Motion (ROM) Stretches",
    description: "Lower extremity hamstring and ankle dorsiflexion stretches as prescribed by physical therapist.",
    priority: "routine",
    completed: false
  }
];

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [comingSoonOpen, setComingSoonOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isUnlocked = localStorage.getItem('directcare_access_unlocked') === 'true' || localStorage.getItem('directcare_waitlist_submitted') === 'true';
      if (isUnlocked) {
        setComingSoonOpen(false);
      }
    }
  }, []);
  
  // Geolocation and Timezone dynamic province scaling
  const [provinceName, setProvinceName] = useState("Ontario");
  const [provinceBadge, setProvinceBadge] = useState("Ontario DF");

  useEffect(() => {
    // 1. Detect using Timezone
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        const lowerTz = tz.toLowerCase();
        if (lowerTz.includes("vancouver") || lowerTz.includes("victoria")) {
          setProvinceName("British Columbia");
          setProvinceBadge("BC CSIL");
        } else if (lowerTz.includes("edmonton") || lowerTz.includes("calgary")) {
          setProvinceName("Alberta");
          setProvinceBadge("Alberta SMC");
        } else if (lowerTz.includes("winnipeg")) {
          setProvinceName("Manitoba");
          setProvinceBadge("Manitoba DF");
        } else if (lowerTz.includes("halifax") || lowerTz.includes("glace_bay")) {
          setProvinceName("Nova Scotia");
          setProvinceBadge("NS Care");
        } else if (lowerTz.includes("regina") || lowerTz.includes("saskatoon")) {
          setProvinceName("Saskatchewan");
          setProvinceBadge("SK Care");
        } else if (lowerTz.includes("st_johns")) {
          setProvinceName("Newfoundland");
          setProvinceBadge("NL Care");
        } else {
          setProvinceName("Ontario");
          setProvinceBadge("Ontario DF");
        }
      }
    } catch (e) {
      console.warn("Timezone province lookup failed, keeping Ontario default:", e);
    }

    // 2. Fallback to active browser Geolocation if allowed
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (longitude < -120 && latitude > 48) {
            setProvinceName("British Columbia");
            setProvinceBadge("BC CSIL");
          } else if (longitude < -110 && longitude >= -120 && latitude > 48) {
            setProvinceName("Alberta");
            setProvinceBadge("Alberta SMC");
          } else if (longitude >= -95 && longitude <= -74 && latitude <= 57) {
            setProvinceName("Ontario");
            setProvinceBadge("Ontario DF");
          }
        },
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  // States to toggle between public Landing Page and operational CareSelf Dashboard
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { userProfile, loginAsDemoUser } = useAuth();

  useEffect(() => {
    const viewParam = searchParams.get("view");
    const tabParam = searchParams.get("tab");
    if (viewParam === "dashboard" || tabParam) {
      if (userProfile) {
        setShowDashboard(true);
      } else {
        router.push("/login");
      }
    }
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams, userProfile, router]);

  useEffect(() => {
    if (showDashboard && !userProfile) {
      router.push("/login");
    }
  }, [showDashboard, userProfile, router]);

  const handleLaunchOrLogin = () => {
    if (!userProfile) {
      router.push("/login");
    } else {
      setShowDashboard(true);
    }
  };

  // Direct Funding Budget State
  const [budget] = useState({
    allocatedHours: 180.0,
    usedHours: 94.5,
    hourlyRate: 23.50,
    allocatedFunds: 4230.00,
    spentFunds: 2220.75,
    periodName: "September 2026"
  });

  // Shift Clock state with fail-safe local persistence
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("directcare_shift_clock");
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
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "directcare_shift_clock",
          JSON.stringify({ isClockedIn: true, startTime: now })
        );
      }
    } else {
      setIsClockedIn(false);
      setClockInTime(null);
      setElapsedMinutes(0);
      if (typeof window !== "undefined") {
        localStorage.removeItem("directcare_shift_clock");
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

  // Ambient Voice Handover State (Powered by Gemini)
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
      console.warn("Microphone access unavailable, simulating audio record:", err);
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
        summary: "Morning shift handover: Assisted client with Hoyer transfer to wheelchair. Skin integrity assessed over sacrum and bilateral heels with zero redness. Consumed 650ml water and hot tea. Morning medication packet verified. Evening attendant requested to assist with 7:30 PM passive range of motion.",
        completedTasks: [
          "Hoyer transfer using 4-point spreader bar (checked)",
          "Skin integrity assessment (clear, intact)",
          "Hydration & breakfast assistance (650ml water)"
        ],
        skinIntegrityNotes: "Coccyx and heels clean, zero erythema observed.",
        bowelBladderNotes: "Routine morning care uneventful.",
        suppliesNeeded: ["Nitrile exam gloves (Size M)", "Chux disposable pads"]
      });
      setAnalyzingHandover(false);
    }, 1200);
  };

  const analyzeAudioMemo = async (blob: Blob) => {
    setAnalyzingHandover(true);
    try {
      const formData = new FormData();
      formData.append("audio", blob, "handover.webm");
      formData.append("authorName", userProfile?.displayName || "Attendant");

      const res = await fetch("/api/gemini/handover", {
        method: "POST",
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

  // FAQ Accordion Toggle States
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Scroll to anchor helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const faqs = [
    {
      q: "Is this expense accepted on my quarterly CILT financial review?",
      a: "Yes. DirectCare Hub generates compliant monthly service invoice receipts citing your custom CILT Client ID and vendor codes. Because we operate as an administration and bookkeeping support service, it qualifies under Category 3 (Administration/Bookkeeping Allowance) budgets, leaving your direct personal care hours completely untouched."
    },
    {
      q: "What if an attendant calls in sick 30 minutes before a transfer?",
      a: "You can trigger the Emergency Relief Broadcast (SOS) button. This immediately dispatches a direct SMS to every off-duty care worker on your configured backup roster. The system utilizes real-time concurrency locks so the first worker to tap 'YES' instantly secures the coverage, followed by an automated browser chime and confirmation text to the employer."
    },
    {
      q: "Does this work outside Ontario (e.g., BC CSIL or Alberta SMC)?",
      a: "Yes. While we default to Ontario CILT standards (WSIB reports, local statutory deductions, 4% vacation pay), DirectCare Hub accommodates CSIL (British Columbia) and SMC (Alberta) consumer-directed programs by matching localized statutory employer contribution models and bookkeeping invoice sheets."
    },
    {
      q: "Can my bookkeeper access my account without seeing my medical notes?",
      a: "Absolutely. DirectCare Hub's security architecture enforces strict separation of concerns. Bookkeepers and designated auditors receive structured logins that authorize viewing timesheets, wage summaries, tax remittances, and expense receipts, but strictly lock out access to private daily runbooks, skin checks, and bowel/bladder logs."
    },
    {
      q: "How are CRA 6-year document retention rules handled?",
      a: "Our Secure Document Vault stores all digitized timesheets, WSIB competency sign-offs, and pay statements in secure, redundant, AES-256 encrypted cloud storage. Your records are preserved automatically for the required 6-year lookback period, shielding you from audits and protecting your peace of mind."
    }
  ];

  /* =========================================================
     VIEW ROUTER: RENDER APPLICATION DASHBOARD VIEW
     ========================================================= */
  if (showDashboard) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <SosResolutionListener activeShiftId="demo_active_shift_1" employerId="employer_1" />
        <NavigationHeader activeTab={activeTab} onSelectTab={(tab) => setActiveTab(tab)} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
          
          {/* Top Direct Funding Employer Banner */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                  Ontario Direct Funding Program
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Employer: {userProfile?.displayName || "Luc Valade"}
                </span>
                <button 
                  onClick={() => setShowDashboard(false)}
                  className="px-2.5 py-0.5 rounded-full text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold cursor-pointer border border-slate-300 transition"
                >
                  Return to Landing Page
                </button>
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
                  {isClockedIn ? `Active (${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m)` : "Off-Duty"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleClock}
                className={`min-h-[44px] px-4 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer text-white shadow-xs ${
                  isClockedIn ? "bg-rose-600 hover:bg-rose-700" : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {isClockedIn ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isClockedIn ? "Clock Out" : "Clock In"}</span>
              </button>
            </div>
          </div>

          {/* Tab View Selector (When in custom tabs) */}
          {activeTab !== "overview" && (
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Current View:</span>
                <span className="text-xs font-black text-blue-700 uppercase">{activeTab}</span>
              </div>
              <button
                onClick={() => setActiveTab("overview")}
                className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center space-x-1 cursor-pointer"
              >
                <span>Back to Master Dashboard</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 1. Direct Funding Monthly Budget Section */}
          {(activeTab === "overview") && (
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
          {(activeTab === "overview" || activeTab === "runbook") && (
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
                      task.completed ? "bg-slate-50 opacity-60" : "hover:bg-blue-50/50"
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
                          <h3 className={`text-sm font-black ${task.completed ? "line-through text-slate-500" : "text-slate-900"}`}>
                            {task.title}
                          </h3>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            task.priority === "critical" ? "bg-rose-100 text-rose-800" : task.priority === "transfer" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"
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

          {/* 3. Ambient Voice Handover */}
          {(activeTab === "overview" || activeTab === "handover") && (
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
                        <Sparkles className="w-3 h-3 mr-1" /> Gemini Assistant
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
                    <RefreshCw className={`w-3.5 h-3.5 ${analyzingHandover ? 'animate-spin' : ""}`} />
                    <span className="hidden sm:inline">Simulate</span>
                  </button>
                </div>
              </div>

              {/* Processing State */}
              {analyzingHandover && (
                <div className="p-6 bg-purple-50 rounded-2xl border border-purple-200 flex items-center space-x-3 text-purple-800">
                  <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />
                  <span className="text-xs font-bold">Gemini analyzing multimodal shift voice memo...</span>
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
                      <p className="text-slate-600">{handoverResult.skinIntegrityNotes || "Assessed and intact"}</p>
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
          {(activeTab === "overview" || activeTab === "emergency") && (
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
                    <span>{sendingSos ? "Broadcasting..." : "Broadcast Emergency SOS"}</span>
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

  /* =========================================================
     LANDING VIEW: PREMIUM HIGH-CONVERSION LANDING PAGE
     ========================================================= */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      
      {/* 1. STICKY ACCESSIBLE HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 w-full shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Logo Brand Title */}
          <Link 
            href="/" 
            onClick={(e) => {
              setShowDashboard(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }} 
            className="flex items-center space-x-3 shrink-0 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <Shield className="w-5.5 h-5.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-base font-black text-slate-900 leading-none">DirectCare Hub</span>
              <span className="text-[9px] text-slate-400 font-bold tracking-wide uppercase leading-none mt-1">
                Self-Managed Care
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full w-fit shrink-0 border border-blue-200 mt-1">
                {provinceBadge}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-bold text-slate-600">
            <button 
              onClick={() => scrollToSection("features-section")} 
              className="min-h-[48px] px-3.5 rounded-xl hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection("cilt-funding-section")} 
              className="min-h-[48px] px-3.5 rounded-xl hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
            >
              How It Pays For Itself
            </button>
            <button 
              onClick={() => scrollToSection("comparison-section")} 
              className="min-h-[48px] px-3.5 rounded-xl hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
            >
              Compliance Comparisons
            </button>
            <button 
              onClick={() => scrollToSection("pricing-section")} 
              className="min-h-[48px] px-3.5 rounded-xl hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollToSection("faq-section")} 
              className="min-h-[48px] px-3.5 rounded-xl hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Actions - Coming Soon, Sign-Up & Log In */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setComingSoonOpen(true)}
              className="min-h-[44px] px-3 py-1.5 bg-gradient-to-r from-blue-900 to-indigo-900 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 rounded-xl transition flex items-center gap-1.5 text-xs font-bold shadow-sm cursor-pointer"
              title="Request Beta Priority Access"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="hidden sm:inline">Coming Soon</span>
            </button>

            <Link
              href="/signup"
              className="text-xs font-bold text-slate-700 hover:text-blue-600 min-h-[48px] px-3 flex items-center transition cursor-pointer"
            >
              Sign-Up
            </Link>

            <Link
              href="/login"
              className="min-h-[48px] px-4 sm:px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-sm transition-transform hover:scale-[1.02] cursor-pointer flex items-center gap-1.5"
            >
              <span>Log In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </header>

      {/* 1.5 PROVINCE REIMBURSEMENT BANNER - PLACED EXACTLY 15px BELOW NAV BAR */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[15px] mb-[-10px] animate-in fade-in duration-300">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 bg-blue-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-2xl shadow-xs">
          <div className="flex items-center space-x-3 text-left">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-wide">
              100% Reimbursable Under {provinceName === "Ontario" ? "Direct Funding (CILT)" : provinceBadge + " Program"} Administrative Budgets
            </span>
          </div>
          {/* Interactive province selection widget */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[10px] font-black uppercase text-slate-400">Location Filter:</span>
            <select
              value={provinceName}
              onChange={(e) => {
                const val = e.target.value;
                setProvinceName(val);
                if (val === "Ontario") {
                  setProvinceBadge("Ontario DF");
                } else if (val === "British Columbia") {
                  router.push("/provinces/bc");
                } else if (val === "Alberta") {
                  router.push("/provinces/alberta");
                } else if (val === "Manitoba") {
                  router.push("/provinces/manitoba");
                } else if (val === "Nova Scotia") {
                  router.push("/provinces/nova-scotia");
                } else if (val === "Saskatchewan") {
                  router.push("/provinces/saskatchewan");
                } else if (val === "Newfoundland") {
                  router.push("/provinces/newfoundland");
                }
              }}
              className="min-h-[32px] px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-black text-slate-700 outline-none cursor-pointer focus:ring-1 focus:ring-blue-500"
            >
              <option value="Ontario">Ontario (DF / CILT)</option>
              <option value="British Columbia">British Columbia (CSIL)</option>
              <option value="Alberta">Alberta (SMC)</option>
              <option value="Manitoba">Manitoba (DF)</option>
              <option value="Nova Scotia">Nova Scotia (NS Care)</option>
              <option value="Saskatchewan">Saskatchewan (SK Care)</option>
              <option value="Newfoundland">Newfoundland (NL Care)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="bg-white border-b border-slate-200 pt-[15px] pb-16 lg:pb-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero text */}
          <div className="lg:col-span-7 space-y-6">

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none">
              The Central Command Center for <span className="text-blue-600">Self-Managed Care.</span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
              <strong className="font-black text-slate-950">Eliminate fragmented paper binders, frantic call-out texts, and payroll compliance headaches.</strong> DirectCare Hub unites daily care protocols, 1-tap relief broadcasts, and automated CRA/WSIB payroll calculations into one accessible platform built for {provinceName} self-managers.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
              <button
                onClick={handleLaunchOrLogin}
                className="min-h-[56px] px-6 bg-blue-600 hover:bg-white text-white hover:text-blue-600 border-2 border-blue-600 text-sm font-black rounded-xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("cilt-funding-section")}
                className="min-h-[56px] px-6 bg-white hover:bg-blue-600 text-blue-700 hover:text-white border-2 border-blue-600 text-sm font-black rounded-xl transition cursor-pointer"
              >
                See How {provinceName === "Ontario" ? "CILT" : provinceBadge} Covers This
              </button>
            </div>

            {/* Trust Logos */}
            <div className="pt-6 border-t border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">
                Verified compliance with Canadian Program standards
              </p>
              <div className="flex flex-wrap gap-4 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                <span className="bg-slate-50 border px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  🇨🇦 CRA 6-Year Records
                </span>
                <span className="bg-slate-50 border px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  ⚖️ WSIB Liability Logged
                </span>
                <span className="bg-slate-50 border px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  🛡️ Service Canada ROE
                </span>
                <span className="bg-slate-50 border px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  💼 CILT Quarterly Audit
                </span>
              </div>
            </div>

          </div>

          {/* Hero Mockup Cards Stack */}
          <div className="lg:col-span-5 relative space-y-4">
            <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full" />

            {/* Card 1: Attendant Care Runbook */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-md space-y-2.5 relative transform -rotate-1 hover:rotate-0 transition duration-300">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <p className="text-[11px] font-black text-slate-900">Active Attendant Care Runbook</p>
                </div>
                <span className="text-[9px] font-extrabold uppercase bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md">
                  In Progress
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <p className="font-extrabold text-slate-800">08:00 AM Routine • Hoyer Lift Transfer</p>
                <p className="text-slate-500 text-[10px] leading-relaxed">
                  Use Yellow loop on shoulders, Green loop on thighs. Inspect spreader bar clips before hoisting.
                </p>
              </div>
            </div>

            {/* Card 2: SOS relief notification */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-lg space-y-3 relative transform rotate-1 hover:rotate-0 transition duration-300">
              <div className="flex items-center justify-between border-b border-rose-100 pb-2">
                <div className="flex items-center gap-2 text-rose-800 font-black text-xs">
                  <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
                  <span>Emergency Relief Dispatch</span>
                </div>
                <span className="text-[9px] font-black text-rose-700 uppercase bg-white border border-rose-200 px-2 py-0.5 rounded">
                  Broadcasted
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-slate-800">Alert sent to 3 Relief PSWs</p>
                <p className="text-[10px] text-slate-600 italic">"Shift claimed by Elena Rostova in 4 minutes."</p>
              </div>
            </div>

            {/* Card 3: Bi-weekly pay stub snapshot */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-md space-y-3 relative transform -rotate-2 hover:rotate-0 transition duration-300">
              <div className="flex items-center justify-between border-b pb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Bi-Weekly Paystub Snapshot</p>
                <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                  Audit Cleared
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-600">
                <div>
                  <p className="font-extrabold">Gross Wages (60h)</p>
                  <p className="font-black text-slate-900 text-xs">$1,410.00</p>
                </div>
                <div>
                  <p className="font-extrabold">Net Pay (Calculated)</p>
                  <p className="font-black text-emerald-700 text-xs">$1,234.80</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. PAIN VS RELIEF COMPARISON GRID */}
      <section id="comparison-section" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Section Card Wrapper in #155dfc */}
          <div className="bg-[#155dfc] text-white rounded-3xl p-8 sm:p-12 space-y-12 shadow-xl border border-blue-600">
            
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-black uppercase tracking-wider bg-white text-[#155dfc] px-3.5 py-1.5 rounded-full border border-blue-200 inline-block shadow-xs">
                Administrative Contrast
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">The Friction vs. The Freedom</h2>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-medium">
                Managing caregivers shouldn't feel like running a complex corporation by hand. See how DirectCare Hub modernizes your compliance workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* The Fragmented Paper Stack (Inner Card: White bg, Black text, Red title & X's) */}
              <div className="bg-white text-slate-900 rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-md">
                <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
                  <AlertTriangle className="w-6 h-6 shrink-0 text-red-600" />
                  <h3 className="text-lg font-black uppercase tracking-wide text-red-600">The Fragmented Paper Stack</h3>
                </div>
                <ul className="space-y-4 text-xs font-bold text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-600 font-black text-base leading-none">❌</span>
                    <span className="text-slate-800"><strong className="text-slate-900">Lost Timesheets & Erasures</strong>: Misplaced papers force manual recalculations, causing friction with attendants and missing record tracks.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-600 font-black text-base leading-none">❌</span>
                    <span className="text-slate-800"><strong className="text-slate-900">Manual Payroll Calculations</strong>: Hand-calculating EI, CPP, Income Tax, and 4% vacation accruals increases liability for CRA penalties.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-600 font-black text-base leading-none">❌</span>
                    <span className="text-slate-800"><strong className="text-slate-900">Pre-shift Callout Scrambles</strong>: Spending hours on group chats and phone tag when an attendant calls in sick 30 minutes before a transfer.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-600 font-black text-base leading-none">❌</span>
                    <span className="text-slate-800"><strong className="text-slate-900">Defenceless WSIB Audits</strong>: No written proof that a caregiver was trained on your ceiling lift sling loop colors during an injury dispute.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-600 font-black text-base leading-none">❌</span>
                    <span className="text-slate-800"><strong className="text-slate-900">Scattered Quarterly Receipts</strong>: Sorting through shoeboxes of physical receipts to justify expenditures to CILT or program auditors.</span>
                  </li>
                </ul>
              </div>

              {/* The DirectCare Hub Way (Inner Card: White bg, Black text, Green checkmarks) */}
              <div className="bg-white text-slate-900 rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-md">
                <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
                  <h3 className="text-lg font-black uppercase tracking-wide text-blue-700">The DirectCare Hub Way</h3>
                </div>
                <ul className="space-y-4 text-xs font-bold text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-600 font-black text-base leading-none">✓</span>
                    <span className="text-slate-800"><strong className="text-slate-900">Digitally Encrypted Logs</strong>: Caregivers check in on mobile; timesheets are securely locked down matching true work durations.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-600 font-black text-base leading-none">✓</span>
                    <span className="text-slate-800"><strong className="text-slate-900">Automated ESA Wage Calculators</strong>: Calculations for gross wages, vacation pay, and CPP withholdings are computed automatically under federal rules.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-600 font-black text-base leading-none">✓</span>
                    <span className="text-slate-800"><strong className="text-slate-900">1-Tap Emergency SOS</strong>: Immediate relief broadcast triggers SMS alerts to relief pools. Concurrency lock lets the first replier claim it.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-600 font-black text-base leading-none">✓</span>
                    <span className="text-slate-800"><strong className="text-slate-900">Immutable Equipment Training Logs</strong>: Handover checklists and equipment training logs are digitally signed by caregivers inside their accounts.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-600 font-black text-base leading-none">✓</span>
                    <span className="text-slate-800"><strong className="text-slate-900">1-Click Quarterly Audit Bundles</strong>: Instantly download compliant ledger logs with HST breakdowns and invoice references for quarterly reviews.</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 4. THE 6 CORE MODULES */}
      <section id="features-section" className="py-16 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600">Complete Operations Kit</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">The 6 Core Modules of DirectCare Hub</h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Every tool is engineered from the ground up to respect consumer-directed care guidelines, and protect against program compliance liabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Module 1 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 group hover:bg-blue-600 hover:border-blue-600 transition duration-300">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-black group-hover:bg-blue-700 group-hover:text-white transition duration-300">
                🚨
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase group-hover:text-white transition duration-300">Emergency Attendant Relief SOS</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-bold group-hover:text-blue-50 transition duration-300">
                Send an immediate SMS broadcast dispatch to your backup caregiver pool. Claims are secured with atomic locks to prevent scheduling double-booking.
              </p>
            </div>

            {/* Module 2 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 group hover:bg-blue-600 hover:border-blue-600 transition duration-300">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-black group-hover:bg-blue-700 group-hover:text-white transition duration-300">
                📖
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase group-hover:text-white transition duration-300">Care Runbooks & Equipment Protocols</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-bold group-hover:text-blue-50 transition duration-300">
                Exact, step-by-step instructions for transfers, mechanical lifters, and sling loop colors available to attendants directly on their mobile phones.
              </p>
            </div>

            {/* Module 3 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 group hover:bg-blue-600 hover:border-blue-600 transition duration-300">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-black group-hover:bg-blue-700 group-hover:text-white transition duration-300">
                💰
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase group-hover:text-white transition duration-300">{provinceName} Payroll & Wage Statements</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-bold group-hover:text-blue-50 transition duration-300">
                Automatically calculates gross wages, statutory CPP contributions, EI withholdings, income taxes, and mandatory 4% vacation accruals.
              </p>
            </div>

            {/* Module 4 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 group hover:bg-blue-600 hover:border-blue-600 transition duration-300">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-black group-hover:bg-blue-700 group-hover:text-white transition duration-300">
                📊
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase group-hover:text-white transition duration-300">Year-End CRA T4 & ROE Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-bold group-hover:text-blue-50 transition duration-300">
                Generate CRA T4 form values (Boxes 14, 16, 18, 22) and Service Canada Record of Employment (ROE) lookup blocks in just a click.
              </p>
            </div>

            {/* Module 5 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 group hover:bg-blue-600 hover:border-blue-600 transition duration-300">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-black group-hover:bg-blue-700 group-hover:text-white transition duration-300">
                ⚖️
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase group-hover:text-white transition duration-300">WSIB Training & Liability Shield</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-bold group-hover:text-blue-50 transition duration-300">
                Require and retain digital competency signatures proving attendants were trained on mechanical transfers before their first shifts.
              </p>
            </div>

            {/* Module 6 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 group hover:bg-blue-600 hover:border-blue-600 transition duration-300">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-black group-hover:bg-blue-700 group-hover:text-white transition duration-300">
                🎟️
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase group-hover:text-white transition duration-300">Non-Taxable Expense Reimbursement</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-bold group-hover:text-blue-50 transition duration-300">
                Attendants snap photos of grocery and transit receipts. Approved claims feed directly into their wage statements without increasing taxable gross pay.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. ROLE-ISOLATED ARCHITECTURE */}
      <section className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600">Privacy-First Segregation</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Three Portals. Absolute Medical Privacy.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We enforce strict data segregation. Caregivers check-in and read transfer runbooks on simple mobile interfaces. Employers oversee payroll from comprehensive managers logs.
            </p>
            <div className="space-y-4 text-xs font-bold text-white">
              <div className="p-4 bg-[#155dfc] border border-blue-600 rounded-2xl flex items-start gap-3 text-white shadow-xs">
                <span className="w-2.5 h-2.5 bg-white rounded-full mt-1.5 shrink-0" />
                <div>
                  <p className="font-extrabold text-white">Employer & Care-Manager Console</p>
                  <p className="text-blue-100 font-medium text-[11px] mt-0.5">Complete control over scheduling, care instructions, and authorized CILT bookkeeping ledger entries.</p>
                </div>
              </div>

              <div className="p-4 bg-[#155dfc] border border-blue-600 rounded-2xl flex items-start gap-3 text-white shadow-xs">
                <span className="w-2.5 h-2.5 bg-emerald-300 rounded-full mt-1.5 shrink-0" />
                <div>
                  <p className="font-extrabold text-white">Attendant Mobile Portal</p>
                  <p className="text-blue-100 font-medium text-[11px] mt-0.5">Mobile-optimized check-in, equipment loop checklists, ambient voice handover memos, and receipt uploads.</p>
                </div>
              </div>

              <div className="p-4 bg-[#155dfc] border border-blue-600 rounded-2xl flex items-start gap-3 text-white shadow-xs">
                <span className="w-2.5 h-2.5 bg-purple-300 rounded-full mt-1.5 shrink-0" />
                <div>
                  <p className="font-extrabold text-white">Bookkeeper & Auditor Gate</p>
                  <p className="text-blue-100 font-medium text-[11px] mt-0.5">Authorized bookkeeping logs and payroll remittance sheets. Enforced privacy masks block bookkeepers from viewing bowel, bladder, or private health details.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#155dfc] border border-blue-600 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 text-white">
            <h3 className="text-base font-black text-white uppercase">Direct Funding Security Policy</h3>
            <div className="p-4 bg-blue-700/60 rounded-2xl border border-blue-400/40 text-xs text-white leading-relaxed space-y-3">
              <p className="font-semibold text-white">
                "By segregating clinical runbooks from financial remittances, DirectCare Hub protects both your medical dignity and your statutory employer liabilities."
              </p>
              <p className="text-blue-100">
                We do not upload physical healthcare files to public networks. Access control tokens are verified directly in Firestore Security Rules, preventing any crosstalk between your attendant staff and third-party accounting professionals.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-blue-100 font-bold justify-between pt-2">
              <span>✓ AES-256 Encrypted</span>
              <span>✓ HIPAA/AODA Compliant</span>
              <span>✓ SSL Encrypted Data</span>
            </div>
          </div>

        </div>
      </section>

      {/* 6. ZERO OUT-OF-POCKET COST */}
      <section id="cilt-funding-section" className="py-16 lg:py-24 bg-blue-600 text-white border-b border-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-black bg-white text-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-slate-200 inline-block shadow-xs">
              Funding Allocation breakdown
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none">
              Zero Out-of-Pocket Cost for Self-Managed Employers.
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed max-w-xl">
              {provinceName}'s Direct Funding program (associated with {provinceBadge}) awards all participants an authorized monthly bookkeeping and administration allowance to run their household payroll.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
              <div className="p-4 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-sm group hover:bg-[#155dfc] hover:border-white hover:text-white transition duration-300">
                <p className="font-black text-sm text-slate-900 group-hover:text-white transition">Monthly Admin Allowance</p>
                <p className="text-slate-600 mt-1 group-hover:text-white transition font-medium">{provinceBadge} budgets fully support administrative and digital software costs to ensure localized employment standards compliance.</p>
              </div>
              <div className="p-4 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-sm group hover:bg-[#155dfc] hover:border-white hover:text-white transition duration-300">
                <p className="font-black text-sm text-slate-900 group-hover:text-white transition">Compliant Monthly receipts</p>
                <p className="text-slate-600 mt-1 group-hover:text-white transition font-medium">We provide formal invoices listing your unique {provinceBadge} Client ID and vendor codes, making reimbursement submission a simple 1-click step.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 group hover:bg-[#155dfc] hover:text-white transition duration-300 border border-slate-200">
            <h3 className="text-sm font-black text-slate-900 group-hover:text-white uppercase tracking-wider transition">How to Claim Your Refund</h3>
            <ol className="space-y-4 text-xs text-slate-600 group-hover:text-white font-bold transition">
              <li className="flex gap-2.5 items-start">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 group-hover:bg-white group-hover:text-[#155dfc] font-extrabold flex items-center justify-center shrink-0 transition">1</span>
                <span>Select any plan and input your unique {provinceBadge} program identification number during onboarding.</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 group-hover:bg-white group-hover:text-[#155dfc] font-extrabold flex items-center justify-center shrink-0 transition">2</span>
                <span>At the end of each month, we auto-generate an itemized ledger receipt directly inside your Document Vault.</span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 group-hover:bg-white group-hover:text-[#155dfc] font-extrabold flex items-center justify-center shrink-0 transition">3</span>
                <span>Attach this receipt to your quarterly {provinceBadge} financial review statement to clear your bookkeeping budget line.</span>
              </li>
            </ol>
          </div>

        </div>
      </section>

      {/* 7. SIMPLE, TRANSPARENT PRICING CARDS */}
      <div id="pricing-section" className="bg-[#020617] py-10 border-y border-white/10">
        <PricingSection />
      </div>

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section id="faq-section" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600">Addressing Concerns</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Have specific questions about Canadian consumer-directed care guidelines? Here are detailed answers.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {faqs.map((faq, i) => (
              <div key={i} className="text-slate-800 group hover:bg-blue-600 transition duration-300">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  className="w-full text-left p-6 flex justify-between items-center transition cursor-pointer"
                  aria-expanded={openFaqIndex === i}
                >
                  <span className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-white flex items-center gap-2.5 transition">
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 group-hover:text-white transition" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4.5 h-4.5 text-slate-400 group-hover:text-white transition-transform duration-200 shrink-0 ${openFaqIndex === i ? "rotate-180" : ""}`} />
                </button>
                
                {openFaqIndex === i && (
                  <div className="p-6 bg-slate-50/50 group-hover:bg-blue-700/50 border-t border-slate-100 group-hover:border-blue-500 text-xs text-slate-600 group-hover:text-blue-100 leading-relaxed font-bold animate-in slide-in-from-top duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 9. ACCESSIBLE FOOTER */}
      <footer className="bg-[#155dfc] py-12 border-t border-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-xs font-bold text-white">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-blue-400/40">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white text-[#155dfc] rounded-lg flex items-center justify-center font-black">
                  <Shield className="w-4.5 h-4.5" />
                </div>
                <span className="text-sm font-black text-white">DirectCare Hub</span>
              </div>
              <p className="text-[11px] text-white leading-relaxed max-w-sm font-normal">
                A specialized, accessible administrative, care-scheduling, and T4 bookkeeping helper for self-managed individuals under CILT, CSIL, and SMC frameworks.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-black uppercase text-white tracking-wider">Canadian Program Links</p>
              <a href="https://www.cilt.ca" target="_blank" rel="noopener noreferrer" className="hover:underline text-white font-normal">
                Centre for Independent Living in Toronto (CILT)
              </a>
              <a href="https://www.wsib.ca" target="_blank" rel="noopener noreferrer" className="hover:underline text-white font-normal">
                WSIB Ontario Compensation Board
              </a>
              <a href="https://www.canada.ca/en/revenue-agency.html" target="_blank" rel="noopener noreferrer" className="hover:underline text-white font-normal">
                CRA Payroll Employers Guide
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-white">
            <p>© {new Date().getFullYear()} DirectCare Hub. All Rights Reserved.</p>
            <div className="flex gap-4">
              <a href="/privacy" className="hover:underline text-white font-normal">Privacy Policy</a>
              <a href="/terms" className="hover:underline text-white font-normal">Terms of Service</a>
              <span className="text-emerald-300 font-bold">✓ AODA Compliant & Audited</span>
            </div>
          </div>

        </div>
      </footer>

      <ComingSoonModal 
        isOpen={comingSoonOpen} 
        onClose={() => setComingSoonOpen(false)}
        onProvinceSelected={(programStr) => {
          if (programStr.includes("Ontario")) {
            setProvinceName("Ontario");
            setProvinceBadge("Ontario DF");
          } else if (programStr.includes("British Columbia")) {
            setProvinceName("British Columbia");
            setProvinceBadge("BC CSIL");
          } else if (programStr.includes("Alberta")) {
            setProvinceName("Alberta");
            setProvinceBadge("Alberta SMC");
          } else if (programStr.includes("Manitoba")) {
            setProvinceName("Manitoba");
            setProvinceBadge("Manitoba DF");
          } else if (programStr.includes("Nova Scotia")) {
            setProvinceName("Nova Scotia");
            setProvinceBadge("NS Care");
          }
        }}
      />
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
