export interface PayrollCalculationInput {
  regularHours: number;
  hourlyRate: number;
  statHours?: number;
  statRate?: number;
  federalClaimCode?: number;
  ontarioClaimCode?: number;
}

export interface PayrollCalculationResult {
  regularWages: number;
  statHolidayWages: number;
  subtotalWages: number;
  vacationPayAmount: number;
  grossPay: number;
  cppDeduction: number;
  eiDeduction: number;
  incomeTaxDeduction: number;
  totalDeductions: number;
  netPay: number;
  employerCpp: number;
  employerEi: number;
  wsibInsurableEarnings: number;
}

export function calculateAttendantPayroll(input: PayrollCalculationInput): PayrollCalculationResult {
  const regularHours = input.regularHours || 0;
  const hourlyRate = input.hourlyRate || 20.0;
  const statHours = input.statHours || 0;
  const statRate = input.statRate || (hourlyRate * 1.5);

  const regularWages = regularHours * hourlyRate;
  const statHolidayWages = statHours * statRate;
  const subtotalWages = regularWages + statHolidayWages;

  // 4% minimum vacation pay under Ontario ESA
  const vacationPayAmount = subtotalWages * 0.04;
  const grossPay = subtotalWages + vacationPayAmount;

  // CPP Calculation (Bi-weekly basic exemption: $3,500 / 26 = $134.62)
  const biWeeklyExemption = 134.62;
  const pensionableEarnings = Math.max(0, grossPay - biWeeklyExemption);
  const cppDeduction = pensionableEarnings * 0.0595; // 5.95% employee rate

  // EI Calculation (1.63% employee rate for Ontario)
  const eiDeduction = grossPay * 0.0163;

  // Federal & Provincial Income Tax Estimation (TD1 Claim Code 1 default)
  // Simplified progressive bracket model or standard TD1 estimate based on gross
  let incomeTaxDeduction = 0;
  if (grossPay > 300) {
    incomeTaxDeduction = Math.round((grossPay * 0.125) * 100) / 100;
  } else {
    incomeTaxDeduction = Math.round((grossPay * 0.08) * 100) / 100;
  }

  const totalDeductions = cppDeduction + eiDeduction + incomeTaxDeduction;
  const netPay = grossPay - totalDeductions;

  // Employer Contributions
  const employerCpp = cppDeduction; // 1.0x matching
  const employerEi = eiDeduction * 1.4; // 1.4x matching under EI premium reduction / standard rules
  const wsibInsurableEarnings = grossPay;

  return {
    regularWages: Math.round(regularWages * 100) / 100,
    statHolidayWages: Math.round(statHolidayWages * 100) / 100,
    subtotalWages: Math.round(subtotalWages * 100) / 100,
    vacationPayAmount: Math.round(vacationPayAmount * 100) / 100,
    grossPay: Math.round(grossPay * 100) / 100,
    cppDeduction: Math.round(cppDeduction * 100) / 100,
    eiDeduction: Math.round(eiDeduction * 100) / 100,
    incomeTaxDeduction: Math.round(incomeTaxDeduction * 100) / 100,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    netPay: Math.round(netPay * 100) / 100,
    employerCpp: Math.round(employerCpp * 100) / 100,
    employerEi: Math.round(employerEi * 100) / 100,
    wsibInsurableEarnings: Math.round(wsibInsurableEarnings * 100) / 100,
  };
}
