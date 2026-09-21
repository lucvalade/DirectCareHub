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

// 1. Zod Validation Schema
const WaitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  role: z.enum(['employer', 'psw', 'auditor', 'family'], {
    message: "Please select your primary role.",
  }),
  fullName: z.string().optional(),
  province: z.string().optional(),
  fundingProgram: z.string().optional(),
});

type WaitlistFormData = z.infer<typeof WaitlistSchema>;

// 2. Coming Soon Modal Component
interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ComingSoonModal({ isOpen, onClose }: ComingSoonModalProps) {
  const [formData, setFormData] = useState<WaitlistFormData>({
    email: '',
    role: 'employer',
    fullName: '',
    province: 'ON',
    fundingProgram: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const validation = WaitlistSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message || "Please complete the required fields.");
      setLoading(false);
      return;
    }

    try {
      // Direct call to waitlist submission simulation
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate write
      setSubmitted(true);
      toast.success("You're on the early access priority list!");
    } catch (err) {
      toast.error("Unable to register right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="coming-soon-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        id="coming-soon-modal-container"
        className="relative w-full max-w-lg bg-[#020617] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accents */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#0224bb]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#7C3AED]/30 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="coming-soon-modal-close-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div id="coming-soon-success-view" className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight">You're on the DirectCare List</h3>
            <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              We'll reach out directly with beta access credentials and updates on CILT/CSIL automated payroll tools as we launch.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-sm font-bold border border-white/10 transition-all"
            >
              Back to Overview
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Coming Soon • Private Beta
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Self-Managed Care, Simplified.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                DirectCare Hub empowers self-managers with geofenced shifts, real-time runbooks, and automated CILT/CSIL payroll compliance. Reserve early access below.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Mandatory: Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Email Address <span className="text-cyan-400">*</span></span>
                  <span className="text-[10px] text-slate-500">Mandatory</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    id="waitlist-email-input"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="luc@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                  />
                </div>
              </div>

              {/* Mandatory: Primary Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>I am joining as a <span className="text-cyan-400">*</span></span>
                  <span className="text-[10px] text-slate-500">Mandatory</span>
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
                          ? 'bg-[#0224bb]/40 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                      }`}
                    >
                      {roleOption.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Section: Name & Region */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                    <span>Full Name</span>
                    <span className="text-[10px] text-slate-600">Optional</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
                    <input
                      id="waitlist-fullname-input"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Luc Valade"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                    <span>Province / Program</span>
                    <span className="text-[10px] text-slate-600">Optional</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
                    <input
                      id="waitlist-program-input"
                      type="text"
                      value={formData.fundingProgram}
                      onChange={(e) => setFormData({ ...formData, fundingProgram: e.target.value })}
                      placeholder="Ontario (CILT) / BC (CSIL)"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Guarantee Note */}
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                Zero spam. Your data remains strictly private and encrypted.
              </p>

              {/* Submit CTA */}
              <button
                id="waitlist-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#0224bb] hover:bg-blue-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all min-h-[48px] focus:ring-4 focus:ring-blue-400 shadow-[0_0_20px_rgba(2,36,187,0.4)] disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Request Beta Priority Access</span>
                    <ChevronRight className="w-4 h-4 text-cyan-400" />
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
