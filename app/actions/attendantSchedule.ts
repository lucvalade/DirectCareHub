'use server';

import { 
  CareProtocolRoutine, 
  AttendantShift, 
  EmergencyShift, 
  TodayAgendaResult, 
  UpcomingScheduleResult 
} from '@/types/attendantSchedule';

// Helper to determine Ontario Statutory Holidays
function checkOntarioStatHoliday(dateStr: string): { isStat: boolean; name?: string } {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // New Year's Day
  if (month === 1 && day === 1) return { isStat: true, name: "New Year's Day" };
  // Family Day (Approx 3rd Monday in Feb)
  if (month === 2 && day >= 15 && day <= 21) return { isStat: true, name: "Family Day" };
  // Good Friday (Approx late March / April)
  if (month === 4 && (day === 3 || day === 10 || day === 18)) return { isStat: true, name: "Good Friday" };
  // Victoria Day (Monday before May 25)
  if (month === 5 && day >= 18 && day <= 24) return { isStat: true, name: "Victoria Day" };
  // Canada Day
  if (month === 7 && day === 1) return { isStat: true, name: "Canada Day" };
  // Labour Day (1st Monday in Sept)
  if (month === 9 && day >= 1 && day <= 7) return { isStat: true, name: "Labour Day" };
  // Thanksgiving Day (2nd Monday in Oct)
  if (month === 10 && day >= 8 && day <= 14) return { isStat: true, name: "Thanksgiving Day" };
  // Christmas Day
  if (month === 12 && day === 25) return { isStat: true, name: "Christmas Day" };
  // Boxing Day
  if (month === 12 && day === 26) return { isStat: true, name: "Boxing Day" };

  return { isStat: false };
}

