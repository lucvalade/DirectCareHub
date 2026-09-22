// Developed by VertexAgent.io
// Project: DirectCare Hub - Atomic Geofenced Arrival Action

'use server';

import { adminDb, adminFieldValue } from '@/lib/firebase-admin';
import { z } from 'zod';

const ArrivalSchema = z.object({
  shiftId: z.string().min(1),
  attendantId: z.string().min(1),
});

export async function logGeofencedArrival(input: z.infer<typeof ArrivalSchema>) {
  const parsed = ArrivalSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: 'Invalid input' };

  const { shiftId, attendantId } = parsed.data;
  const shiftRef = adminDb.collection('shifts').doc(shiftId);

  try {
    await adminDb.runTransaction(async (transaction: any) => {
      const shiftDoc = await transaction.get(shiftRef);
      if (!shiftDoc.exists) throw new Error("Shift not found");

      const shiftData = shiftDoc.data();

      // Ensure we don't overwrite the arrival time if it was already logged
      if (shiftData?.status === 'arrived' || shiftData?.status === 'in_progress') {
        return; 
      }

      // Security check: ensure the arriving attendant actually owns this shift if assigned_to is present
      if (shiftData?.assigned_to && shiftData.assigned_to !== attendantId) {
        throw new Error("Unauthorized arrival attempt");
      }

      transaction.update(shiftRef, {
        status: 'arrived',
        actual_start_time: adminFieldValue.serverTimestamp(),
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Geofenced arrival logging failed:", error);
    return { success: false, error: 'transaction_failed' };
  }
}
