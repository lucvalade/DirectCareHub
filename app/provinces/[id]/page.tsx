"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Shield, Landmark, FileText, CheckCircle2 } from "lucide-react";

interface ProvinceData {
  id: string;
  name: string;
  programName: string;
  badge: string;
  fundingLimit: string;
  description: string;
  requirements: string[];
  agencyLink: string;
  agencyName: string;
}

const PROVINCES_DATA: Record<string, ProvinceData> = {
  bc: {
    id: "bc",
    name: "British Columbia",
    programName: "Choice in Personal Support Link (CSIL)",
    badge: "BC CSIL",
    fundingLimit: "$32.50 to $38.00 / hr authorized",
    description: "British Columbia's CSIL program is a self-directed funding model that allows individuals with physical disabilities to receive funds directly from their local Health Authority to hire and manage their own personal support workers.",
    requirements: [
      "Must be a resident of British Columbia with a stable physical disability",
      "Must be able to direct your own care or appoint an authorized representative",
      "Responsible for CRA payroll deductions and WorkSafeBC coverage"
    ],
    agencyName: "BC Ministry of Health - CSIL Guidelines",
    agencyLink: "https://www2.gov.bc.ca/gov/content/health/accessing-health-care/home-community-care"
  },
  alberta: {
    id: "alberta",
    name: "Alberta",
    programName: "Self-Managed Care (SMC)",
    badge: "Alberta SMC",
    fundingLimit: "Varies by AHS Regional Assessment",
    description: "Alberta Health Services (AHS) provides SMC funding directly to qualified Albertans to manage their own personal care services. This allows employers to directly hire private care staff or contract agencies.",
    requirements: [
      "Requires an active assessment by an Alberta Health Services (AHS) home care coordinator",
      "Must operate as a registered domestic employer with CRA and WCB Alberta",
      "Eligible for bookkeeping cost offsets under regional care plans"
    ],
    agencyName: "Alberta Health Services - Self-Managed Care",
    agencyLink: "https://www.albertahealthservices.ca/info/page12634.aspx"
  },
  manitoba: {
    id: "manitoba",
    name: "Manitoba",
    programName: "Direct Funding Option (DFO)",
    badge: "Manitoba DF",
    fundingLimit: "Set by Regional Health Authorities",
    description: "Manitoba's DFO program enables individuals with long-term disabilities to receive direct financial assistance to arrange and manage their own non-professional home care supports.",
    requirements: [
      "Must be assessed as requiring Home Care services by Manitoba Health",
      "Must assume full employer liabilities including payroll taxes and workers compensation",
      "Subject to annual reconciliation audits by regional wellness boards"
    ],
    agencyName: "Manitoba Health - Direct Funding Care",
    agencyLink: "https://www.gov.mb.ca/health/homecare/"
  },
  "nova-scotia": {
    id: "nova-scotia",
    name: "Nova Scotia",
    programName: "Direct Family Support (DFS)",
    badge: "NS Care",
    fundingLimit: "Fixed Provincial Tier Allocations",
    description: "Nova Scotia's DFS program assists low-to-moderate-income families supporting children or adults with severe disabilities at home, facilitating direct funding to secure respite or personal care workers.",
    requirements: [
      "Must meet provincial income eligibility assessments",
      "Funding must be spent on direct care staffing or verified respite providers",
      "Submission of itemized quarterly receipts is required for replenishment"
    ],
    agencyName: "Nova Scotia Department of Community Services",
    agencyLink: "https://novascotia.ca/coms/disabilities/DirectFamilySupport.html"
  },
  saskatchewan: {
    id: "saskatchewan",
    name: "Saskatchewan",
    programName: "Individualized Funding (IF)",
    badge: "SK Care",
    fundingLimit: "Regional Health Authority Apportionment",
    description: "Saskatchewan's Individualized Funding model provides direct payment options to home care clients with high-density needs, allowing them to arrange support services that align with their personal schedules.",
    requirements: [
      "Must reside in Saskatchewan and undergo local clinical needs assessment",
      "Approved funds must be strictly restricted to personal attendant care or transfers",
      "Requires formal compliance reporting to local Saskatchewan Health Authority offices"
    ],
    agencyName: "Saskatchewan Health Authority Home Care",
    agencyLink: "https://www.saskatchewan.ca/residents/health/accessing-health-care-services"
  },
  newfoundland: {
    id: "newfoundland",
    name: "Newfoundland",
    programName: "Provincial Home Support Program (PHSP)",
    badge: "NL Care",
    fundingLimit: "Assessed Hourly Support Tiers",
    description: "Newfoundland and Labrador's PHSP program incorporates a self-managed home support option, empowering clients with stable daily support requirements to directly recruit their own attendants.",
    requirements: [
      "Requires comprehensive functional and financial assessment",
      "Must be utilized for essential non-professional personal care assistance",
      "Subject to random verification audits of timesheets and tax withholdings"
    ],
    agencyName: "Newfoundland & Labrador Department of Health",
    agencyLink: "https://www.gov.nl.ca/cssd/disabilities/"
  }
};

export default function ProvincePage() {
  const params = useParams();
  const id = (params?.id as string) || "bc";
  const data = PROVINCES_DATA[id] || PROVINCES_DATA.bc;

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
          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {data.badge} • Active Program
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {data.name} Self-Managed Care
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-bold">
            {data.programName} Framework & Compliance Guidelines
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Landmark className="w-5 h-5 text-blue-600 shrink-0" />
              Program Overview
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-bold">
              {data.description}
            </p>
          </section>

          <section className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-950 space-y-1">
            <p className="font-extrabold text-blue-900">Funding Rates & Bookkeeping Offsets:</p>
            <p className="font-semibold">{data.fundingLimit}</p>
            <p className="text-slate-600 font-medium">
              DirectCare Hub's custom bookkeeping models are fully authorized as claimable expenses under provincial digital administration rules.
            </p>
          </section>

          <section className="space-y-3 border-t pt-6">
            <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 shrink-0" />
              Employer Eligibility Checklist
            </h2>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600 font-bold">
              {data.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-semibold">
              <p>Looking for Ontario CILT instead?</p>
              <Link href="/" className="text-blue-600 hover:underline">
                View Ontario Direct Funding Dashboard
              </Link>
            </div>
            <a
              href={data.agencyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition cursor-pointer"
            >
              Visit Official {data.name} Care Portal
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
