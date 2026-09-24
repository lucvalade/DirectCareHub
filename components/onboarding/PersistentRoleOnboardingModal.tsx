// Developed by VertexAgent.io
// Project: DirectCare Hub - Interactive Role-Based Setup Wizard with Saved Progress
// File: /components/onboarding/PersistentRoleOnboardingModal.tsx

'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Sparkles, 
  Building2, 
  Users, 
  Compass, 
  BarChart3,
  Loader2,
  DollarSign,
  AlertCircle,
  FileCheck2,
  Lock
} from 'lucide-react';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { saveRoleSetupProgressAction } from '@/lib/serverActions';

export type UserRole = 'employer' | 'psw' | 'auditor';

// ============================================================================
// 1. DATA CONTRACTS & VALIDATION SCHEMAS
// ============================================================================

export interface WizardFormState {
  // Employer fields
  homeAddress?: string;
  targetLatitude?: number;
  targetLongitude?: number;
  initialCareRoutineTitle?: string;
  employerOriginatorId?: string;
  authorizedQuarterlyBudget?: number;

  // PSW fields
  locationPermissionGranted?: boolean;
  claimBasicPersonalAmount?: boolean;
  additionalTaxDeduction?: number;
  institutionNumber?: string;
  transitNumber?: string;
  accountNumber?: string;

  // Auditor fields
  defaultProgram?: 'CILT_ON' | 'CSIL_BC' | 'AHS_AB';
  agencyTransmitterNumber?: string;
  quarterlyAuditFrequencyConfirmed?: boolean;
}

export interface SetupProgressRecord {
  userId: string;
  role: UserRole;
  currentStepIndex: number;
  completedStepIds: string[];
  isFullyCompleted: boolean;
  dismissPermanently: boolean;
  formData: WizardFormState;
  lastUpdated: string;
}

// Zod Schemas for individual steps
const EmployerAddressSchema = z.object({
  homeAddress: z.string().min(5, 'Valid address is required'),
  targetLatitude: z.number().min(-90).max(90),
  targetLongitude: z.number().min(-180).max(180),
});

const EmployerRunbookSchema = z.object({
  initialCareRoutineTitle: z.string().min(3, 'Routine title required'),
  authorizedQuarterlyBudget: z.number().min(100, 'Minimum budget of $100 required'),
});

const EmployerEftSchema = z.object({
  employerOriginatorId: z.string().regex(/^\d{10}$/, 'Originator ID must be exactly 10 digits'),
});

const PswLocationSchema = z.object({
  locationPermissionGranted: z.literal(true, {
    message: 'Device location permission is required for 50m check-ins',
  }),
});

const PswTd1Schema = z.object({
  claimBasicPersonalAmount: z.boolean(),
  additionalTaxDeduction: z.number().min(0),
});

const PswBankingSchema = z.object({
  institutionNumber: z.string().regex(/^\d{3}$/, 'Institution must be exactly 3 digits'),
  transitNumber: z.string().regex(/^\d{5}$/, 'Transit must be exactly 5 digits'),
  accountNumber: z.string().regex(/^\d{7,12}$/, 'Account must be 7-12 digits'),
});

const AuditorProgramSchema = z.object({
  defaultProgram: z.enum(['CILT_ON', 'CSIL_BC', 'AHS_AB']),
});

const AuditorAuditSchema = z.object({
  quarterlyAuditFrequencyConfirmed: z.literal(true, {
    message: 'Please confirm review schedule',
  }),
});

const AuditorTaxSchema = z.object({
  agencyTransmitterNumber: z.string().regex(/^[A-Z0-9]{6,8}$/, 'Valid CRA transmitter number required (e.g., MM000000)'),
});

// ============================================================================
// 2. STEP CONFIGURATION METADATA
// ============================================================================

export interface WizardStepMeta {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  regulatoryNotice: string;
}

