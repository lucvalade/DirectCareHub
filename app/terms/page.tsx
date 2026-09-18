import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Terms of Service | DirectCare Hub",
  description: "Read the Terms of Service for DirectCare Hub, the operations suite for self-managed care.",
};

export default function TermsPage() {
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
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-bold">
            Last Updated: September 17, 2026
          </p>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-2xs space-y-6 text-xs sm:text-sm leading-relaxed text-slate-600 font-bold">
          
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">1. User Agreement</h2>
            <p>
              By accessing DirectCare Hub, you represent that you are a registered employer or support caregiver under a recognized consumer-directed or Direct Funding framework (such as CILT in Ontario, CSIL in British Columbia, or SMC in Alberta).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">2. Bookkeeping & Deduction Liability</h2>
            <p>
              DirectCare Hub provides automated calculator tools to assist in computing CPP, EI, Income Tax, and WSIB deductions based on CRA publications. While we strive to maintain perfect accuracy with Canadian tax tables, users should verify calculated pay stubs prior to submitting final quarterly financial records to their funding bodies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">3. CILT Expense Reimbursement Policy</h2>
            <p>
              DirectCare Hub is fully reimbursable under Category 3 administrative and digital software budgets. Users are responsible for providing their correct vendor code and Client ID to ensure their quarterly expense claims are processed seamlessly.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">4. Prohibited Uses</h2>
            <p>
              You agree not to use DirectCare Hub to store medical records or information unrelated to the individual self-manager's household support services. You are strictly prohibited from bypassing role-enforced Firestore access masks.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">5. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, DirectCare Hub shall not be liable for any indirect, incidental, or consequential damages resulting from shift disruptions or incorrect local withholding reports.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
