// Developed by VertexAgent.io
// Project: DirectCare Hub - Itemized Pay Stub PDF Generator Route

import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit-table';
import { calculateBiWeeklyPayrollWithOvertime } from '@/lib/payroll/craOvertimeCalculator';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const attendantName = searchParams.get('name') || 'Elena Rostova (PSW)';
    const hourlyRate = parseFloat(searchParams.get('rate') || '28.50');
    const totalHours = parseFloat(searchParams.get('hours') || '94.0'); // Example with 6 overtime hours

    const payroll = calculateBiWeeklyPayrollWithOvertime(hourlyRate, totalHours);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks: Buffer[] = [];
    
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    doc.fontSize(20).text('DirectCare Hub: Bi-Weekly Itemized Pay Stub', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Attendant Name: ${attendantName}`);
    doc.text(`Pay Period: Bi-Weekly (44 hr/week ESA Threshold)`);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`);
    doc.moveDown(2);

    const stubTable = {
      title: "Itemized Earnings & CRA Statutory Deductions",
      headers: ["Description", "Hours / Rate", "Amount"],
      rows: [
        [`Regular Hours`, `${payroll.regularHours.toFixed(2)} hrs @ $${hourlyRate.toFixed(2)}/hr`, `$${payroll.regularPay.toFixed(2)}`],
        [`Overtime Hours (1.5x)`, `${payroll.overtimeHours.toFixed(2)} hrs @ $${(hourlyRate * 1.5).toFixed(2)}/hr`, `$${payroll.overtimePay.toFixed(2)}`],
        ["Gross Earnings", "-", `$${payroll.grossPay.toFixed(2)}`],
        ["Less: CPP Deduction", "-", `($${payroll.cppDeduction.toFixed(2)})`],
        ["Less: EI Deduction", "-", `($${payroll.eiDeduction.toFixed(2)})`],
        ["Less: Income Tax", "-", `($${payroll.incomeTax.toFixed(2)})`],
        ["Net Pay Transfer", "-", `$${payroll.netPay.toFixed(2)}`]
      ],
    };

    await doc.table(stubTable, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
      prepareRow: () => doc.font("Helvetica").fontSize(9),
    });

    doc.end();

    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="PayStub_${attendantName.replace(/\s+/g, '_')}.pdf"`,
      },
    });

  } catch (error) {
    console.error("Payroll PDF Generation Failed:", error);
    return NextResponse.json({ error: 'Failed to generate pay stub' }, { status: 500 });
  }
}