// In-memory / initial seed data for prototypes
const DEFAULT_PROTOCOLS: CareProtocolRoutine[] = [
  {
    id: 'prot_morning_transfer',
    title: 'Arjo Maxi Sky Ceiling Lift Transfer (Bed -> Powerchair)',
    category: 'transfer',
    categoryLabel: 'Transfer Protocol',
    scheduledTime: '08:15 AM',
    durationMinutes: 25,
    isMandatory: true,
    isCompleted: false,
    assistType: '1-person-assist',
    equipment: {
      deviceName: 'Arjo Maxi Sky 2 Ceiling Hoist (Track Unit 4)',
      slingModelSize: 'Medium High-Back Clip/Loop Sling (Green Trim)',
      shoulderLoop: 'Middle Green Loop (Upright Positioning)',
      legLoop: 'Short Blue Loop (Inner Thigh Crossover)',
      carryBar: '2-Point Spreader Bar with Safety Latches',
      legRouting: 'Crossed (Divided Leg Band Under Femurs)',
      transferPath: 'Bed surface -> Permobil F5 Corpus Power Wheelchair'
    },
    steps: [
      'Ensure Permobil F5 power is switched OFF and joystick locked.',
      'Check sling fabric for tears, frayed seams, or degraded loop stitching.',
      'Log roll employer smoothly to apply sling centered from coccyx to crown.',
      'Connect shoulder loops (Green) first, then thread and cross leg bands (Blue).',
      'Hoist 3 inches above mattress, pause for 10 seconds to verify pelvic alignment.',
      'Maneuver along ceiling track directly above powerchair seat.',
      'Lower carefully until employer is fully seated with pelvis against backrest.'
    ],
    precautions: [
      'CRITICAL: Check catheter drainage line is free from snagging before lifting.',
      'Watch for autonomic dysreflexia symptoms: flushing, headache, or sudden spasticity.',
      'Do not pull on legs or feet while hoisting.'
    ],
    emergencyNotes: 'Emergency cord on Arjo motor lowers hoist manually if power fails.'
  },
  {
    id: 'prot_bowel_bladder',
    title: 'Bowel Routine & Intermittent Catheterization',
    category: 'bladder_bowel',
    categoryLabel: 'Medical / Continence Care',
    scheduledTime: '09:00 AM',
    durationMinutes: 40,
    isMandatory: true,
    isCompleted: false,
    assistType: '1-person-assist',
    equipment: {
      deviceName: 'SpeediCath Compact Male 14Fr / Sterile Lubricant Gel',
      transferPath: 'Commode / Bed surface',
      deviceName_supplies: 'Nitrile gloves (size M), chlorhexidine wipes, Chux pads'
    } as any,
    steps: [
      'Sanitize hands thoroughly and don fresh sterile nitrile gloves.',
      'Position Chux pad beneath employer with minimal friction on sacrum.',
      'Cleanse meatus with antiseptic wipes in outward circular motion.',
      'Insert pre-lubricated SpeediCath catheter gently without force.',
      'Measure output volume in graduated cylinder (target: 400-550 ml).',
      'Perform digital stimulation per prescribed bowel protocol every 10 min.'
    ],
    precautions: [
      'Maintain strict sterile technique to prevent urinary tract infections.',
      'If resistance met during catheter insertion, stop immediately, do not force.',
      'Document output clarity and temperature in shift log.'
    ]
  },
  {
    id: 'prot_hygiene_dressing',
    title: 'Morning Hygiene, Oral Care & Compression Garments',
    category: 'hygiene',
    categoryLabel: 'Personal Care & Hygiene',
    scheduledTime: '10:00 AM',
    durationMinutes: 35,
    isMandatory: true,
    isCompleted: false,
    assistType: '1-person-assist',
    equipment: {
      deviceName: 'Sigvaris 20-30 mmHg Thigh-High Compression Stockings',
      transferPath: 'Power Wheelchair with Tilt-in-Space'
    },
    steps: [
      'Assist with warm washcloth facial wash, electric razor shave, and oral brushing.',
      'Inspect skin over trochanters, scapulae, and heels for non-blanching erythema.',
      'Apply moisturizing barrier lotion to dry areas, avoiding macerated skin folds.',
      'Don compression stockings before sitting upright to prevent orthostatic hypotension.',
      'Dress in adaptive clothing with magnetic closures or low-friction seams.'
    ],
    precautions: [
      'Ensure zero wrinkles in compression stockings over tibia or Achilles tendon.',
      'Support limb weight with both hands during leg dressing.'
    ]
  },
  {
    id: 'prot_breakfast_prep',
    title: 'Nutrition Support & Hydration (Breakfast + Meds Setup)',
    category: 'meals',
    categoryLabel: 'Nutrition & Hydration',
    scheduledTime: '11:15 AM',
    durationMinutes: 30,
    isMandatory: true,
    isCompleted: false,
    assistType: '1-person-assist',
    equipment: {
      deviceName: 'Adaptive angled mug with silicone straw holder'
    },
    steps: [
      'Prepare warm oatmeal with sliced fruit and 300ml electrolyte water.',
      'Set out medication blister pack within employer visual field for verification.',
      'Position dining table at wheelchair height (72cm).',
      'Provide sips with angled straw at safe swallowing pace.',
      'Confirm employer has finished hydration target (minimum 500ml by noon).'
    ],
    precautions: [
      'Confirm upright trunk angle (minimum 80 degrees) during oral intake.',
      'Check for swallowing pauses or coughing.'
    ]
  },
  {
    id: 'prot_skin_repositioning',
    title: '30-Minute Pressure Relief Tilt & Range of Motion',
    category: 'exercises',
    categoryLabel: 'Skin Integrity & Mobility',
    scheduledTime: '12:30 PM',
    durationMinutes: 20,
    isMandatory: true,
    isCompleted: false,
    assistType: '1-person-assist',
    equipment: {
      deviceName: 'Permobil F5 Power Tilt-in-Space (45-degree posterior tilt)'
    },
    steps: [
      'Activate powerchair tilt mechanism to 45 degrees for complete ischial unloading.',
      'Maintain full tilt for a minimum of 2 minutes to restore capillary refill.',
      'Perform gentle passive range of motion on ankles, knees, and wrists.',
      'Verify armrest gel pads are positioned evenly under forearms.'
    ],
    precautions: [
      'Do not shear skin during leg repositioning.',
      'Confirm employer feet remain secured on anti-slip footplates.'
    ]
  }
];

