// Developed by VertexAgent.io
// Project: DirectCare Hub - Advanced Payroll & Overtime Engine

export interface ExtendedPayrollResult {
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;
  grossPay: number;
  cppDeduction: number;
  eiDeduction: number;
  incomeTax: number;
  netPay: number;
  employerCpp: number;
  employerEi: number;
  totalCraRemittance: number;
}

/**
 * Calculates bi-weekly payroll with automated 1.5x overtime calculation.
 */
export function calculateBiWeeklyPayrollWithOvertime(
  hourlyRate: number, 
  totalHours: number
): ExtendedPayrollResult {
  // Standard bi-weekly threshold based on 44 hours/week (88 hours total per pay period)
  const BI_WEEKLY_REGULAR_THRESHOLD = 88.0;

  const regularHours = Math.min(totalHours, BI_WEEKLY_REGULAR_THRESHOLD);
  const overtimeHours = Math.max(0, totalHours - BI_WEEKLY_REGULAR_THRESHOLD);

  const regularPay = regularHours * hourlyRate;
  const overtimePay = overtimeHours * (hourlyRate * 1.5); // 1.5x statutory multiplier
  const grossPay = regularPay + overtimePay;

  // CRA Statutory Deductions
  const CPP_RATE = 0.0595;
  const BI_WEEKLY_CPP_EXEMPTION = 3500 / 26;
  const EI_RATE = 0.0166;
  const FEDERAL_BASE_TAX = 0.15;
  const ONTARIO_BASE_TAX = 0.0505;

  const pensionableEarnings = Math.max(0, grossPay - BI_WEEKLY_CPP_EXEMPTION);
  const cppDeduction = pensionableEarnings * CPP_RATE;
  const eiDeduction = grossPay * EI_RATE;

  const taxableIncome = Math.max(0, grossPay - cppDeduction - eiDeduction);
  const incomeTax = taxableIncome * (FEDERAL_BASE_TAX + ONTARIO_BASE_TAX); 

  const netPay = grossPay - cppDeduction - eiDeduction - incomeTax;

  const employerCpp = cppDeduction;
  const employerEi = eiDeduction * 1.4;
  const totalCraRemittance = cppDeduction + employerCpp + eiDeduction + employerEi + incomeTax;

  return {
    regularHours,
    overtimeHours,
    regularPay,
    overtimePay,
    grossPay,
    cppDeduction,
    eiDeduction,
    incomeTax,
    netPay,
    employerCpp,
    employerEi,
    totalCraRemittance
  };
}
