'use server';

import { adminDb } from '@/lib/firebase-admin';
import { ShiftBidSchema } from '@/schemas/shiftBidding';
import { checkWeeklyOvertimeRisk } from '@/lib/payroll/overtimeChecker';
import { z } from 'zod';

export async function submitShiftBid(input: z.infer<typeof ShiftBidSchema>) {
  const parsed = ShiftBidSchema.safeParse({
    ...input,
    submitted_at: new Date().toISOString(),
  });

  if (!parsed.success) {
    return { success: false, error: 'Invalid bid parameters' };
  }

  const { shift_id, attendant_id } = parsed.data;

  try {
    // 0. Check for weekly overtime threshold risk
    const proposedHours = 8.0;
    const overtimeCheck = await checkWeeklyOvertimeRisk(attendant_id, proposedHours, new Date());

    if (overtimeCheck.isOvertime) {
      console.warn(`Overtime Alert: Attendant ${attendant_id} will reach ${overtimeCheck.totalWeeklyHours} hours this week.`);
    }

    // 1. Check if the attendant has already submitted a bid for this shift
    let existingBidQuery: any;
    try {
      existingBidQuery = await adminDb.collection('shifts').doc(shift_id)
        .collection('bids')
        .where('attendant_id', '==', attendant_id)
        .get();
    } catch (dbErr) {
      console.warn("Shift bid check fallback:", dbErr);
      existingBidQuery = { empty: true };
    }

    if (!existingBidQuery.empty) {
      return { success: false, error: 'already_bid' };
    }

    // 2. Write the bid to the shift's subcollection
    const bidRef = adminDb.collection('shifts').doc(shift_id).collection('bids').doc();
    await bidRef.set({
      ...parsed.data,
      submitted_at: new Date().toISOString()
    });

    return { success: true, bidId: bidRef.id };

  } catch (error) {
    console.error("Failed to submit shift bid:", error);
    return { success: false, error: 'server_error' };
  }
}
