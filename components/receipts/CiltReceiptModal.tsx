"use client";

import React, { useRef } from "react";
import { X, Printer, Shield, CheckCircle2, Download } from "lucide-react";

export interface CiltReceipt {
  id: string;
  invoice_number: string;
  payment_date: string;
  subtotal: number;
  ontario_hst_13: number;
  total_paid_cad: number;
  payment_method: string;
  last4: string;
}

interface CiltReceiptModalProps {
  receipt: CiltReceipt;
  onClose: () => void;
}

export default function CiltReceiptModal({ receipt, onClose }: CiltReceiptModalProps) {
  const printableRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printableRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (printContent) {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Container */}
      <div className="bg-white rounded-3xl max-w-2xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh]">
        
        {/* Header toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-black text-slate-800 tracking-tight uppercase">CILT Compliant Audit Document</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="min-h-[38px] px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" /> Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200/50 rounded-full text-slate-500 hover:text-slate-800 cursor-pointer transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12" ref={printableRef}>
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-receipt-area, #printable-receipt-area * {
                visibility: visible;
              }
              #printable-receipt-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                font-family: ui-sans-serif, system-ui, sans-serif;
              }
            }
          `}} />

          <div id="printable-receipt-area" className="space-y-8">
            {/* DirectCare Hub Invoice Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black text-slate-900 tracking-tight">DirectCare Hub Inc.</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Toronto, ON, M5V 2H1<br />
                  Canada • support@directcarehub.ca<br />
                  <strong>HST Registration No:</strong> 74812 3915 RT0001
                </p>
              </div>

              <div className="text-left sm:text-right space-y-1 sm:ml-auto">
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-md border border-emerald-200 uppercase tracking-wide inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Paid In Full
                </span>
                <p className="text-xs text-slate-500 font-bold mt-1">Invoice #{receipt.invoice_number}</p>
                <p className="text-xs text-slate-500 font-semibold">Date: {new Date(receipt.payment_date).toLocaleDateString("en-CA")}</p>
              </div>
            </div>

            {/* Program Justification Info Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-blue-900">
                <Shield className="w-4 h-4 text-blue-600" /> Direct Funding (CILT) Expense Eligibility Statement
              </p>
              <p className="text-slate-500 font-semibold">
                This receipt registers software services used exclusively for the administration, scheduling, WSIB training compliance, and CRA-compliant payroll management of Personal Support Workers (PSWs). This qualifies directly under the authorized monthly bookkeeping and software allocation budget line items of Ontario's self-directed care framework.
              </p>
            </div>

            {/* Bill To & Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div className="space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider block">Billed To (Self-Manager)</span>
                <p className="text-slate-900 font-extrabold text-sm">Direct Funding Employer</p>
                <p className="text-slate-500 font-medium leading-normal">
                  Registered Ontario Individual Employer<br />
                  Direct Funding Program participant
                </p>
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-slate-400 font-bold uppercase tracking-wider block">Payment Details</span>
                <p className="text-slate-900 font-extrabold">{receipt.payment_method}</p>
                <p className="text-slate-500 font-medium">Ending in *{receipt.last4}</p>
                <p className="text-slate-500 font-medium">Transaction: {receipt.id}</p>
              </div>
            </div>

            {/* Line Item Table */}
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-300 text-slate-400 font-bold uppercase">
                  <th className="py-2.5">Service Description</th>
                  <th className="py-2.5 text-right">Qty</th>
                  <th className="py-2.5 text-right">Unit Price</th>
                  <th className="py-2.5 text-right">Amount (CAD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-4">
                    <span className="font-extrabold text-slate-900 block">DirectCare Hub — Compliance & Bookkeeper Pro Plan</span>
                    <span className="text-slate-400 font-semibold text-[10px] block mt-0.5">Comprehensive CRA Payroll + WSIB Training Registry + CILT Reporting</span>
                  </td>
                  <td className="py-4 text-right">1</td>
                  <td className="py-4 text-right">${receipt.subtotal.toFixed(2)}</td>
                  <td className="py-4 text-right font-bold text-slate-900">${receipt.subtotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Financial Summary Breakout */}
            <div className="border-t border-slate-200 pt-4 flex justify-end">
              <div className="w-64 space-y-2 text-xs font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-900">${receipt.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ontario HST (13%)</span>
                  <span className="font-mono text-slate-900">${receipt.ontario_hst_13.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
                  <span>Total Paid (CAD)</span>
                  <span className="font-mono text-blue-700">${receipt.total_paid_cad.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Compliance Footer message */}
            <div className="text-center pt-8 border-t border-slate-200 text-[10px] text-slate-400 font-semibold">
              DirectCare Hub Inc. • Thank you for directing your own independent care safely.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
