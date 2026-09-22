'use client';

import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface BannerProps {
  allocated: number;
  spent: number;
  status: 'healthy' | 'warning' | 'critical';
  projectedDate: string;
}

export default function BudgetAlertBanner({ allocated, spent, status, projectedDate }: BannerProps) {
  const percentageSpent = Math.min(100, Math.round((spent / allocated) * 100));

  const styles = {
    healthy: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      message: 'Care budget burn rate is tracking safely within provincial parameters.',
    },
    warning: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
      message: `Elevated overtime detected. Funds are projected to exhaust by ${projectedDate}.`,
    },
    critical: {
      border: 'border-red-500/30',
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      icon: <AlertTriangle className="w-6 h-6 text-red-500 animate-bounce" />,
      message: `CRITICAL: Budget exhaustion imminent on ${projectedDate}. Immediate shift adjustments required.`,
    },
  }[status];

  return (
    <div className={`bg-[#020617] border ${styles.border} rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 w-full h-1 ${styles.bg}`} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${styles.bg} border ${styles.border} shrink-0`}>
            {styles.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold">Quarterly Care Budget Health</h2>
            <p className="text-sm text-slate-400">CILT / CSIL Administrative Allocation Monitor</p>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-white/5 px-5 py-3 rounded-2xl border border-white/10">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Spent</p>
            <p className="text-lg font-bold text-slate-100">${spent.toLocaleString()}</p>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Allocated</p>
            <p className="text-lg font-bold text-cyan-400">${allocated.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400 font-medium">Burn Rate Utilization</span>
          <span className={`font-bold ${styles.text}`}>{percentageSpent}% Spent</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              status === 'critical' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' :
              status === 'warning' ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' :
              'bg-[#22d3ee] shadow-[0_0_15px_rgba(34,211,238,0.5)]'
            }`}
            style={{ width: `${percentageSpent}%` }}
          />
        </div>
      </div>

      <div className={`p-4 rounded-2xl ${styles.bg} border ${styles.border} flex items-center gap-3`}>
        <p className={`text-sm font-semibold ${styles.text}`}>{styles.message}</p>
      </div>
    </div>
  );
}
