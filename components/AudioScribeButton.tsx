'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, WifiOff } from 'lucide-react';
import { set, get, del, keys } from 'idb-keyval';
import { uploadAudioToStorage } from '@/lib/firebase/storage';
import { generateStructuredShiftNote } from '@/actions/scribeShift';
import type { ShiftScribeResult } from '@/schemas/shiftScribe';

interface AudioScribeButtonProps {
  shiftId: string;
  onHandoverProcessed?: (note: ShiftScribeResult) => void;
}

export default function AudioScribeButton({ shiftId, onHandoverProcessed }: AudioScribeButtonProps) {
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'offline_saved' | 'syncing'>('idle');
  const [pendingCacheKey, setPendingCacheKey] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 1. Register Service Worker and check IndexedDB on component mount
  useEffect(() => {
    // Register Service Worker for PWA Background Sync support
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn('Service Worker registration skipped or restricted:', err);
      });
    }

    const checkOfflineCache = async () => {
      try {
        const storedKeys = await keys();
        const offlineKey = storedKeys.find(k => typeof k === 'string' && k.startsWith(`handover_${shiftId}`));
        if (offlineKey) {
          setPendingCacheKey(offlineKey as string);
          setStatus('offline_saved');
        }
      } catch (e) {
        console.error("IndexedDB read error:", e);
      }
    };
    checkOfflineCache();
  }, [shiftId]);

  // 2. Core Processing Engine
  const processAndUpload = async (audioBlob: Blob, cacheKey: string) => {
    try {
      const uploadResult = await uploadAudioToStorage(audioBlob, shiftId);
      const structuredNote = await generateStructuredShiftNote(
        uploadResult.fileUri, 
        'audio/webm',
        uploadResult.isBase64
      );
      
      console.log('Successfully Processed Handover:', structuredNote);

      if (onHandoverProcessed) {
        onHandoverProcessed(structuredNote);
      }
      
      // Cleanup local cache on absolute success
      await del(cacheKey);
      setPendingCacheKey(null);
      setStatus('idle');
      
    } catch (error) {
      console.error("Network request failed. Handover safely cached locally in IndexedDB.", error);
      setStatus('offline_saved');

      // Register Background Sync task if supported by browser
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          // @ts-ignore - TypeScript handles SyncManager dynamically
          await registration.sync.register('sync-offline-handovers');
          console.log("Background sync registered. Audio will upload automatically upon reconnection.");
        } catch (syncErr) {
          console.warn("Background sync registration failed:", syncErr);
        }
      }
    }
  };

  // 3. Recording Initialization
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setStatus('processing');
        stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const cacheKey = `handover_${shiftId}_${Date.now()}`;
        
        // FAIL-SAFE: Save to IndexedDB immediately before attempting network upload
        await set(cacheKey, audioBlob);
        setPendingCacheKey(cacheKey);

        // Check online status
        if (typeof navigator !== 'undefined' && navigator.onLine) {
          await processAndUpload(audioBlob, cacheKey);
        } else {
          setStatus('offline_saved');
          if ('serviceWorker' in navigator && 'SyncManager' in window) {
            try {
              const registration = await navigator.serviceWorker.ready;
              // @ts-ignore
              await registration.sync.register('sync-offline-handovers');
              console.log("Background sync registered for offline recording.");
            } catch (syncErr) {
              console.warn("Background sync registration failed:", syncErr);
            }
          }
        }
      };

      mediaRecorder.start();
      setStatus('recording');
    } catch (error) {
      console.error("Microphone access denied:", error);
      alert("Please allow microphone access to record the shift handover.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // 4. Manual Sync Trigger for Offline Recoveries
  const syncOfflineHandover = async () => {
    if (!pendingCacheKey) return;
    setStatus('syncing');
    try {
      const cachedBlob = await get<Blob>(pendingCacheKey);
      if (cachedBlob) {
        await processAndUpload(cachedBlob, pendingCacheKey);
      } else {
        setStatus('idle');
      }
    } catch (e) {
      console.error("Error retrieving cached audio:", e);
      setStatus('offline_saved');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {status === 'offline_saved' || status === 'syncing' ? (
        <button
          id="audio-scribe-sync-button"
          onClick={syncOfflineHandover}
          disabled={status === 'syncing'}
          aria-label="Sync offline handover to cloud"
          className="flex items-center justify-center gap-3 rounded-xl font-bold transition-all min-h-[56px] min-w-[200px] px-6 py-4 shadow-md focus:outline-none focus:ring-4 bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-300"
        >
          {status === 'syncing' ? (
            <><Loader2 className="w-6 h-6 animate-spin" /> Syncing to Hub...</>
          ) : (
            <><WifiOff className="w-6 h-6" /> Offline - Tap to Sync</>
          )}
        </button>
      ) : (
        <button
          id="audio-scribe-record-button"
          onClick={status === 'recording' ? stopRecording : startRecording}
          disabled={status === 'processing'}
          aria-label={status === 'recording' ? 'Stop recording handover' : 'Start ambient shift scribe'}
          className={`
            flex items-center justify-center gap-3 rounded-xl font-bold transition-all min-h-[56px] min-w-[200px] px-6 py-4 shadow-md focus:outline-none focus:ring-4
            ${status === 'idle' ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300' : ''}
            ${status === 'recording' ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-300 animate-pulse' : ''}
            ${status === 'processing' ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : ''}
          `}
        >
          {status === 'idle' && <><Mic className="w-6 h-6" /> Record Handover</>}
          {status === 'recording' && <><Square className="w-6 h-6 fill-current" /> Finish Shift</>}
          {status === 'processing' && <><Loader2 className="w-6 h-6 animate-spin" /> Structuring Note...</>}
        </button>
      )}
    </div>
  );
}
