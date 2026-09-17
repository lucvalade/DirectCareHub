'use client';

import React, { useState } from 'react';
import { DocumentType, VaultDocument } from '@/types/vault';
import { X, UploadCloud, AlertCircle } from 'lucide-react';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (doc: Omit<VaultDocument, 'id' | 'uploaded_at'>) => void;
}

export default function UploadDocumentModal({ isOpen, onClose, onUpload }: UploadDocumentModalProps) {
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<DocumentType>('employment_contract');
  const [attendantName, setAttendantName] = useState('Elena Rostova');
  const [expiryDate, setExpiryDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onUpload({
      title,
      doc_type: docType,
      attendant_id: 'psw_elena_02',
      attendant_name: attendantName,
      employer_id: 'emp_ontario_01',
      status: docType === 'employment_contract' ? 'pending_signature' : 'active',
      expires_at: expiryDate ? new Date(expiryDate).toISOString() : undefined,
      signed_by: []
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-lg text-slate-900">Upload Compliance Document</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Document Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., WSIB Annual Clearance Certificate"
              className="w-full px-3 py-2 border rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full px-3 py-2 border rounded-xl text-sm"
              >
                <option value="employment_contract">Employment Contract</option>
                <option value="cpr_first_aid">CPR & First Aid</option>
                <option value="vulnerable_sector_check">Vulnerable Sector Check</option>
                <option value="wsib_clearance">WSIB Clearance</option>
                <option value="direct_deposit_form">Direct Deposit Form</option>
                <option value="confidentiality_agreement">Confidentiality Agreement</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Attendant Name</label>
              <input
                type="text"
                value={attendantName}
                onChange={(e) => setAttendantName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Expiry Date (Optional)</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-sm"
            />
          </div>

          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-500 hover:border-blue-400 cursor-pointer">
            <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-bold">Drag and drop document PDF or image</p>
            <p className="text-[10px] text-slate-400">PDF, PNG, JPG up to 10MB</p>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
            >
              Add Document to Vault
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
