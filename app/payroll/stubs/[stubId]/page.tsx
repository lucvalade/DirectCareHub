'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import NavigationHeader from '@/components/NavigationHeader';
import { useAuth } from '@/context/AuthContext';
import WageStatement from '@/components/payroll/WageStatement';
import { ArrowLeft, FileText, Calendar } from 'lucide-react';

export default function PayStubDetailPage() {
  const params = useParams();
  const { userProfile, signOut } = useAuth();
  if (!params) return null;
  const stubId = params.stubId as string;

  // In production, fetch stub from Firestore using stubId. For demo, we render WageStatement with sample data.
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavigationHeader
        userRole={userProfile?.role || 'employer'}
        userName={userProfile?.displayName || 'Direct Funding Employer'}
        activeTab="payroll"
        onSignOut={signOut}
      />

      <div className="max-w-5xl w-full mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/payroll/stubs"
            className="inline-flex items-center space-x-2 text-sm font-bold text-slate-700 hover:text-blue-700 transition min-h-[44px] px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-blue-300"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back to All Wage Statements</span>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              href="/payroll/remittance"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-xl transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>CRA Remittance</span>
            </Link>
          </div>
        </div>

        <WageStatement
          attendantName="Sarah Jenkins, PSW"
          attendantId="ATT-001"
          payPeriod="2026-09-01 to 2026-09-14"
          payDate="2026-09-15"
          hoursWorked={60.0}
          hourlyRate={20.00}
          paymentReference="INTERAC-ETR-893241"
        />
      </div>
    </div>
  );
}
