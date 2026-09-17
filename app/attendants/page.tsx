'use client';

import React, { useState } from 'react';
import NavigationHeader from '@/components/NavigationHeader';
import { Users, Phone, Mail, Award, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';

interface Attendant {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  hourlyRate: number;
  cprExpiry: string;
  wsibStatus: 'clear' | 'pending';
  reliefAvailable: boolean;
}

const INITIAL_ROSTER: Attendant[] = [
  {
    id: 'att_1',
    name: 'Elena Rostova',
    role: 'Lead PSW / Attendant',
    phone: '647-555-0144',
    email: 'elena.rostova@care.ca',
    hourlyRate: 23.50,
    cprExpiry: '2027-06-10',
    wsibStatus: 'clear',
    reliefAvailable: true
  },
  {
    id: 'att_2',
    name: 'Kavita Patel',
    role: 'Evening Attendant',
    phone: '416-555-0812',
    email: 'kavita.p@care.ca',
    hourlyRate: 23.50,
    cprExpiry: '2026-11-15',
    wsibStatus: 'clear',
    reliefAvailable: true
  },
  {
    id: 'att_3',
    name: 'Marcus Bell',
    role: 'Relief / Weekend Attendant',
    phone: '905-555-0329',
    email: 'marcus.bell@care.ca',
    hourlyRate: 24.00,
    cprExpiry: '2027-01-20',
    wsibStatus: 'clear',
    reliefAvailable: false
  }
];

export default function AttendantsPage() {
  const [roster] = useState<Attendant[]>(INITIAL_ROSTER);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <NavigationHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Attendant Team & Roster</h1>
              <p className="text-xs font-medium text-slate-500">
                Direct Funding hired attendants, emergency relief availability, and credentials
              </p>
            </div>
          </div>
        </div>

        {/* Attendants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roster.map((attendant) => (
            <div
              key={attendant.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{attendant.name}</h3>
                    <p className="text-xs font-semibold text-blue-600">{attendant.role}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    attendant.reliefAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {attendant.reliefAvailable ? 'Relief On-Call' : 'Off-Duty'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{attendant.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{attendant.email}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hourly Rate</span>
                    <span className="font-bold text-slate-900">${attendant.hourlyRate.toFixed(2)}/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">CPR Expiry</span>
                    <span className="font-bold text-slate-900">{attendant.cprExpiry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">WSIB Ontario</span>
                    <span className="font-bold text-emerald-700 flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Cleared
                    </span>
                  </div>
                </div>
              </div>

              <a
                href={`tel:${attendant.phone}`}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold text-center transition block cursor-pointer"
              >
                Call Attendant
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
