// Developed by VertexAgent.io
// Project: DirectCare Hub - Pro-Dark Glassmorphism 2.0 Pricing & Plan Matrix

'use client';

import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  Building2, 
  FileText, 
  ArrowRight,
  Briefcase,
  Layers,
  FileCheck2,
  Users,
  CheckCircle2,
  Zap,
  TrendingUp,
  Receipt
} from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  badge?: string;
  priceMonthly: number;
  priceAnnualMonthly: number;
  description: string;
  idealFor: string;
  fundingFitBadge?: string;
  isPopular?: boolean;
  ctaText: string;
  features: string[];
  complianceGuarantees: string[];
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Self-Manager Basic',
    priceMonthly: 49,
    priceAnnualMonthly: 39,
    description: 'Core shift scheduling, geofenced clock-in, and accurate gross-to-net paystub calculations.',
    idealFor: 'Independent self-managers with 1-2 attendants who manually remit CRA deductions and write cheques.',
    ctaText: 'Start with Basic',
    features: [
      'Up to 3 active attendants / PSWs',
      '50m Haversine GPS geofenced shift clock-in',
      'Daily care runbook & ADL task checklists',
      'Offline IndexedDB shift sync when away from Wi-Fi',
      'Multi-province overtime splits (ON 44h / BC daily 8h/12h)',
      'Statutory holiday premium calculations (1.5x)',
      'Non-taxable care expense tracking (mileage, PPE, supplies)',
      'Standard printable CRA paystubs (PDF)',
    ],
    complianceGuarantees: [
      'Provincial Employment Standards Act (ESA) compliance',
      'Basic personal tax credits (TD1) deduction tables',
    ],
  },
  {
    id: 'compliance',
    name: 'Compliance & Direct Deposit',
    badge: 'Most Popular • The Sweet Spot • 100% Ministry Eligible',
    priceMonthly: 89,
    priceAnnualMonthly: 74,
    description: 'Full automation: electronic bank direct deposits, automated CRA remittances, and CILT/CSIL audit oversight.',
    idealFor: 'Full direct-funding employers utilizing their $170+/mo CILT/CSIL administrative allowance.',
    fundingFitBadge: '100% Covered under CILT/CSIL monthly admin budget',
    isPopular: true,
    ctaText: 'Unlock Full Compliance',
    features: [
      'Everything in Self-Manager Basic',
      'Unlimited attendant profiles & shift records',
      'Payments Canada Standard 005 (1464-byte) EFT file export',
      'Transaction Code 201 bank reversal / cancellation recall',
      'Automated CRA Form PD7A monthly remittance calculations',
      'Annual T4 Internet File Transfer (IFT) XML generator',
      'Service Canada Record of Employment (ROE Web) v2.0 XML',
      'Quarterly WSIB / WorkSafeBC assessment & rate tracking',
      'Quarterly CILT / CSIL allocation burn-rate variance alerts',
      'Automated SMS & email paystub delivery to attendants',
    ],
    complianceGuarantees: [
      'Payments Canada Standard 005 direct deposit compliance',
      'CRA payroll source deduction & T4 schema certified',
      'One-click regional health authority / CILT audit package',
    ],
  },
  {
    id: 'bookkeeper',
    name: 'Bookkeeper / Agency Pro',
    badge: 'Multi-Client Console',
    priceMonthly: 189,
    priceAnnualMonthly: 159,
    description: 'A centralized multi-tenant workspace built specifically for specialized Direct Funding bookkeepers and agency desks.',
    idealFor: 'Bookkeeping firms (e.g., First Richvale), CILT resource hubs, and payroll accountants administering multiple self-managers.',
    ctaText: 'Access Agency Console',
    features: [
      'Includes 10 self-manager client accounts (add $15/client/mo)',
      'Single-login multi-client switcher dashboard (manage 5-20+ clients)',
      'Batch CPA Standard 005 EFT generation across all clients',
      'Bulk CRA PD7A remittance ledger and reconciliation exports',
      'Batch Year-End T4 and Service Canada ROE XML compilations',
      'Master CILT / CSIL quarterly expenditure manifests',
      'Custom role-based auditor view with read-only permissions',
      'Priority direct phone & screen-share compliance support',
    ],
    complianceGuarantees: [
      'Multi-entity audit trail with immutable timestamps',
      'Dedicated compliance specialist onboarding',
    ],
  },
];

