// Developed by VertexAgent.io
// Project: DirectCare Hub - "Coming Soon" Early Access Modal & Action Suite
'use client';

import { useState } from 'react';
import { z } from 'zod';
import { 
  Sparkles, 
  Mail, 
  User, 
  MapPin, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  Loader2, 
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

// Helper function to capitalize the first letter of each word
const toTitleCase = (str: string) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

// 1. Zod Validation Schema with explicit Regex for Email
const WaitlistSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required.")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address (e.g. user@domain.com)."),
  role: z.enum(['employer', 'psw', 'auditor', 'family'], {
    message: "Please select your primary role.",
  }),
  fullName: z.string().optional(),
  provinceProgram: z.string().min(1, "Please select your Province / Program."),
});

type WaitlistFormData = z.infer<typeof WaitlistSchema>;

const PROVINCE_PROGRAM_OPTIONS = [
  { value: "", label: "-- Select Province / Program --" },
  { value: "Ontario (CILT)", label: "Ontario (CILT Direct Funding)" },
  { value: "British Columbia (CSIL)", label: "British Columbia (CSIL)" },
  { value: "Alberta (SMC / FMS)", label: "Alberta (SMC / FMS)" },
  { value: "Quebec (Direct Funding)", label: "Quebec (Direct Funding)" },
  { value: "Nova Scotia (Self-Managed Care)", label: "Nova Scotia (Self-Managed Care)" },
  { value: "Manitoba (In the Company of Friends)", label: "Manitoba (Self-Directed)" },
  { value: "Saskatchewan (Individualized Funding)", label: "Saskatchewan (IF)" },
  { value: "Other / Private", label: "Other / Private Support" },
];

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ComingSoonModal({ isOpen, onClose }: ComingSoonModalProps) {
  const [formData, setFormData] = useState<WaitlistFormData>({
    email: '',
    role: 'employer',
    fullName: '',
    provinceProgram: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState('');

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = toTitleCase(rawValue);
    setFormData((prev) => ({ ...prev, fullName: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = WaitlistSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message || "Please complete all mandatory fields.");
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate write
      setSubmittedName(formData.fullName?.trim() || '');
      setSubmitted(true);
      toast.success("Priority access request received!");
    } catch (err) {
      toast.error("Unable to register right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.role.length > 0 &&
    formData.provinceProgram.length > 0;

  return (
    <div id="coming-soon-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        id="coming-soon-modal-container"
        className="relative w-full max-w-lg bg-[#155dfc] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accents */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-900/40 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="coming-soon-modal-close-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div id="coming-soon-success-view" className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-400/20 border border-emerald-300/40 text-emerald-300 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            {/* Thank You Title featuring Full Name */}
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Thank you{submittedName ? `, ${submittedName}` : ''}!
            </h3>
            
            <p className="text-sm text-blue-100 max-w-sm mx-auto leading-relaxed">
              You're officially on the DirectCare Priority Beta list for <span className="font-bold text-cyan-200">{formData.provinceProgram}</span>. We will notify you at <span className="font-mono text-cyan-300 underline">{formData.email}</span> as soon as access opens.
            </p>

            <button
              onClick={onClose}
              className="mt-4 px-6 py-3 rounded-2xl bg-white text-[#155dfc] font-black text-sm shadow-xl hover:bg-blue-50 transition-all min-h-[48px]"
            >
              Back to DirectCare Hub
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            
            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-cyan-200 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" /> Coming Soon • Private Beta
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Self-Managed Care, Simplified.
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                DirectCare Hub empowers self-managers with geofenced shifts, real-time runbooks, and automated CILT/CSIL payroll compliance. Reserve early access below.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Mandatory: Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-blue-100 flex items-center justify-between">
                  <span>Email Address <span className="text-cyan-300">*</span></span>
                  <span className="text-[10px] text-cyan-300 font-bold uppercase">Mandatory</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-blue-200" />
                  <input
                    id="waitlist-email-input"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john.smith@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200/60 text-sm focus:outline-none focus:ring-2 focus:ring-white transition-all"
                  />
                </div>
              </div>

              {/* Mandatory: Primary Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-blue-100 flex items-center justify-between">
                  <span>I am joining as a <span className="text-cyan-300">*</span></span>
                  <span className="text-[10px] text-cyan-300 font-bold uppercase">Mandatory</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'employer', label: 'Care Employer / Self-Manager' },
                    { id: 'psw', label: 'Attendant / PSW' },
                    { id: 'auditor', label: 'Auditor / CILT Agency' },
                    { id: 'family', label: 'Family / Support Network' },
                  ].map((roleOption) => (
                    <button
                      key={roleOption.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: roleOption.id as any })}
                      className={`p-2.5 rounded-2xl text-xs font-semibold border transition-all text-left ${
                        formData.role === roleOption.id
                          ? 'bg-white text-[#155dfc] font-black border-white shadow-lg'
                          : 'bg-white/10 border-white/20 text-blue-100 hover:bg-white/20'
                      }`}
                    >
                      {roleOption.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name & Province/Program */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                
                {/* Full Name (Capitalized First Letters, Placeholder John Smith) */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-blue-100 flex items-center justify-between">
                    <span>Full Name</span>
                    <span className="text-[10px] text-blue-200">Optional</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-3.5 h-3.5 text-blue-200" />
                    <input
                      id="waitlist-fullname-input"
                      type="text"
                      value={formData.fullName}
                      onChange={handleNameChange}
                      placeholder="John Smith"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200/60 text-xs focus:outline-none focus:ring-2 focus:ring-white capitalize"
                    />
                  </div>
                </div>

                {/* Mandatory Dropdown: Province / Program */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-blue-100 flex items-center justify-between">
                    <span>Province / Program <span className="text-cyan-300">*</span></span>
                    <span className="text-[10px] text-cyan-300 font-bold uppercase">Mandatory</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-blue-200 pointer-events-none" />
                    <select
                      id="waitlist-program-select"
                      required
                      value={formData.provinceProgram}
                      onChange={(e) => setFormData({ ...formData, provinceProgram: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1048ca] border border-white/30 text-white text-xs focus:outline-none focus:ring-2 focus:ring-white cursor-pointer appearance-none"
                    >
                      {PROVINCE_PROGRAM_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>

              {/* Privacy Guarantee Note */}
              <p className="text-[11px] text-blue-100 flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                Zero spam. Your data remains strictly private and encrypted.
              </p>

              {/* Submit CTA */}
              <button
                id="waitlist-submit-btn"
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-950 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all min-h-[48px] focus:ring-4 focus:ring-slate-400 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Request Beta Priority Access</span>
                    <ChevronRight className="w-4 h-4 text-cyan-300" />
                  </>
                )}
              </button>

            </form>
          </div>
        )}
      </div>
    </div>
  );
}
