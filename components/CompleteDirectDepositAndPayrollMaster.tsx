// Developed by VertexAgent.io
// Project: DirectCare Hub - Complete Payroll, Tax, ROE, Reimbursements, CPA 005 EFT & Reversals Master Suite

'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  FileCheck, 
  Calendar, 
  DollarSign, 
  ChevronRight, 
  ArrowUpRight, 
  Send, 
  Loader2, 
  Code2,
  Briefcase,
  Receipt,
  UploadCloud,
  Check,
  X,
  CreditCard,
  Layers,
  MinusCircle,
  PlusCircle,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================================
// 1. DATA CONTRACTS & INTERFACES
// ============================================================================
export interface ApprovedReimbursementItem {
  expenseId: string;
  category: string;
  description: string;
  dateIncurred: string;
  amount: number;
}

export interface ShiftCalculationBreakdown {
  shiftId: string;
  date: string;
  regularHours: number;
  dailyOvertimeHours: number;
  dailyDoubleTimeHours: number;
  statutoryHours: number;
}

export interface AttendantBankingProfile {
  institutionNumber: string; // 3 digits (e.g., '004' for TD, '001' for BMO, '002' for Scotiabank)
  transitNumber: string;     // 5 digits branch routing
  accountNumber: string;     // Up to 12 digits
}

export interface ComprehensivePayrollStatement {
  payrollRunId: string;
  attendantId: string;
  attendantName: string;
  employerName: string;
  employerOriginatorId: string; // 10 digits for CPA 005
  provinceCode: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  paymentDate: string;          // YYYY-MM-DD
  baseHourlyRate: number;
  bankingProfile: AttendantBankingProfile;
  summary: {
    totalWorkedHours: number;
    regularHours: number;
    overtimeHours: number;
    doubleTimeHours: number;
    statutoryHours: number;
  };
  earnings: {
    regularPay: number;
    overtimePay: number;
    doubleTimePay: number;
    statutoryPay: number;
    grossTaxableWages: number;
  };
  statutoryDeductions: {
    cppEmployee: number;
    eiEmployee: number;
    incomeTax: number;
    totalDeductions: number;
  };
  reimbursements: {
    items: ApprovedReimbursementItem[];
    totalNonTaxableReimbursements: number;
  };
  finalDisbursement: {
    netTaxablePay: number;
    netTakeHomePay: number;
  };
  shiftDetails: ShiftCalculationBreakdown[];
}

export interface ExpenseClaim {
  expenseId: string;
  attendantId: string;
  attendantName: string;
  employerId: string;
  category: 'medical_supplies' | 'travel_mileage' | 'client_outings' | 'ppe' | 'other';
  description: string;
  amount: number;
  dateIncurred: string;
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  rejectionReason?: string;
  submittedAt: string;
  disbursedInPayrollRunId?: string;
}

export interface CRARemittanceRecord {
  periodId: string;
  periodMonth: string;
  dueDate: string;
  grossPayroll: number;
  cppEmployeeDeduction: number;
  cppEmployerContribution: number;
  eiEmployeeDeduction: number;
  eiEmployerContribution: number;
  federalProvincialTax: number;
  totalRemittanceDue: number;
  status: 'paid' | 'pending' | 'overdue';
  confirmationNumber?: string;
  paidAt?: string;
}

export interface YearEndT4Slip {
  taxYear: number;
  employerName: string;
  employerBN: string;
  employeeName: string;
  employeeSIN: string;
  provinceOfEmployment: string;
  box14_EmploymentIncome: number;
  box16_EmployeeCPP: number;
  box18_EmployeeEI: number;
  box22_IncomeTaxDeducted: number;
  box24_EIInsurableEarnings: number;
  box26_CPPPensionableEarnings: number;
}

