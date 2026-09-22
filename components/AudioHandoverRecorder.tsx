'use client';

import { useState, useRef } from 'react';
import { Mic, Square, UploadCloud, CheckCircle2 } from 'lucide-react';
import { saveHandoverOffline } from '@/lib/offlineAudioStorage';
import toast from 'react-hot-toast';

export default function AudioHandoverRecorder({ shiftId }: { shiftId: string }) {
  const [recording, setRecording] = useState(false);
  const [saved, setSaved] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Save to IndexedDB for offline persistence
        await saveHandoverOffline(shiftId, audioBlob);
        setSaved(true);

        // Attempt background sync registration if supported
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          try {
            const reg = await navigator.serviceWorker.ready;
            await (reg as any).sync.register('sync-audio-handovers');
          } catch (syncErr) {
            console.warn("SyncManager registration fallback:", syncErr);
          }
        }

        toast.success("Handover audio saved securely (Offline Ready).");
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
    } catch (error) {
      console.error("Microphone access denied or unavailable:", error);
      toast.error("Microphone access required for voice handovers.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="bg-[#020617] border border-white/10 rounded-3xl p-6 text-white shadow-2xl flex flex-col items-center text-center gap-4">
      <div className="p-4 bg-white/5 border border-white/10 rounded-full shrink-0">
        <Mic className={`w-8 h-8 ${recording ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`} />
      </div>
      <div>
        <h3 className="text-xl font-bold">End-of-Shift Voice Handover</h3>
        <p className="text-sm text-slate-400">Record a verbal summary for the incoming relief attendant.</p>
      </div>

      {saved ? (
        <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-6 py-3 rounded-xl w-full justify-center">
          <CheckCircle2 className="w-5 h-5" />
          Handover Stored Locally & Queued for Sync
        </div>
      ) : recording ? (
        <button
          type="button"
          onClick={stopRecording}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all min-h-[48px] cursor-pointer"
        >
          <Square className="w-5 h-5 fill-current" />
          Stop & Save Handover
        </button>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          className="w-full flex items-center justify-center gap-2 bg-[#0224bb] hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition-all min-h-[48px] cursor-pointer"
        >
          <UploadCloud className="w-5 h-5 text-cyan-400" />
          Start Voice Recording
        </button>
      )}
    </div>
  );
}
