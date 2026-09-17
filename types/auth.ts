export type UserRole = 'employer' | 'attendant' | 'bookkeeper';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phoneNumber?: string;
  isBackupRoster?: boolean;
  hourlyRate?: number;
  createdAt: number;
}

export interface BudgetPeriod {
  id: string;
  employerUid: string;
  monthYear: string;
  allocatedHours: number;
  usedHours: number;
  statHolidayHoursUsed: number;
  remainingHours: number;
  notes?: string;
}

export interface RunbookTask {
  id: string;
  title: string;
  category: string;
  description: string;
  equipmentDetails?: string;
  slingSize?: string;
  liftSettings?: string;
  shoulderLoopSetting?: string;
  legLoopSetting?: string;
  carryBarType?: string;
  legRoutingStyle?: string;
  attendantCount?: string;
  transferPath?: string;
  headSupportNotes?: string;
  precautionsNotes?: string;
  emergencyLoweringNotes?: string;
  destinationNotes?: string;
  isMandatory: boolean;
  order: number;
}

export interface ShiftRecord {
  id: string;
  employerUid: string;
  attendantUid: string;
  attendantName: string;
  clockInTime: number;
  clockOutTime?: number;
  totalHours?: number;
  isStatHoliday: boolean;
  status: 'active' | 'completed' | 'approved' | 'disputed';
  notes?: string;
}

export interface HandoverNote {
  id: string;
  employerUid: string;
  attendantUid: string;
  attendantName: string;
  timestamp: number;
  rawTranscript: string;
  tasksCompleted: string[];
  suppliesNeeded: string[];
  observations: string;
  urgencyLevel: 'routine' | 'attention_needed' | 'critical';
  audioStorageUrl?: string;
}

export interface EmergencyBroadcast {
  id: string;
  employerUid: string;
  timestamp: number;
  status: 'active' | 'claimed' | 'resolved';
  claimedByUid?: string;
  claimedByName?: string;
  message: string;
}
