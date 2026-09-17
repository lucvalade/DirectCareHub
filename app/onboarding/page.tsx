'use client';

import React, { useState } from 'react';
import NavigationHeader from '@/components/NavigationHeader';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, FileText, Landmark } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <NavigationHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-amber-100 text-amber-800 rounded-2xl">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Direct Funding Employer Setup Wizard</h1>
          <p className="text-xs text-slate-600">
            Guide to setting up your Ontario Direct Funding self-managed household
          </p>
        </div>

        {/* Steps Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <span className="text-xs font-bold text-slate-400 uppercase">Step {step} of 3</span>
            <div className="flex space-x-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-2 rounded-full ${s <= step ? 'bg-amber-500' : 'bg-slate-200'}`}
                />
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900">1. CRA Business Number & Payroll Account</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                As a Direct Funding individual employer, you must register for a CRA Business Number (BN) with a Payroll program identifier (RP0001). This allows you to legally remit CPP, EI, and income tax withholdings to Receiver General for Canada.
              </p>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold">Checklist Item:</p>
                <p>Call CRA Business Inquiries at 1-800-959-5525 or register via Business Registration Online (BRO).</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900">2. WSIB Ontario Employer Account</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Under Ontario law, all domestic employers hiring attendants through Direct Funding must open a Workplace Safety and Insurance Board (WSIB) account within 10 days of hiring your first attendant to provide workplace injury coverage.
              </p>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-900 space-y-1">
                <p className="font-bold">Direct Funding Subsidy:</p>
                <p>Your Direct Funding budget allocation includes funds specifically earmarked for your WSIB premiums.</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900">3. Attendant Employment Agreement & Compliance</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ensure all attendants sign standard Direct Funding Employment Agreements, submit proof of CPR/First Aid certification, and provide Vulnerable Sector Checks. All documents can be uploaded to your Document Vault.
              </p>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <p className="font-bold">Vault Integration:</p>
                <p>Access the Document Vault to send electronic contracts and track expiry dates automatically.</p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl"
              >
                Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href="/vault"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5"
              >
                <span>Complete & Open Vault</span>
                <CheckCircle2 className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