export interface ServiceCanadaROERecord {
  serialNumber?: string;
  employerBN: string;
  employerName: string;
  employerAddress: string;
  employeeSIN: string;
  employeeName: string;
  employeeAddress: string;
  firstDayWorked: string;
  lastDayForWhichPaid: string;
  finalPayPeriodEnding: string;
  reasonCode: 'A' | 'E' | 'M' | 'N';
  totalInsurableHours: number;
  totalInsurableEarnings: number;
  payPeriodType: 'B';
  consecutivePayPeriods: { periodNumber: number; amount: number }[];
}

// ============================================================================
// 2. CLIENT-SAFE EFT HELPER FUNCTIONS
// ============================================================================

export function generateCPA005DirectDepositFile(statements: ComprehensivePayrollStatement[]) {
  try {
    if (!statements.length) {
      return { success: false, error: 'No statements provided for EFT file compilation.' };
    }

    const fileCreationDate = new Date();
    const yearStr = fileCreationDate.getFullYear().toString().slice(-2);
    const startOfYear = new Date(fileCreationDate.getFullYear(), 0, 0);
    const diff = fileCreationDate.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const julianDate = `0${yearStr}${dayOfYear.toString().padStart(3, '0')}`;

    const originatorId = (statements[0].employerOriginatorId || '1234567890').padEnd(10, ' ').slice(0, 10);
    const fileCreationNumber = '0001';

    let fileBuffer = '';
    const recordA = [
      'A',
      '000000001',
      originatorId,
      fileCreationNumber,
      julianDate,
      '0000',
      ''.padEnd(20, ' '),
      'CAD',
    ].join('').padEnd(1464, ' ') + '\r\n';

    fileBuffer += recordA;

    let totalCents = 0;
    let recordCount = 1;

    statements.forEach((stmt) => {
      recordCount++;
      const takeHomeCents = Math.round(stmt.finalDisbursement.netTakeHomePay * 100);
      totalCents += takeHomeCents;

      const inst = stmt.bankingProfile.institutionNumber.padStart(3, '0');
      const transit = stmt.bankingProfile.transitNumber.padStart(5, '0');
      const acct = stmt.bankingProfile.accountNumber.padEnd(12, ' ').slice(0, 12);
      const attendantName = stmt.attendantName.toUpperCase().padEnd(30, ' ').slice(0, 30);
      const employerName = stmt.employerName.toUpperCase().padEnd(30, ' ').slice(0, 30);

      const recordC = [
        'C',
        recordCount.toString().padStart(9, '0'),
        originatorId,
        fileCreationNumber,
        '200',
        takeHomeCents.toString().padStart(10, '0'),
        julianDate,
        `0${inst}${transit}`,
        acct,
        ''.padStart(22, '0'),
        '0',
        attendantName,
        employerName,
        stmt.payrollRunId.padEnd(19, ' ').slice(0, 19),
      ].join('').padEnd(1464, ' ') + '\r\n';

      fileBuffer += recordC;
    });

    recordCount++;
    const recordZ = [
      'Z',
      recordCount.toString().padStart(9, '0'),
      originatorId,
      fileCreationNumber,
      totalCents.toString().padStart(14, '0'),
      statements.length.toString().padStart(8, '0'),
      ''.padStart(14, '0'),
      ''.padStart(8, '0'),
    ].join('').padEnd(1464, ' ') + '\r\n';

    fileBuffer += recordZ;

    const totalDisbursed = Number((totalCents / 100).toFixed(2));
    const filename = `EFT_PAYROLL_${julianDate}_${fileCreationNumber}.txt`;

    return {
      success: true,
      fileContent: fileBuffer,
      filename,
      totalDisbursed,
      transactionCount: statements.length,
      message: `Generated CPA Standard 005 EFT transmission file for ${statements.length} direct deposits.`,
    };
  } catch {
    return { success: false, error: 'Failed to generate CPA 005 direct deposit file.' };
  }
}