const REPLACED_TOOLS = [
  {
    tool: 'Traditional Payroll Software (QuickBooks / Wagepoint)',
    cost: '$20 to $45 base + $3 to $5/attendant',
    equivalent: 'Multi-province gross-to-net payroll engine',
  },
  {
    tool: 'Scheduling & Time Tracking (Homebase / When I Work)',
    cost: '$25 to $50/month',
    equivalent: '50m Haversine geofenced clock-in & ADL runbooks',
  },
  {
    tool: 'CPA Standard 005 EFT Processing (Bank portal / Telpay)',
    cost: '$15 to $30/month + transaction fees',
    equivalent: '1464-byte EFT direct deposit & Code 201 recall files',
  },
  {
    tool: 'Care Runbook / Caregiver Notes (Paper / Binder)',
    cost: 'Manual time & error risk',
    equivalent: 'Real-time ADL checklist with offline IndexedDB buffer',
  },
  {
    tool: 'CRA & Provincial Slips (T4 / ROE Web / WSIB)',
    cost: '$100 to $250 annual filing fees',
    equivalent: 'Automated CRA IFT XML, ROE Web v2.0 XML, WSIB ledger',
  },
];

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-white overflow-hidden selection:bg-cyan-500 selection:text-black">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#0224bb]/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-[#7C3AED]/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Transparent Canadian Care Pricing
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
          Covered by Your Monthly <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
            Administrative Care Budget
          </span>
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Ontario Direct Funding (CILT), BC CSIL, and provincial self-managed programs provide dedicated administrative allowances ($170+/mo) for bookkeeping and payroll. DirectCare Hub fits directly inside your approved subsidy.
        </p>

        {/* Billing Switcher */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <div className="p-1 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-1 backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-[#0224bb] text-white shadow-[0_0_15px_rgba(2,36,187,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Prepaid</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-20">
        {PRICING_TIERS.map((tier) => {
          const currentPrice = billingCycle === 'annual' ? tier.priceAnnualMonthly : tier.priceMonthly;

          return (
            <div
              key={tier.id}
              className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 ${
                tier.isPopular
                  ? 'bg-[#020617]/90 border-2 border-cyan-400/80 shadow-[0_0_50px_rgba(34,211,238,0.2)] lg:-translate-y-2'
                  : 'bg-[#020617]/70 border border-white/10 hover:border-white/20 shadow-xl'
              }`}
            >
              {/* Popular / Focus Banner */}
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-[#7C3AED] text-white shadow-[0_0_20px_rgba(34,211,238,0.4)] whitespace-nowrap">
                  {tier.badge}
                </div>
              )}

              <div>
                {/* Top Section */}
                <div className="space-y-3 pb-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white">{tier.name}</h3>
                    {tier.isPopular ? (
                      <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                    ) : tier.id === 'bookkeeper' ? (
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                        <Briefcase className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-white/5 text-slate-400 border border-white/10">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 min-h-[36px] leading-relaxed">
                    {tier.description}
                  </p>

                  {/* Price Display */}
                  <div className="pt-2 flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                      ${currentPrice}
                    </span>
                    <div className="text-xs text-slate-400">
                      <span>CAD / month</span>
                      {billingCycle === 'annual' && <span className="block text-[10px] text-cyan-400">Billed annually</span>}
                    </div>
                  </div>

                  {/* Funding Allowance Callout */}
                  {tier.fundingFitBadge && (
                    <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{tier.fundingFitBadge}</span>
                    </div>
                  )}
                </div>

                {/* Target User Detail */}
                <div className="py-4 border-b border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Ideal Setup</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {tier.idealFor}
                  </p>
                </div>

                {/* Features List */}
                <div className="py-6 space-y-3">
                  <span className="text-[11px] uppercase font-extrabold tracking-wider text-slate-400 block">
                    Included Capabilities:
                  </span>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                        <div className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Actions & Compliance Footnote */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  className={`w-full py-3.5 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all min-h-[48px] focus:outline-none focus:ring-4 cursor-pointer ${
                    tier.isPopular
                      ? 'bg-[#0224bb] hover:bg-blue-800 text-white shadow-[0_0_25px_rgba(2,36,187,0.5)] focus:ring-cyan-400'
                      : 'bg-white/10 hover:bg-white/15 text-white border border-white/15 focus:ring-white/20'
                  }`}
                >
                  <span>{tier.ctaText}</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                </button>

                <div className="space-y-1">
                  {tier.complianceGuarantees.map((guarantee, gIdx) => (
                    <div key={gIdx} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{guarantee}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* What DirectCare Hub Replaces Comparison Matrix */}
      <div className="mb-16 rounded-3xl bg-[#020617]/80 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> Consolidated Care Stack
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              What DirectCare Hub Replaces
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Self-managers and bookkeepers previously cobbled together fragmented software tools, bank addons, and manual binders. DirectCare Hub unifies your entire care operating system into one platform.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0224bb]/40 to-[#7C3AED]/40 border border-cyan-400/30 text-center shrink-0">
            <span className="text-xs text-cyan-300 font-bold block uppercase tracking-wider">Combined Replaced Value</span>
            <span className="text-3xl sm:text-4xl font-black font-mono text-white">$85 to $150+</span>
            <span className="text-[10px] text-slate-300 block font-medium">/ month in fragmented tool fees</span>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400 bg-white/5">
                <th className="p-4 rounded-tl-xl">Replaced Tool / Fragmented Service</th>
                <th className="p-4">Typical Monthly Cost</th>
                <th className="p-4 rounded-tr-xl">DirectCare Hub Native Equivalent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {REPLACED_TOOLS.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span>{row.tool}</span>
                  </td>
                  <td className="p-4 font-mono font-semibold text-rose-300 whitespace-nowrap">
                    {row.cost}
                  </td>
                  <td className="p-4 font-bold text-cyan-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{row.equivalent}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trust & Policy Assurance Footer */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6 text-xs text-slate-400">
        <div className="space-y-1">
          <span className="font-bold text-white text-sm block">How Direct Funding Reimbursement Works</span>
          <p className="max-w-2xl leading-relaxed">
            Direct Funding participants submit their DirectCare Hub invoice directly on their quarterly CILT/CSIL financial report under approved administrative or bookkeeping expenditures. Invoices include your Canadian Business Number and itemized compliance receipts.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <span>CPA 005 Certified</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Building2 className="w-4 h-4 text-purple-400" />
            <span>CRA XML Ready</span>
          </div>
        </div>
      </div>

    </section>
  );
}
