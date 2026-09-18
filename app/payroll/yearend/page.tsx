'use client';

import React from 'react';
import NavigationHeader from '@/components/NavigationHeader';
import YearEndHub from '@/components/payroll/YearEndHub';

const DEFAULT_ATTENDANTS = [
  { id: 'psw_elena_02', name: 'Elena Rostova (Lead PSW)' },
  { id: 'att_2', name: 'Kavita Patel (Evening Attendant)' },
  { id: 'att_3', name: 'Marcus Bell (Relief Attendant)' }
];

export default function YearEndPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <NavigationHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <YearEndHub 
          employerId="emp_ontario_01" 
          attendants={DEFAULT_ATTENDANTS} 
        />
      </main>
    </div>
  );
}
