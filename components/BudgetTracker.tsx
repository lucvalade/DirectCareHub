'use client';

import React, { useState } from 'react';
import { BudgetPeriod } from '@/types/auth';
import { Clock, TrendingUp, AlertTriangle, CheckCircle, Plus, Calendar, DollarSign } from 'lucide-react';

interface BudgetTrackerProps {
  budget: BudgetPeriod;
  onUpdateBudget: (updated: BudgetPeriod) => void;
  isEmployer: boolean;
}

export default function BudgetTracker({ budget, onUpdateBudget, isEmployer }: BudgetTrackerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [allocated, setAllocated] = useState(budget.allocatedHours);
  const [used, setUsed] = useState(budget.usedHours);
  const [statUsed, setStatUsed] = useState(budget.statHolidayHoursUsed);

  const percentageUsed = Math.min(100, Math.round((used / allocated) * 100));
  const remaining = Math.max(0, allocated - used);

  let statusColor = 'bg-emerald-500';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let statusText = 'Normal Burn Rate (On Track)';
  let StatusIcon = CheckCircle;

  if (percentageUsed >= 95) {
    statusColor = 'bg-red-500';
    badgeBg = 'bg-red-50 text-red-700 border-red-200';
    statusText = 'Critical: Near Monthly Hour Allocation Limit!';
    StatusIcon = AlertTriangle;
  } else if (percentageUsed >= 75) {
    statusColor = 'bg-amber-500';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
    statusText = 'Caution: High Monthly Allocation Burn Rate';
    StatusIcon = TrendingUp;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBudget({
      ...budget,
      allocatedHours: Number(allocated),
      usedHours: Number(used),
      statHolidayHoursUsed: Number(statUsed),
      remainingHours: Math.max(0, Number(allocated) - Number(used))
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Ontario Direct Funding
            </span>
            <span className="text-slate-400 text-sm flex items-center">
              <Calendar className="w-4 h-4 mr-1 text-slate-400" />
              Period: {budget.monthYear}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Monthly Budget Hour Meter</h2>
        </div>
        {isEmployer && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {isEditing ? 'Cancel Edit' : 'Adjust Monthly Allocation'}
          </button>
        )}
      </div>

      <div className={`mt-6 p-4 rounded-xl border flex items-center space-x-3 ${badgeBg}`}>
        <StatusIcon className="w-6 h-6 shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-sm">{statusText}</p>
          <p className="text-xs opacity-90 mt-0.5">
            {percentageUsed}% of monthly allocated Direct Funding hours consumed. {remaining} hours remaining.
          </p>
        </div>
      </div>

      {isEditing && isEmployer && (
        <form onSubmit={handleSave} className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm">Update Funding Allocation Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Allocated Hours</label>
              <input
                type="number"
                step="0.5"
                value={allocated}
                onChange={(e) => setAllocated(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Used Hours</label>
              <input
                type="number"
                step="0.5"
                value={used}
                onChange={(e) => setUsed(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Stat Holiday Hours</label>
              <input
                type="number"
                step="0.5"
                value={statUsed}
                onChange={(e) => setStatUsed(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      <div className="mt-6">
        <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
          <span>Burn Rate: {used} hrs logged</span>
          <span>Allocation: {allocated} hrs</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border border-slate-200">
          <div 
            className={`h-full transition-all duration-500 ${statusColor}`}
            style={{ width: `${percentageUsed}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Allocated Hours</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{allocated} <span className="text-sm font-normal text-slate-500">hrs</span></p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Remaining Balance</p>
          <p className="text-2xl font-extrabold text-blue-700 mt-1">{remaining} <span className="text-sm font-normal text-slate-500">hrs</span></p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Stat Holiday Hours</p>
          <p className="text-2xl font-extrabold text-purple-700 mt-1">{statUsed} <span className="text-sm font-normal text-slate-500">hrs</span></p>
        </div>
      </div>
    </div>
  );
}
