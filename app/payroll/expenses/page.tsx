'use client';

import React from 'react';
import NavigationHeader from '@/components/NavigationHeader';
import ExpensesHub from '@/components/payroll/ExpensesHub';
import { useAuth } from '@/context/AuthContext';

export default function ExpensesPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <NavigationHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Out-Of-Pocket Expenses & Reimbursements</h1>
          <p className="text-xs text-slate-500">Track, approve, and audit tax-exempt business expenses for attendants</p>
        </div>

        <ExpensesHub />
      </main>
    </div>
  );
}
