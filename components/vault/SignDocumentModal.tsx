'use client';

import React, { useState } from 'react';
import { VaultDocument } from '@/types/vault';
import { X, CheckSquare, ShieldCheck } from 'lucide-react';

interface SignDocumentModalProps {
  document: VaultDocument | null;
  currentUserId: string;
  onClose: () => void;
  onSign: (docId: string) => void;
}

export default function SignDocumentModal({ document, currentUserId, onClose, onSign }: SignDocumentModalProps) {
  const [agreed, setAgreed] = useState(false);

  if (!document) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    onSign(document.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-lg text-slate-900">Sign Legal Document</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm text-slate-700">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
            <p className="font-bold text-blue-900">{document.title}</p>
            <p className="text-xs text-blue-700 mt-0.5">Direct Funding Program Compliance</p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            By applying your electronic signature, you certify under the Ontario Direct Funding program guidelines and Employment Standards Act (ESA) that you understand and agree to the terms herein.
          </p>

          <label className="flex items-start space-x-2.5 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs font-semibold text-slate-800">
              I acknowledge and electronically sign this document as an authorized party.
            </span>
          </label>
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!agreed}
            onClick={handleSubmit}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Apply Legal Signature</span>
          </button>
        </div>
      </div>
    </div>
  );
}
