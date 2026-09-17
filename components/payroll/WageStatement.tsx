'use client';

import React, { useRef, useState } from 'react';
import { Printer, Download, Calculator, DollarSign } from 'lucide-react';

interface WageStatementProps {
  attendantName: string;
  attendantId?: string;
  payPeriod: string;
  payDate: string;
  hoursWorked: number;
  hourlyRate: number;
  statHours?: number;
  statRate?: number;
  paymentReference?: string;
}

export default function WageStatement({
  attendantName,
  attendantId = 'ATT-001',
  payPeriod = '2026-09-01 to 2026-09-14',
  payDate = '2026-09-15',
  hoursWorked = 60.0,
  hourlyRate = 20.00,
  statHours = 0.0,
  statRate = 30.00,
  paymentReference = 'INTERAC-ETR-893241'
}: WageStatementProps) {
  const statementRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Calculations
  const regularEarnings = hoursWorked * hourlyRate;
  const statEarnings = statHours * statRate;
  const subtotalEarnings = regularEarnings + statEarnings;
  const vacationPay = subtotalEarnings * 0.04; // 4% ESA minimum
  const totalGross = subtotalEarnings + vacationPay;

  // CPP Calculation (Bi-weekly exemption: $3,500 / 26 = $134.62)
  const biWeeklyExemption = 134.62;
  const pensionableEarnings = Math.max(0, totalGross - biWeeklyExemption);
  const cppDeduction = pensionableEarnings * 0.0595;

  // EI Calculation (1.63%)
  const eiDeduction = totalGross * 0.0163;

  // Federal & Ontario Tax (Estimated TD1 Basic Claim 1)
  const taxDeduction = 85.50;

  const totalDeductions = cppDeduction + eiDeduction + taxDeduction;
  const netPay = totalGross - totalDeductions;

  // Employer Remittances
  const employerCpp = cppDeduction; // 1.0x matching
  const employerEi = eiDeduction * 1.4; // 1.4x matching
  const totalMonthlyCra = cppDeduction + employerCpp + eiDeduction + employerEi + (taxDeduction * 2);
  const wsibEstimate = totalGross * 0.022;

  const handlePrint = () => {
    if (typeof window === 'undefined') return;
    const printContent = statementRef.current?.innerHTML;
    if (!printContent) {
      window.print();
      return;
    }
    try {
      const printWindow = window.open('', '_blank', 'width=800,height=900');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Wage Statement - ${attendantName}</title>
              <style>
                body { font-family: monospace; padding: 20px; background: #fff; color: #000; }
                .statement-box { border: 1px solid #ccc; padding: 24px; border-radius: 8px; }
                h3 { color: #047857; margin-top: 0; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #eee; }
                .row { display: flex; justify-content: space-between; margin-bottom: 6px; }
                .bold { font-weight: bold; }
                .net-box { background: #ecfdf5; border: 1px solid #10b981; padding: 12px; margin-top: 16px; display: flex; justify-content: space-between; align-items: center; }
              </style>
            </head>
            <body>
              <div class="statement-box">
                ${printContent}
              </div>
              <script>
                window.onload = function() { window.print(); window.close(); }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        window.print();
      }
    } catch {
      window.print();
    }
  };

  const handleExportPDF = async () => {
    if (typeof window === 'undefined' || !statementRef.current) return;
    let canvas: HTMLCanvasElement | null = null;
    try {
      setIsExporting(true);
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;
      const { default: jsPDF } = await import('jspdf');

      canvas = await html2canvas(statementRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 size in mm
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Wage_Statement_${attendantName.replace(/\s+/g, '_')}_${payDate}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Error generating PDF. Please try printing via browser.");
    } finally {
      // Free canvas image memory to avoid retaining large bitmaps in DOM heap
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Top Action Bar (Hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Ontario ESA Compliant
            </span>
            <span className="text-slate-400 text-sm">Employment Standards Act, 2000</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Bi-Weekly Attendant Wage Statement</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official Statement of Earnings, Deductions, and Net Pay Disbursement.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="min-h-[48px] px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl flex items-center space-x-2 transition shadow-sm cursor-pointer"
          >
            <Printer className="w-5 h-5 text-slate-700" />
            <span>Print Statement</span>
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="min-h-[48px] px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl flex items-center space-x-2 transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isExporting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Export PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Printable Statement Document Container */}
      <div 
        ref={statementRef}
        className="bg-slate-900 text-slate-100 p-6 sm:p-8 rounded-2xl font-mono text-xs shadow-lg space-y-6 print:m-0 print:p-6 print:shadow-none print:bg-white print:text-black print:rounded-none"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 print:border-slate-300 pb-4 gap-4">
          <div className="text-center sm:text-left flex-1">
            <h3 className="text-base font-bold text-emerald-400 print:text-emerald-800 tracking-wider">STATEMENT OF EARNINGS & DEDUCTIONS</h3>
            <p className="text-slate-400 print:text-slate-600 text-[11px] mt-0.5">Ontario Ministry of Labour — Employment Standards Act, 2000 (ESA)</p>
          </div>
          {/* DirectCare Hub Logo and Subtitle */}
          <div className="flex items-center space-x-2 bg-slate-800/80 print:bg-slate-100 px-3 py-2 rounded-xl border border-slate-700 print:border-slate-300 shrink-0">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
              ✓
            </div>
            <div>
              <p className="text-xs font-bold text-white print:text-slate-900 leading-none">DirectCare Hub</p>
              <p className="text-[9px] text-slate-400 print:text-slate-600 leading-tight">Self-Managed Attendant Care Hub</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-800 print:border-slate-300 pb-6 text-slate-300 print:text-slate-800">
          <div className="space-y-1">
            <span className="text-emerald-400 print:text-emerald-800 font-bold block mb-1">EMPLOYER INFORMATION:</span>
            <p>Name: Direct Funding Employer (Participant)</p>
            <p>Address: Hamilton, ON</p>
            <p>CRA Business No: 849201948 RP 0001</p>
            <p>Program: Direct Funding (CILT) / FMHC</p>
          </div>
          <div className="space-y-1">
            <span className="text-emerald-400 print:text-emerald-800 font-bold block mb-1">EMPLOYEE INFORMATION:</span>
            <p>Name: {attendantName}</p>
            <p>Address: Ontario, Canada</p>
            <p>Employee ID: {attendantId}</p>
            <p>SIN: ###-###-### (Masked)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-800 print:border-slate-300 pb-6 text-slate-300 print:text-slate-800">
          <div>
            <span className="text-slate-400 print:text-slate-600 block">Pay Period:</span>
            <span className="text-white print:text-black font-bold">{payPeriod}</span>
          </div>
          <div>
            <span className="text-slate-400 print:text-slate-600 block">Pay Date:</span>
            <span className="text-white print:text-black font-bold">{payDate} (Bi-Weekly)</span>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="space-y-2 border-b border-slate-800 print:border-slate-300 pb-6">
          <span className="text-emerald-400 print:text-emerald-800 font-bold block">EARNINGS BREAKDOWN</span>
          <div className="grid grid-cols-4 text-slate-400 print:text-slate-600 font-semibold border-b border-slate-800 print:border-slate-300 pb-1">
            <span>Description</span>
            <span>Hours / Basis</span>
            <span>Rate / %</span>
            <span className="text-right">Current Total</span>
          </div>
          <div className="grid grid-cols-4 text-slate-200 print:text-slate-900 py-1">
            <span>Regular Care Hours</span>
            <span>{hoursWorked.toFixed(2)} hrs</span>
            <span>${hourlyRate.toFixed(2)} / hr</span>
            <span className="text-right">${regularEarnings.toFixed(2)}</span>
          </div>
          {statHours > 0 && (
            <div className="grid grid-cols-4 text-slate-200 print:text-slate-900 py-1">
              <span>Statutory Holiday Hours</span>
              <span>{statHours.toFixed(2)} hrs</span>
              <span>${statRate.toFixed(2)} / hr</span>
              <span className="text-right">${statEarnings.toFixed(2)}</span>
            </div>
          )}
          <div className="grid grid-cols-4 text-slate-200 print:text-slate-900 py-1">
            <span>Vacation Pay (Paid Out)</span>
            <span>4.00 %</span>
            <span>on ${subtotalEarnings.toFixed(2)}</span>
            <span className="text-right">${vacationPay.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 pt-3 border-t border-slate-800 print:border-slate-300 text-sm font-bold text-emerald-400 print:text-emerald-800">
            <span>TOTAL GROSS EARNINGS:</span>
            <span className="text-right">${totalGross.toFixed(2)}</span>
          </div>
        </div>

        {/* Statutory Deductions */}
        <div className="space-y-2 border-b border-slate-800 print:border-slate-300 pb-6">
          <span className="text-rose-400 print:text-rose-800 font-bold block">STATUTORY DEDUCTIONS (EMPLOYEE PORTION)</span>
          <div className="grid grid-cols-3 text-slate-400 print:text-slate-600 font-semibold border-b border-slate-800 print:border-slate-300 pb-1">
            <span>Description</span>
            <span>Calculation</span>
            <span className="text-right">Amount</span>
          </div>
          <div className="grid grid-cols-3 text-slate-200 print:text-slate-900 py-1">
            <span>Canada Pension Plan (CPP)</span>
            <span>5.95% on (${totalGross.toFixed(2)} - $134.62)</span>
            <span className="text-right">${cppDeduction.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-3 text-slate-200 print:text-slate-900 py-1">
            <span>Employment Insurance (EI)</span>
            <span>1.63% on ${totalGross.toFixed(2)}</span>
            <span className="text-right">${eiDeduction.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-3 text-slate-200 print:text-slate-900 py-1">
            <span>Federal & Ontario Income Tax</span>
            <span>Canada Revenue Agency TD1 Claim</span>
            <span className="text-right">${taxDeduction.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 pt-3 border-t border-slate-800 print:border-slate-300 text-sm font-bold text-rose-400 print:text-rose-800">
            <span>TOTAL DEDUCTIONS:</span>
            <span className="text-right">${totalDeductions.toFixed(2)}</span>
          </div>
        </div>

        {/* Net Pay */}
        <div className="p-4 bg-emerald-950/60 print:bg-emerald-50 rounded-xl border border-emerald-800 print:border-emerald-300 flex flex-col sm:flex-row items-center justify-between text-white print:text-slate-900">
          <div>
            <span className="text-emerald-300 print:text-emerald-800 text-xs uppercase tracking-wider block font-bold">Net Pay Distribution</span>
            <span className="text-slate-300 print:text-slate-700 text-xs">Direct Deposit / Reference: {paymentReference}</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400 print:text-emerald-900 mt-2 sm:mt-0">
            ${netPay.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Step-by-Step Calculation Breakdown & Employer Remittance Liability Cards (Hidden on print) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold">
            <Calculator className="w-5 h-5 text-purple-700" />
            <h4 className="text-base">Step-by-Step Bi-Weekly Calculation Breakdown</h4>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700 list-disc pl-4">
            <li><strong>Regular Care Hours:</strong> {hoursWorked.toFixed(1)} hours worked × ${hourlyRate.toFixed(2)}/hour = ${regularEarnings.toFixed(2)}</li>
            <li><strong>Vacation Pay (4% ESA Minimum):</strong> ${subtotalEarnings.toFixed(2)} × 0.04 = ${vacationPay.toFixed(2)}. (Note: Paying vacation pay on every paycheque is permitted under the ESA provided it is broken down as a separate line item).</li>
            <li><strong>Total Gross Earnings:</strong> ${subtotalEarnings.toFixed(2)} + ${vacationPay.toFixed(2)} = ${totalGross.toFixed(2)}</li>
            <li><strong>CPP Contribution:</strong> Bi-weekly basic exemption ($3,500 ÷ 26 pay periods = $134.62). Pensionable earnings: ${totalGross.toFixed(2)} − $134.62 = ${pensionableEarnings.toFixed(2)}. Employee contribution: ${pensionableEarnings.toFixed(2)} × 5.95% = ${cppDeduction.toFixed(2)}.</li>
            <li><strong>EI Premium:</strong> Insurable from first dollar. ${totalGross.toFixed(2)} × 1.63% = ${eiDeduction.toFixed(2)}.</li>
            <li><strong>Federal & Provincial Income Tax:</strong> Estimated at ${taxDeduction.toFixed(2)} based on standard Federal and Ontario TD1 Basic Personal Amounts (Claim Code 1) via CRA Payroll Calculator.</li>
            <li><strong>Net Pay:</strong> ${totalGross.toFixed(2)} (Gross) − ${totalDeductions.toFixed(2)} (Deductions) = <strong>${netPay.toFixed(2)}</strong></li>
          </ul>
        </div>

        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold">
            <DollarSign className="w-5 h-5 text-emerald-700" />
            <h4 className="text-base">Employer Remittance Liability (CRA & WSIB)</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-200/70 text-slate-700 font-semibold">
                <tr>
                  <th className="p-2 rounded-l-lg">Remittance Item</th>
                  <th className="p-2">Responsibility</th>
                  <th className="p-2 text-right rounded-r-lg">Amount Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr>
                  <td className="py-2.5 px-2 font-medium">Employee CPP</td>
                  <td className="py-2.5 px-2 text-slate-500">Withheld from Pay</td>
                  <td className="py-2.5 px-2 text-right font-semibold">${cppDeduction.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-2 font-medium">Employer CPP (1.0x)</td>
                  <td className="py-2.5 px-2 text-slate-500">Employer Contribution</td>
                  <td className="py-2.5 px-2 text-right font-semibold">${employerCpp.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-2 font-medium">Employee EI</td>
                  <td className="py-2.5 px-2 text-slate-500">Withheld from Pay</td>
                  <td className="py-2.5 px-2 text-right font-semibold">${eiDeduction.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-2 font-medium">Employer EI (1.4x)</td>
                  <td className="py-2.5 px-2 text-slate-500">Employer Contribution</td>
                  <td className="py-2.5 px-2 text-right font-semibold">${employerEi.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-2 font-medium">Income Tax Withheld</td>
                  <td className="py-2.5 px-2 text-slate-500">Federal & Provincial</td>
                  <td className="py-2.5 px-2 text-right font-semibold">${taxDeduction.toFixed(2)}</td>
                </tr>
                <tr className="bg-emerald-50 font-bold text-emerald-900">
                  <td className="py-2 px-2">Total CRA Remittance Due</td>
                  <td className="py-2 px-2 text-xs font-normal">By 15th of next month</td>
                  <td className="py-2 px-2 text-right">${totalMonthlyCra.toFixed(2)}</td>
                </tr>
                <tr className="bg-purple-50 font-bold text-purple-900">
                  <td className="py-2 px-2">WSIB Ontario Premium</td>
                  <td className="py-2 px-2 text-xs font-normal">Quarterly return</td>
                  <td className="py-2 px-2 text-right">${wsibEstimate.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
