// Developed by VertexAgent.io 
// Project: DirectCare Hub - Multi-Jurisdiction Payroll & Compliance Engine

export interface OvertimeRule {
  daily_tier1_hours: number | null;
  daily_tier1_rate: number | null;
  daily_tier2_hours: number | null;
  daily_tier2_rate: number | null;
  weekly_hours: number;
  weekly_rate: number;
}

export interface DailyShift {
  date: string;
  hours_worked: number;
}

export interface OvertimeCalculationResult {
  regular_hours: number;
  tier1_hours: number;  // 1.5x multiplier
  tier2_hours: number;  // 2.0x multiplier (BC specific)
}

/**
 * Calculates compliant regular and overtime hours for a 7-day work week.
 * Supports both British Columbia (CSIL) and Alberta (SMC) labor standards.
 */
export function calculateWeeklyOvertime(
  jurisdictionCode: "ON" | "BC" | "AB" | "MB" | "SK" | "NS" | "QC",
  weeklyShifts: DailyShift[],
  rules: OvertimeRule
): OvertimeCalculationResult {
  let totalHoursWorked = 0;
  let totalDailyOvertimeTier1 = 0;
  let totalDailyOvertimeTier2 = 0;
  
  // Base tracker to prevent double-counting daily overtime against the weekly limit (Critical for BC)
  let totalRegularHoursForWeeklyCap = 0;

  // 1. Process Daily Thresholds
  weeklyShifts.forEach((shift) => {
    totalHoursWorked += shift.hours_worked;
    let hoursLeftToProcess = shift.hours_worked;
    
    let shiftTier2 = 0;
    let shiftTier1 = 0;
    let shiftRegular = 0;

    // Check Tier 2 (e.g., BC > 12 hours)
    if (rules.daily_tier2_hours !== null && hoursLeftToProcess > rules.daily_tier2_hours) {
      shiftTier2 = hoursLeftToProcess - rules.daily_tier2_hours;
      hoursLeftToProcess = rules.daily_tier2_hours;
    }

    // Check Tier 1 (e.g., AB/BC > 8 hours)
    if (rules.daily_tier1_hours !== null && hoursLeftToProcess > rules.daily_tier1_hours) {
      shiftTier1 = hoursLeftToProcess - rules.daily_tier1_hours;
      hoursLeftToProcess = rules.daily_tier1_hours;
    }

    // Remaining hours are regular daily hours
    shiftRegular = hoursLeftToProcess;

    totalDailyOvertimeTier2 += shiftTier2;
    totalDailyOvertimeTier1 += shiftTier1;
    totalRegularHoursForWeeklyCap += shiftRegular;
  });

  // 2. Process Weekly Thresholds & Reconciliation
  
  if (jurisdictionCode === "AB") {
    // ALBERTA 8/44 RULE: Overtime is the GREATER of total daily overtime OR weekly hours exceeding 44.
    const totalDailyOvertime = totalDailyOvertimeTier1; // AB does not have Tier 2
    const totalWeeklyOvertime = Math.max(0, totalHoursWorked - rules.weekly_hours);
    
    const appliedOvertime = Math.max(totalDailyOvertime, totalWeeklyOvertime);
    
    return {
      regular_hours: totalHoursWorked - appliedOvertime,
      tier1_hours: appliedOvertime,
      tier2_hours: 0
    };
  } 
  
  if (jurisdictionCode === "BC") {
    // BRITISH COLUMBIA: Daily overtime is isolated. Weekly overtime only applies 
    // if the accumulated *regular* hours exceed the weekly limit of 40.
    let weeklyOvertimeTier1 = 0;
    
    if (totalRegularHoursForWeeklyCap > rules.weekly_hours) {
      weeklyOvertimeTier1 = totalRegularHoursForWeeklyCap - rules.weekly_hours;
    }

    return {
      regular_hours: totalRegularHoursForWeeklyCap - weeklyOvertimeTier1,
      tier1_hours: totalDailyOvertimeTier1 + weeklyOvertimeTier1,
      tier2_hours: totalDailyOvertimeTier2
    };
  }

  // Fallback for standard weekly-only jurisdictions (e.g., Ontario default 44 hours, no daily cap)
  const standardWeeklyOvertime = Math.max(0, totalHoursWorked - rules.weekly_hours);
  
  return {
    regular_hours: totalHoursWorked - standardWeeklyOvertime,
    tier1_hours: standardWeeklyOvertime,
    tier2_hours: 0
  };
}
