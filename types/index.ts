export type UserRole = 'employer' | 'attendant' | 'bookkeeper';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  hourlyRate?: number;
  phone?: string;
  emergencyContact?: string;
}

export interface BudgetPeriod {
  id: string;
  month: string;
  allocatedHours: number;
  usedHours: number;
  allocatedFunds: number;
  spentFunds: number;
  hourlyRateBase: number;
}

export interface ShiftRecord {
  id: string;
  attendantId: string;
  attendantName: string;
  startTime: string;
  endTime?: string;
  durationHours?: number;
  status: 'active' | 'completed' | 'verified';
  tasksCompleted: string[];
  notes?: string;
  reliefRequired?: boolean;
}

export interface RunbookTask {
  id: string;
  timeSlot: string;
  title: string;
  description: string;
  priority: 'routine' | 'critical' | 'transfer';
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  safetyNote?: string;
}

export interface HandoverSummary {
  id: string;
  shiftDate: string;
  authorName: string;
  statusSummary: string;
  completedTasks: string[];
  skinIntegrityNotes?: string;
  bowelBladderNotes?: string;
  suppliesNeeded?: string[];
  redFlags?: string[];
  rawAudioUrl?: string;
  createdAt: string;
}

export interface PayStub {
  id: string;
  attendantId: string;
  attendantName: string;
  periodStart: string;
  periodEnd: string;
  regularHours: number;
  hourlyRate: number;
  grossPay: number;
  vacationPay: number; // 4% ESA
  cppDeduction: number;
  eiDeduction: number;
  taxDeduction: number;
  netPay: number;
  employerCpp: number;
  employerEi: number;
  wsibPremium: number;
  directFundingCategory: 'attendant_wages' | 'bookkeeping';
  status: 'draft' | 'approved' | 'paid';
}
