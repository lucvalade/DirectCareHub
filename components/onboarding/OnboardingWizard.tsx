'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Users, 
  FileText, 
  Activity, 
  DollarSign, 
  Clock, 
  Building, 
  AlertTriangle,
  HelpCircle,
  Save,
  Check
} from 'lucide-react';

export default function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const submitTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) {
        clearTimeout(submitTimerRef.current);
      }
    };
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Employer & Direct Funding
    employerName: 'Alex Morgan',
    ciltId: 'DF-ON-84920',
    allocatedHoursPerMonth: 160,
    craBusinessNumber: '893472910 RP 0001',
    wsibNumber: 'WSIB-492019-ON',
    
    // Step 2: Care & Equipment Protocols
    liftModel: 'Arjo MaxiSky 2 Ceiling Lift',
    slingModel: 'Medium Mesh Quick-Fit Sling (#DF-204)',
    slingLoops: 'Shoulder Level 3 (Grey) / Leg Level 2 (Blue - Crossed)',
    catheterProtocol: 'Coloplast SpeediCath 14Fr sterile no-touch technique',
    skinCheckAreas: 'Sacrum, Ischial Tuberosities, Greater Trochanters, Heels',
    emergencyReliefNotes: 'In case of autonomic dysreflexia, immediately sit upright, loosen tight clothing, check catheter for blockages, and call emergency contact.',

    // Step 3: Attendant Team Setup
    primaryAttendantName: 'Sarah Jenkins, PSW',
    primaryAttendantEmail: 'sarah.jenkins@example.com',
    primaryAttendantRate: '20.00',
    backupAttendantName: 'Michael Chang, PSW',
    backupAttendantEmail: 'michael.chang@example.com',
    backupAttendantPhone: '416-555-0192',

    // Step 4: Ontario Payroll & Compliance Rules
    payFrequency: 'Semi-Monthly (1st-15th & 16th-End)',
    vacationPayOption: '4% paid on every pay cheque (Ontario ESA Standard)',
    remittanceReminder: true,
    etransferEnabled: true
  });

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsSubmitting(true);
    // Save to localStorage so settings persist locally
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('careself_onboarding_completed', 'true');
        localStorage.setItem('careself_employer_config', JSON.stringify(formData));
      } catch (e) {
        console.error(e);
      }
    }

    if (submitTimerRef.current) {
      clearTimeout(submitTimerRef.current);
    }
    submitTimerRef.current = setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 1000);
  };

  const steps = [
    { number: 1, title: 'Direct Funding & Employer', icon: Building, desc: 'CILT ID, CRA & WSIB' },
    { number: 2, title: 'Care & Transfer Protocols', icon: Activity, desc: 'Ceiling lift, sling & hygiene' },
    { number: 3, title: 'Attendant Team & Backup', icon: Users, desc: 'PSW roster & emergency contacts' },
    { number: 4, title: 'Payroll & ESA Settings', icon: DollarSign, desc: 'Wage rates & CRA compliance' },
    { number: 5, title: 'Review & Activate', icon: Sparkles, desc: 'Verify and launch dashboard' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Wizard Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Ontario Direct Funding (DF) Self-Management Setup</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              DirectCare Hub Onboarding Wizard
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Configure your employer profile, customized ceiling lift transfers, medical routines, attendant wage rates, and CRA payroll settings in 5 simple steps.
            </p>
          </div>

          <button
            onClick={() => router.push('/protocols/dashboard')}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 transition px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 self-start sm:self-center whitespace-nowrap"
          >
            Skip to Dashboard →
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-2 border-t border-slate-100 pt-6">
          {steps.map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.number;
            const isCurrent = currentStep === s.number;

            return (
              <button
                key={s.number}
                onClick={() => setCurrentStep(s.number)}
                className={`p-3 rounded-2xl text-left transition flex flex-col justify-between border cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-600/20'
                    : isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-50'
                    : 'bg-slate-50/60 border-slate-200 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : s.number}
                  </span>
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-blue-700' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                </div>
                <div>
                  <p className={`text-xs font-bold ${isCurrent ? 'text-blue-950' : 'text-slate-900'}`}>{s.title}</p>
                  <p className="text-[10px] text-slate-500 truncate">{s.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        {/* STEP 1: Direct Funding & Employer Info */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">Step 1: Direct Funding & Employer Information</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your official Ontario Direct Funding program details and CRA employer payroll credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Employer Full Legal Name
                </label>
                <input
                  type="text"
                  value={formData.employerName}
                  onChange={(e) => updateForm('employerName', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="e.g., Alex Morgan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Direct Funding (CILT) Participant ID
                </label>
                <input
                  type="text"
                  value={formData.ciltId}
                  onChange={(e) => updateForm('ciltId', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="e.g., DF-ON-84920"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Monthly Allocated Attendant Care Hours
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.allocatedHoursPerMonth}
                    onChange={(e) => updateForm('allocatedHoursPerMonth', Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <span className="absolute right-4 top-3 text-xs font-bold text-slate-400">hours/month</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Direct Funding allocated budget (e.g. 160 hrs = approx 5.3 hrs/day)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  CRA Employer Payroll Number (RP)
                </label>
                <input
                  type="text"
                  value={formData.craBusinessNumber}
                  onChange={(e) => updateForm('craBusinessNumber', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  placeholder="123456789 RP 0001"
                />
                <p className="text-[11px] text-slate-500 mt-1">Required for monthly CRA Receiver General remittances</p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  WSIB Employer Account Number
                </label>
                <input
                  type="text"
                  value={formData.wsibNumber}
                  onChange={(e) => updateForm('wsibNumber', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="e.g., WSIB-492019-ON"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Care & Equipment Protocols */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">Step 2: Care Protocols & Assistive Equipment</h2>
              <p className="text-xs text-slate-500 mt-1">
                Define the precise mechanical transfer loops, sling models, and personal medical hygiene protocols to ensure safety and PHIPA compliance.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ceiling / Mechanical Lift Model
                  </label>
                  <input
                    type="text"
                    value={formData.liftModel}
                    onChange={(e) => updateForm('liftModel', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Sling Model & Size
                  </label>
                  <input
                    type="text"
                    value={formData.slingModel}
                    onChange={(e) => updateForm('slingModel', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Transfer Sling Loop Level Configuration
                </label>
                <input
                  type="text"
                  value={formData.slingLoops}
                  onChange={(e) => updateForm('slingLoops', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">e.g., Shoulder loops level 3 (Grey) / Leg loops crossed on level 2 (Blue)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Catheterization & Sterile Bladder Protocol
                </label>
                <textarea
                  rows={2}
                  value={formData.catheterProtocol}
                  onChange={(e) => updateForm('catheterProtocol', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Daily Skin Integrity Checkpoints
                </label>
                <input
                  type="text"
                  value={formData.skinCheckAreas}
                  onChange={(e) => updateForm('skinCheckAreas', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                <label className="block text-xs font-bold text-rose-900 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Emergency Health Instructions (e.g. Autonomic Dysreflexia)</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.emergencyReliefNotes}
                  onChange={(e) => updateForm('emergencyReliefNotes', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-rose-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Attendant Team & Emergency Backup Roster */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">Step 3: Attendant Team & Emergency Roster</h2>
              <p className="text-xs text-slate-500 mt-1">
                Add your primary personal support workers (PSWs) and secondary backup attendants for last-minute emergency SOS coverage.
              </p>
            </div>

            <div className="space-y-5">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center space-x-1.5">
                  <Users className="w-4 h-4" />
                  <span>Primary Attendant (PSW)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.primaryAttendantName}
                      onChange={(e) => updateForm('primaryAttendantName', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">e-Transfer Email</label>
                    <input
                      type="email"
                      value={formData.primaryAttendantEmail}
                      onChange={(e) => updateForm('primaryAttendantEmail', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hourly Wage Rate</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">$</span>
                      <input
                        type="text"
                        value={formData.primaryAttendantRate}
                        onChange={(e) => updateForm('primaryAttendantRate', e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Backup Attendant (Emergency SOS Roster)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.backupAttendantName}
                      onChange={(e) => updateForm('backupAttendantName', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone (SMS SOS)</label>
                    <input
                      type="tel"
                      value={formData.backupAttendantPhone}
                      onChange={(e) => updateForm('backupAttendantPhone', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.backupAttendantEmail}
                      onChange={(e) => updateForm('backupAttendantEmail', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Payroll & Ontario ESA Settings */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">Step 4: Ontario Payroll & ESA Compliance</h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure vacation pay calculations, payroll frequency, and automated CRA remittance alerts.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ontario ESA 4% Vacation Pay Policy
                </label>
                <select
                  value={formData.vacationPayOption}
                  onChange={(e) => updateForm('vacationPayOption', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold cursor-pointer focus:ring-2 focus:ring-blue-600"
                >
                  <option>4% paid on every pay cheque (Ontario ESA Standard)</option>
                  <option>Accrued and paid upon request / year end</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Under the Ontario Employment Standards Act (ESA), Direct Funding employers typically disburse the mandatory 4% vacation pay on each wage statement.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pay Run Frequency
                </label>
                <select
                  value={formData.payFrequency}
                  onChange={(e) => updateForm('payFrequency', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold cursor-pointer focus:ring-2 focus:ring-blue-600"
                >
                  <option>Semi-Monthly (1st-15th & 16th-End of Month)</option>
                  <option>Bi-Weekly (Every 2 Weeks on Friday)</option>
                  <option>Monthly</option>
                </select>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="remitCheck"
                  checked={formData.remittanceReminder}
                  onChange={(e) => updateForm('remittanceReminder', e.target.checked)}
                  className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="remitCheck" className="text-xs text-slate-800 cursor-pointer">
                  <span className="font-bold block text-purple-950">Enable CRA Receiver General Monthly Remittance Alerts</span>
                  Remind me on the 10th of every month to submit CPP, EI, and Income Tax deductions via CRA My Business Account before the 15th deadline.
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Activate */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">Step 5: Review Configuration & Launch</h2>
              <p className="text-xs text-slate-500 mt-1">
                Verify your self-managed setup details before activating your live DirectCare Hub system.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Employer & DF Funding</p>
                <div className="space-y-1 text-xs text-slate-700">
                  <p><span className="font-bold">Employer:</span> {formData.employerName}</p>
                  <p><span className="font-bold">CILT ID:</span> {formData.ciltId}</p>
                  <p><span className="font-bold">Monthly Hours:</span> {formData.allocatedHoursPerMonth} hrs/mo</p>
                  <p><span className="font-bold">CRA RP:</span> {formData.craBusinessNumber}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Transfer Equipment</p>
                <div className="space-y-1 text-xs text-slate-700">
                  <p><span className="font-bold">Lift:</span> {formData.liftModel}</p>
                  <p><span className="font-bold">Sling:</span> {formData.slingModel}</p>
                  <p><span className="font-bold">Loops:</span> {formData.slingLoops}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Attendant Team</p>
                <div className="space-y-1 text-xs text-slate-700">
                  <p><span className="font-bold">Primary:</span> {formData.primaryAttendantName} (${formData.primaryAttendantRate}/hr)</p>
                  <p><span className="font-bold">e-Transfer:</span> {formData.primaryAttendantEmail}</p>
                  <p><span className="font-bold">Backup SOS:</span> {formData.backupAttendantName} ({formData.backupAttendantPhone})</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payroll & ESA</p>
                <div className="space-y-1 text-xs text-slate-700">
                  <p><span className="font-bold">Frequency:</span> {formData.payFrequency}</p>
                  <p><span className="font-bold">Vacation Pay:</span> {formData.vacationPayOption}</p>
                  <p><span className="font-bold">CRA Remittance:</span> Reminders Enabled</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                All settings comply with the Ontario Direct Funding Agreement, Employment Standards Act (ESA), and Personal Health Information Protection Act (PHIPA).
              </span>
            </div>
          </div>
        )}

        {/* Wizard Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold transition inline-flex items-center space-x-2 ${
              currentStep === 1
                ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100'
                : 'text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="min-h-[44px] px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center space-x-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Setup...</span>
              </>
            ) : currentStep === 5 ? (
              <>
                <span>Complete Setup & Open Protocols Dashboard</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">Setup Successfully Completed!</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Your Ontario Direct Funding employer profile, care runbook routines, attendant roster, and CRA payroll settings are now active.
              </p>
            </div>

            <button
              onClick={() => router.push('/protocols/dashboard')}
              className="w-full min-h-[48px] bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Go to Protocols & Care Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
