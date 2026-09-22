'use client';

import { useEffect, useRef } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';
import { playSosResolvedChime } from '@/lib/audioUtils';
import { toast } from 'react-hot-toast';
import AttendantEnRouteToast from './AttendantEnRouteToast';
import { getDrivingEta } from '@/actions/getDrivingEta';

export default function SosResolutionListener({ activeShiftId, employerId = "employer_1" }: { activeShiftId: string, employerId?: string }) {
  const previousStatusRef = useRef<string>('sos_active');

  useEffect(() => {
    if (!activeShiftId) return;

    const shiftRef = doc(db, 'shifts', activeShiftId);

    const unsubscribe = onSnapshot(shiftRef, async (docSnap) => {
      if (docSnap.exists()) {
        const shiftData = docSnap.data();
        const currentStatus = shiftData.status;

        if (previousStatusRef.current === 'sos_active' && currentStatus === 'assigned') {
          const assignedAttendantId = shiftData.assigned_to;

          try {
            // 1. Fetch both the Employer and Attendant profiles concurrently
            const [userDoc, employerDoc] = await Promise.all([
              getDoc(doc(db, 'users', assignedAttendantId)),
              getDoc(doc(db, 'users', employerId))
            ]);

            const userData = userDoc.exists() ? userDoc.data() : null;
            const employerData = employerDoc.exists() ? employerDoc.data() : null;

            let liveEtaMinutes = userData?.default_eta_minutes || 30; // Default SLA

            // 2. Extract coordinates and calculate live Mapbox ETA
            const userCoords = userData?.coordinates;
            const employerCoords = employerData?.coordinates;

            if (userCoords && employerCoords) {
              const attendantLng = typeof userCoords.lng === 'number' ? userCoords.lng : userCoords[0];
              const attendantLat = typeof userCoords.lat === 'number' ? userCoords.lat : userCoords[1];
              const employerLng = typeof employerCoords.lng === 'number' ? employerCoords.lng : employerCoords[0];
              const employerLat = typeof employerCoords.lat === 'number' ? employerCoords.lat : employerCoords[1];

              if (typeof attendantLng === 'number' && typeof attendantLat === 'number' &&
                  typeof employerLng === 'number' && typeof employerLat === 'number') {
                liveEtaMinutes = await getDrivingEta({
                  attendantCoords: [attendantLng, attendantLat],
                  employerCoords: [employerLng, employerLat]
                });
              }
            }

            // 3. Play the synthesized Web Audio API Chime
            playSosResolvedChime();

            // 4. Trigger the interactive UI with the live Mapbox data
            toast.custom(
              (t) => (
                <AttendantEnRouteToast 
                  t={t} 
                  attendantName={userData?.name || 'A Relief Attendant'} 
                  attendantPhone={userData?.phone || ''}
                  etaMinutes={liveEtaMinutes}
                />
              ),
              { duration: Infinity, position: 'top-center' }
            );

          } catch (error) {
            console.error("Failed to construct SOS resolution notification:", error);
          }
        }

        previousStatusRef.current = currentStatus;
      }
    });

    return () => unsubscribe();
  }, [activeShiftId, employerId]);

  return null;
}