export function generateCPA005ReversalFile(input: {
  statement: ComprehensivePayrollStatement;
  reversalReason: string;
}) {
  try {
    const { statement } = input;
    const fileCreationDate = new Date();
    const yearStr = fileCreationDate.getFullYear().toString().slice(-2);
    const startOfYear = new Date(fileCreationDate.getFullYear(), 0, 0);
    const diff = fileCreationDate.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const julianDate = `0${yearStr}${dayOfYear.toString().padStart(3, '0')}`;

    const originatorId = (statement.employerOriginatorId || '1234567890').padEnd(10, ' ').slice(0, 10);
    const fileCreationNumber = '9001';

    let fileBuffer = '';
    const recordA = [
      'A',
      '000000001',
      originatorId,
      fileCreationNumber,
      julianDate,
      '0000',
      ''.padEnd(20, ' '),
      'CAD',
    ].join('').padEnd(1464, ' ') + '\r\n';
    fileBuffer += recordA;

    const reversalCents = Math.round(statement.finalDisbursement.netTakeHomePay * 100);
    const inst = statement.bankingProfile.institutionNumber.padStart(3, '0');
    const transit = statement.bankingProfile.transitNumber.padStart(5, '0');
    const acct = statement.bankingProfile.accountNumber.padEnd(12, ' ').slice(0, 12);
    const attendantName = statement.attendantName.toUpperCase().padEnd(30, ' ').slice(0, 30);
    const employerName = statement.employerName.toUpperCase().padEnd(30, ' ').slice(0, 30);
    const crossRef = `REV-${statement.payrollRunId}`.padEnd(19, ' ').slice(0, 19);

    const recordC = [
      'C',
      '000000002',
      originatorId,
      fileCreationNumber,
      '201',
      reversalCents.toString().padStart(10, '0'),
      julianDate,
      `0${inst}${transit}`,
      acct,
      ''.padStart(22, '0'),
      '0',
      attendantName,
      employerName,
      crossRef,
    ].join('').padEnd(1464, ' ') + '\r\n';
    fileBuffer += recordC;

    const recordZ = [
      'Z',
      '000000003',
      originatorId,
      fileCreationNumber,
      reversalCents.toString().padStart(14, '0'),
      '00000001',
      reversalCents.toString().padStart(14, '0'),
      '00000001',
    ].join('').padEnd(1464, ' ') + '\r\n';
    fileBuffer += recordZ;

    const filename = `EFT_REVERSAL_201_${statement.payrollRunId}_${julianDate}.txt`;

    return {
      success: true,
      fileContent: fileBuffer,
      filename,
      reversalAmount: statement.finalDisbursement.netTakeHomePay,
      message: `Generated CPA 005 Transaction Code 201 reversal for ${statement.attendantName} ($${statement.finalDisbursement.netTakeHomePay.toFixed(2)}).`,
    };
  } catch {
    return { success: false, error: 'Failed to generate CPA 005 reversal file.' };
  }
}

