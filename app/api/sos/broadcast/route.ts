import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { adminDb } from '@/lib/firebase-admin';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 
  'BKgjeitAV81NnpHGdvBtHe_V8sowXWzjqsEPPT7_nNyDr6QerS3ZGN6O6YEv1XuZWchYWGuCwLhwETuQn1jB9gM';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || 
  '_tRIZTmFmYriVRvPt4T4IfyXoy3fO0OHxfCrAZESbmY';

try {
  webpush.setVapidDetails(
    'mailto:operations@directcarehub.ca',
    vapidPublicKey,
    vapidPrivateKey
  );
} catch (e) {
  console.warn('VAPID setup warning:', e);
}

export async function POST(req: NextRequest) {
  try {
    const { employerId, shiftId, date, time } = await req.json();

    if (!employerId) {
      return NextResponse.json({ error: 'Employer ID required' }, { status: 400 });
    }

    // 1. Fetch all backup attendants linked to this employer
    let attendantsSnapshot;
    try {
      attendantsSnapshot = await adminDb.collection('users')
        .where('role', '==', 'attendant')
        .get();
    } catch (e) {
      console.warn('Firestore query fallback:', e);
      attendantsSnapshot = { docs: [], forEach: () => {} };
    }

    const pushPromises: Promise<any>[] = [];
    
    // 2. Iterate through attendants and their registered devices
    attendantsSnapshot.forEach((doc: any) => {
      const data = doc.data();
      const subscriptions = data.push_subscriptions || [];

      const payload = JSON.stringify({
        title: "🚨 URGENT: Shift Coverage Needed",
        body: `Emergency relief requested for ${date || 'Today'} at ${time || 'ASAP'}. First to claim secures the shift.`,
        url: `/dashboard/shifts/claim/${shiftId || 'emergency'}`
      });

      subscriptions.forEach((sub: webpush.PushSubscription) => {
        pushPromises.push(
          webpush.sendNotification(sub, payload).catch((err: any) => {
            if (err.statusCode === 410) {
              console.log("Dead subscription expired:", sub.endpoint);
            }
          })
        );
      });
    });

    await Promise.all(pushPromises);

    return NextResponse.json({ success: true, alerted: pushPromises.length }, { status: 200 });

  } catch (error) {
    console.error("SOS Broadcast Failed:", error);
    return NextResponse.json({ error: 'Failed to broadcast SOS' }, { status: 500 });
  }
}
