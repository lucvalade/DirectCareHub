'use client';

import React from 'react';
import { VaultDocument } from '@/types/vault';
import { FileText, CheckCircle2, Clock, AlertTriangle, PenTool } from 'lucide-react';

interface VaultTableProps {
  documents: VaultDocument[];
  onSignClick: (doc: VaultDocument) => void;
}

export default function VaultTable({ documents, onSignClick }: VaultTableProps) {
  const getBadge = (status: VaultDocument['status']) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active</span>;
      case 'pending_signature':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><Clock className="w-3.5 h-3.5 mr-1" /> Pending Signature</span>;
      case 'expiring_soon':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Expiring Soon</span>;
      case 'expired':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Expired</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">Draft</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3.5">Document Title</th>
              <th scope="col" className="px-6 py-3.5">Attendant / Scope</th>
              <th scope="col" className="px-6 py-3.5">Status</th>
              <th scope="col" className="px-6 py-3.5">Expires</th>
              <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  No documents found in vault.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{doc.title}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">{doc.doc_type.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-slate-800">{doc.attendant_name || 'All Attendants'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getBadge(doc.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                    {doc.expires_at ? new Date(doc.expires_at).toLocaleDateString() : 'N/A (Permanent)'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {doc.status === 'pending_signature' && (
                      <button
                        onClick={() => onSignClick(doc)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ml-auto"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>Sign Document</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
