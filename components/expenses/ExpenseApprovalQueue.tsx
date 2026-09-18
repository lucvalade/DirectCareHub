"use client";

import { ExpenseClaim } from "@/types/expenses";
import { approveExpense } from "@/app/actions/expenses";
import { CheckCircle, Eye, AlertCircle } from "lucide-react";

export default function ExpenseApprovalQueue({ expenses }: { expenses: ExpenseClaim[] }) {
  const pendingExpenses = expenses.filter(e => e.status === 'pending');

  const handleApprove = async (id: string) => {
    await approveExpense(id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 bg-slate-50 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <AlertCircle className="text-amber-500 h-6 w-6" />
          Pending Approvals
        </h2>
        <p className="text-slate-600 text-sm mt-1">Review attendant expenses. Approved items are automatically added to the next pay run.</p>
      </div>

      <div className="divide-y divide-slate-100">
        {pendingExpenses.map(expense => (
          <div key={expense.id} className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="font-bold text-slate-900 text-lg">${expense.amount.toFixed(2)} - <span className="capitalize">{expense.category}</span></p>
              <p className="text-slate-600">{expense.description}</p>
              <p className="text-xs font-medium text-slate-500 mt-1">Date: {expense.date_incurred}</p>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              {expense.receipt_url && (
                <a 
                  href={expense.receipt_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 sm:flex-none min-h-[48px] px-4 flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                >
                  <Eye className="h-5 w-5" /> View Receipt
                </a>
              )}
              <button 
                onClick={() => handleApprove(expense.id)}
                className="flex-1 sm:flex-none min-h-[48px] px-4 flex items-center justify-center gap-2 bg-blue-100 text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-200 font-bold"
              >
                <CheckCircle className="h-5 w-5" /> Approve
              </button>
            </div>
          </div>
        ))}
        {pendingExpenses.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No pending expenses to review.
          </div>
        )}
      </div>
    </div>
  );
}
