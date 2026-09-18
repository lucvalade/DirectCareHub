import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | DirectCare Hub",
  description: "Learn how DirectCare Hub safeguards health-related data and financial records under CILT, CSIL, and SMC guidelines.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 min-h-[48px]">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <span className="text-sm font-black text-slate-900">DirectCare Hub</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-800 min-h-[48px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="space-y-3">
          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Effective: September 2026
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-bold">
            Last Updated: September 17, 2026
          </p>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-2xs space-y-6 text-xs sm:text-sm leading-relaxed text-slate-600 font-bold">
          
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">1. Privacy Commitment</h2>
            <p>
              At DirectCare Hub, we respect your dignity, autonomy, and absolute medical privacy. Unlike standard SaaS platforms, we enforce strict role-based data segregation so that bookkeepers and third-party auditors cannot access private physical healthcare runbooks, mechanical transfer procedures, or shift logs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">2. Information We Collect</h2>
            <p>
              To run household caregiver payroll under the Direct Funding (CILT / CSIL / SMC) programs, we collect and store:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[11px] sm:text-xs">
              <li><strong>Employer Profile Details:</strong> Your full name, email, and program vendor identifiers.</li>
              <li><strong>Caregiver Information:</strong> Name, hourly pay rates, work history log, and digital signatures.</li>
              <li><strong>Payroll Deductions:</strong> Statutory CPP, EI, Income Tax calculations, and WSIB premium rates.</li>
              <li><strong>Audio Handover Memos:</strong> Temporary, voice-recorded team handovers that are stored securely in Firestore Storage.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">3. Data Security & Storage</h2>
            <p>
              Your data is encrypted both in transit (using SSL/TLS) and at rest (using AES-256 standards). Access control is enforced directly at the database layer through rigorous security rules, ensuring no third party can fetch unauthorized employee files.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">4. Compliance Guidelines</h2>
            <p>
              DirectCare Hub is built to comply with both the Accessibility for Ontarians with Disabilities Act (AODA) and the Health Insurance Portability and Accountability Act (HIPAA) security frameworks. We retain files for up to 6 years, as required by the Canada Revenue Agency (CRA) for audit verification.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">5. Contact Information</h2>
            <p>
              For all data protection requests or inquiries regarding CILT/CSIL expense reimbursement invoices, please reach out to us at <strong>privacy@directcarehub.ca</strong>.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
