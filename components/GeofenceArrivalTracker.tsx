'use client';

import { useEffect, useRef, useState } from 'react';
import { getDistanceInMeters } from '@/lib/geoUtils';
import { logGeofencedArrival } from '@/actions/logGeofencedArrival';
import { MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

interface TrackerProps {
  shiftId: string;
  attendantId: string;
  employerCoords: { lat: number; lng: number }; // Target destination
}

export default function GeofenceArrivalTracker({ shiftId, attendantId, employerCoords }: TrackerProps) {
  const [distanceToTarget, setDistanceToTarget] = useState<number | null>(null);
  const [hasArrived, setHasArrived] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Stop tracking if already arrived
    if (hasArrived || typeof window === 'undefined' || !navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Ignore highly inaccurate GPS pings (e.g., cell tower triangulation > 100m variance)
        if (accuracy > 100) return;

        const currentDistance = getDistanceInMeters(
          latitude, 
          longitude, 
          employerCoords.lat, 
          employerCoords.lng
        );

        setDistanceToTarget(currentDistance);

        // TRIGGER: Breach the 50-meter radius
        if (currentDistance <= 50 && !hasArrived) {
          setHasArrived(true); // Optimistic UI update to prevent duplicate firing
          
          // Clear the GPS watcher immediately to save battery
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
          }

          toast.success("You have entered the 50m geofence. Arrival logged automatically.");

          // Log to Firestore
          await logGeofencedArrival({ shiftId, attendantId });
        }
      },
      (error) => {
        console.error("GPS Tracking Error:", error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    // Cleanup the GPS watcher if the component unmounts
    return () => {
      if (watchIdRef.current !== null && typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [hasArrived, shiftId, attendantId, employerCoords]);

  // Provide a manual fallback for the attendant in case of GPS hardware failure
  if (hasArrived) return null;

  return (
    <div className="bg-slate-100 rounded-xl p-4 flex items-center justify-between shadow-sm border border-slate-200">
      <div className="flex items-center gap-3">
        <MapPin className="text-[#0224bb] w-6 h-6 animate-pulse" />
        <div>
          <p className="font-bold text-slate-900 text-sm">Live GPS Tracking Active</p>
          <p className="text-slate-500 text-xs">
            {distanceToTarget !== null 
              ? `${distanceToTarget} meters from destination` 
              : "Acquiring satellite lock..."}
          </p>
        </div>
      </div>
      <button 
        onClick={async () => {
          setHasArrived(true);
          await logGeofencedArrival({ shiftId, attendantId });
          toast.success("Manual arrival logged.");
        }}
        className="text-sm font-semibold text-[#0224bb] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors cursor-pointer"
      >
        I'm Here
      </button>
    </div>
  );
}
