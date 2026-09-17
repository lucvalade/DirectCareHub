'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PayrollRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/payroll/stubs');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-600 font-medium text-sm">Opening Payroll & Pay Stubs Hub...</p>
      </div>
    </div>
  );
}
