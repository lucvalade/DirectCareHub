'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, Shield, Award, Phone, Mail, User } from 'lucide-react';
import { UserProfile } from '@/app/actions/profiles';

interface AttendantProfileModalProps {
  attendant: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: UserProfile) => void;
}

export default function AttendantProfileModal({ attendant, isOpen, onClose, onSave }: AttendantProfileModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hourlyRate, setHourlyRate] = useState('20.00');
  const [isBackup, setIsBackup] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'etransfer' | 'direct_deposit' | 'cheque'>('etransfer');
  const [td1Fed, setTd1Fed] = useState('1');
  const [td1Ont, setTd1Ont] = useState('1');
  const [skills, setSkills] = useState('');

  useEffect(() => {
    if (attendant) {
      setDisplayName(attendant.displayName || '');
      setLegalName(attendant.attendant_profile?.legal_name || '');
      setEmail(attendant.email || '');
      setPhone(attendant.phone || '');
      setHourlyRate(attendant.attendant_profile?.hourly_rate_override?.toString() || '20.00');
      setIsBackup(attendant.attendant_profile?.is_backup_roster || false);
      setPaymentMethod(attendant.attendant_profile?.payment_method || 'etransfer');
      setTd1Fed(attendant.attendant_profile?.td1_claim_code_federal?.toString() || '1');
      setTd1Ont(attendant.attendant_profile?.td1_claim_code_ontario?.toString() || '1');
      setSkills((attendant.attendant_profile?.trained_skills || []).join(', '));
    }
  }, [attendant]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);

    const updated: UserProfile = {
      ...(attendant || {
        uid: `attendant_${Date.now()}`,
        role: 'attendant',
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      }),
      displayName: displayName,
      email,
      phone,
      attendant_profile: {
        legal_name: legalName,
        mailing_address: attendant?.attendant_profile?.mailing_address || '',
        is_active: attendant?.attendant_profile?.is_active ?? true,
        is_backup_roster: isBackup,
        hourly_rate_override: parseFloat(hourlyRate) || 20.0,
        payment_method: paymentMethod,
        td1_claim_code_federal: parseInt(td1Fed) || 1,
        td1_claim_code_ontario: parseInt(td1Ont) || 1,
        trained_skills: skillsArray
      }
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-purple-400" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">
              {attendant ? 'Edit Attendant Profile' : 'Add New Attendant'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Display Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Legal Name</label>
              <input
                type="text"
                required
                value={legalName}
                onChange={e => setLegalName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hourly Rate ($)</label>
              <input
                type="number"
                step="0.25"
                required
                value={hourlyRate}
                onChange={e => setHourlyRate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="etransfer">E-Transfer</option>
                <option value="direct_deposit">Direct Deposit</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">TD1 Federal</label>
              <input
                type="number"
                value={td1Fed}
                onChange={e => setTd1Fed(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">TD1 Ontario</label>
              <input
                type="number"
                value={td1Ont}
                onChange={e => setTd1Ont(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Trained Skills (comma separated)</label>
            <input
              type="text"
              value={skills}
              onChange={e => setSkills(e.target.value)}
              placeholder="Hoyer Lift, Bowel Care, Tracheostomy Care"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="is_backup"
              checked={isBackup}
              onChange={e => setIsBackup(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="is_backup" className="text-xs font-bold text-slate-700">
              Is Backup Roster Attendant (Available for emergency SOS broadcast)
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Attendant Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