// ============================================================================
// 3. MOCK DATA FIXTURES
// ============================================================================
export const MOCK_PAYROLL_STATEMENTS: ComprehensivePayrollStatement[] = [
  {
    payrollRunId: 'PR-2026-09-A',
    attendantId: 'psw-sarah-j',
    attendantName: 'Sarah Jenkins',
    employerName: 'Luc Valade (Direct Funding)',
    employerOriginatorId: '9876543210',
    provinceCode: 'ON',
    payPeriodStart: '2026-09-01',
    payPeriodEnd: '2026-09-14',
    paymentDate: '2026-09-18',
    baseHourlyRate: 24.50,
    bankingProfile: {
      institutionNumber: '004',
      transitNumber: '10292',
      accountNumber: '5284910284',
    },
    summary: {
      totalWorkedHours: 84.0,
      regularHours: 80.0,
      overtimeHours: 4.0,
      doubleTimeHours: 0.0,
      statutoryHours: 0.0,
    },
    earnings: {
      regularPay: 1960.00,
      overtimePay: 147.00,
      doubleTimePay: 0.0,
      statutoryPay: 0.0,
      grossTaxableWages: 2107.00,
    },
    statutoryDeductions: {
      cppEmployee: 125.36,
      eiEmployee: 34.98,
      incomeTax: 252.84,
      totalDeductions: 413.18,
    },
    reimbursements: {
      items: [
        {
          expenseId: 'EXP-10482',
          category: 'Travel Mileage',
          description: 'Specialist medical transit accompaniment (Hamilton Health Sciences)',
          dateIncurred: '2026-09-12',
          amount: 34.50,
        },
        {
          expenseId: 'EXP-10483',
          category: 'Medical Supplies',
          description: 'Sterile nitrile gloves & antiseptic skin prep',
          dateIncurred: '2026-09-08',
          amount: 52.80,
        },
      ],
      totalNonTaxableReimbursements: 87.30,
    },
    finalDisbursement: {
      netTaxablePay: 1693.82,
      netTakeHomePay: 1781.12,
    },
    shiftDetails: [
      { shiftId: 's-101', date: '2026-09-02', regularHours: 8, dailyOvertimeHours: 0, dailyDoubleTimeHours: 0, statutoryHours: 0 },
      { shiftId: 's-102', date: '2026-09-04', regularHours: 8, dailyOvertimeHours: 0, dailyDoubleTimeHours: 0, statutoryHours: 0 },
      { shiftId: 's-103', date: '2026-09-06', regularHours: 8, dailyOvertimeHours: 0, dailyDoubleTimeHours: 0, statutoryHours: 0 },
      { shiftId: 's-104', date: '2026-09-08', regularHours: 8, dailyOvertimeHours: 0, dailyDoubleTimeHours: 0, statutoryHours: 0 },
      { shiftId: 's-105', date: '2026-09-10', regularHours: 8, dailyOvertimeHours: 0, dailyDoubleTimeHours: 0, statutoryHours: 0 },
      { shiftId: 's-106', date: '2026-09-12', regularHours: 8, dailyOvertimeHours: 4, dailyDoubleTimeHours: 0, statutoryHours: 0 },
    ],
  },
  {
    payrollRunId: 'PR-2026-09-A',
    attendantId: 'psw-marcus-t',
    attendantName: 'Marcus Tremblay',
    employerName: 'Luc Valade (Direct Funding)',
    employerOriginatorId: '9876543210',
    provinceCode: 'ON',
    payPeriodStart: '2026-09-01',
    payPeriodEnd: '2026-09-14',
    paymentDate: '2026-09-18',
    baseHourlyRate: 25.00,
    bankingProfile: {
      institutionNumber: '001',
      transitNumber: '24012',
      accountNumber: '9182746192',
    },
    summary: {
      totalWorkedHours: 36.0,
      regularHours: 36.0,
      overtimeHours: 0.0,
      doubleTimeHours: 0.0,
      statutoryHours: 0.0,
    },
    earnings: {
      regularPay: 900.00,
      overtimePay: 0.0,
      doubleTimePay: 0.0,
      statutoryPay: 0.0,
      grossTaxableWages: 900.00,
    },
    statutoryDeductions: {
      cppEmployee: 53.55,
      eiEmployee: 14.94,
      incomeTax: 108.00,
      totalDeductions: 176.49,
    },
    reimbursements: {
      items: [
        {
          expenseId: 'EXP-10484',
          category: 'Client Outings',
          description: 'Community sensory program tickets',
          dateIncurred: '2026-09-05',
          amount: 28.00,
        },
      ],
      totalNonTaxableReimbursements: 28.00,
    },
    finalDisbursement: {
      netTaxablePay: 723.51,
      netTakeHomePay: 751.51,
    },
    shiftDetails: [
      { shiftId: 's-201', date: '2026-09-03', regularHours: 12, dailyOvertimeHours: 0, dailyDoubleTimeHours: 0, statutoryHours: 0 },
      { shiftId: 's-202', date: '2026-09-07', regularHours: 12, dailyOvertimeHours: 0, dailyDoubleTimeHours: 0, statutoryHours: 0 },
      { shiftId: 's-203', date: '2026-09-11', regularHours: 12, dailyOvertimeHours: 0, dailyDoubleTimeHours: 0, statutoryHours: 0 },
    ],
  }
];

