export type ProtocolCategory = 
  | 'transfer' 
  | 'hygiene' 
  | 'bladder_bowel' 
  | 'meals' 
  | 'exercises' 
  | 'medication_support' 
  | 'domestic';

export interface CareProtocolRoutine {
  id: string;
  title: string;
  category: ProtocolCategory;
  categoryLabel: string;
  scheduledTime: string;
  durationMinutes: number;
  isMandatory: boolean;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
  assistType: '1-person-assist' | '2-person-assist';
  equipment: {
    deviceName: string;
    slingModelSize?: string;
    shoulderLoop?: string;
    legLoop?: string;
    carryBar?: string;
    legRouting?: string;
    transferPath?: string;
  };
  steps: string[];
  precautions: string[];
  emergencyNotes?: string;
  notes?: string;
}

export interface AttendantShift {
  id: string;
  attendantId: string;
  attendantName: string;
  employerId: string;
  employerName: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // e.g. "Monday"
  startTime: string; // e.g. "08:00"
  endTime: string; // e.g. "13:00"
  displayTimeRange: string; // e.g. "8:00 AM - 1:00 PM"
  totalHours: number;
  hourlyRate: number;
  isStatHoliday: boolean;
  statHolidayName?: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  address: string;
  buzzerCode?: string;
  lockboxCode?: string;
  parkingInstructions?: string;
  protocols: CareProtocolRoutine[];
  shiftType: 'regular' | 'emergency_relief' | 'respite';
  premiumRateMultiplier?: number;
}

export interface EmergencyShift {
  id: string;
  employerId: string;
  employerName: string;
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  displayTimeRange: string;
  totalHours: number;
  baseRate: number;
  emergencyBonusRate: number;
  totalRate: number;
  urgencyLevel: 'critical' | 'urgent' | 'standard';
  reason: string;
  notes: string;
  broadcastedAt: string;
  status: 'open' | 'claimed';
  claimedBy?: string;
  claimedByName?: string;
  location: string;
  requiredSkills: string[];
}

export interface TodayAgendaResult {
  shift: AttendantShift | null;
  status: 'before_shift' | 'during_shift' | 'after_shift' | 'no_shift_today';
  countdownMinutes: number | null;
  countdownLabel: string;
  protocols: CareProtocolRoutine[];
  completedProtocolsCount: number;
  totalProtocolsCount: number;
}

export interface UpcomingScheduleResult {
  currentWeekShifts: AttendantShift[];
  nextWeekShifts: AttendantShift[];
  allShifts: AttendantShift[];
  currentWeekHours: number;
  nextWeekHours: number;
  currentWeekGross: number;
  nextWeekGross: number;
  totalProjectedGross: number;
  statHolidayCount: number;
}

export interface HandoverExtractionResult {
  rawTranscript: string;
  tasksCompleted: string[];
  suppliesNeeded: string[];
  observations: string;
  urgencyLevel: 'routine' | 'attention_needed' | 'critical';
  confidenceScore?: number;
}