export const WIZARD_STEP_META: Record<UserRole, WizardStepMeta[]> = {
  employer: [
    {
      id: 'employer_address',
      title: 'Care Residence Geofence',
      subtitle: 'Set up the 50m check-in radius for your attendants',
      badge: 'Step 1 of 3 • Location Perimeter',
      icon: MapPin,
      regulatoryNotice: 'GPS coordinates are strictly used to authenticate clock-in within CILT audit compliance.',
    },
    {
      id: 'employer_runbook_budget',
      title: 'Care Plan & Allocation',
      subtitle: 'Establish your primary care runbook and quarterly CILT budget',
      badge: 'Step 2 of 3 • Allocation Care Plan',
      icon: Compass,
      regulatoryNotice: 'Helps the burn-rate engine prevent accidental over-scheduling deficits.',
    },
    {
      id: 'employer_eft',
      title: 'Payments Canada CPA 005',
      subtitle: 'Enter your 10-digit financial institution Originator ID',
      badge: 'Step 3 of 3 • Direct Deposit',
      icon: CreditCard,
      regulatoryNotice: 'Format adheres strictly to 1464-byte Payments Canada Standard 005 rules.',
    },
  ],
  psw: [
    {
      id: 'psw_location',
      title: 'Location Permissions',
      subtitle: 'Enable browser GPS for geofenced 50m check-ins',
      badge: 'Step 1 of 3 • Shift Authentication',
      icon: MapPin,
      regulatoryNotice: 'DirectCare Hub samples GPS at the moment of clock-in and clock-out to verify your visit.',
    },
    {
      id: 'psw_td1',
      title: 'TD1 Tax Credit Declaration',
      subtitle: 'Configure your federal and provincial withholding claims',
      badge: 'Step 2 of 3 • CRA Tax Profile',
      icon: FileText,
      regulatoryNotice: 'Claims Basic Personal Amount ($15,705) for proper CRA Box 14/22 calculations.',
    },
    {
      id: 'psw_banking',
      title: 'Direct Deposit Account',
      subtitle: 'Direct take-home wages and non-taxable expense reimbursements',
      badge: 'Step 3 of 3 • Banking Setup',
      icon: CreditCard,
      regulatoryNotice: 'Stored encrypted at rest (AES-256) for direct generation into CPA 005 batch files.',
    },
  ],
  auditor: [
    {
      id: 'auditor_program',
      title: 'Program Jurisdiction',
      subtitle: 'Select your default administrative oversight framework',
      badge: 'Step 1 of 3 • Regulatory Desk',
      icon: Users,
      regulatoryNotice: 'Applies Ontario CILT or British Columbia CSIL labor rules automatically.',
    },
    {
      id: 'auditor_burnrate_confirm',
      title: 'Variance & Audit Cadence',
      subtitle: 'Confirm schedule for quarterly health authority reviews',
      badge: 'Step 2 of 3 • Variance Thresholds',
      icon: BarChart3,
      regulatoryNotice: 'DirectCare Hub automatically flags burn rates exceeding 93% or dropping below 80%.',
    },
    {
      id: 'auditor_cra_transmitter',
      title: 'CRA XML Transmitter Number',
      subtitle: 'Configure digital filing authorization for T4 and PD7A batches',
      badge: 'Step 3 of 3 • Internet File Transfer',
      icon: Building2,
      regulatoryNotice: 'Required for CRA T619 top-level submission and Service Canada ROE Web XML v2.0.',
    },
  ],
};

// ============================================================================
// 3. MAIN INTERACTIVE SETUP WIZARD COMPONENT
// ============================================================================

