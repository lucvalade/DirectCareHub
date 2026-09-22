'use client';

import { Toast, toast } from 'react-hot-toast';
import { Phone, X, MapPin, UserCircle, CheckCircle2 } from 'lucide-react';

interface ToastProps {
  t: Toast;
  attendantName: string;
  attendantPhone: string;
  etaMinutes: number;
}

export default function AttendantEnRouteToast({ t, attendantName, attendantPhone, etaMinutes }: ToastProps) {
  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex flex-col ring-1 ring-slate-900/5 overflow-hidden`}
    >
      {/* Header Banner */}
      <div className="bg-emerald-500 p-4 flex items-center gap-3">
        <CheckCircle2 className="w-6 h-6 text-white" />
        <h3 className="font-bold text-white text-lg m-0">SOS Resolved</h3>
      </div>

      {/* Body Content */}
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <UserCircle className="w-12 h-12 text-slate-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Relief Attendant</p>
            <p className="text-xl font-bold text-slate-900">{attendantName}</p>
            <div className="flex items-center gap-1.5 text-emerald-600 mt-1 font-semibold">
              <MapPin className="w-4 h-4" />
              <span>ETA: ~{etaMinutes} minutes</span>
            </div>
          </div>
        </div>

        <p className="text-slate-600 text-sm">
          The shift has been securely assigned to {attendantName.split(' ')[0]}. Their payroll profile is active.
        </p>

        {/* Action Buttons (AODA Compliant 48px min-height) */}
        <div className="flex gap-3 mt-2">
          {attendantPhone && (
            <a
              href={`tel:${attendantPhone}`}
              className="flex-1 flex items-center justify-center gap-2 bg-[#0224bb] text-white font-bold rounded-xl min-h-[48px] hover:bg-blue-800 transition-colors focus:ring-4 focus:ring-blue-300"
              onClick={() => toast.dismiss(t.id)}
            >
              <Phone className="w-5 h-5" />
              Call Now
            </a>
          )}
          <button
            onClick={() => toast.dismiss(t.id)}
            aria-label="Dismiss notification"
            className="flex items-center justify-center bg-slate-100 text-slate-600 rounded-xl min-h-[48px] min-w-[48px] hover:bg-slate-200 transition-colors focus:ring-4 focus:ring-slate-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
