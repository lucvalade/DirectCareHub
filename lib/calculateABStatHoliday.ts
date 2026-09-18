// Developed by VertexAgent.io 
// Project: DirectCare Hub - AB Statutory Holiday Engine

export interface ABStatHolidayDailyShift {
  hours: number;
  regular_wages: number;
  overtime_wages: number;
}

export interface ABStatHolidayParams {
  wage_rate: number;
  lookback_shifts_28_days: ABStatHolidayDailyShift[]; // Strict 4-week window
  hours_worked_on_holiday: number;
  absent_without_consent?: boolean; // Fails eligibility if true
}

export interface ABStatHolidayResult {
  is_eligible: boolean;
  stat_holiday_pay: number; 
  premium_pay: number;      
  total_pay: number;
}

/**
 * Calculates Alberta (SMC) Statutory Holiday Pay
 * strictly adhering to the 4-week 5% rule and flat 1.5x premium.
 */
export function calculateABStatHoliday(params: ABStatHolidayParams): ABStatHolidayResult {
  // 1. Eligibility Check
  // Alberta grants eligibility immediately upon employment unless absent without consent.
  if (params.absent_without_consent) {
    return {
      is_eligible: false,
      stat_holiday_pay: 0,
      premium_pay: 0,
      total_pay: 0,
    };
  }

  // 2. The 5% General Holiday Pay Calculation
  // Total regular wages in the 4 weeks (28 days) preceding the holiday
  const totalRegularWages = params.lookback_shifts_28_days.reduce((sum, shift) => {
    return sum + shift.regular_wages;
  }, 0);

  const statHolidayPay = totalRegularWages * 0.05;

  // 3. Stacked Premium Calculation (If they worked on the holiday)
  let premiumPay = 0;
  if (params.hours_worked_on_holiday > 0) {
    // Alberta: 1.5x regular wage for ALL hours worked (No tier 2 double-time)
    premiumPay = params.hours_worked_on_holiday * (params.wage_rate * 1.5);
  }

  // 4. Total Owed for the Day
  const totalPay = premiumPay + statHolidayPay;

  return {
    is_eligible: true, 
    stat_holiday_pay: Number(statHolidayPay.toFixed(2)),
    premium_pay: Number(premiumPay.toFixed(2)),
    total_pay: Number(totalPay.toFixed(2)),
  };
}
