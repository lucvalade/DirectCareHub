'use server';

export async function logSingleShift(shiftData: {
  attendantId: string;
  attendantName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  shiftType: string;
  notes?: string;
}) {
  try {
    // In production, write to Firestore /shifts collection
    return {
      success: true,
      shiftId: `shift_${Date.now()}`,
      ...shiftData,
      employer_verified: true,
      status: 'completed',
      payroll_processed: false
    };
  } catch (err) {
    console.error('logSingleShift error:', err);
    throw new Error('Failed to log single shift');
  }
}

export async function saveWeeklyTimesheet(
  attendantId: string,
  weekStartDate: string,
  dailyEntries: Array<{
    date: string;
    hours: number;
    isStatHoliday: boolean;
    shiftType: string;
    notes?: string;
  }>
) {
  try {
    // In production, batch write 7 daily shifts to Firestore /shifts
    const entries = Array.isArray(dailyEntries) ? dailyEntries : [];
    const createdShifts = entries.filter(entry => entry && entry.hours > 0).map((entry, index) => ({
      shiftId: `shift_${Date.now()}_${index}`,
      attendantId,
      date: entry.date,
      totalHours: entry.hours,
      isStatHoliday: Boolean(entry.isStatHoliday),
      shiftType: entry.shiftType || 'Regular',
      notes: entry.notes || '',
      employer_verified: true,
      status: 'completed',
      payroll_processed: false
    }));

    return {
      success: true,
      savedCount: createdShifts.length,
      shifts: createdShifts
    };
  } catch (err) {
    console.error('saveWeeklyTimesheet error:', err);
    throw new Error('Failed to save weekly timesheet');
  }
}

export async function getShiftsForWeek(weekStartDate: string) {
  try {
    // Mock recent shifts for the week
    return [
      {
        shiftId: 'shift_101',
        attendantId: 'att_01',
        attendantName: 'Sarah Jenkins, PSW',
        date: '2026-09-14',
        totalHours: 8.0,
        shiftType: 'Regular',
        employer_verified: true,
        status: 'completed'
      },
      {
        shiftId: 'shift_102',
        attendantId: 'att_01',
        attendantName: 'Sarah Jenkins, PSW',
        date: '2026-09-15',
        totalHours: 6.5,
        shiftType: 'Regular',
        employer_verified: true,
        status: 'completed'
      }
    ];
  } catch (err) {
    console.error('getShiftsForWeek error:', err);
    return [];
  }
}

export async function deleteOrUpdateShift(shiftId: string, updatedData?: any) {
  try {
    return {
      success: true,
      message: updatedData ? `Shift ${shiftId} updated successfully` : `Shift ${shiftId} deleted successfully`
    };
  } catch (err) {
    console.error('deleteOrUpdateShift error:', err);
    return {
      success: false,
      message: 'Operation failed'
    };
  }
}
