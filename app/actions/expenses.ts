'use server';

import { revalidatePath } from 'next/cache';
import { adminDb, adminStorage } from '@/lib/firebase-admin';
import { ExpenseClaim, ExpenseCategory, ExpenseStatus } from '@/types/expenses';

// Fetch all expenses from Firestore (or in-memory mock fallback)
export async function fetchExpenses(): Promise<{ data: ExpenseClaim[]; error?: string }> {
  try {
    const snap = await adminDb.collection('expenses').get();
    const list: ExpenseClaim[] = [];
    
    snap.docs.forEach((doc: any) => {
      list.push({
        id: doc.id,
        ...doc.data()
      } as ExpenseClaim);
    });

    // Sort by submitted_at desc
    list.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
    
    return { data: list };
  } catch (error: any) {
    console.error('Error fetching expenses from adminDb:', error);
    return { data: [], error: error.message || 'Failed to fetch expenses' };
  }
}

// User-requested: submitExpense with FormData
export async function submitExpense(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const file = formData.get('receipt') as File | null;
    const attendantId = formData.get('attendantId') as string;
    const attendantName = (formData.get('attendantName') as string) || 'Elena Rostova (Lead PSW)';
    const employerId = formData.get('employerId') as string;
    const dateIncurred = formData.get('dateIncurred') as string;
    const category = formData.get('category') as ExpenseCategory;
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;

    if (!attendantId || !employerId || !amount || !dateIncurred) {
      throw new Error('Missing required expense fields.');
    }

    let receipt_url = '';

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const filePath = `expenses/${employerId}/${attendantId}/${fileName}`;
      const bucket = adminStorage.bucket();
      const fileRef = bucket.file(filePath);

      await fileRef.save(buffer, { metadata: { contentType: file.type } });
      await fileRef.makePublic();
      receipt_url = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    } else {
      // Fallback placeholder image for UI completeness
      receipt_url = 'https://picsum.photos/seed/receipt/400/600';
    }

    const newExpense: ExpenseClaim = {
      id: crypto.randomUUID(),
      attendant_id: attendantId,
      attendant_name: attendantName,
      employer_id: employerId,
      date_incurred: dateIncurred,
      category,
      amount,
      description,
      receipt_url,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    };

    await adminDb.collection('expenses').doc(newExpense.id).set(newExpense);
    revalidatePath('/payroll/expenses');
    return { success: true };
  } catch (error: any) {
    console.error('Error submitting expense via FormData:', error);
    return { success: false, error: error.message };
  }
}

// User-requested: approveExpense
export async function approveExpense(expenseId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await adminDb.collection('expenses').doc(expenseId).update({
      status: 'approved',
      approved_at: new Date().toISOString(),
    });
    revalidatePath('/payroll/expenses');
    return { success: true };
  } catch (error: any) {
    console.error('Error approving expense:', error);
    return { success: false, error: error.message };
  }
}

// Bridge function for submitExpenseClaim (UI compatibility)
export async function submitExpenseClaim(claim: Omit<ExpenseClaim, 'id' | 'submitted_at' | 'status'>): Promise<{ data: ExpenseClaim | null; error?: string }> {
  try {
    const newExpense: ExpenseClaim = {
      id: crypto.randomUUID(),
      ...claim,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    };

    await adminDb.collection('expenses').doc(newExpense.id).set(newExpense);
    revalidatePath('/payroll/expenses');
    return { data: newExpense };
  } catch (error: any) {
    console.error('Error submitting expense claim:', error);
    return { data: null, error: error.message || 'Failed to submit expense claim' };
  }
}

// Bridge function for updateExpenseStatus (UI compatibility)
export async function updateExpenseStatus(id: string, status: ExpenseStatus): Promise<{ success: boolean; error?: string }> {
  try {
    await adminDb.collection('expenses').doc(id).update({
      status,
      approved_at: status === 'approved' ? new Date().toISOString() : undefined
    });
    revalidatePath('/payroll/expenses');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating expense status:', error);
    return { success: false, error: error.message || 'Failed to update expense status' };
  }
}
