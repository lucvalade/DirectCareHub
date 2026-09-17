'use server';

import { PayPeriodRun, PayStub } from '@/types/payroll';
import { calculateAttendantPayroll } from '@/lib/payrollEngine';

const MAX_IN_MEMORY_RECORDS = 50;

// In-memory or simulated database storage for server actions in preview environment
let mockPayRuns: PayPeriodRun[] = [
  {
    id: 'run_2026_09_01',
    start_date: '2026-09-01',
    end_date: '2026-09-14',
    pay_date: '2026-09-15',
    status: 'approved',
    total_gross_wages: 1248.00,
    total_employer_liabilities: 161.58,
    total_net_disbursement: 1075.91,
    processed_by: 'employer_user_1',
    created_at: '2026-09-14T12:00:00Z'
  }
];

let mockPayStubs: PayStub[] = [
  {
    id: 'stub_001',
    attendant_id: 'att_1',
    attendant_name: 'Sarah Jenkins, PSW',
    pay_run_id: 'run_2026_09_01',
    regular_hours: 60.0,
    regular_wages: 1200.00,
    stat_holiday_hours: 0,
    stat_holiday_wages: 0,
    vacation_pay_amount: 48.00,
    gross_pay: 1248.00,
    cpp_deduction: 66.25,
    ei_deduction: 20.34,
    income_tax_deduction: 85.50,
    total_deductions: 172.09,
    net_pay: 1075.91,
    employer_cpp: 66.25,
    employer_ei: 28.48,
    wsib_insurable_earnings: 1248.00,
    payment_status: 'sent',
    payment_reference: 'INTERAC-ETR-893241',
    shift_ids: ['shift_1', 'shift_2']
  }
];

export async function getPayRuns(): Promise<PayPeriodRun[]> {
  try {
    return [...mockPayRuns];
  } catch (err) {
    console.error('getPayRuns error:', err);
    return [];
  }
}

export async function getPayStubsForRun(runId: string): Promise<PayStub[]> {
  try {
    if (!runId) return [];
    return mockPayStubs.filter(s => s.pay_run_id === runId);
  } catch (err) {
    console.error('getPayStubsForRun error:', err);
    return [];
  }
}

export async function createDraftPayRun(startDate: string, endDate: string, payDate: string, processedBy: string): Promise<PayPeriodRun> {
  try {
    const runId = `run_${Date.now()}`;
    
    // Calculate sample stub for demo attendants
    const calc = calculateAttendantPayroll({ regularHours: 60, hourlyRate: 20 });

    const newStub: PayStub = {
      id: `stub_${Date.now()}`,
      attendant_id: 'att_1',
      attendant_name: 'Sarah Jenkins, PSW',
      pay_run_id: runId,
      regular_hours: 60,
      regular_wages: calc.regularWages,
      stat_holiday_hours: 0,
      stat_holiday_wages: 0,
      vacation_pay_amount: calc.vacationPayAmount,
      gross_pay: calc.grossPay,
      cpp_deduction: calc.cppDeduction,
      ei_deduction: calc.eiDeduction,
      income_tax_deduction: calc.incomeTaxDeduction,
      total_deductions: calc.totalDeductions,
      net_pay: calc.netPay,
      employer_cpp: calc.employerCpp,
      employer_ei: calc.employerEi,
      wsib_insurable_earnings: calc.wsibInsurableEarnings,
      payment_status: 'pending',
      payment_reference: '',
      shift_ids: ['shift_101', 'shift_102']
    };

    mockPayStubs.push(newStub);
    if (mockPayStubs.length > MAX_IN_MEMORY_RECORDS) {
      mockPayStubs = mockPayStubs.slice(-MAX_IN_MEMORY_RECORDS);
    }

    const newRun: PayPeriodRun = {
      id: runId,
      start_date: startDate || new Date().toISOString().split('T')[0],
      end_date: endDate || new Date().toISOString().split('T')[0],
      pay_date: payDate || new Date().toISOString().split('T')[0],
      status: 'draft',
      total_gross_wages: calc.grossPay,
      total_employer_liabilities: calc.employerCpp + calc.employerEi + (calc.grossPay * 0.022),
      total_net_disbursement: calc.netPay,
      processed_by: processedBy || 'employer_user_1',
      created_at: new Date().toISOString()
    };

    mockPayRuns.unshift(newRun);
    if (mockPayRuns.length > MAX_IN_MEMORY_RECORDS) {
      mockPayRuns = mockPayRuns.slice(0, MAX_IN_MEMORY_RECORDS);
    }

    return newRun;
  } catch (err) {
    console.error('createDraftPayRun error:', err);
    throw new Error('Failed to create draft pay run');
  }
}

export async function finalizeAndLockPayRun(runId: string): Promise<boolean> {
  try {
    const run = mockPayRuns.find(r => r.id === runId);
    if (run) {
      run.status = 'approved';
      return true;
    }
    return false;
  } catch (err) {
    console.error('finalizeAndLockPayRun error:', err);
    return false;
  }
}

export async function recordPaymentDisbursement(stubId: string, paymentReference: string): Promise<boolean> {
  try {
    const stub = mockPayStubs.find(s => s.id === stubId);
    if (stub) {
      stub.payment_status = 'sent';
      stub.payment_reference = paymentReference;
      return true;
    }
    return false;
  } catch (err) {
    console.error('recordPaymentDisbursement error:', err);
    return false;
  }
}

export async function getCRAMonthlyRemittanceSummary(month: number, year: number) {
  try {
    let totalEmployeeCpp = 0;
    let totalEmployerCpp = 0;
    let totalEmployeeEi = 0;
    let totalEmployerEi = 0;
    let totalIncomeTax = 0;

    mockPayStubs.forEach(s => {
      totalEmployeeCpp += s.cpp_deduction || 0;
      totalEmployerCpp += s.employer_cpp || 0;
      totalEmployeeEi += s.ei_deduction || 0;
      totalEmployerEi += s.employer_ei || 0;
      totalIncomeTax += s.income_tax_deduction || 0;
    });

    const grandTotalCRA = totalEmployeeCpp + totalEmployerCpp + totalEmployeeEi + totalEmployerEi + totalIncomeTax;

    return {
      month,
      year,
      totalEmployeeCpp: Math.round(totalEmployeeCpp * 100) / 100,
      totalEmployerCpp: Math.round(totalEmployerCpp * 100) / 100,
      totalEmployeeEi: Math.round(totalEmployeeEi * 100) / 100,
      totalEmployerEi: Math.round(totalEmployerEi * 100) / 100,
      totalIncomeTax: Math.round(totalIncomeTax * 100) / 100,
      grandTotalCRA: Math.round(grandTotalCRA * 100) / 100,
      dueDate: `${year}-${String(month + 1).padStart(2, '0')}-15`
    };
  } catch (err) {
    console.error('getCRAMonthlyRemittanceSummary error:', err);
    return {
      month,
      year,
      totalEmployeeCpp: 0,
      totalEmployerCpp: 0,
      totalEmployeeEi: 0,
      totalEmployerEi: 0,
      totalIncomeTax: 0,
      grandTotalCRA: 0,
      dueDate: `${year}-${String(month + 1).padStart(2, '0')}-15`
    };
  }
}
