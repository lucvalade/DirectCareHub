'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import { MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import InteractiveRunbook from './InteractiveRunbook';

interface ShiftData {
  status: 'assigned' | 'arrived' | 'in_progress' | 'completed' | 'scheduled' | 'sos_active';
  assigned_to?: string;
  actual_start_time?: any;
}

export default function EmployerRunbookDashboard({ activeShiftId }: { activeShiftId: string }) {
  const [shift, setShift] = useState<ShiftData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeShiftId) return;

    const shiftRef = doc(db, 'shifts', activeShiftId);

    const unsubscribe = onSnapshot(
      shiftRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as ShiftData;
          
          // Trigger a success toast exactly when the status flips to arrived
          if (shift?.status === 'assigned' && data.status === 'arrived') {
            toast.success("Attendant has arrived. Runbook unlocked.", {
              style: {
                background: '#020617',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
              },
              iconTheme: { primary: '#22d3ee', secondary: '#020617' } // Neon cyan accent
            });
          }
          
          setShift(data);
        } else {
          // Fallback demo data if doc not in Firestore yet
          setShift({ status: 'assigned' });
        }
        setLoading(false);
      },
      (err) => {
        console.warn("EmployerRunbookDashboard listener notice:", err);
        setShift({ status: 'assigned' });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [activeShiftId, shift?.status]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#020617] rounded-3xl border border-white/10">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
      </div>
    );
  }

  // State 1: Attendant is en route or tracking
  if (!shift || shift.status === 'assigned' || shift.status === 'scheduled') {
    return (
      <div className="bg-[#020617] p-8 rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#0224bb]/40 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6 min-h-[300px]">
          <div className="p-6 bg-white/5 rounded-full border border-white/10 shadow-[0_0_20px_rgba(2,36,187,0.3)]">
            <MapPin className="w-12 h-12 text-[#7C3AED] animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Tracking Arrival</h2>
            <p className="text-slate-400 max-w-sm">
              Waiting for the attendant's device to breach the 50m geofence. The care runbook will unlock automatically upon arrival.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Attendant has arrived (Runbook Unlocked)
  return (
    <InteractiveRunbook shiftId={activeShiftId} userRole="employer" />
  );
}
