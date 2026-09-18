export type ExpenseCategory = 'groceries' | 'transit' | 'mileage' | 'supplies' | 'other';
export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'reimbursed';

export interface ExpenseClaim {
  id: string;
  attendant_id: string;
  attendant_name: string;
  employer_id: string;
  date_incurred: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  receipt_url?: string;
  status: ExpenseStatus;
  submitted_at: string;
  approved_at?: string;
  reimbursed_on_pay_run_id?: string;
}
