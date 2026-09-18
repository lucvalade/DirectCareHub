"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Check, 
  HelpCircle, 
  ShieldCheck, 
  Receipt, 
  FileSpreadsheet, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Sparkles
} from "lucide-react";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Can I expense this under Ontario's Direct Funding (CILT) program?",
      a: "Yes. Direct Funding allocates a monthly administrative and bookkeeping budget to every Self-Manager. DirectCare Hub qualifies as an eligible payroll and administrative expense. Simply attach your monthly invoice or receipt to your quarterly CILT financial report."
    },
    {
      q: "Does this also qualify under BC (CSIL) or Alberta (SMC)?",
      a: "Yes. British Columbia's CSIL includes an explicit bookkeeping and admin budget, and Alberta Health Services permits reasonable administrative software costs within individualized funding allocations."
    },
    {
      q: "Can my bookkeeper access the system for free?",
      a: "Yes! On the Bookkeeper Pro plan, bookkeeper invites are completely free. They receive their own dedicated, role-isolated portal focused exclusively on timesheets, remittances, and T4/ROE generation—without access to your private medical or care notes."
    },
    {
      q: "What happens if an attendant leaves mid-year?",
      a: "DirectCare Hub stores their historical hours and locked wage statements in compliance with the CRA's 6-year record retention rule. You can generate their Record of Employment (ROE) and T4 tax slip at any time with one click."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header Banner */}
      <section className="bg-white border-b border-slate-200 py-16 px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-4">
            <ShieldCheck className="w-4 h-4" /> 100% Eligible Under Direct Funding Administrative Budgets
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Simple, Transparent Pricing Built for Self-Managers
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Everything you need to schedule attendants, ensure safe transfers, and run compliant CRA/WSIB payroll—covered by your program admin funds.
          </p>

          {/* Billing Toggle */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <span className={`text-base font-semibold ${billingCycle === "monthly" ? "text-blue-700" : "text-slate-500"}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
              className="relative inline-flex h-10 w-20 items-center rounded-full bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 p-1"
              role="switch"
              aria-checked={billingCycle === "annual"}
              aria-label="Toggle annual or monthly billing"
            >
              <span
                className={`inline-block h-8 w-8 transform rounded-full bg-blue-600 shadow-md transition-transform ${
                  billingCycle === "annual" ? "translate-x-10" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-base font-semibold flex items-center gap-1.5 ${billingCycle === "annual" ? "text-blue-700" : "text-slate-500"}`}>
              Annual Billing
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">
                Save 17% (2 Mo. Free)
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Tier 1: Self-Manager Standard */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Self-Manager Standard</h2>
                  <p className="text-slate-600 text-sm mt-1">For employers directing daily household care & schedules</p>
                </div>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900">
                  {billingCycle === "monthly" ? "$29" : "$24"}
                </span>
                <span className="text-slate-500 text-base font-medium">
                  / month {billingCycle === "annual" && "(billed annually at $290)"}
                </span>
              </div>
              <p className="text-xs text-blue-700 font-semibold mt-1">Fully claimable on quarterly CILT report</p>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Included Operations</p>
                <ul className="space-y-3.5">
                  {[
                    "Daily Care Runbook & Transfer Sling Checklists",
                    "Emergency Relief SOS (1-Tap Shift Broadcast)",
                    "Multimodal Shift Audio Handover (Gemini Notes)",
                    "Attendant Scheduling & Weekly Hours Meter",
                    "WSIB Equipment Training & Liability Register",
                    "Secure Document Vault (TD1s & Signed Contracts)",
                    "Up to 8 Active Attendants"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700 text-sm sm:text-base">
                      <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link
                href="/signup?plan=standard"
                className="w-full min-h-[52px] px-6 rounded-xl bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 font-bold text-lg flex items-center justify-center transition-colors shadow-sm"
              >
                Start 14-Day Free Trial
              </Link>
            </div>
          </div>

          {/* Tier 2: Bookkeeper Pro */}
          <div className="bg-white rounded-2xl shadow-md border-2 border-blue-600 p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Most Popular for DF
            </div>

            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Compliance & Bookkeeper Pro</h2>
                  <p className="text-slate-600 text-sm mt-1">Complete peace of mind for CRA, WSIB, and CILT reporting</p>
                </div>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900">
                  {billingCycle === "monthly" ? "$49" : "$41"}
                </span>
                <span className="text-slate-500 text-base font-medium">
                  / month {billingCycle === "annual" && "(billed annually at $490)"}
                </span>
              </div>
              <p className="text-xs text-blue-700 font-semibold mt-1">Covered within standard CILT bookkeeping line-item</p>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Everything in Standard, plus:</p>
                <ul className="space-y-3.5">
                  {[
                    "Bi-Weekly Ontario Payroll & Wage Statement Generator",
                    "CRA Monthly Remittance Formatter (CPP, EI, Tax)",
                    "Year-End T4 Slip & Service Canada ROE Engine",
                    "Attendant Grocery & Expense Reimbursement Tracking",
                    "Dedicated, Health-Data-Isolated Bookkeeper Portal",
                    "WSIB Premium Reporting & Rate Calculations",
                    "Unlimited Attendants & Historical Records (7-Yr CRA Vault)"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700 text-sm sm:text-base">
                      <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link
                href="/signup?plan=pro"
                className="w-full min-h-[52px] px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg flex items-center justify-center transition-colors shadow-md"
              >
                Get Started with Pro
              </Link>
            </div>
          </div>
        </div>

        {/* How to Expense Callout Section */}
        <section className="mt-16 bg-blue-50 rounded-2xl p-8 border border-blue-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-blue-800 font-bold text-lg mb-1">
                <Receipt className="w-5 h-5" /> How Direct Funding Reimbursement Works
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Zero Out-of-Pocket Expense for Self-Managers</h3>
              <p className="text-slate-600 mt-2 text-sm sm:text-base">
                Under Ontario's Direct Funding (CILT) framework, you receive an authorized administrative allotment for software, banking, and payroll preparation. DirectCare Hub invoices qualify directly under this category.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="bg-white p-4 rounded-xl border border-blue-200 text-center flex-1 min-w-[140px]">
                <Clock className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500 font-medium">Monthly Invoicing</p>
                <p className="text-sm font-bold text-slate-900">Instant PDF Receipts</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-blue-200 text-center flex-1 min-w-[140px]">
                <FileSpreadsheet className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500 font-medium">Quarterly CILT</p>
                <p className="text-sm font-bold text-slate-900">One-Tap Audit Export</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full min-h-[56px] p-5 text-left font-bold text-slate-900 flex justify-between items-center gap-4 hover:bg-slate-50"
                  aria-expanded={openFaq === index}
                >
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5 text-slate-600 text-sm sm:text-base border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
