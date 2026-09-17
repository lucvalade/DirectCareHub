'use client';

import React, { useRef, useState } from 'react';
import { Printer, Download } from 'lucide-react';

interface CRARemittanceReportProps {
  month?: string;
  year?: number;
  totalEmployeeCpp?: number;
  totalEmployerCpp?: number;
  totalEmployeeEi?: number;
  totalEmployerEi?: number;
  totalIncomeTax?: number;
}

export default function CRARemittanceReport({
  month = 'September',
  year = 2026,
  totalEmployeeCpp = 132.50,
  totalEmployerCpp = 132.50,
  totalEmployeeEi = 40.68,
  totalEmployerEi = 56.95,
  totalIncomeTax = 171.00
}: CRARemittanceReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const grandTotalCRA = totalEmployeeCpp + totalEmployerCpp + totalEmployeeEi + totalEmployerEi + totalIncomeTax;
  const dueDate = `${year}-10-15`;

  const handlePrint = () => {
    if (typeof window === 'undefined') return;
    const printContent = reportRef.current?.innerHTML;
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
              <title>CRA Monthly Remittance - ${month} ${year}</title>
              <style>
                body { font-family: monospace; padding: 20px; background: #fff; color: #000; }
                .report-box { border: 1px solid #ccc; padding: 24px; border-radius: 8px; }
                h3 { color: #6b21a8; margin-top: 0; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #eee; }
                .row { display: flex; justify-content: space-between; margin-bottom: 6px; }
                .bold { font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="report-box">
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
    if (typeof window === 'undefined' || !reportRef.current) return;
    let canvas: HTMLCanvasElement | null = null;
    try {
      setIsExporting(true);
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;
      const { default: jsPDF } = await import('jspdf');

      canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
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

      pdf.save(`CRA_Remittance_${month}_${year}.pdf`);
    } catch (err) {
      console.error("Failed to generate CRA Remittance PDF:", err);
      alert("Error generating PDF. Please try printing via browser.");
    } finally {
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              CRA Receiver General for Canada
            </span>
            <span className="text-slate-400 text-sm">PD7A Monthly Remittance</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">CRA Monthly Remittance Summary ({month} {year})</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated employee deductions and employer contributions due by the 15th of the following month.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="min-h-[48px] px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl flex items-center space-x-2 transition shadow-sm cursor-pointer"
          >
            <Printer className="w-5 h-5 text-slate-700" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="min-h-[48px] px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold rounded-xl flex items-center space-x-2 transition shadow-sm disabled:opacity-50 cursor-pointer"
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

      {/* Printable Report Document Container */}
      <div 
        ref={reportRef}
        className="bg-slate-900 text-slate-100 p-6 sm:p-8 rounded-2xl font-mono text-xs shadow-lg space-y-6 print:m-0 print:p-6 print:shadow-none print:bg-white print:text-black print:rounded-none"
      >
        <div className="text-center border-b border-slate-800 print:border-slate-300 pb-4">
          <h3 className="text-base font-bold text-purple-400 print:text-purple-800 tracking-wider">CRA MONTHLY REMITTANCE STATEMENT (PD7A)</h3>
          <p className="text-slate-400 print:text-slate-600 text-[11px] mt-0.5">Receiver General for Canada — Direct Funding Program Participant</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-800 print:border-slate-300 pb-6 text-slate-300 print:text-slate-800">
          <div className="space-y-1">
            <span className="text-purple-400 print:text-purple-800 font-bold block mb-1">EMPLOYER ACCOUNT DETAILS:</span>
            <p>Participant Name: Direct Funding Employer</p>
            <p>CRA Program Account: 849201948 RP 0001</p>
            <p>Remittance Period: {month} {year}</p>
          </div>
          <div className="space-y-1">
            <span className="text-purple-400 print:text-purple-800 font-bold block mb-1">PAYMENT DEADLINE:</span>
            <p>Due Date: {dueDate}</p>
            <p>Payment Method: My Business Account / Online Banking (RCcode)</p>
          </div>
        </div>

        <div className="space-y-3 border-b border-slate-800 print:border-slate-300 pb-6">
          <span className="text-emerald-400 print:text-emerald-800 font-bold block">REMITTANCE BREAKDOWN BY COMPONENT</span>
          <div className="grid grid-cols-3 text-slate-400 print:text-slate-600 font-semibold border-b border-slate-800 print:border-slate-300 pb-1">
            <span>Remittance Description</span>
            <span>Basis / Calculation</span>
            <span className="text-right">Total Amount</span>
          </div>
          <div className="grid grid-cols-3 text-slate-200 print:text-slate-900 py-1.5">
            <span>Employee CPP Withheld</span>
            <span>5.95% from pay stubs</span>
            <span className="text-right">${totalEmployeeCpp.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-3 text-slate-200 print:text-slate-900 py-1.5">
            <span>Employer CPP Contribution</span>
            <span>100% matching (1.0x)</span>
            <span className="text-right">${totalEmployerCpp.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-3 text-slate-200 print:text-slate-900 py-1.5">
            <span>Employee EI Withheld</span>
            <span>1.63% from pay stubs</span>
            <span className="text-right">${totalEmployeeEi.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-3 text-slate-200 print:text-slate-900 py-1.5">
            <span>Employer EI Contribution</span>
            <span>140% matching (1.4x)</span>
            <span className="text-right">${totalEmployerEi.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-3 text-slate-200 print:text-slate-900 py-1.5">
            <span>Income Tax Withheld</span>
            <span>Federal & Provincial TD1</span>
            <span className="text-right">${totalIncomeTax.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 pt-4 border-t border-slate-800 print:border-slate-300 text-sm font-bold text-purple-400 print:text-purple-900">
            <span>TOTAL MONTHLY REMITTANCE DUE:</span>
            <span className="text-right text-lg">${grandTotalCRA.toFixed(2)}</span>
          </div>
        </div>

        <div className="p-4 bg-purple-950/60 print:bg-purple-50 rounded-xl border border-purple-800 print:border-purple-300 text-slate-200 print:text-slate-800">
          <p className="font-bold text-purple-300 print:text-purple-900 mb-1">Instructions for Remittance:</p>
          <p className="text-slate-300 print:text-slate-700 text-[11px] leading-relaxed">
            Please ensure remittance is paid to the Receiver General for Canada on or before {dueDate} to avoid any Canada Revenue Agency late-filing penalties or arrears interest. Reference account number 849201948RP0001.
          </p>
        </div>
      </div>
    </div>
  );
}
