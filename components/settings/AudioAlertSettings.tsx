"use client";

import { useState } from "react";
import { playShiftClaimedChime } from "@/lib/audioAlert";
import { Volume2, Bell, CheckCircle2, Sparkles } from "lucide-react";

export default function AudioAlertSettings() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasTested, setHasTested] = useState(false);

  const handleTestChime = () => {
    setIsPlaying(true);
    playShiftClaimedChime();

    setTimeout(() => {
      setIsPlaying(false);
      setHasTested(true);
    }, 700);
  };

  const handleTestNotification = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    if (Notification.permission !== "granted") {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return;
    }

    playShiftClaimedChime();
    new Notification("Test Alert — DirectCare Hub", {
      body: "Emergency SOS audio and desktop alerts are configured correctly!",
      icon: "/icons/icon-192.png",
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
      <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Emergency Audio & Alert Settings</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              System Audio
            </span>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            Ensure your household tablet or computer can be clearly heard across the room when relief staff respond.
          </p>
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        {/* Test Chime Only */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between gap-4">
          <div>
            <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-600" />
              Speaker Chime Check
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Plays the synthesized dual-tone harmonic (C5 &rarr; G5) without triggering a live shift notification.
            </p>
          </div>

          <button
            type="button"
            onClick={handleTestChime}
            disabled={isPlaying}
            className="min-h-[48px] px-4 rounded-xl bg-white border-2 border-blue-600 text-blue-700 font-bold hover:bg-blue-50 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Volume2 className={`w-4 h-4 ${isPlaying ? "animate-bounce text-blue-600" : ""}`} />
            <span>{isPlaying ? "Playing Chime..." : "Test Audio Chime"}</span>
          </button>
        </div>

        {/* Test Chime + Desktop Notification */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between gap-4">
          <div>
            <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              Full Desktop Alert Simulation
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Fires both the speaker sound and a system desktop banner to confirm OS permissions.
            </p>
          </div>

          <button
            type="button"
            onClick={handleTestNotification}
            className="min-h-[48px] px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Simulate Shift Claim</span>
          </button>
        </div>
      </div>

      {hasTested && (
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Sound system operational. No external audio assets or network downloads required.</span>
        </div>
      )}
    </div>
  );
}
