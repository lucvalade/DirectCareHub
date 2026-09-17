'use client';

import React from 'react';
import NavigationHeader from '@/components/NavigationHeader';
import { Landmark, Calendar, Download, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RemittancePage() {
  const remittanceData = {
    period: 'August 2026',
    dueDate: 'September 15, 2026',
    employeesCount: 3,
    grossPayroll: 4210.00,
    cppEmployee: 215.30,
    cppEmployer: 215.30, // 1.0x match
    eiEmployee: 69.80,
    eiEmployer: 97.72, // 1.4x match
    incomeTax: 380.40,
    totalRemittance: 978.52,
    status: 'Ready to File'
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <NavigationHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-700 text-white rounded-2xl shadow-sm">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">CRA Monthly Remittance (PD7A)</h1>
              <p className="text-xs font-medium text-slate-500">
                Receiver General for Canada payroll tax deductions and Direct Funding budget reporting
              </p>
            </div>
          </div>
        </div>

        {/* Remittance Detail Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div className="border-b pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-900">FORM PD7A STATEMENT OF ACCOUNT</h2>
              <p className="text-xs text-slate-500">Direct Funding Employer Payroll Number: 84920 1829 RP0001</p>
            </div>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-xl">
              Due: {remittanceData.dueDate}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b">
              <span className="text-slate-600 font-medium">Number of Employees in Remittance Period</span>
              <span className="font-bold text-slate-900">{remittanceData.employeesCount}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-slate-600 font-medium">Gross Payroll for Month</span>
              <span className="font-bold text-slate-900">${remittanceData.grossPayroll.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-slate-600 font-medium">CPP Contributions (Employee $215.30 + Employer Match $215.30)</span>
              <span className="font-bold text-slate-900">${(remittanceData.cppEmployee + remittanceData.cppEmployer).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-slate-600 font-medium">EI Premiums (Employee $69.80 + Employer 1.4x $97.72)</span>
              <span className="font-bold text-slate-900">${(remittanceData.eiEmployee + remittanceData.eiEmployer).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-slate-600 font-medium">Total Federal & Provincial Income Tax Withheld</span>
              <span className="font-bold text-slate-900">${remittanceData.incomeTax.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-6 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-purple-900 uppercase tracking-wider">Total CRA Remittance Required</p>
              <p className="text-xs text-purple-700">Payable via CRA My Business Account online banking</p>
            </div>
            <p className="text-3xl font-black text-purple-950">${remittanceData.totalRemittance.toFixed(2)}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
