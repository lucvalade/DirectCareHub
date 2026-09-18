import { adminDb } from "@/lib/firebase-admin";

export interface PayRunResult {
  id: string;
  employer_id: string;
  attendant_id: string;
  attendant_name: string;
  period_start: string;
  period_end: string;
  pay_date: string;
  hours_worked: number;
  hourly_rate: number;
  gross_wages: number;
  vacation_pay: number;
  gross_pay: number; // total gross with vacation pay
  cpp_deduction: number;
  ei_deduction: number;
  income_tax: number;
  total_deductions: number;
  non_taxable_reimbursements: number;
  reimbursed_expense_ids: string[];
  net_pay: number;
  status: 'draft' | 'approved' | 'paid';
}

export async function generateBiWeeklyPayRun(
  employerId: string, 
  attendantId: string,
  hoursWorked: number = 60.0,
  hourlyRate: number = 23.50,
  periodStart: string = "2026-09-01",
  periodEnd: string = "2026-09-15",
  payDate: string = "2026-09-20",
  attendantName?: string
): Promise<PayRunResult> {
  // 1. Calculate Standard Wages
  const grossWages = hoursWorked * hourlyRate;
  const vacationPay = grossWages * 0.04; // 4% Ontario ESA Minimum Vacation Pay
  const grossPay = grossWages + vacationPay;

  // 2. Calculate Standard Statutory Deductions
  const cppDeduction = parseFloat((grossPay * 0.0595).toFixed(2)); // CPP Employee contribution rate
  const eiDeduction = parseFloat((grossPay * 0.0166).toFixed(2));  // EI Employee rate
  const incomeTax = parseFloat((grossPay * 0.0857).toFixed(2));    // Federal + Ontario simplified tax rate
  const totalDeductions = parseFloat((cppDeduction + eiDeduction + incomeTax).toFixed(2));

  // 3. Fetch all approved expenses that haven't been reimbursed yet
  const expensesSnap = await adminDb.collection("expenses")
    .where("employer_id", "==", employerId)
    .where("attendant_id", "==", attendantId)
    .where("status", "==", "approved")
    .get();

  let nonTaxableReimbursements = 0;
  const reimbursedExpenseIds: string[] = [];

  expensesSnap.docs.forEach((doc: any) => {
    const expense = doc.data();
    nonTaxableReimbursements += expense.amount;
    reimbursedExpenseIds.push(doc.id || expense.id);
  });

  // 4. Add non-taxable reimbursements directly to Net Pay (after all taxes are deducted from Gross)
  const netPay = parseFloat(((grossPay - cppDeduction - eiDeduction - incomeTax) + nonTaxableReimbursements).toFixed(2));

  const payRunData: PayRunResult = {
    id: `pay_${Date.now()}`,
    employer_id: employerId,
    attendant_id: attendantId,
    attendant_name: attendantName || "Elena Rostova", // Standard display name fallback
    period_start: periodStart,
    period_end: periodEnd,
    pay_date: payDate,
    hours_worked: hoursWorked,
    hourly_rate: hourlyRate,
    gross_wages: grossWages,
    vacation_pay: vacationPay,
    gross_pay: grossPay,
    cpp_deduction: cppDeduction,
    ei_deduction: eiDeduction,
    income_tax: incomeTax,
    total_deductions: totalDeductions,
    non_taxable_reimbursements: nonTaxableReimbursements,
    reimbursed_expense_ids: reimbursedExpenseIds,
    net_pay: netPay,
    status: 'draft',
  };

  // 5. Mark the expenses as fully reimbursed so they don't roll over to the next period
  if (reimbursedExpenseIds.length > 0) {
    const batch = adminDb.batch();
    reimbursedExpenseIds.forEach(id => {
      const expenseRef = adminDb.collection("expenses").doc(id);
      batch.update(expenseRef, {
        status: "reimbursed",
        reimbursed_on_pay_run_id: payRunData.id,
      });
    });
    await batch.commit();
  }

  // 6. Save the generated paystub/payrun to collection
  await adminDb.collection("paystubs").doc(payRunData.id).set(payRunData);

  return payRunData;
}
