"use client";

import { useState } from "react";
import { submitExpense } from "@/app/actions/expenses";
import { Receipt, UploadCloud, CheckCircle } from "lucide-react";

interface ExpenseSubmitFormProps {
  employerId: string;
  attendantId: string;
}

export default function ExpenseSubmitForm({ employerId, attendantId }: ExpenseSubmitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append("employerId", employerId);
    formData.append("attendantId", attendantId);
    
    const result = await submitExpense(formData);
    
    setIsSubmitting(false);
    if (result.success) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-full">
          <Receipt className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Submit an Expense</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Date Incurred</label>
            <input 
              name="dateIncurred" 
              type="date" 
              required 
              className="w-full min-h-[48px] px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Amount ($)</label>
            <input 
              name="amount" 
              type="number" 
              step="0.01" 
              required 
              placeholder="0.00"
              className="w-full min-h-[48px] px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">Category</label>
          <select 
            name="category" 
            required 
            className="w-full min-h-[48px] px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white"
          >
            <option value="groceries">Groceries / Food</option>
            <option value="transit">Transit / Parking</option>
            <option value="mileage">Mileage</option>
            <option value="supplies">Care Supplies</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">Description</label>
          <input 
            name="description" 
            type="text" 
            required 
            placeholder="e.g., Groceries from Fortinos for meal prep"
            className="w-full min-h-[48px] px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">Receipt Photo</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-2 text-slate-500" />
                <p className="text-sm text-slate-500"><span className="font-semibold">Tap to upload</span> or take a photo</p>
              </div>
              <input name="receipt" type="file" accept="image/*,.pdf" className="hidden" />
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full min-h-[56px] bg-blue-600 text-white font-bold rounded-lg text-lg hover:bg-blue-700 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? "Uploading..." : success ? <><CheckCircle className="h-5 w-5"/> Submitted</> : "Submit Expense Claim"}
        </button>
      </form>
    </div>
  );
}
