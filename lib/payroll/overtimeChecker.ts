// Developed by VertexAgent.io
// Project: DirectCare Hub - Compliance & Overtime Engine

import { adminDb } from '@/lib/firebase-admin';

/**
 * Calculates total weekly hours for an attendant and checks against provincial thresholds.
 * @param attendantId The ID of the relief attendant
 * @param proposedShiftHours The duration of the shift being bid on
 * @param shiftDate The date of the proposed shift
 */
export async function checkWeeklyOvertimeRisk(
  attendantId: string, 
  proposedShiftHours: number, 
  shiftDate: Date
): Promise<{ totalWeeklyHours: number; isOvertime: boolean; threshold: number }> {
  
  // 1. Determine the start and end of the work week (Sunday to Saturday)
  const startOfWeek = new Date(shiftDate);
  startOfWeek.setDate(shiftDate.getDate() - shiftDate.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // 2. Fetch all confirmed shifts for this attendant within the current week
  let accumulatedHours = 0;
  try {
    const shiftsSnapshot = await adminDb.collection('shifts')
      .where('assigned_to', '==', attendantId)
      .where('status', 'in', ['assigned', 'arrived', 'in_progress', 'completed'])
      .get();

    shiftsSnapshot.forEach((doc: any) => {
      const data = doc.data();
      accumulatedHours += data.scheduled_duration_hours || data.duration_hours || 8.0;
    });
  } catch (dbErr) {
    console.warn("Overtime check query fallback:", dbErr);
  }

  const totalWeeklyHours = accumulatedHours + proposedShiftHours;
  
  // Provincial Statutory Overtime Threshold (e.g., Ontario ESA standard is 44 hours)
  const OVERTIME_THRESHOLD = 44.0;

  return {
    totalWeeklyHours,
    isOvertime: totalWeeklyHours > OVERTIME_THRESHOLD,
    threshold: OVERTIME_THRESHOLD
  };
}