// ============================================================================
// 4. UNIFIED WAGE STATEMENT, CPA 005 DIRECT DEPOSIT & REVERSAL SUITE
// ============================================================================
export function IntegratedWageStatementViewer({
  statements = MOCK_PAYROLL_STATEMENTS,
}: {
  statements?: ComprehensivePayrollStatement[];
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [generatingEft, setGeneratingEft] = useState(false);
  const [reversing, setReversing] = useState(false);
  const [showReversalModal, setShowReversalModal] = useState(false);
  const [reversalReason, setReversalReason] = useState('Erroneous shift duplication / incorrect hours reported');

  const statementData = statements[selectedIndex] || statements[0];
  const { summary, earnings, statutoryDeductions, reimbursements, finalDisbursement } = statementData;

  // Handle Standard CPA 005 Direct Deposit (Credit 200)
  const handleExportCPA005 = () => {
    setGeneratingEft(true);
    try {
      const res = generateCPA005DirectDepositFile(statements);
      if (res.success && res.fileContent) {
        const blob = new Blob([res.fileContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = res.filename || 'EFT_PAYROLL_DIRECT_DEPOSIT.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`CPA 005 EFT File exported! Total: $${res.totalDisbursed?.toFixed(2)} (${res.transactionCount} deposits)`);
      } else {
        toast.error(res.error || 'Failed to export EFT file.');
      }
    } catch {
      toast.error('Network error creating CPA 005 file.');
    } finally {
      setGeneratingEft(false);
    }
  };

  // Handle CPA 005 Reversal / Cancellation File (Transaction Code 201)
  const handleExportReversalFile = () => {
    setReversing(true);
    try {
      const res = generateCPA005ReversalFile({
        statement: statementData,
        reversalReason,
      });

      if (res.success && res.fileContent) {
        const blob = new Blob([res.fileContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = res.filename || 'EFT_REVERSAL_201.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setShowReversalModal(false);
        toast.success(`CPA 005 Code 201 Reversal File Exported! Recalled: $${res.reversalAmount?.toFixed(2)}`);
      } else {
        toast.error(res.error || 'Failed to generate reversal file.');
      }
    } catch {
      toast.error('Network error creating reversal transmission.');
    } finally {
      setReversing(false);
    }
  };

  return (
    <div className="bg-[#020617] border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6 max-w-4xl mx-auto backdrop-blur-xl">
      
      {/* Header & Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#7C3AED]/20 text-purple-300 border border-[#7C3AED]/30 uppercase tracking-wider">
              {statementData.provinceCode} Self-Managed Care Payroll
            </span>
            <span className="text-xs text-slate-400">• Official Paystub, EFT & Reversal Console</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Itemized Wage Statement</h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            Period: {statementData.payPeriodStart} to {statementData.payPeriodEnd} (Deposit Date: {statementData.paymentDate})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCPA005}
            disabled={generatingEft}
            className="px-4 py-2.5 rounded-2xl bg-[#0224bb] hover:bg-blue-800 border border-cyan-500/30 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(2,36,187,0.4)] disabled:opacity-50 cursor-pointer min-h-[44px]"
          >
            {generatingEft ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4 text-cyan-400" />}
            Export CPA 005 EFT File
          </button>
          
          <button
            type="button"
            onClick={() => setShowReversalModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer min-h-[44px]"
            title="Recall or reverse electronic direct deposit"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" /> Reverse Deposit
          </button>

          <button 
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer min-h-[44px]"
          >
            <Printer className="w-4 h-4 text-cyan-400" /> Print
          </button>
        </div>
      </div>

      {/* Attendant Selection Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {statements.map((stmt, idx) => (
          <button
            type="button"
            key={stmt.attendantId}
            onClick={() => setSelectedIndex(idx)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedIndex === idx
                ? 'bg-[#0224bb]/40 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
            <div className="text-left">
              <span className="block">{stmt.attendantName}</span>
              <span className="text-[10px] text-slate-400 font-normal">Take-Home: ${stmt.finalDisbursement.netTakeHomePay.toFixed(2)}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Metadata Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
        <div>
          <span className="text-slate-400 block">Attendant / Payee</span>
          <span className="font-bold text-white text-sm">{statementData.attendantName}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Direct Deposit Routing</span>
          <span className="font-mono text-cyan-300 font-bold text-xs">
            Inst {statementData.bankingProfile.institutionNumber} • Transit {statementData.bankingProfile.transitNumber}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">Bank Account</span>
          <span className="font-mono text-slate-300 font-bold text-xs">
            •••• {statementData.bankingProfile.accountNumber.slice(-4)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">Base Hourly Rate</span>
          <span className="font-bold text-cyan-400 text-sm">${statementData.baseHourlyRate.toFixed(2)}/hr</span>
        </div>
      </div>

      {/* SECTION 1: Taxable Hourly Earnings */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#7C3AED]" /> 1. Taxable Care Hours & Overtime
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Earning Component</th>
                <th className="py-2.5 px-3">Rate Factor</th>
                <th className="py-2.5 px-3 text-right">Hours</th>
                <th className="py-2.5 px-3 text-right">Effective Rate</th>
                <th className="py-2.5 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" /> Regular Care Hours
                </td>
                <td className="py-3 px-3 text-slate-400">1.0x</td>
                <td className="py-3 px-3 text-right font-mono text-slate-200">{summary.regularHours.toFixed(2)}</td>
                <td className="py-3 px-3 text-right font-mono text-slate-400">${statementData.baseHourlyRate.toFixed(2)}</td>
                <td className="py-3 px-3 text-right font-mono font-bold text-slate-100">${earnings.regularPay.toFixed(2)}</td>
              </tr>
              {summary.overtimeHours > 0 && (
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#7C3AED]" /> Overtime Hours (1.5x)
                  </td>
                  <td className="py-3 px-3 text-slate-400">1.5x</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-200">{summary.overtimeHours.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400">${(statementData.baseHourlyRate * 1.5).toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-purple-300">${earnings.overtimePay.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono">
          <span className="text-slate-300 font-bold">Total Gross Taxable Wages (CRA T4 Box 14 Subtotal):</span>
          <span className="text-sm font-black text-cyan-300">${earnings.grossTaxableWages.toFixed(2)}</span>
        </div>
      </div>

      {/* SECTION 2: Statutory Payroll Deductions */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <MinusCircle className="w-4 h-4 text-rose-400" /> 2. Statutory Source Deductions (CRA Withholdings)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-sans block">CPP Employee Contribution</span>
            <span className="text-sm font-bold text-slate-200">-${statutoryDeductions.cppEmployee.toFixed(2)}</span>
            <span className="text-[10px] text-slate-500 font-sans block">Box 16 Pension Deduction</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-sans block">EI Employee Premium</span>
            <span className="text-sm font-bold text-slate-200">-${statutoryDeductions.eiEmployee.toFixed(2)}</span>
            <span className="text-[10px] text-slate-500 font-sans block">Box 18 Insurable Premium</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-sans block">Federal & Provincial Tax</span>
            <span className="text-sm font-bold text-slate-200">-${statutoryDeductions.incomeTax.toFixed(2)}</span>
            <span className="text-[10px] text-slate-500 font-sans block">Box 22 Total Tax Withheld</span>
          </div>
        </div>

        <div className="flex justify-between items-center p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-300">
          <span className="font-bold">Total Statutory Deductions:</span>
          <span className="font-black text-sm">-${statutoryDeductions.totalDeductions.toFixed(2)}</span>
        </div>
      </div>

      {/* SECTION 3: Approved Non-Taxable Reimbursements */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-emerald-400" /> 3. Non-Taxable Expense Reimbursements (Additive)
          </h4>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            100% Tax Free
          </span>
        </div>

        {reimbursements.items.length > 0 ? (
          <div className="space-y-2">
            {reimbursements.items.map((item) => (
              <div
                key={item.expenseId}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{item.description}</span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] bg-white/5 text-slate-400 uppercase">
                      {item.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                    Ref #{item.expenseId} • Incurred {item.dateIncurred}
                  </span>
                </div>
                <div className="font-mono font-bold text-emerald-400 text-sm">
                  +${item.amount.toFixed(2)}
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300">
              <span className="font-bold">Total Non-Taxable Reimbursement Disbursal:</span>
              <span className="font-black text-sm">+${reimbursements.totalNonTaxableReimbursements.toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 text-center text-xs text-slate-500">
            No approved out-of-pocket care expense claims attached to this pay period.
          </div>
        )}
      </div>

      {/* SECTION 4: Take-Home Net Summary */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0224bb]/30 via-[#020617] to-[#7C3AED]/30 border border-white/15 space-y-4 shadow-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Gross Wages</span>
            <span className="text-xl font-mono font-bold text-white">${earnings.grossTaxableWages.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-400 block">Less: Statutory Taxes</span>
            <span className="text-xl font-mono font-bold text-rose-300">-${statutoryDeductions.totalDeductions.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Plus: Tax-Free Expenses</span>
            <span className="text-xl font-mono font-bold text-emerald-300">+${reimbursements.totalNonTaxableReimbursements.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-400 block">
              Total Net Take-Home Pay (CPA 005 Direct Deposit)
            </span>
            <span className="text-xs text-slate-400">
              Net Taxable Pay (${finalDisbursement.netTaxablePay.toFixed(2)}) + Non-Taxable Reimbursements (${reimbursements.totalNonTaxableReimbursements.toFixed(2)})
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono text-cyan-300 tracking-tight drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            ${finalDisbursement.netTakeHomePay.toFixed(2)}
          </div>
        </div>
      </div>

      {/* CPA 005 Format Guarantee Footnote */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 border-t border-white/10 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Payments Canada Standard 005 (1464-byte Fixed Length) EFT & Code 201 Reversals Supported
        </span>
        <span className="font-mono text-slate-500">ORIGINATOR: {statementData.employerOriginatorId}</span>
      </div>

      {/* Modal: CPA 005 Bank Payment Reversal (Transaction Code 201) */}
      {showReversalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#020617] border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(244,63,94,0.2)] text-white space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Generate CPA 005 Reversal File</h3>
                  <span className="text-[10px] text-rose-400 uppercase font-semibold">Transaction Code 201 Recall</span>
                </div>
              </div>
              <button type="button" onClick={() => setShowReversalModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Attendant:</span>
                  <span className="font-bold text-white">{statementData.attendantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank Account:</span>
                  <span className="font-mono text-cyan-300">•••• {statementData.bankingProfile.accountNumber.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount to Recall:</span>
                  <span className="font-mono font-bold text-rose-400 text-sm">${statementData.finalDisbursement.netTakeHomePay.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Original Run ID:</span>
                  <span className="font-mono text-slate-300">{statementData.payrollRunId}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Audit Justification / Cancellation Reason</label>
                <textarea
                  rows={3}
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Payments Canada rules require reversal files (Code 201) to be submitted to your financial institution within the designated clearing window (typically within 48 to 72 hours of initial settlement).
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReversalModal(false)}
                className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExportReversalFile}
                disabled={reversing}
                className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all disabled:opacity-50 cursor-pointer min-h-[44px]"
              >
                {reversing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4 text-white" />}
                Export Reversal 201 File
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ============================================================================
// 5. MASTER ROUTE WRAPPER COMPONENT
// ============================================================================
export default function CompleteDirectDepositAndPayrollMasterPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 sm:p-12 space-y-8">
      <IntegratedWageStatementViewer />
    </div>
  );
}
