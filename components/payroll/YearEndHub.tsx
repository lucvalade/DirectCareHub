"use client";

import { useState } from "react";
import { generateT4Data, generateROEData, T4Data, ROEData } from "@/app/actions/yearEnd";
import { FileBarChart, Download, ArrowRight, Activity } from "lucide-react";

interface YearEndHubProps {
  employerId: string;
  attendants: { id: string; name: string }[];
}

export default function YearEndHub({ employerId, attendants }: YearEndHubProps) {
  const [selectedAttendant, setSelectedAttendant] = useState(attendants[0]?.id || "");
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [t4Data, setT4Data] = useState<T4Data | null>(null);
  const [roeData, setRoeData] = useState<ROEData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchT4 = async () => {
    setIsLoading(true);
    const res = await generateT4Data(employerId, selectedAttendant, taxYear);
    if (res.data) setT4Data(res.data);
    setIsLoading(false);
  };

  const fetchROE = async () => {
    setIsLoading(true);
    const res = await generateROEData(employerId, selectedAttendant);
    if (res.data) setRoeData(res.data);
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileBarChart className="text-blue-600 h-7 w-7" />
            Year-End & Record of Employment Hub
          </h2>
          <p className="text-slate-600 mt-1">Generate CRA T4 aggregates and Service Canada ROE breakdowns.</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            value={selectedAttendant}
            onChange={(e) => setSelectedAttendant(e.target.value)}
            className="flex-1 md:w-48 min-h-[48px] px-4 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
          >
            {attendants.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select
            value={taxYear}
            onChange={(e) => setTaxYear(Number(e.target.value))}
            className="w-32 min-h-[48px] px-4 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* T4 Aggregation Card */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">T4 Tax Summary ({taxYear})</h3>
            <button 
              onClick={fetchT4}
              disabled={isLoading}
              className="bg-blue-600 text-white min-h-[48px] px-4 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-slate-300"
            >
              Run T4 Engine
            </button>
          </div>
          
          {t4Data ? (
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-white border border-slate-200 rounded-md">
                <span className="text-slate-600 font-medium">Box 14 (Gross Income)</span>
                <span className="text-slate-900 font-bold">${t4Data.box14_gross_income.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-3 bg-white border border-slate-200 rounded-md">
                <span className="text-slate-600 font-medium">Box 16 (CPP Deducted)</span>
                <span className="text-slate-900 font-bold">${t4Data.box16_cpp_contributions.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-3 bg-white border border-slate-200 rounded-md">
                <span className="text-slate-600 font-medium">Box 18 (EI Deducted)</span>
                <span className="text-slate-900 font-bold">${t4Data.box18_ei_premiums.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-3 bg-white border border-slate-200 rounded-md">
                <span className="text-slate-600 font-medium">Box 22 (Income Tax)</span>
                <span className="text-slate-900 font-bold">${t4Data.box22_income_tax.toFixed(2)}</span>
              </div>
            </div>
          ) : (
             <div className="h-48 flex items-center justify-center text-slate-500 bg-white border border-dashed border-slate-300 rounded-lg">
               Tap to calculate T4 boxes
             </div>
          )}
        </div>

        {/* ROE Data Card */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" /> Service Canada ROE
            </h3>
            <button 
              onClick={fetchROE}
              disabled={isLoading}
              className="bg-blue-100 text-blue-800 border border-blue-200 min-h-[48px] px-4 rounded-lg font-bold hover:bg-blue-200 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              Generate ROE Data
            </button>
          </div>
          
          {roeData ? (
            <div className="space-y-4">
              <div className="bg-white p-4 border border-blue-200 rounded-lg shadow-sm border-l-4 border-l-blue-600">
                <p className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-1">Block 15A (Last 27 Periods)</p>
                <p className="text-2xl font-black text-slate-900">{roeData.block15A_insurable_hours.toFixed(1)} <span className="text-sm font-normal text-slate-600">Hours</span></p>
              </div>
              <div className="bg-white p-4 border border-blue-200 rounded-lg shadow-sm border-l-4 border-l-blue-600">
                <p className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-1">Block 15B (Last 14 Periods)</p>
                <p className="text-2xl font-black text-slate-900">${roeData.block15B_insurable_earnings.toFixed(2)}</p>
              </div>
              <button className="w-full min-h-[48px] mt-2 flex items-center justify-center gap-2 bg-white text-blue-600 font-semibold rounded-lg border border-slate-300 hover:bg-slate-50">
                <Download className="h-5 w-5" /> Export Block 15C Detailed CSV
              </button>
            </div>
          ) : (
             <div className="h-48 flex items-center justify-center text-slate-500 bg-white border border-dashed border-slate-300 rounded-lg">
               Tap to calculate ROE blocks
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