// Seed confirmed shifts
function generateMockShifts(attendantId: string): AttendantShift[] {
  const today = new Date();
  const shifts: AttendantShift[] = [];

  // Generate for 14 days starting today
  for (let i = 0; i < 14; i++) {
    const shiftDate = new Date(today);
    shiftDate.setDate(today.getDate() + i);

    const year = shiftDate.getFullYear();
    const month = String(shiftDate.getMonth() + 1).padStart(2, '0');
    const day = String(shiftDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[shiftDate.getDay()];

    // Assume shifts on Mon, Wed, Fri, Sat, Sun
    const isShiftDay = [0, 1, 3, 5, 6].includes(shiftDate.getDay());
    if (!isShiftDay && i !== 0) continue;

    const { isStat, name: statName } = checkOntarioStatHoliday(dateStr);

    const isMorning = i % 2 === 0;
    const startTime = isMorning ? '08:00' : '15:30';
    const endTime = isMorning ? '13:00' : '20:30';
    const displayTimeRange = isMorning ? '8:00 AM - 1:00 PM' : '3:30 PM - 8:30 PM';
    const totalHours = 5.0;
    const hourlyRate = 26.50;

    shifts.push({
      id: `shift_${dateStr}_${attendantId}`,
      attendantId,
      attendantName: 'Sarah Jenkins (Attendant / PSW)',
      employerId: 'employer_alex_1',
      employerName: 'Alex Mercer',
      date: dateStr,
      dayOfWeek,
      startTime,
      endTime,
      displayTimeRange,
      totalHours,
      hourlyRate,
      isStatHoliday: isStat,
      statHolidayName: statName,
      status: i === 0 ? 'active' : 'scheduled',
      address: '284 Queen St West, Apt 402, Toronto, ON M5V 2A1',
      buzzerCode: '#4029',
      lockboxCode: '7412',
      parkingInstructions: 'Underground visitor stall #14 (ring buzzer for garage door release)',
      protocols: i === 0 ? DEFAULT_PROTOCOLS : DEFAULT_PROTOCOLS.slice(0, 3),
      shiftType: 'regular',
      premiumRateMultiplier: isStat ? 1.5 : 1.0
    });
  }

  return shifts;
}

// Open Emergency shifts broadcasted by employer
const INITIAL_EMERGENCY_SHIFTS: EmergencyShift[] = [
  {
    id: 'emerg_shift_urgent_01',
    employerId: 'employer_alex_1',
    employerName: 'Alex Mercer',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    dayOfWeek: 'Tomorrow',
    startTime: '08:00',
    endTime: '13:00',
    displayTimeRange: '8:00 AM - 1:00 PM',
    totalHours: 5.0,
    baseRate: 26.50,
    emergencyBonusRate: 10.00,
    totalRate: 36.50,
    urgencyLevel: 'critical',
    reason: 'Primary attendant ill with severe flu symptoms. Urgent morning lift & transfer cover required.',
    notes: 'Direct Funding emergency rate authorized ($36.50/hr). Must be certified with Arjo ceiling track hoist.',
    broadcastedAt: '25 minutes ago',
    status: 'open',
    location: '284 Queen St West, Apt 402, Toronto, ON',
    requiredSkills: ['Ceiling Track Hoist', 'Catheterization Routine', 'Skin Check Protocol']
  }
];

// In-memory runtime state for prototype interaction
let emergencyShiftsStore = [...INITIAL_EMERGENCY_SHIFTS];
let completedProtocolsStore: Record<string, boolean> = {};

/**
 * 1. getTodayAgenda
 * Fetches today's assigned shift(s) and specific Care Protocols scheduled during that shift window
 */
export async function getTodayAgenda(attendantId: string = 'demo_attendant_uid_456'): Promise<TodayAgendaResult> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const allShifts = generateMockShifts(attendantId);
  const todayShift = allShifts.find(s => s.date === todayStr) || allShifts[0];

  if (!todayShift) {
    return {
      shift: null,
      status: 'no_shift_today',
      countdownMinutes: null,
      countdownLabel: 'No shifts scheduled today',
      protocols: [],
      completedProtocolsCount: 0,
      totalProtocolsCount: 0
    };
  }

  // Calculate shift status and countdown
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const [startH, startM] = todayShift.startTime.split(':').map(Number);
  const shiftStartMinutes = startH * 60 + startM;
  const [endH, endM] = todayShift.endTime.split(':').map(Number);
  const shiftEndMinutes = endH * 60 + endM;

  let status: 'before_shift' | 'during_shift' | 'after_shift' = 'during_shift';
  let countdownLabel = 'Active Shift Now • 2h 45m remaining';
  let countdownMinutes: number | null = null;

  if (currentMinutes < shiftStartMinutes) {
    status = 'before_shift';
    countdownMinutes = shiftStartMinutes - currentMinutes;
    const hoursLeft = Math.floor(countdownMinutes / 60);
    const minsLeft = countdownMinutes % 60;
    countdownLabel = hoursLeft > 0 
      ? `Shift Starts in ${hoursLeft}h ${minsLeft}m`
      : `Shift Starts in ${minsLeft} Mins`;
  } else if (currentMinutes > shiftEndMinutes) {
    status = 'after_shift';
    countdownLabel = 'Shift Completed';
  } else {
    status = 'during_shift';
    const remaining = shiftEndMinutes - currentMinutes;
    const hoursLeft = Math.floor(remaining / 60);
    const minsLeft = remaining % 60;
    countdownLabel = `Active Shift Now • ${hoursLeft}h ${minsLeft}m remaining`;
  }

  // Synchronize completion state with in-memory store
  const protocolsWithState = todayShift.protocols.map(p => ({
    ...p,
    isCompleted: completedProtocolsStore[p.id] ?? p.isCompleted,
    completedAt: completedProtocolsStore[p.id] ? 'Completed Today' : undefined
  }));

  const completedCount = protocolsWithState.filter(p => p.isCompleted).length;

  return {
    shift: {
      ...todayShift,
      protocols: protocolsWithState
    },
    status,
    countdownMinutes,
    countdownLabel,
    protocols: protocolsWithState,
    completedProtocolsCount: completedCount,
    totalProtocolsCount: protocolsWithState.length
  };
}

