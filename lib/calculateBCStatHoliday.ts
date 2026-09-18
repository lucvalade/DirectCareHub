// Developed by VertexAgent.io 
// Project: DirectCare Hub - BC Statutory Holiday Engine

export interface BCStatHolidayDailyShift {
  hours: number;
  regular_wages: number;
  overtime_wages: number;
}

export interface BCStatHolidayParams {
  wage_rate: number;
  days_employed: number;
  lookback_shifts_30_days: BCStatHolidayDailyShift[];
  hours_worked_on_holiday: number;
}

export interface BCStatHolidayResult {
  is_eligible: boolean;
  average_days_pay: number;
  premium_pay: number;
  stat_holiday_pay: number;
}

/**
 * Calculates British Columbia (CSIL) Statutory Holiday Pay
 * strictly adhering to the Employment Standards Act 15/30 test and average day's pay rules.
 */
export function calculateBCStatHoliday(params: BCStatHolidayParams): BCStatHolidayResult {
  const daysWorked = params.lookback_shifts_30_days.length;

  // 1. Eligibility Check: The 15/30 Rule
  // Must be employed >= 30 days AND have earned wages on >= 15 of the last 30 days.
  const isEligible = params.days_employed >= 30 && daysWorked >= 15;

  if (!isEligible) {
    return {
      is_eligible: false,
      average_days_pay: 0,
      premium_pay: 0,
      stat_holiday_pay: 0,
    };
  }

  // 2. Average Day's Pay Calculation
  // Total regular wages (strictly excluding overtime) divided by total days worked in the 30-day window.
  const totalRegularWages = params.lookback_shifts_30_days.reduce((sum, shift) => {
    return sum + shift.regular_wages;
  }, 0);

  const averageDaysPay = daysWorked > 0 ? totalRegularWages / daysWorked : 0;

  // 3. Stacked Premium Calculation (If they worked on the holiday)
  let premiumPay = 0;
  
  if (params.hours_worked_on_holiday > 0) {
    const hoursWorked = params.hours_worked_on_holiday;

    // Tier 1: First 12 hours at 1.5x regular wage
    const tier1Hours = Math.min(hoursWorked, 12);
    premiumPay += tier1Hours * (params.wage_rate * 1.5);

    // Tier 2: Hours beyond 12 at 2.0x regular wage
    if (hoursWorked > 12) {
      const tier2Hours = hoursWorked - 12;
      premiumPay += tier2Hours * (params.wage_rate * 2.0);
    }
  }

  // 4. Total Owed for the Day
  // The premium stacks ON TOP of the average day's pay, rather than replacing it.
  const statHolidayPay = premiumPay + averageDaysPay;

  return {
    is_eligible: isEligible,
    average_days_pay: Number(averageDaysPay.toFixed(2)),
    premium_pay: Number(premiumPay.toFixed(2)),
    stat_holiday_pay: Number(statHolidayPay.toFixed(2)),
  };
}
