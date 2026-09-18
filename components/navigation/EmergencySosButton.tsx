"use client";

import { useState, useRef, useEffect } from "react";
import { AlertTriangle, Loader2, CheckCircle2, X } from "lucide-react";

interface EmergencySosButtonProps {
  onTriggerBroadcast?: () => Promise<void> | void;
  reliefAttendantCount?: number;
}

export default function EmergencySosButton({
  onTriggerBroadcast,
  reliefAttendantCount = 3,
}: EmergencySosButtonProps) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100%
  const [isDispatched, setIsDispatched] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const HOLD_DURATION_MS = 3000;

  const triggerDispatch = async () => {
    setIsDispatching(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([100, 50, 200]);
    }

    try {
      if (onTriggerBroadcast) {
        await onTriggerBroadcast();
      }
      setIsDispatched(true);
      setShowConfirmModal(false);
      // Reset status badge after 5 seconds
      setTimeout(() => {
        setIsDispatched(false);
      }, 5000);
    } catch (err) {
      console.error("SOS Dispatch failed:", err);
    } finally {
      setIsDispatching(false);
      resetHold();
    }
  };

  const startHold = () => {
    if (isDispatched || isDispatching) return;
    setHolding(true);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setProgress(pct);

      if (elapsed >= HOLD_DURATION_MS) {
        clearInterval(timerRef.current!);
        triggerDispatch();
      }
    }, 40);
  };

  const resetHold = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setHolding(false);
    setProgress(0);
  };

  const handleClick = () => {
    // If tapped without completing the 3s hold, open confirmation modal
    if (!isDispatched && !isDispatching && progress < 100) {
      setShowConfirmModal(true);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (isDispatched) {
    return (
      <div 
        role="status"
        aria-live="polite"
        className="min-h-[48px] px-4 rounded-xl bg-emerald-50 text-emerald-800 border-2 border-emerald-300 font-bold flex items-center gap-2 text-sm shadow-sm"
      >
        <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-bounce" />
        <span>Alert Dispatched!</span>
      </div>
    );
  }

  return (
    <>
      {/* Primary SOS Button */}
      <div className="relative inline-block select-none">
        <button
          type="button"
          onMouseDown={startHold}
          onMouseUp={resetHold}
          onMouseLeave={resetHold}
          onTouchStart={startHold}
          onTouchEnd={resetHold}
          onClick={handleClick}
          disabled={isDispatching}
          aria-label="Emergency Relief SOS. Press and hold for 3 seconds or click to confirm."
          className="relative overflow-hidden min-h-[48px] px-5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors border-2 border-rose-700 outline-none focus:ring-4 focus:ring-rose-300 cursor-pointer"
        >
          {/* Progress Bar Fill Overlay */}
          <div
            className="absolute inset-0 bg-rose-950/40 pointer-events-none transition-all"
            style={{
              width: `${progress}%`,
              transition: holding ? "width 40ms linear" : "width 200ms ease-out",
            }}
          />

          <span className="relative z-10 flex items-center gap-2 text-xs sm:text-sm tracking-wide">
            {isDispatching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Broadcasting...</span>
              </>
            ) : holding ? (
              <>
                <AlertTriangle className="w-4 h-4 animate-bounce" />
                <span>Hold ({Math.ceil((HOLD_DURATION_MS - (progress / 100) * HOLD_DURATION_MS) / 1000)}s)...</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>Emergency SOS</span>
              </>
            )}
          </span>
        </button>
      </div>

      {/* Accessible Fallback Confirmation Modal */}
      {showConfirmModal && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="sos-modal-title"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-200">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                aria-label="Cancel broadcast"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <h3 id="sos-modal-title" className="text-xl font-black text-slate-900">
                Broadcast Emergency Relief SOS?
              </h3>
              <p className="text-slate-600 text-sm mt-2">
                This will instantly dispatch urgent SMS notifications to{" "}
                <strong className="text-slate-900">{reliefAttendantCount} relief attendants</strong> on your backup roster:
              </p>
              
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 italic leading-relaxed">
                "Direct Funding Urgent Alert: Coverage requested starting immediately. Reply YES to accept shift."
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 min-h-[48px] px-4 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={triggerDispatch}
                disabled={isDispatching}
                className="flex-1 min-h-[48px] px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isDispatching ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Confirm & Send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
