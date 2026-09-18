'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { generateBiWeeklyPayRun, PayRunResult } from '@/lib/payrollEngine';

// Fetch all generated payruns/stubs
export async function fetchPayStubs(): Promise<{ data: PayRunResult[]; error?: string }> {
  try {
    const snap = await adminDb.collection('paystubs').get();
    const list: PayRunResult[] = [];
    
    snap.docs.forEach((doc: any) => {
      list.push({
        id: doc.id,
        ...doc.data()
      } as PayRunResult);
    });

    // If empty, generate a default seeded run so the page isn't blank
    if (list.length === 0) {
      const seeded = await generateBiWeeklyPayRun(
        'emp_ontario_01',
        'psw_elena_02',
        60.0,
        23.50,
        'Sept 01 - Sept 15, 2026',
        'Sept 15, 2026',
        'Sept 20, 2026'
      );
      list.push(seeded);
    }

    // Sort by pay_date desc
    list.sort((a, b) => new Date(b.pay_date).getTime() - new Date(a.pay_date).getTime());

    return { data: list };
  } catch (error: any) {
    console.error('Error fetching paystubs:', error);
    return { data: [], error: error.message || 'Failed to fetch paystubs' };
  }
}

// Generate new bi-weekly pay run
export async function createPayRun(
  hoursWorked: number,
  hourlyRate: number,
  periodStart: string,
  periodEnd: string,
  payDate: string,
  attendantId: string = 'psw_elena_02',
  attendantName: string = 'Elena Rostova'
): Promise<{ success: boolean; data?: PayRunResult; error?: string }> {
  try {
    const result = await generateBiWeeklyPayRun(
      'emp_ontario_01',
      attendantId,
      hoursWorked,
      hourlyRate,
      periodStart,
      periodEnd,
      payDate,
      attendantName
    );
    revalidatePath('/payroll/stubs');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error creating pay run:', error);
    return { success: false, error: error.message || 'Failed to generate pay run' };
  }
}
