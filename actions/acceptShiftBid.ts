// Developed by VertexAgent.io
// Project: DirectCare Hub - Shift Bidding Module

'use server';

import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';

const AcceptBidSchema = z.object({
  shiftId: z.string().min(1),
  bidId: z.string().min(1),
  attendantId: z.string().min(1),
});

export async function acceptShiftBid(input: z.infer<typeof AcceptBidSchema>) {
  const parsed = AcceptBidSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid parameters' };
  }

  const { shiftId, bidId, attendantId } = parsed.data;
  const shiftRef = adminDb.collection('shifts').doc(shiftId);
  const bidRef = shiftRef.collection('bids').doc(bidId);

  try {
    await adminDb.runTransaction(async (transaction: any) => {
      const shiftDoc = await transaction.get(shiftRef);
      const bidDoc = await transaction.get(bidRef);

      if (!shiftDoc.exists || !bidDoc.exists) {
        throw new Error('Shift or bid record not found.');
      }

      // 1. Assign the shift to the selected attendant
      transaction.update(shiftRef, {
        status: 'assigned',
        assigned_to: attendantId,
        assigned_at: new Date().toISOString(),
        bidding_closed: true,
      });

      // 2. Accept this specific bid
      transaction.update(bidRef, {
        status: 'accepted',
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to accept shift bid:", error);
    return { success: false, error: 'transaction_failed' };
  }
}
