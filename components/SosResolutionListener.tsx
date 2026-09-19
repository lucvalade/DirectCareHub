'use client';

import { useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import { playSosResolvedChime } from '@/lib/audioUtils';
import { CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SosResolutionListener({ activeShiftId }: { activeShiftId: string }) {
  // Use a ref to track previous status and prevent firing the chime on initial mount
  const previousStatusRef = useRef<string>('sos_active');

  useEffect(() => {
    if (!activeShiftId || typeof window === 'undefined') return;

    let unsubscribe = () => {};

    try {
      const shiftRef = doc(db, 'shifts', activeShiftId);

      // Initialize real-time listener
      unsubscribe = onSnapshot(shiftRef, (docSnap) => {
        if (docSnap.exists()) {
          const shiftData = docSnap.data();
          const currentStatus = shiftData.status;

          // Detect the exact transition from 'sos_active' to 'assigned'
          if (previousStatusRef.current === 'sos_active' && currentStatus === 'assigned') {
            
            // 1. Fire the synthesized audio chime
            playSosResolvedChime();

            // 2. Display visual confirmation
            toast.success('SOS Resolved! An attendant has claimed the shift.', {
              icon: <CheckCircle className="text-emerald-500 w-5 h-5" />,
              duration: 5000,
            });
          }

          // Update the ref for the next snapshot
          previousStatusRef.current = currentStatus;
        }
      }, (err) => {
        console.warn('Firestore onSnapshot listener error:', err);
      });
    } catch (e) {
      console.warn('Real-time SOS listener initialization skipped (demo mode):', e);
    }

    // Cleanup the WebSocket listener when the component unmounts
    return () => unsubscribe();
  }, [activeShiftId]);

  return null; // Headless component
}
