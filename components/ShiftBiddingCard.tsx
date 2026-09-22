'use client';

import { useState } from 'react';
import { Calendar, Clock, DollarSign, Send, CheckCircle2 } from 'lucide-react';
import { submitShiftBid } from '@/actions/submitShiftBid';
import toast from 'react-hot-toast';

interface ShiftCardProps {
  shiftId: string;
  attendantId: string;
  date: string;
  timeRange: string;
  hourlyRate: number;
}

export default function ShiftBiddingCard({ shiftId, attendantId, date, timeRange, hourlyRate }: ShiftCardProps) {
  const [hasBid, setHasBid] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBidSubmission = async () => {
    setLoading(true);
    const response = await submitShiftBid({
      shift_id: shiftId,
      attendant_id: attendantId,
      status: 'pending',
      submitted_at: null,
    });

    if (response.success) {
      setHasBid(true);
      toast.success("Bid submitted successfully. The employer has been notified.");
    } else if (response.error === 'already_bid') {
      toast.error("You have already placed a bid on this shift.");
      setHasBid(true);
    } else {
      toast.error("Failed to submit bid. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#020617] border border-white/10 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
            Open Shift
          </span>
          <div className="flex items-center text-emerald-400 font-bold text-lg">
            <DollarSign className="w-5 h-5" />
            <span>{hourlyRate.toFixed(2)} / hr</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="w-5 h-5 text-[#7C3AED]" />
            <span className="font-semibold">{date}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-5 h-5 text-[#7C3AED]" />
            <span>{timeRange}</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        {hasBid ? (
          <div className="flex items-center justify-center gap-2 py-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl font-bold min-h-[48px]">
            <CheckCircle2 className="w-5 h-5" />
            Bid Submitted
          </div>
        ) : (
          <button
            type="button"
            onClick={handleBidSubmission}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#0224bb] hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all min-h-[48px] focus:ring-4 focus:ring-blue-300 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-5 h-5 text-cyan-400" />
            {loading ? 'Submitting Bid...' : 'Place Shift Bid'}
          </button>
        )}
      </div>
    </div>
  );
}
