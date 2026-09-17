'use client';

import { useState, useEffect, useTransition } from 'react';
import { useAuth } from '@/context/AuthContext';
import NavigationHeader from '@/components/NavigationHeader';
import VaultTable from '@/components/vault/VaultTable';
import UploadDocumentModal from '@/components/vault/UploadDocumentModal';
import SignDocumentModal from '@/components/vault/SignDocumentModal';
import { getVaultDocuments, addVaultDocument, signVaultDocument } from '@/app/actions/vault';
import { VaultDocument } from '@/types/vault';
import { FileCheck2, Plus, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function VaultCommandCenterPage() {
  const { userProfile } = useAuth();
  const currentUserId = userProfile?.uid || 'employer_1';

  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [isPending, startTransition] = useTransition();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [signingDoc, setSigningDoc] = useState<VaultDocument | null>(null);

  useEffect(() => {
    startTransition(async () => {
      const docs = await getVaultDocuments();
      setDocuments(docs);
    });
  }, []);

  const handleUpload = async (docData: Omit<VaultDocument, 'id' | 'uploaded_at'>) => {
    const created = await addVaultDocument(docData);
    setDocuments((prev) => [created, ...prev]);
  };

  const handleSign = async (docId: string) => {
    await signVaultDocument(docId, currentUserId);
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              signed_by: [...(d.signed_by || []), currentUserId],
              status: 'active',
              signed_at: new Date().toISOString()
            }
          : d
      )
    );
  };

  const activeCount = documents.filter((d) => d.status === 'active').length;
  const pendingCount = documents.filter((d) => d.status === 'pending_signature').length;
  const expiringCount = documents.filter((d) => d.status === 'expiring_soon' || d.status === 'expired').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <NavigationHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-sm">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Compliance & Document Vault</h1>
              <p className="text-xs font-medium text-slate-500">
                Ontario Direct Funding legal contracts, WSIB clearances, and police check records
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Status Metrics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active & Verified</p>
              <p className="text-2xl font-black text-slate-900">{activeCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Signatures</p>
              <p className="text-2xl font-black text-slate-900">{pendingCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Action Required / Expiries</p>
              <p className="text-2xl font-black text-slate-900">{expiringCount}</p>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">All Program Compliance Files</h2>
          <VaultTable documents={documents} onSignClick={(doc) => setSigningDoc(doc)} />
        </div>
      </main>

      <UploadDocumentModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      <SignDocumentModal
        document={signingDoc}
        currentUserId={currentUserId}
        onClose={() => setSigningDoc(null)}
        onSign={handleSign}
      />
    </div>
  );
}
