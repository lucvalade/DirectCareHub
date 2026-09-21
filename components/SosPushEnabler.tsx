'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseConfig';

const VAPID_PUBLIC_KEY = (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string) || 
  'BKgjeitAV81NnpHGdvBtHe_V8sowXWzjqsEPPT7_nNyDr6QerS3ZGN6O6YEv1XuZWchYWGuCwLhwETuQn1jB9gM';

// Helper to convert VAPID string for the PushManager
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function SosPushEnabler({ attendantId }: { attendantId: string }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(!!subscription);
        });
      }).catch(err => {
        console.warn('Push manager check skipped:', err);
      });
    }
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      if (!('Notification' in window)) {
        alert("This browser does not support desktop notifications.");
        setLoading(false);
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert("Push notifications were denied. Please enable them in browser settings.");
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Save the subscription object array to Firestore
      try {
        const attendantRef = doc(db, 'users', attendantId);
        await updateDoc(attendantRef, {
          push_subscriptions: arrayUnion(JSON.parse(JSON.stringify(subscription)))
        });
      } catch (dbErr) {
        console.warn('Firestore update skipped (demo mode):', dbErr);
      }

      setIsSubscribed(true);
    } catch (error) {
      console.error("Failed to subscribe to Web Push:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      id="sos-push-enabler-button"
      onClick={handleSubscribe}
      disabled={isSubscribed || loading}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
        isSubscribed 
          ? 'bg-emerald-100 text-emerald-800 cursor-default' 
          : 'bg-[#0224bb] text-white hover:bg-blue-800'
      }`}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isSubscribed ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
      {isSubscribed ? 'SOS Alerts Active' : 'Enable Emergency SOS Alerts'}
    </button>
  );
}