/**
 * 2. getUpcomingSchedule
 * Fetches confirmed shifts for current week (Monday-Sunday) and next week (14-day forward view)
 */
export async function getUpcomingSchedule(attendantId: string = 'demo_attendant_uid_456'): Promise<UpcomingScheduleResult> {
  const allShifts = generateMockShifts(attendantId);
  const today = new Date();
  
  // Calculate current week boundaries (Monday to Sunday)
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() + distanceToMonday);
  currentMonday.setHours(0, 0, 0, 0);

  const currentSunday = new Date(currentMonday);
  currentSunday.setDate(currentMonday.getDate() + 6);
  currentSunday.setHours(23, 59, 59, 999);

  const nextMonday = new Date(currentMonday);
  nextMonday.setDate(currentMonday.getDate() + 7);

  const nextSunday = new Date(nextMonday);
  nextSunday.setDate(nextMonday.getDate() + 6);
  nextSunday.setHours(23, 59, 59, 999);

  const currentWeekShifts: AttendantShift[] = [];
  const nextWeekShifts: AttendantShift[] = [];

  for (const shift of allShifts) {
    const shiftDate = new Date(`${shift.date}T12:00:00`);
    if (shiftDate >= currentMonday && shiftDate <= currentSunday) {
      currentWeekShifts.push(shift);
    } else if (shiftDate >= nextMonday && shiftDate <= nextSunday) {
      nextWeekShifts.push(shift);
    }
  }

  const currentWeekHours = currentWeekShifts.reduce((acc, s) => acc + s.totalHours, 0);
  const nextWeekHours = nextWeekShifts.reduce((acc, s) => acc + s.totalHours, 0);

  const currentWeekGross = currentWeekShifts.reduce((acc, s) => {
    const rate = s.hourlyRate * (s.premiumRateMultiplier || 1);
    return acc + (s.totalHours * rate);
  }, 0);

  const nextWeekGross = nextWeekShifts.reduce((acc, s) => {
    const rate = s.hourlyRate * (s.premiumRateMultiplier || 1);
    return acc + (s.totalHours * rate);
  }, 0);

  const statCount = allShifts.filter(s => s.isStatHoliday).length;

  return {
    currentWeekShifts,
    nextWeekShifts,
    allShifts,
    currentWeekHours,
    nextWeekHours,
    currentWeekGross,
    nextWeekGross,
    totalProjectedGross: currentWeekGross + nextWeekGross,
    statHolidayCount: statCount
  };
}

/**
 * 3. getAvailableEmergencyShifts
 * Fetches any open shifts the employer has broadcasted to the backup roster
 */
export async function getAvailableEmergencyShifts(): Promise<EmergencyShift[]> {
  return emergencyShiftsStore.filter(s => s.status === 'open');
}

/**
 * 4. markProtocolCompleted
 * Marks a specific care protocol routine as completed or undone
 */
export async function markProtocolCompleted(
  protocolId: string, 
  attendantId: string, 
  isCompleted: boolean,
  notes?: string
): Promise<{ success: boolean; protocolId: string; isCompleted: boolean }> {
  completedProtocolsStore[protocolId] = isCompleted;
  return {
    success: true,
    protocolId,
    isCompleted
  };
}

/**
 * 5. claimEmergencyShift
 * Allows an attendant on the backup roster to claim an open broadcasted shift
 */
export async function claimEmergencyShift(
  shiftId: string, 
  attendantId: string, 
  attendantName: string
): Promise<{ success: boolean; shift?: EmergencyShift; error?: string }> {
  const shiftIndex = emergencyShiftsStore.findIndex(s => s.id === shiftId);
  if (shiftIndex === -1) {
    return { success: false, error: 'Shift not found or already filled.' };
  }

  const targetShift = emergencyShiftsStore[shiftIndex];
  if (targetShift.status === 'claimed') {
    return { success: false, error: 'This emergency shift was already claimed by another attendant.' };
  }

  const updatedShift: EmergencyShift = {
    ...targetShift,
    status: 'claimed',
    claimedBy: attendantId,
    claimedByName: attendantName
  };

  emergencyShiftsStore[shiftIndex] = updatedShift;

  return {
    success: true,
    shift: updatedShift
  };
}

/**
 * 6. recordAudioHandoverNotes
 * Saves an AI-structured shift handover note
 */
export async function recordAudioHandoverNotes(data: {
  attendantId: string;
  shiftId: string;
  rawTranscript: string;
  tasksCompleted: string[];
  suppliesNeeded: string[];
  observations: string;
  urgencyLevel: string;
}): Promise<{ success: boolean; handoverId: string }> {
  const handoverId = `handover_${Date.now()}`;
  return {
    success: true,
    handoverId
  };
}
