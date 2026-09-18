"use client";

import { useState } from "react";
import { 
  Receipt, 
  Download, 
  Printer, 
  ExternalLink, 
  ShieldCheck, 
  FileText, 
  Calendar, 
  CreditCard 
} from "lucide-react";
import CiltReceiptModal, { CiltReceipt } from "@/components/receipts/CiltReceiptModal";
import NavigationHeader from "@/components/NavigationHeader";

interface BillingSettingsProps {
  subscription?: {
    planName: string;
    billingCycle: "monthly" | "annual";
    status: "active" | "past_due" | "canceled";
    currentPeriodEnd: string;
    monthlyCostCad: number;
  };
  receipts?: CiltReceipt[];
}

const DEFAULT_SUBSCRIPTION = {
  planName: "Compliance & Bookkeeper Pro",
  billingCycle: "monthly" as const,
  status: "active" as const,
  currentPeriodEnd: "2026-10-14T00:00:00Z",
  monthlyCostCad: 49.00
};

const DEFAULT_RECEIPTS: CiltReceipt[] = [
  {
    id: "tx_9a81c2",
    invoice_number: "INV-2026-0914",
    payment_date: "2026-09-14",
    subtotal: 43.36,
    ontario_hst_13: 5.64,
    total_paid_cad: 49.00,
    payment_method: "Visa",
    last4: "4242"
  },
  {
    id: "tx_8b27f1",
    invoice_number: "INV-2026-0814",
    payment_date: "2026-08-14",
    subtotal: 43.36,
    ontario_hst_13: 5.64,
    total_paid_cad: 49.00,
    payment_method: "Visa",
    last4: "4242"
  },
  {
    id: "tx_7c38a2",
    invoice_number: "INV-2026-0714",
    payment_date: "2026-07-14",
    subtotal: 43.36,
    ontario_hst_13: 5.64,
    total_paid_cad: 49.00,
    payment_method: "Visa",
    last4: "4242"
  },
  {
    id: "tx_6d49b1",
    invoice_number: "INV-2026-0614",
    payment_date: "2026-06-14",
    subtotal: 43.36,
    ontario_hst_13: 5.64,
    total_paid_cad: 49.00,
    payment_method: "Visa",
    last4: "4242"
  },
  {
    id: "tx_5e50c2",
    invoice_number: "INV-2026-0514",
    payment_date: "2026-05-14",
    subtotal: 43.36,
    ontario_hst_13: 5.64,
    total_paid_cad: 49.00,
    payment_method: "Visa",
    last4: "4242"
  },
  {
    id: "tx_4f61d1",
    invoice_number: "INV-2026-0414",
    payment_date: "2026-04-14",
    subtotal: 43.36,
    ontario_hst_13: 5.64,
    total_paid_cad: 49.00,
    payment_method: "Visa",
    last4: "4242"
  },
  {
    id: "tx_3g72e2",
    invoice_number: "INV-2025-1214",
    payment_date: "2025-12-14",
    subtotal: 43.36,
    ontario_hst_13: 5.64,
    total_paid_cad: 49.00,
    payment_method: "Visa",
    last4: "4242"
  },
  {
    id: "tx_2h83f1",
    invoice_number: "INV-2025-1114",
    payment_date: "2025-11-14",
    subtotal: 43.36,
    ontario_hst_13: 5.64,
    total_paid_cad: 49.00,
    payment_method: "Visa",
    last4: "4242"
  }
];

export default function BillingSettingsPage() {
  const [subscription] = useState(DEFAULT_SUBSCRIPTION);
  const [receipts] = useState(DEFAULT_RECEIPTS);
  const [selectedReceipt, setSelectedReceipt] = useState<CiltReceipt | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const filteredReceipts = receipts.filter(r => 
    new Date(r.payment_date).getFullYear() === selectedYear
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <NavigationHeader />

      <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
          {/* Page Header */}
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-3 py-1 rounded-md">
              Program Administration
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">Subscription & CILT Receipts Archive</h1>
            <p className="text-slate-600 mt-1 text-base">
              Manage your DirectCare Hub subscription and retrieve audit-ready expense receipts for your quarterly CILT reports.
            </p>
          </div>

          {/* Current Plan Overview Card */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{subscription.planName}</h2>
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full uppercase">
                    ● {subscription.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Billed {subscription.billingCycle} • Next scheduled charge on {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-CA")}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg w-fit font-bold">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>100% Eligible under CILT Administration Allocation (Budget Line #3)</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <a
                  href={process.env.NEXT_PUBLIC_STRIPE_PORTAL_URL || "#"}
                  className="min-h-[48px] px-5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <CreditCard className="w-4 h-4" /> Manage Payment Method
                </a>
              </div>
            </div>
          </section>

          {/* CILT Audit Receipts Table */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-600" /> Official Expense Receipts
                </h2>
                <p className="text-sm text-slate-600 mt-0.5">
                  Download or print individual CILT-compliant statements showing HST and program justification.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="min-h-[48px] px-4 border border-slate-300 rounded-xl bg-white text-slate-900 font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                  aria-label="Filter receipts by year"
                >
                  <option value={2026}>Tax Year 2026</option>
                  <option value={2025}>Tax Year 2025</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                    <th className="p-4">Payment Date</th>
                    <th className="p-4">Receipt #</th>
                    <th className="p-4">Eligible Allocation</th>
                    <th className="p-4 text-right">Subtotal</th>
                    <th className="p-4 text-right">HST (13%)</th>
                    <th className="p-4 text-right">Total Paid (CAD)</th>
                    <th className="p-4 text-center">CILT Document</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredReceipts.map((receipt) => (
                    <tr key={receipt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-semibold text-slate-900">
                        {new Date(receipt.payment_date).toLocaleDateString("en-CA")}
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-600">{receipt.invoice_number}</td>
                      <td className="p-4 text-slate-700 font-semibold">Category 3 (Admin/Software)</td>
                      <td className="p-4 text-right font-mono text-slate-600">${receipt.subtotal.toFixed(2)}</td>
                      <td className="p-4 text-right font-mono text-slate-600">${receipt.ontario_hst_13.toFixed(2)}</td>
                      <td className="p-4 text-right font-black font-mono text-slate-900">${receipt.total_paid_cad.toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedReceipt(receipt)}
                          className="min-h-[44px] px-3.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 font-bold inline-flex items-center gap-1.5 transition-colors text-xs cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" /> View / Print
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredReceipts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-500 font-semibold text-xs">
                        No billing receipts found for the {selectedYear} calendar year.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Modal for PDF Generation / Printing */}
          {selectedReceipt && (
            <CiltReceiptModal 
              receipt={selectedReceipt} 
              onClose={() => setSelectedReceipt(null)} 
            />
          )}
        </main>
      </div>
    </div>
  );
}
