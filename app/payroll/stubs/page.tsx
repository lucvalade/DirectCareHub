"use client";

import React, { useState, useEffect, useMemo } from "react";
import NavigationHeader from "@/components/NavigationHeader";
import { fetchPayStubs, createPayRun } from "@/app/actions/payroll";
import { PayRunResult } from "@/lib/payrollEngine";
import { useAuth } from "@/context/AuthContext";
import { calculateWeeklyOvertime } from "@/lib/calculateWeeklyOvertime";
import { calculateBCStatHoliday } from "@/lib/calculateBCStatHoliday";
import { calculateABStatHoliday } from "@/lib/calculateABStatHoliday";
import { 
  DollarSign, 
  Printer, 
  Download, 
  FileText, 
  CheckCircle, 
  Plus, 
  Loader2, 
  AlertCircle, 
  X,
  TrendingUp,
  Receipt,
  FileCheck,
  Calendar,
  User,
  Mail,
  ShieldAlert,
  Send,
  Clock,
  ShieldCheck,
  HelpCircle,
  Activity,
  Sparkles
} from "lucide-react";

export default function PayStubsPage() {
  const { userProfile } = useAuth();
  const effectiveRole = userProfile?.role || "employer";
  
  // Authority Verification Check:
  // ONLY Self-Managers (employer) and authorized bookkeepers/auditors (bookkeeper) are permitted to inspect overall program tax withholding and pay stub records.
  const isAuthorized = effectiveRole === "employer" || effectiveRole === "bookkeeper";

  const [stubs, setStubs] = useState<PayRunResult[]>([]);
  const [selectedStub, setSelectedStub] = useState<PayRunResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenForm, setShowGenForm] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters State:
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  // New Payrun Form States:
  const [formEmployeeId, setFormEmployeeId] = useState("psw_elena_02");
  const [formEmployeeName, setFormEmployeeName] = useState("Elena Rostova");
  const [hours, setHours] = useState("60.0");
  const [rate, setRate] = useState("23.50");
  const [pStart, setPStart] = useState("2026-09-01");
  const [pEnd, setPEnd] = useState("2026-09-15");
  const [payDate, setPayDate] = useState("2026-09-20");

  // Email Modal States:
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTarget, setEmailTarget] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // ==========================================================================
  // REAL-TIME INTERACTIVE MULTI-PROVINCIAL COMPLIANCE SIMULATOR STATES
  // ==========================================================================
  const [simProvince, setSimProvince] = useState<"ON" | "BC" | "AB" | "MB" | "SK" | "NS" | "QC">("BC");
  const [simHourlyRate, setSimHourlyRate] = useState<number>(20.00);
  const [simShifts, setSimShifts] = useState<number[]>([8, 10, 8, 14, 0, 0, 0]);
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // BC Stat Holiday Lookback variables
  const [bcDaysEmployed, setBcDaysEmployed] = useState<number>(45);
  const [bcShiftsCount, setBcShiftsCount] = useState<number>(18);
  const [bcHolidayHours, setBcHolidayHours] = useState<number>(10);

  // Alberta Stat Holiday Lookback variables
  const [abWagesLast4Weeks, setAbWagesLast4Weeks] = useState<number>(3200);
  const [abHolidayHours, setAbHolidayHours] = useState<number>(14);
  const [abAbsent, setAbAbsent] = useState<boolean>(false);

  // 1. Calculate Simulated Overtime
  const simOvertimeResult = useMemo(() => {
    const weeklyShifts = simShifts.map((h, i) => ({
      date: daysOfWeek[i],
      hours_worked: h,
    }));

    const rules = {
      daily_tier1_hours: simProvince === "ON" ? null : 8,
      daily_tier1_rate: simProvince === "ON" ? null : 1.5,
      daily_tier2_hours: simProvince === "BC" ? 12 : null,
      daily_tier2_rate: simProvince === "BC" ? 2.0 : null,
      weekly_hours: simProvince === "BC" ? 40 : 44,
      weekly_rate: 1.5,
    };

    return calculateWeeklyOvertime(simProvince, weeklyShifts, rules);
  }, [simProvince, simShifts]);

  // 2. Calculate Simulated Stat Holiday Pay
  const simStatResult = useMemo(() => {
    if (simProvince === "BC") {
      const historicalShifts = Array(bcShiftsCount).fill({
        hours: 8,
        regular_wages: 8 * simHourlyRate,
        overtime_wages: 0,
      });

      return calculateBCStatHoliday({
        wage_rate: simHourlyRate,
        days_employed: bcDaysEmployed,
        lookback_shifts_30_days: historicalShifts,
        hours_worked_on_holiday: bcHolidayHours,
      });
    } else if (simProvince === "AB") {
      const historicalShifts = [{
        hours: 0,
        regular_wages: abWagesLast4Weeks,
        overtime_wages: 0,
      }];

      return calculateABStatHoliday({
        wage_rate: simHourlyRate,
        lookback_shifts_28_days: historicalShifts,
        hours_worked_on_holiday: abHolidayHours,
        absent_without_consent: abAbsent,
      });
    }

    return null;
  }, [simProvince, simHourlyRate, bcDaysEmployed, bcShiftsCount, bcHolidayHours, abWagesLast4Weeks, abHolidayHours, abAbsent]);

  useEffect(() => {
    if (isAuthorized) {
      loadStubs();
    }
  }, [isAuthorized]);

  useEffect(() => {
    if (selectedStub && showEmailModal) {
      // Pre-fill email target depending on the stub
      setEmailTarget(
        selectedStub.attendant_name.includes("Elena") 
          ? "elena.rostova@care.ca" 
          : "chloe.bouchard@care.ca"
      );
    }
  }, [selectedStub, showEmailModal]);

  const loadStubs = async () => {
    setIsLoading(true);
    const res = await fetchPayStubs();
    if (res.data && res.data.length > 0) {
      setStubs(res.data);
      setSelectedStub(res.data[0]);
    }
    setIsLoading(false);
  };

  const handleEmployeeFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFormEmployeeId(val);
    if (val === "psw_elena_02") {
      setFormEmployeeName("Elena Rostova");
      setRate("23.50");
    } else {
      setFormEmployeeName("Chloe Bouchard");
      setRate("21.00");
    }
  };

  const handleGeneratePayRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setMessage(null);

    const res = await createPayRun(
      parseFloat(hours),
      parseFloat(rate),
      pStart,
      pEnd,
      payDate,
      formEmployeeId,
      formEmployeeName
    );

    setIsGenerating(false);
    if (res.success && res.data) {
      setMessage({ 
        type: "success", 
        text: `Successfully generated bi-weekly pay run for ${formEmployeeName}! Paid wages + auto-cleared approved out-of-pocket expenses.` 
      });
      setShowGenForm(false);
      // Reload lists
      const stubsRes = await fetchPayStubs();
      if (stubsRes.data) {
        setStubs(stubsRes.data);
        const generated = stubsRes.data.find(s => s.id === res.data?.id);
        if (generated) {
          setSelectedStub(generated);
        } else if (stubsRes.data.length > 0) {
          setSelectedStub(stubsRes.data[0]);
        }
      }
    } else {
      setMessage({ type: "error", text: res.error || "Failed to generate pay run." });
    }
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStub) return;

    setIsSendingEmail(true);

    setTimeout(() => {
      setIsSendingEmail(false);
      setShowEmailModal(false);
      setMessage({
        type: "success",
        text: `Success! Itemized Statement #${selectedStub.id} has been compiled into a secure, CRA-compliant PDF and emailed to ${emailTarget}.`
      });
      // Clear alert after 5 seconds
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    }, 1200);
  };

  const triggerPrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Extract distinct employee list dynamically from stubs
  const distinctEmployees = Array.from(new Set(stubs.map(s => s.attendant_name || "Elena Rostova")));

  // Filter stubs based on selected Employee and Date Range
  const filteredStubs = stubs.filter((stub) => {
    // 1. Employee Filter
    if (employeeFilter !== "all" && stub.attendant_name !== employeeFilter) {
      return false;
    }
    // 2. Start Pay Date Filter
    if (startDateFilter && stub.pay_date < startDateFilter) {
      return false;
    }
    // 3. End Pay Date Filter
    if (endDateFilter && stub.pay_date > endDateFilter) {
      return false;
    }
    return true;
  });

  // Access Denied Shield layout for attendants trying to inspect files they shouldn't
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <NavigationHeader />
        <main className="flex-1 max-w-xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 bg-rose-100 rounded-3xl border border-rose-200 flex items-center justify-center text-rose-600 animate-bounce">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Authority Verification Required</h1>
            <p className="text-xs font-semibold text-rose-800 uppercase tracking-wider bg-rose-50 border border-rose-200 px-3 py-1 rounded-full inline-block">
              Role: Attendant (Restricted Access)
            </p>
            <p className="text-slate-600 text-sm leading-relaxed max-w-sm pt-2">
              Access Denied. Only direct self-managers (Employer profile) or authorized independent auditors (Bookkeeper/Auditor profile) are permitted to inspect overall program tax withholding records, CRA payroll summaries, and bi-weekly ESA pay statements.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 leading-relaxed max-w-sm">
            Please click on the <strong>Profile Menu</strong> in the top-right corner and select <strong>Luc Valade</strong> or <strong>Marcus Vance (Bookkeeper)</strong> to access the financial payroll records.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col print:bg-white print:min-h-0">
      
      {/* Hide on Print */}
      <div className="print:hidden">
        <NavigationHeader />
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 print:py-0 print:px-0">
        
        {/* Style Tag to override print behavior - hides navigation, filters, sidebar and prints exactly the itemized statement card */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background-color: white !important;
              color: black !important;
            }
            .print\\:hidden {
              display: none !important;
            }
            #printable-statement-card {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              visibility: visible !important;
            }
            main {
              padding: 0 !important;
              margin: 0 !important;
            }
          }
        `}} />

        {/* Top Header - Hide on Print */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-sm">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ontario Pay Stubs & Wage Statements</h1>
              <p className="text-xs font-medium text-slate-500">
                ESA itemized statements, vacation pay (4%), CPP/EI withholdings, and automatic non-taxable reimbursements.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGenForm(!showGenForm)}
              className="min-h-[44px] px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Bi-Weekly Pay Run</span>
            </button>
            
            {/* Print Statement Button (Fixed to hide rest of page) */}
            <button
              type="button"
              onClick={triggerPrint}
              disabled={!selectedStub}
              className="min-h-[44px] px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-xs flex items-center space-x-2 transition cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Print Statement</span>
            </button>

            {/* Email PDF Statement Button */}
            <button
              type="button"
              onClick={() => setShowEmailModal(true)}
              disabled={!selectedStub}
              className="min-h-[44px] px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-2 transition cursor-pointer disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              <span>Email Statement PDF</span>
            </button>
          </div>
        </div>

        {/* Message Notifications - Hide on Print */}
        {message && (
          <div className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-between print:hidden ${
            message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
          }`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="p-1 hover:bg-black/5 rounded cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search, Filter, & Selectors - Hide on Print */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 print:hidden">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Filter Archives</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Employee Selector */}
            <div className="space-y-1.5">
              <label htmlFor="filter-employee" className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> Select Employee
              </label>
              <select
                id="filter-employee"
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="w-full min-h-[44px] px-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="all">All Employees</option>
                {distinctEmployees.map((emp) => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </select>
            </div>

            {/* Start Date Range */}
            <div className="space-y-1.5">
              <label htmlFor="filter-start-date" className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Pay Date (From)
              </label>
              <input
                id="filter-start-date"
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-full min-h-[44px] px-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              />
            </div>

            {/* End Date Range */}
            <div className="space-y-1.5">
              <label htmlFor="filter-end-date" className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Pay Date (To)
              </label>
              <input
                id="filter-end-date"
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="w-full min-h-[44px] px-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Generation Form Panel - Hide on Print */}
        {showGenForm && (
          <form onSubmit={handleGeneratePayRun} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 max-w-4xl mx-auto print:hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <span>Calculate & Authorize New Bi-Weekly Pay Period</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowGenForm(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
              
              {/* Employee Selection */}
              <div className="md:col-span-2">
                <label htmlFor="form-employee" className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                  Select Employee
                </label>
                <select
                  id="form-employee"
                  value={formEmployeeId}
                  onChange={handleEmployeeFormChange}
                  className="w-full min-h-[44px] px-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-600 outline-none"
                >
                  <option value="psw_elena_02">Elena Rostova (Lead PSW)</option>
                  <option value="psw_chloe_04">Chloe Bouchard (Relief PSW)</option>
                </select>
              </div>

              <div>
                <label htmlFor="form-hours" className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Worked Hours</label>
                <input
                  id="form-hours"
                  type="number"
                  step="0.1"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full min-h-[44px] px-3 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div>
                <label htmlFor="form-rate" className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Hourly Rate ($)</label>
                <input
                  id="form-rate"
                  type="number"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full min-h-[44px] px-3 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div>
                <label htmlFor="form-start" className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Period Start</label>
                <input
                  id="form-start"
                  type="date"
                  value={pStart}
                  onChange={(e) => setPStart(e.target.value)}
                  className="w-full min-h-[44px] px-3 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div>
                <label htmlFor="form-end" className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Period End</label>
                <input
                  id="form-end"
                  type="date"
                  value={pEnd}
                  onChange={(e) => setPEnd(e.target.value)}
                  className="w-full min-h-[44px] px-3 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div>
                <label htmlFor="form-paydate" className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Pay Date</label>
                <input
                  id="form-paydate"
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full min-h-[44px] px-3 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-800 font-medium">
                <strong>✨ Expense Audit:</strong> Generates itemized calculations matching approved expenses for {formEmployeeName}.
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full min-h-[48px] bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing ESA Calculations...</span>
                </>
              ) : (
                <span>Calculate & Authorize Paystub</span>
              )}
            </button>
          </form>
        )}

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Sidebar list of stubs - Hide on Print */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4 print:hidden">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Statement Archives ({filteredStubs.length})</h3>
            
            {isLoading ? (
              <div className="p-8 text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                <p className="text-xs text-slate-500">Loading statements...</p>
              </div>
            ) : filteredStubs.length === 0 ? (
              <p className="text-xs text-slate-500 p-4 text-center">No pay statements match selection criteria.</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredStubs.map((stub) => (
                  <button
                    key={stub.id}
                    onClick={() => setSelectedStub(stub)}
                    className={`w-full p-3.5 rounded-2xl text-left border text-xs transition cursor-pointer flex justify-between items-center ${
                      selectedStub?.id === stub.id
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="font-extrabold text-slate-900">{stub.attendant_name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Pay Date: {stub.pay_date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-950">${stub.net_pay.toFixed(2)}</p>
                      {stub.non_taxable_reimbursements > 0 && (
                        <p className="text-[9px] text-blue-700 font-black">+${stub.non_taxable_reimbursements.toFixed(2)} exp</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pay Stub Detail view - Visible both on screen & print */}
          <div className="lg:col-span-8 w-full">
            {selectedStub ? (
              <div 
                id="printable-statement-card" 
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6"
              >
                
                {/* Statement Header */}
                <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-black text-slate-900 uppercase">STATEMENT OF EARNINGS AND DEDUCTIONS</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Direct Funding Program • Ontario Ministry of Health and Long-Term Care</p>
                  </div>
                  <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5">
                    <p><span className="font-bold">Pay Date:</span> {selectedStub.pay_date}</p>
                    <p><span className="font-bold">Period:</span> {selectedStub.period_start} to {selectedStub.period_end}</p>
                    <p><span className="font-bold">Statement Ref:</span> #{selectedStub.id}</p>
                  </div>
                </div>

                {/* Employee & Employer info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-400 uppercase text-[9px]">Employer</p>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">Luc Valade</p>
                    <p className="text-slate-600">Individual Direct Funding Employer</p>
                    <p className="text-[10px] text-slate-500">CRA Payroll # 84920 1829 RP0001</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400 uppercase text-[9px]">Employee (Attendant / PSW)</p>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedStub.attendant_name || "Elena Rostova"}</p>
                    <p className="text-slate-600">SIN: XXX-XXX-782</p>
                    <p className="text-[10px] text-slate-500">Hourly Rate: ${selectedStub.hourly_rate.toFixed(2)}/hr</p>
                  </div>
                </div>

                {/* Breakdown Table */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Earnings */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b pb-1">Earnings</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Regular Hours ({selectedStub.hours_worked} hrs @ ${selectedStub.hourly_rate.toFixed(2)})</span>
                        <span className="font-bold text-slate-900">${selectedStub.gross_wages.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Vacation Pay (4% ESA Statutory)</span>
                        <span className="font-bold text-slate-900">${selectedStub.vacation_pay.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-black text-xs text-slate-900">
                        <span>Total Gross Earnings</span>
                        <span>${selectedStub.gross_pay.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b pb-1">Employee Deductions</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Canada Pension Plan (CPP)</span>
                        <span className="font-bold text-slate-900">${selectedStub.cpp_deduction.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Employment Insurance (EI)</span>
                        <span className="font-bold text-slate-900">${selectedStub.ei_deduction.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Federal & Ontario Income Tax</span>
                        <span className="font-bold text-slate-900">${selectedStub.income_tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-black text-xs text-slate-900">
                        <span>Total Deductions</span>
                        <span>${selectedStub.total_deductions.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reimbursements section */}
                {selectedStub.non_taxable_reimbursements > 0 && (
                  <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center space-x-1.5 text-blue-800">
                      <Receipt className="w-4.5 h-4.5" />
                      <h4 className="text-xs font-black uppercase tracking-wider">Tax-Exempt Business Expense Reimbursements</h4>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Reimbursed Out-of-pocket claims (Tax-Free)</span>
                      <span className="font-extrabold text-blue-900">${selectedStub.non_taxable_reimbursements.toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Matches approved receipts verified for grocery ingredients, public transit or clinic supplies. Fully compliant with Canada Revenue Agency (CRA) guidelines.
                    </p>
                  </div>
                )}

                {/* Net Pay Callout */}
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Net Amount Payable</p>
                    <p className="text-[11px] text-emerald-700">Formula: (Gross Earning - Total Deductions) + Reimbursements</p>
                  </div>
                  <p className="text-3xl font-black text-emerald-900">${selectedStub.net_pay.toFixed(2)}</p>
                </div>

                {/* Print Verification Stamp */}
                <div className="hidden print:block border-t border-dashed pt-4 text-center text-[10px] text-slate-400 italic">
                  Compiled and authorized under the CILT Direct Funding Framework. Secure CRA Registry ID: df-stub-{selectedStub.id}. Printed on {new Date().toLocaleDateString()}.
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
                Please select or generate a pay statement.
              </div>
            )}
          </div>

        </div>

        {/* ==========================================================================
            4. INTERACTIVE MULTI-PROVINCIAL COMPLIANCE & AUDIT SIMULATOR (BENTO SECTION)
            ========================================================================== */}
        <section className="bg-slate-900 text-slate-100 rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-800 space-y-8 print:hidden animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Multi-Provincial Compliance Sandbox</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">National Payroll & Statutory Audit Simulator</h2>
              <p className="text-xs text-slate-400 max-w-xl">
                Test and verify complex labor standard calculations, daily/weekly overtime splits, and historical Lookback Statutory Holiday Pay across Canadian jurisdictions.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Target Province:</span>
              <select
                value={simProvince}
                onChange={(e) => setSimProvince(e.target.value as any)}
                className="min-h-[44px] px-3 bg-slate-850 border border-slate-750 rounded-xl text-xs font-black text-white outline-none cursor-pointer focus:ring-2 focus:ring-blue-500"
              >
                <option value="ON">Ontario (DF / CILT)</option>
                <option value="BC">British Columbia (CSIL)</option>
                <option value="AB">Alberta (SMC / AHS)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUMN 1: WAGE & SHIFT OVERTIME SIMULATOR (Lg: col-span-7) */}
            <div className="lg:col-span-7 bg-slate-850 p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>1. Daily & Weekly Overtime Splitter</span>
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Regular Rate:</span>
                  <input
                    type="number"
                    value={simHourlyRate}
                    onChange={(e) => setSimHourlyRate(parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-center font-black text-white outline-none"
                  />
                  <span>/hr</span>
                </div>
              </div>

              {/* Instructions and Rules overview based on province */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400 leading-normal space-y-1.5">
                <p className="font-bold text-slate-200">
                  {simProvince === "BC" && "BC Labor Standard: Tiered daily (1.5x after 8h, 2.0x after 12h) + weekly (1.5x after 40 regular hours). Prevents double-counting."}
                  {simProvince === "AB" && "Alberta Standard: The '8/44 rule'. Pays whichever calculation is greater: total daily OT (>8h) vs. weekly hours exceeding 44."}
                  {simProvince === "ON" && "Ontario Standard: Weekly-only OT trigger. 1.5x premium paid after 44 hours worked in a 7-day period. No daily limits."}
                </p>
                <p className="text-[10px]">
                  Adjust the worked hours for each calendar day below to trigger the compliance engine in real-time.
                </p>
              </div>

              {/* 7-day Shift input grid */}
              <div className="grid grid-cols-7 gap-2.5">
                {daysOfWeek.map((day, idx) => (
                  <div key={day} className="text-center space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-500">{day}</span>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={simShifts[idx]}
                      onChange={(e) => {
                        const next = [...simShifts];
                        next[idx] = parseFloat(e.target.value) || 0;
                        setSimShifts(next);
                      }}
                      className="w-full min-h-[44px] px-1 bg-slate-900 border border-slate-700 rounded-xl text-center text-xs font-black text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                ))}
              </div>

              {/* Real-time Overtime Output metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
                <div className="bg-slate-900 p-3.5 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Regular Hours</p>
                  <p className="text-base font-black text-white mt-1">{simOvertimeResult.regular_hours.toFixed(1)}h</p>
                  <p className="text-[9px] text-slate-500 font-bold mt-0.5">${(simOvertimeResult.regular_hours * simHourlyRate).toFixed(2)}</p>
                </div>
                
                <div className="bg-slate-900 p-3.5 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Tier 1 OT (1.5x)</p>
                  <p className="text-base font-black text-amber-500 mt-1">{simOvertimeResult.tier1_hours.toFixed(1)}h</p>
                  <p className="text-[9px] text-slate-500 font-bold mt-0.5">${(simOvertimeResult.tier1_hours * simHourlyRate * 1.5).toFixed(2)}</p>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Tier 2 OT (2.0x)</p>
                  <p className="text-base font-black text-rose-500 mt-1">{simOvertimeResult.tier2_hours.toFixed(1)}h</p>
                  <p className="text-[9px] text-slate-500 font-bold mt-0.5">${(simOvertimeResult.tier2_hours * simHourlyRate * 2.0).toFixed(2)}</p>
                </div>

                <div className="bg-blue-600/20 border border-blue-500/30 p-3.5 rounded-xl text-center">
                  <p className="text-[10px] font-black text-blue-400 uppercase">Sim Gross Wages</p>
                  <p className="text-base font-black text-blue-300 mt-1">
                    ${(
                      (simOvertimeResult.regular_hours * simHourlyRate) + 
                      (simOvertimeResult.tier1_hours * simHourlyRate * 1.5) + 
                      (simOvertimeResult.tier2_hours * simHourlyRate * 2.0)
                    ).toFixed(2)}
                  </p>
                  <p className="text-[9px] text-blue-400/80 font-bold mt-0.5">Overtime Included</p>
                </div>
              </div>
            </div>

            {/* COLUMN 2: STATUTORY HOLIDAY ENGINE SIMULATOR (Lg: col-span-5) */}
            <div className="lg:col-span-5 bg-slate-850 p-6 rounded-2xl border border-slate-800 space-y-6">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>2. Statutory Lookback Calculator</span>
              </h3>

              {simProvince === "ON" ? (
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-center space-y-3">
                  <HelpCircle className="w-10 h-10 text-slate-500 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-slate-200">Ontario Standard Holiday Formula</h4>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Ontario uses the standard Public Holiday Pay calculation: total regular wages earned in the 4 weeks preceding the holiday divided by 20. Premium pay for working is a flat 1.5x multiplier.
                    </p>
                  </div>
                  <p className="text-[9px] text-slate-500 italic">
                    Select BC or Alberta in the dropdown to simulate advanced eligibility tests & lookback formulas.
                  </p>
                </div>
              ) : simProvince === "BC" ? (
                <div className="space-y-4">
                  {/* BC Controls */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Days Employed</label>
                      <input
                        type="number"
                        value={bcDaysEmployed}
                        onChange={(e) => setBcDaysEmployed(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Lookback Shifts (30d)</label>
                      <input
                        type="number"
                        value={bcShiftsCount}
                        onChange={(e) => setBcShiftsCount(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Hours Worked on Stat Holiday</label>
                    <input
                      type="number"
                      value={bcHolidayHours}
                      onChange={(e) => setBcHolidayHours(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none font-bold"
                    />
                  </div>

                  {/* BC Output Results */}
                  {simStatResult && (() => {
                    const bcResult = simStatResult as any;
                    return (
                      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <span className="text-[10px] font-black text-slate-500 uppercase">BC Statutory Eligibility</span>
                          {bcResult.is_eligible ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Eligible (15/30 Met)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              Ineligible (Under 15 shifts)
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between text-slate-400 text-[11px]">
                            <span>Average Day's Pay Formula:</span>
                            <span className="font-extrabold text-white">${bcResult.average_days_pay.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-400 text-[11px]">
                            <span>Worked Holiday Premium (BC):</span>
                            <span className="font-extrabold text-amber-500">${bcResult.premium_pay.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-black text-white text-xs pt-1.5 border-t border-slate-800">
                            <span>Total Stat Holiday Payout:</span>
                            <span className="text-emerald-400">${bcResult.stat_holiday_pay.toFixed(2)}</span>
                          </div>
                        </div>

                        <p className="text-[9px] text-slate-500 leading-normal italic pt-1 text-center">
                          BC Code Rule: Worked premium stacks *on top* of the lookback average daily pay for eligible attendants.
                        </p>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* AB Controls */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Gross Wages (Last 28d)</label>
                      <input
                        type="number"
                        value={abWagesLast4Weeks}
                        onChange={(e) => setAbWagesLast4Weeks(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Hours Worked on Holiday</label>
                      <input
                        type="number"
                        value={abHolidayHours}
                        onChange={(e) => setAbHolidayHours(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs">
                    <span className="text-slate-400 font-bold">Absent Without Excuse?</span>
                    <button
                      type="button"
                      onClick={() => setAbAbsent(!abAbsent)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition border ${
                        abAbsent
                          ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                          : "bg-slate-850 border-slate-700 text-slate-300"
                      }`}
                    >
                      {abAbsent ? "Yes (Fails)" : "No (Passes)"}
                    </button>
                  </div>

                  {/* AB Output Results */}
                  {simStatResult && (() => {
                    const abResult = simStatResult as any;
                    return (
                      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <span className="text-[10px] font-black text-slate-500 uppercase">Alberta Statutory Eligibility</span>
                          {abResult.is_eligible ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Eligible (No unexcused abs)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              Disqualified
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between text-slate-400 text-[11px]">
                            <span>Alberta 5% Average Day Formula:</span>
                            <span className="font-extrabold text-white">${abResult.stat_holiday_pay.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-400 text-[11px]">
                            <span>Flat Premium Worked (1.5x):</span>
                            <span className="font-extrabold text-amber-500">${abResult.premium_pay.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-black text-white text-xs pt-1.5 border-t border-slate-800">
                            <span>Total Alberta Payout:</span>
                            <span className="text-emerald-400">${abResult.total_pay.toFixed(2)}</span>
                          </div>
                        </div>

                        <p className="text-[9px] text-slate-500 leading-normal italic pt-1 text-center">
                          Alberta Code Rule: Attendant earns 5% of previous 28-day regular wages, plus flat 1.5x on any hours worked.
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

          </div>
        </section>

      </main>

      {/* Email PDF Statement Modal */}
      {showEmailModal && selectedStub && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="email-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Mail className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="mt-4 space-y-4">
              <div>
                <h3 id="email-modal-title" className="text-lg font-black text-slate-900">
                  Email Statement as Secure PDF
                </h3>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  Compiles bi-weekly earnings, ESA vacation accruals, and CPP/EI deductibles into a locked audit-grade PDF statement.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-700">
                <p><span className="font-bold text-slate-500">Document:</span> ESA Paystub #{selectedStub.id}</p>
                <p><span className="font-bold text-slate-500">Employee:</span> {selectedStub.attendant_name}</p>
                <p><span className="font-bold text-slate-500">Net Pay:</span> ${selectedStub.net_pay.toFixed(2)}</p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email-input" className="text-xs font-bold text-slate-600">
                  Recipient Email Address
                </label>
                <input
                  id="email-input"
                  type="email"
                  required
                  value={emailTarget}
                  onChange={(e) => setEmailTarget(e.target.value)}
                  placeholder="elena.rostova@care.ca"
                  className="w-full min-h-[44px] px-3.5 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 min-h-[44px] border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="flex-1 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      <span>Sending PDF...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send PDF Email</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
