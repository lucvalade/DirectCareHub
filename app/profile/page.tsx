'use client';

import React from 'react';
import NavigationHeader from '@/components/NavigationHeader';
import { useAuth } from '@/context/AuthContext';
import { Settings, User, Phone, ShieldCheck, Mail, FileText } from 'lucide-react';

export default function ProfilePage() {
  const { userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <NavigationHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-slate-700 text-white rounded-2xl shadow-sm">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Household & Profile Settings</h1>
            <p className="text-xs font-medium text-slate-500">
              Direct Funding Program participant agreement details and contact parameters
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="flex items-center space-x-4 border-b pb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xl">
              {userProfile?.displayName ? userProfile.displayName.charAt(0) : 'U'}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{userProfile?.displayName}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800">
                {userProfile?.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <p className="font-bold text-slate-400 uppercase text-[10px]">Email Address</p>
              <p className="font-bold text-slate-900">{userProfile?.email}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <p className="font-bold text-slate-400 uppercase text-[10px]">Phone Number</p>
              <p className="font-bold text-slate-900">{userProfile?.phone || '416-555-0192'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <p className="font-bold text-slate-400 uppercase text-[10px]">Direct Funding IL Resource Centre</p>
              <p className="font-bold text-slate-900">Centre for Independent Living in Toronto (CILT)</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <p className="font-bold text-slate-400 uppercase text-[10px]">Approved Monthly Hours</p>
              <p className="font-bold text-slate-900">180.0 Hours / Month</p>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-bold">Emergency Attendant Contact:</p>
            <p>{userProfile?.emergencyContact || 'Sarah Miller (Sister) - 416-555-0199'}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
