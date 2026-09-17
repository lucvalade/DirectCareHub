'use client';

import React, { useState } from 'react';
import NavigationHeader from '@/components/NavigationHeader';
import { DollarSign, Printer, Download, FileText, CheckCircle } from 'lucide-react';

interface PayStubItem {
  id: string;
  attendantName: string;
  sinLast3: string;
  payPeriod: string;
  payDate: string;
  hoursWorked: number;
  hourlyRate: number;
  grossWages: number;
  vacationPay: number; // 4% ESA
  totalGross: number;
  cpp: number;
  ei: number;
  incomeTax: number;
  totalDeductions: number;
  netPay: number;
}

const SAMPLE_STUBS: PayStubItem[] = [
  {
    id: 'stub_101',
    attendantName: 'Elena Rostova',
    sinLast3: '782',
    payPeriod: 'Sept 01 - Sept 15, 2026',
    payDate: 'Sept 20, 2026',
    hoursWorked: 60.0,
    hourlyRate: 23.50,
    grossWages: 1410.00,
    vacationPay: 56.40,
    totalGross: 1466.40,
    cpp: 75.30,
    ei: 24.34,
    incomeTax: 125.60,
    totalDeductions: 225.24,
    netPay: 1241.16
  }
];

export default function PayStubsPage() {
  const [stubs] = useState<PayStubItem[]>(SAMPLE_STUBS);
  const [selectedStub, setSelectedStub] = useState<PayStubItem>(SAMPLE_STUBS[0]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <NavigationHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-sm">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ontario Pay Stubs & Wage Statements</h1>
              <p className="text-xs font-medium text-slate-500">
                ESA itemized statements, vacation pay (4%), CPP/EI withholdings, and DF fund allocations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-xs flex items-center space-x-2 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Itemized Statement</span>
          </button>
        </div>

        {/* Pay Stub Detail Card (Direct Funding Legal Format) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">STATEMENT OF EARNINGS AND DEDUCTIONS</h2>
              <p className="text-xs text-slate-500 mt-1">Direct Funding Program • Ontario Centre for Independent Living (CILT)</p>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-600 space-y-0.5">
              <p><span className="font-bold">Pay Date:</span> {selectedStub.payDate}</p>
              <p><span className="font-bold">Period:</span> {selectedStub.payPeriod}</p>
              <p><span className="font-bold">Cheque/Stub Ref:</span> #{selectedStub.id}</p>
            </div>
          </div>

          {/* Employee & Employer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-400 uppercase text-[10px]">Employer</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">Luc Valade</p>
              <p className="text-slate-600">Individual Direct Funding Employer</p>
              <p className="text-slate-500">CRA Payroll # 84920 1829 RP0001</p>
            </div>
            <div>
              <p className="font-bold text-slate-400 uppercase text-[10px]">Employee (Attendant / PSW)</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedStub.attendantName}</p>
              <p className="text-slate-600">SIN: XXX-XXX-{selectedStub.sinLast3}</p>
              <p className="text-slate-500">Rate: ${selectedStub.hourlyRate.toFixed(2)}/hr</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b pb-1">Earnings</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Regular Hours ({selectedStub.hoursWorked} hrs @ ${selectedStub.hourlyRate.toFixed(2)})</span>
                  <span className="font-bold text-slate-900">${selectedStub.grossWages.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Vacation Pay (4% ESA Statutory)</span>
                  <span className="font-bold text-slate-900">${selectedStub.vacationPay.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-black text-sm text-slate-900">
                  <span>Total Gross Earnings</span>
                  <span>${selectedStub.totalGross.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b pb-1">Employee Deductions</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Canada Pension Plan (CPP)</span>
                  <span className="font-bold text-slate-900">${selectedStub.cpp.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Employment Insurance (EI)</span>
                  <span className="font-bold text-slate-900">${selectedStub.ei.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Federal & Ontario Income Tax</span>
                  <span className="font-bold text-slate-900">${selectedStub.incomeTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-black text-sm text-slate-900">
                  <span>Total Deductions</span>
                  <span>${selectedStub.totalDeductions.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay Callout */}
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Net Amount Payable</p>
              <p className="text-xs text-emerald-700">Direct Deposit / E-Transfer into attendant account</p>
            </div>
            <p className="text-3xl font-black text-emerald-900">${selectedStub.netPay.toFixed(2)}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