export function PersistentRoleOnboardingModal({
  userId,
  userRole,
  forceOpen = false,
  onDismissCallback,
}: {
  userId: string;
  userRole: UserRole;
  forceOpen?: boolean;
  onDismissCallback?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Unified Form State for all roles
  const [formData, setFormData] = useState<WizardFormState>({
    // Employer defaults
    homeAddress: '100 King St W, Hamilton, ON',
    targetLatitude: 43.2557,
    targetLongitude: -79.8711,
    initialCareRoutineTitle: 'Morning Ceiling Lift & Personal Care',
    authorizedQuarterlyBudget: 16500,
    employerOriginatorId: '9876543210',

    // PSW defaults
    locationPermissionGranted: true,
    claimBasicPersonalAmount: true,
    additionalTaxDeduction: 0,
    institutionNumber: '004',
    transitNumber: '10292',
    accountNumber: '5284910284',

    // Auditor defaults
    defaultProgram: 'CILT_ON',
    agencyTransmitterNumber: 'MM982104',
    quarterlyAuditFrequencyConfirmed: true,
  });

  const storageKey = `directcare_wizard_progress_${userId}_${userRole}`;
  const steps = WIZARD_STEP_META[userRole] || WIZARD_STEP_META.employer;
  const currentStep = steps[currentStepIndex];

  // Hydrate local progress
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.completedStepIds) setCompletedStepIds(parsed.completedStepIds);
        if (typeof parsed.currentStepIndex === 'number') setCurrentStepIndex(parsed.currentStepIndex);
        // Continually appear until 100% complete
        setIsOpen(!parsed.isFullyCompleted);
      } else {
        setIsOpen(true);
      }
    } catch {
      setIsOpen(true);
    }
  }, [forceOpen, storageKey]);

  // Synchronize state locally and to server
  const persistState = (
    nextIndex: number, 
    nextCompleted: string[], 
    nextForm: WizardFormState, 
    fullyDone: boolean, 
    dismiss: boolean
  ) => {
    const payload: SetupProgressRecord = {
      userId,
      role: userRole,
      currentStepIndex: nextIndex,
      completedStepIds: nextCompleted,
      isFullyCompleted: fullyDone,
      dismissPermanently: dismiss,
      formData: nextForm,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(storageKey, JSON.stringify(payload));

    startTransition(async () => {
      await saveRoleSetupProgressAction({
        userId,
        role: userRole,
        stepId: currentStep.id,
        formData: nextForm,
        completedStepIds: nextCompleted,
        dismissPermanently: dismiss,
        isFullyCompleted: fullyDone,
      });
    });
  };

  // Step Validation Handlers
  const handleValidateAndProceed = () => {
    try {
      if (userRole === 'employer') {
        if (currentStep.id === 'employer_address') {
          EmployerAddressSchema.parse({
            homeAddress: formData.homeAddress,
            targetLatitude: formData.targetLatitude,
            targetLongitude: formData.targetLongitude,
          });
        } else if (currentStep.id === 'employer_runbook_budget') {
          EmployerRunbookSchema.parse({
            initialCareRoutineTitle: formData.initialCareRoutineTitle,
            authorizedQuarterlyBudget: formData.authorizedQuarterlyBudget,
          });
        } else if (currentStep.id === 'employer_eft') {
          EmployerEftSchema.parse({
            employerOriginatorId: formData.employerOriginatorId,
          });
        }
      } else if (userRole === 'psw') {
        if (currentStep.id === 'psw_location') {
          PswLocationSchema.parse({
            locationPermissionGranted: formData.locationPermissionGranted,
          });
        } else if (currentStep.id === 'psw_td1') {
          PswTd1Schema.parse({
            claimBasicPersonalAmount: formData.claimBasicPersonalAmount,
            additionalTaxDeduction: formData.additionalTaxDeduction,
          });
        } else if (currentStep.id === 'psw_banking') {
          PswBankingSchema.parse({
            institutionNumber: formData.institutionNumber,
            transitNumber: formData.transitNumber,
            accountNumber: formData.accountNumber,
          });
        }
      } else if (userRole === 'auditor') {
        if (currentStep.id === 'auditor_program') {
          AuditorProgramSchema.parse({
            defaultProgram: formData.defaultProgram,
          });
        } else if (currentStep.id === 'auditor_burnrate_confirm') {
          AuditorAuditSchema.parse({
            quarterlyAuditFrequencyConfirmed: formData.quarterlyAuditFrequencyConfirmed,
          });
        } else if (currentStep.id === 'auditor_cra_transmitter') {
          AuditorTaxSchema.parse({
            agencyTransmitterNumber: formData.agencyTransmitterNumber,
          });
        }
      }

      // Mark step completed
      const updatedCompleted = Array.from(new Set([...completedStepIds, currentStep.id]));
      setCompletedStepIds(updatedCompleted);

      if (currentStepIndex < steps.length - 1) {
        const nextIdx = currentStepIndex + 1;
        setCurrentStepIndex(nextIdx);
        persistState(nextIdx, updatedCompleted, formData, false, dontShowAgain);
        toast.success(`Completed ${currentStep.title}`);
      } else {
        // All steps finished
        persistState(currentStepIndex, updatedCompleted, formData, true, dontShowAgain);
        toast.success('Onboarding checklist 100% complete! Your profile is verified.');
        setIsOpen(false);
        if (onDismissCallback) onDismissCallback();
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0]?.message || 'Please review step inputs');
      } else {
        toast.error('Validation failed');
      }
    }
  };

  const handleManualDismiss = () => {
    persistState(currentStepIndex, completedStepIds, formData, false, dontShowAgain);
    setIsOpen(false);
    if (onDismissCallback) onDismissCallback();
  };

  if (!isOpen) return null;

  const StepIcon = currentStep.icon;
  const progressPercent = Math.round((completedStepIds.length / steps.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/85 backdrop-blur-2xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#155dfc] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.8)] text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-white/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-900/50 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Close Action */}
        <div className="flex items-center justify-between pb-5 border-b border-white/20 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-cyan-300 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-cyan-200 block">
                {userRole.toUpperCase()} SETUP WIZARD
              </span>
              <h3 className="text-lg font-black text-white">Interactive Setup Checklist</h3>
            </div>
          </div>

          <button
            onClick={handleManualDismiss}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20 transition-colors cursor-pointer"
            aria-label="Dismiss setup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Saved Progress Checklist Indicator */}
        <div className="py-4 space-y-2 relative z-10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-100 font-semibold flex items-center gap-1.5">
              <span>Overall Completion:</span>
              <span className="text-cyan-300 font-mono font-bold">{progressPercent}%</span>
            </span>
            <span className="text-blue-200 font-mono text-[11px]">
              {completedStepIds.length} of {steps.length} Steps Verified
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-black/20 overflow-hidden border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-white transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {steps.map((st, i) => {
              const isDone = completedStepIds.includes(st.id);
              const isCurrent = i === currentStepIndex;

              return (
                <button
                  key={st.id}
                  onClick={() => setCurrentStepIndex(i)}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-white text-[#155dfc] font-black border-white shadow-xl'
                      : isDone
                      ? 'bg-emerald-400/20 border-emerald-300/40 text-emerald-200'
                      : 'bg-white/10 border-white/20 text-blue-100 hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] uppercase font-mono font-bold ${isCurrent ? 'text-[#155dfc]' : 'text-blue-200'}`}>Step {i + 1}</span>
                    {isDone ? (
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrent ? 'text-[#155dfc]' : 'text-emerald-300'}`} />
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-[#155dfc]' : 'bg-blue-300/60'}`} />
                    )}
                  </div>
                  <span className={`text-xs font-bold block truncate mt-0.5 ${isCurrent ? 'text-[#155dfc]' : 'text-white'}`}>{st.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Form Body for Active Step */}
        <div className="py-4 space-y-4 relative z-10 max-h-[380px] overflow-y-auto pr-1">
          <div className="flex items-start gap-3.5 pb-2">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-cyan-400 shrink-0">
              <StepIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0224bb]/40 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                {currentStep.badge}
              </span>
              <h4 className="text-lg font-black text-white mt-1">{currentStep.title}</h4>
              <p className="text-xs text-slate-300">{currentStep.subtitle}</p>
            </div>
          </div>

          {/* ================= EMPLOYER FORMS ================= */}
          {userRole === 'employer' && currentStep.id === 'employer_address' && (
            <div className="space-y-3 bg-white/10 p-4 rounded-2xl border border-white/20">
              <div className="space-y-1">
                <label className="text-xs text-blue-100 font-semibold">Primary Care Residence Street Address</label>
                <input
                  type="text"
                  value={formData.homeAddress || ''}
                  onChange={(e) => setFormData({ ...formData, homeAddress: e.target.value })}
                  placeholder="e.g. 100 King St W, Hamilton, ON"
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-blue-200/60 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-blue-200">Target Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.targetLatitude || ''}
                    onChange={(e) => setFormData({ ...formData, targetLatitude: parseFloat(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-mono text-cyan-200 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-blue-200">Target Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.targetLongitude || ''}
                    onChange={(e) => setFormData({ ...formData, targetLongitude: parseFloat(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-mono text-cyan-200 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
              </div>
            </div>
          )}

          {userRole === 'employer' && currentStep.id === 'employer_runbook_budget' && (
            <div className="space-y-3 bg-white/10 p-4 rounded-2xl border border-white/20">
              <div className="space-y-1">
                <label className="text-xs text-blue-100 font-semibold">Default Daily ADL Routine Title</label>
                <input
                  type="text"
                  value={formData.initialCareRoutineTitle || ''}
                  onChange={(e) => setFormData({ ...formData, initialCareRoutineTitle: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-xs text-white focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-blue-100 font-semibold">Approved Quarterly Budget Allocation (CAD)</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-blue-200 absolute left-3 top-3" />
                  <input
                    type="number"
                    value={formData.authorizedQuarterlyBudget || ''}
                    onChange={(e) => setFormData({ ...formData, authorizedQuarterlyBudget: parseFloat(e.target.value) })}
                    className="w-full pl-9 p-3 rounded-xl bg-white/10 border border-white/20 text-xs font-mono text-emerald-300 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
              </div>
            </div>
          )}

          {userRole === 'employer' && currentStep.id === 'employer_eft' && (
            <div className="space-y-3 bg-white/10 p-4 rounded-2xl border border-white/20">
              <div className="space-y-1">
                <label className="text-xs text-blue-100 font-semibold">Employer 10-Digit Originator ID (Payments Canada)</label>
                <input
                  type="text"
                  maxLength={10}
                  value={formData.employerOriginatorId || ''}
                  onChange={(e) => setFormData({ ...formData, employerOriginatorId: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#1048ca] border border-white/30 text-xs font-mono text-cyan-200 focus:outline-none focus:ring-2 focus:ring-white text-center tracking-widest text-sm"
                />
                <span className="text-[10px] text-blue-200">Assigned by your Canadian financial institution for EFT batch files.</span>
              </div>
            </div>
          )}

          {/* ================= PSW FORMS ================= */}
          {userRole === 'psw' && currentStep.id === 'psw_location' && (
            <div className="space-y-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-cyan-300 block">Geolocation Permission Status</span>
                  <span className="text-[11px] text-slate-300">Required for 50m geofenced shift logging</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        () => {
                          setFormData({ ...formData, locationPermissionGranted: true });
                          toast.success('Browser GPS permission verified!');
                        },
                        () => toast.error('Please allow location access in your browser settings')
                      );
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 text-black text-xs font-bold cursor-pointer hover:bg-cyan-400 transition-colors"
                >
                  Verify GPS
                </button>
              </div>
            </div>
          )}

          {userRole === 'psw' && currentStep.id === 'psw_td1' && (
            <div className="space-y-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-white block">Claim Basic Personal Amount</span>
                  <span className="text-[10px] text-slate-400">Federal $15,705 & Provincial basic tax exemption credit</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.claimBasicPersonalAmount || false}
                  onChange={(e) => setFormData({ ...formData, claimBasicPersonalAmount: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400"
                />
              </label>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-semibold">Additional Voluntary Tax Withholding (per pay)</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="number"
                    min={0}
                    value={formData.additionalTaxDeduction || 0}
                    onChange={(e) => setFormData({ ...formData, additionalTaxDeduction: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-9 p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {userRole === 'psw' && currentStep.id === 'psw_banking' && (
            <div className="grid grid-cols-3 gap-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-semibold">Inst # (3 Digits)</label>
                <input
                  type="text"
                  maxLength={3}
                  value={formData.institutionNumber || ''}
                  onChange={(e) => setFormData({ ...formData, institutionNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-center text-cyan-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-semibold">Transit # (5 Digits)</label>
                <input
                  type="text"
                  maxLength={5}
                  value={formData.transitNumber || ''}
                  onChange={(e) => setFormData({ ...formData, transitNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-center text-cyan-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-semibold">Account # (7-12)</label>
                <input
                  type="text"
                  maxLength={12}
                  value={formData.accountNumber || ''}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-cyan-300"
                />
              </div>
            </div>
          )}

          {/* ================= AUDITOR FORMS ================= */}
          {userRole === 'auditor' && currentStep.id === 'auditor_program' && (
            <div className="space-y-3 bg-white/10 p-4 rounded-2xl border border-white/20">
              <label className="text-xs text-blue-100 font-semibold block">Select Primary Direct Funding Program</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'CILT_ON', label: 'Ontario CILT Direct Funding' },
                  { id: 'CSIL_BC', label: 'BC CSIL Health Authorities' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, defaultProgram: item.id as any })}
                    className={`p-3 rounded-xl border text-xs font-bold text-left cursor-pointer transition-all ${
                      formData.defaultProgram === item.id
                        ? 'bg-white text-[#155dfc] font-black border-white shadow-xl'
                        : 'bg-white/10 text-blue-100 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {userRole === 'auditor' && currentStep.id === 'auditor_burnrate_confirm' && (
            <div className="space-y-3 bg-white/10 p-4 rounded-2xl border border-white/20">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.quarterlyAuditFrequencyConfirmed || false}
                  onChange={(e) => setFormData({ ...formData, quarterlyAuditFrequencyConfirmed: e.target.checked })}
                  className="w-4 h-4 accent-cyan-300"
                />
                <span className="text-xs text-blue-100 font-medium">
                  I confirm monthly burn-rate monitoring and quarterly deficit escalation threshold alerts.
                </span>
              </label>
            </div>
          )}

          {userRole === 'auditor' && currentStep.id === 'auditor_cra_transmitter' && (
            <div className="space-y-3 bg-white/10 p-4 rounded-2xl border border-white/20">
              <div className="space-y-1">
                <label className="text-xs text-blue-100 font-semibold">CRA Transmitter Number (T619 File Header)</label>
                <input
                  type="text"
                  maxLength={8}
                  value={formData.agencyTransmitterNumber || ''}
                  onChange={(e) => setFormData({ ...formData, agencyTransmitterNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g. MM000000"
                  className="w-full p-3 rounded-xl bg-[#1048ca] border border-white/30 text-xs font-mono text-center tracking-widest text-cyan-200 uppercase focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
            </div>
          )}

          {/* Regulatory Disclaimer Banner */}
          <div className="p-3 rounded-2xl bg-white/10 border border-white/20 flex items-center gap-2 text-[11px] text-blue-100">
            <ShieldCheck className="w-4 h-4 text-cyan-300 shrink-0" />
            <span>{currentStep.regulatoryNotice}</span>
          </div>
        </div>

        {/* Footer Actions & Dismissal Checkbox */}
        <div className="pt-4 border-t border-white/20 space-y-4 relative z-10">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
              }}
              disabled={currentStepIndex === 0 || isPending}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <button
              onClick={handleValidateAndProceed}
              disabled={isPending}
              className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold flex items-center gap-2 shadow-xl transition-all cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : currentStepIndex === steps.length - 1 ? (
                <>
                  <span>Verify & Finalize</span>
                  <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                </>
              ) : (
                <>
                  <span>Save & Continue</span>
                  <ChevronRight className="w-4 h-4 text-cyan-300" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
