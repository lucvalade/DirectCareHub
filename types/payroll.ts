export interface AttendantPayrollProfile {
  uid: string;
  hourly_rate: number;
  vacation_pay_percent: number; // default 4.0%
  claim_code_federal: number; // default 1
  claim_code_ontario: number; // default 1
  payment_method: "etransfer" | "direct_deposit" | "cheque";
  payment_details: {
    email?: string;
    bank_institution?: string;
    transit_number?: string;
    account_number?: string;
    cheque_memo?: string;
  };
}

export interface PayPeriodRun {
  id: string;
  start_date: string; // ISO
  end_date: string; // ISO
  pay_date: string; // ISO
  status: "draft" | "approved" | "paid";
  total_gross_wages: number;
  total_employer_liabilities: number; // Employer CPP + Employer EI + WSIB estimate
  total_net_disbursement: number;
  processed_by: string; // userId of employer or bookkeeper
  created_at?: string;
}

export interface PayStub {
  id: string;
  attendant_id: string;
  attendant_name: string;
  pay_run_id: string;
  regular_hours: number;
  regular_wages: number;
  stat_holiday_hours: number;
  stat_holiday_wages: number;
  vacation_pay_amount: number;
  gross_pay: number;
  
  // Employee Deductions
  cpp_deduction: number;
  ei_deduction: number;
  income_tax_deduction: number;
  total_deductions: number;

  net_pay: number;

  // Employer Contributions (Liabilities)
  employer_cpp: number; // 100% matching of employee CPP
  employer_ei: number; // 140% / 1.4x of employee EI
  wsib_insurable_earnings: number;

  payment_status: "pending" | "sent";
  payment_reference: string; // e.g., Interac e-Transfer reference or Cheque #
  shift_ids: string[];
}
