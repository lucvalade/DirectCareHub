'use client';

import React from 'react';
import WageStatement from '@/components/payroll/WageStatement';
import { DollarSign, FileText } from 'lucide-react';
import Link from 'next/link';

interface WageStatementViewProps {
  userRole: string;
  userName: string;
}

export default function WageStatementView({ userRole, userName }: WageStatementViewProps) {
  return (
    <div className="space-y-6">
      {userRole !== 'attendant' && (
        <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-2xl p-4 sm:p-6">
          <div>
            <h3 className="text-base font-bold text-purple-900">CRA Monthly Remittance (PD7A) & WSIB Management</h3>
            <p className="text-xs text-purple-700 mt-0.5">
              Access the monthly aggregated Receiver General remittance report due by the 15th of each month.
            </p>
          </div>
          <Link
            href="/payroll/remittance"
            className="min-h-[44px] px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl inline-flex items-center space-x-2 transition shadow-sm whitespace-nowrap"
          >
            <DollarSign className="w-4 h-4" />
            <span>View CRA Remittance Summary</span>
          </Link>
        </div>
      )}

      <WageStatement
        attendantName={userName}
        attendantId="ATT-001"
        payPeriod="2026-09-01 to 2026-09-14"
        payDate="2026-09-15"
        hoursWorked={60.0}
        hourlyRate={20.00}
        paymentReference="INTERAC-ETR-893241"
      />
    </div>
  );
}
