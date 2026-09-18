"use client";

import React, { useState, useEffect } from "react";
import { fetchExpenses, submitExpenseClaim, updateExpenseStatus } from "@/app/actions/expenses";
import { ExpenseClaim, ExpenseCategory, ExpenseStatus } from "@/types/expenses";
import { useAuth } from "@/context/AuthContext";
import { 
  DollarSign, 
  Check, 
  X, 
  FileText, 
  Plus, 
  AlertCircle, 
  Calendar, 
  User, 
  Tag, 
  ExternalLink,
  Loader2,
  TrendingUp,
  Receipt,
  HelpCircle,
  FileCheck,
  CheckCircle,
  ShieldAlert
} from "lucide-react";

export default function ExpensesHub() {
  const { userProfile } = useAuth();
  const effectiveRole = userProfile?.role || "employer";
  const isEmployer = effectiveRole === "employer";
  const isBookkeeper = effectiveRole === "bookkeeper";
  const isAttendant = effectiveRole === "attendant";

  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form State for new submission
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("groceries");
  const [dateIncurred, setDateIncurred] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("https://picsum.photos/seed/receipt/400/600");
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setIsLoading(true);
    const res = await fetchExpenses();
    if (res.data) {
      setClaims(res.data);
    }
    setIsLoading(false);
  };

  const handleApprove = async (id: string) => {
    const res = await updateExpenseStatus(id, 'approved');
    if (res.success) {
      setMessage({ type: 'success', text: 'Expense claim approved with 1-tap! Added to next bi-weekly pay cycle.' });
      loadExpenses();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to approve claim' });
    }
  };

  const handleReject = async (id: string) => {
    const res = await updateExpenseStatus(id, 'rejected');
    if (res.success) {
      setMessage({ type: 'success', text: 'Expense claim declined successfully.' });
      loadExpenses();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to decline claim' });
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid expense amount.' });
      return;
    }
    if (!description.trim()) {
      setMessage({ type: 'error', text: 'Please provide a clear business purpose description.' });
      return;
    }

    setIsSubmitting(true);
    const res = await submitExpenseClaim({
      attendant_id: userProfile?.uid || "psw_elena_02",
      attendant_name: userProfile?.displayName || "Elena Rostova (Lead PSW)",
      employer_id: "emp_ontario_01",
      date_incurred: dateIncurred,
      category,
      amount: Number(amount),
      description,
      receipt_url: receiptUrl
    });

    setIsSubmitting(false);
    if (res.data) {
      setMessage({ type: 'success', text: 'Tax-exempt expense claim submitted successfully with receipt!' });
      setAmount("");
      setDescription("");
      setShowSubmitForm(false);
      loadExpenses();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to submit expense claim.' });
    }
  };

  // Calculations for stats
  const pendingTotal = claims.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0);
  const approvedTotal = claims.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.amount, 0);
  const totalCount = claims.length;

  return (
    <div className="space-y-8">
      {/* Informative Header on CRA rules */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center space-x-2 text-blue-800">
            <FileCheck className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-black uppercase tracking-wider">CRA Tax-Exempt Business Reimbursement Rules</h3>
          </div>
          <p className="text-xs text-blue-900 leading-relaxed">
            Legitimate business expenses (like grocery ingredients for client nutrition plans, transit, or medical supplies) paid out-of-pocket by attendants are **tax-exempt**. Reimbursing them does not affect the attendant's gross income (T4 Box 14) and simply reimburses their actual cost, provided receipts are supplied.
          </p>
        </div>
        <div className="shrink-0 flex gap-2">
          {isAttendant && !showSubmitForm && (
            <button
              onClick={() => setShowSubmitForm(true)}
              className="min-h-[44px] px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Expense Claim</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-between ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1 hover:bg-black/5 rounded cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Approval</span>
          <p className="text-2xl font-black text-slate-900">${pendingTotal.toFixed(2)}</p>
          <div className="flex items-center space-x-1.5 text-amber-700 text-[11px] font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Awaiting Review</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approved Reimbursements</span>
          <p className="text-2xl font-black text-emerald-700">${approvedTotal.toFixed(2)}</p>
          <div className="flex items-center space-x-1.5 text-emerald-700 text-[11px] font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Appended to net pay</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Claims Processed</span>
          <p className="text-2xl font-black text-slate-900">{totalCount}</p>
          <div className="flex items-center space-x-1.5 text-slate-500 text-[11px] font-semibold">
            <Receipt className="w-3.5 h-3.5 text-blue-600" />
            <span>Audit trail intact</span>
          </div>
        </div>
      </div>

      {/* Submission Form Component */}
      {showSubmitForm && (
        <form onSubmit={handleSubmitClaim} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-blue-600" />
              <span>Submit New Out-Of-Pocket Expense Claim</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowSubmitForm(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full min-h-[48px] px-3.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 outline-none"
              >
                <option value="groceries">Groceries & Client Meals</option>
                <option value="transit">TTC / Transit & Parking</option>
                <option value="mileage">Mileage Allowance</option>
                <option value="supplies">Clinical / PPE Supplies</option>
                <option value="other">Other Business Costs</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Amount (CAD $)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full min-h-[48px] px-3.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Date Incurred</label>
              <input
                type="date"
                value={dateIncurred}
                onChange={(e) => setDateIncurred(e.target.value)}
                className="w-full min-h-[48px] px-3.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Business Purpose Description & Receipt Details</label>
            <textarea
              rows={3}
              placeholder="e.g., Grocery trip to Sobey's for client's dietary ingredients: thickeners, fresh produce, liquid meals. Checked by employer."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Digital Receipt Attachment</label>
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center space-y-2">
              <Receipt className="w-8 h-8 text-slate-400" />
              <p className="text-xs font-bold text-slate-700">Digital receipt camera snapshot automatically attached</p>
              <p className="text-[10px] text-slate-500">Standard test receipt placeholder link generated</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[48px] bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Claim...</span>
              </>
            ) : (
              <span>Submit Tax-Exempt Reimbursement Claim</span>
            )}
          </button>
        </form>
      )}

      {/* Claims List Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">Reimbursement Claims & Receipts Log</h3>
            <p className="text-xs text-slate-500">Official audit trail tracking out-of-pocket expenses for Direct Funding</p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {claims.length} Records
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading expense claims...</p>
          </div>
        ) : claims.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No out-of-pocket expense claims submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Submitted By</th>
                  <th className="p-4">Date Incurred</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Business Description</th>
                  <th className="p-4">Receipt</th>
                  <th className="p-4">Status</th>
                  {isEmployer && <th className="p-4 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-bold text-slate-900">
                      {claim.attendant_name}
                    </td>
                    <td className="p-4 text-slate-600 whitespace-nowrap">
                      {claim.date_incurred}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        claim.category === 'groceries' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        claim.category === 'transit' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        claim.category === 'mileage' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {claim.category}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-slate-900">
                      ${claim.amount.toFixed(2)}
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs truncate" title={claim.description}>
                      {claim.description}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {claim.receipt_url ? (
                        <a
                          href={claim.receipt_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-bold flex items-center space-x-1"
                        >
                          <Receipt className="w-4 h-4 shrink-0" />
                          <span>View Receipt</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">No Receipt</span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                        claim.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                        claim.status === 'rejected' ? 'bg-rose-50 text-rose-800 border border-rose-100' :
                        'bg-amber-50 text-amber-800 border border-amber-100'
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                    {isEmployer && (
                      <td className="p-4 whitespace-nowrap text-center">
                        {claim.status === 'pending' ? (
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleApprove(claim.id)}
                              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg cursor-pointer transition border border-emerald-200"
                              title="Approve Reimbursement"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(claim.id)}
                              className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg cursor-pointer transition border border-rose-200"
                              title="Reject Reimbursement"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">Processed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
