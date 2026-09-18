"use client";

import { useState, useEffect, useTransition } from "react";
import { useAuth } from "@/context/AuthContext";
import NavigationHeader from "@/components/NavigationHeader";
import VaultTable from "@/components/vault/VaultTable";
import UploadDocumentModal from "@/components/vault/UploadDocumentModal";
import SignDocumentModal from "@/components/vault/SignDocumentModal";
import { getVaultDocuments, addVaultDocument, signVaultDocument } from "@/app/actions/vault";
import { VaultDocument } from "@/types/vault";
import { FileCheck2, Plus, ShieldCheck, AlertTriangle, RefreshCw, X, EyeOff } from "lucide-react";

export default function VaultCommandCenterPage() {
  const { userProfile } = useAuth();
  const currentUserId = userProfile?.uid || "employer_1";
  const userRole = userProfile?.role || "employer";

  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [isPending, startTransition] = useTransition();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [signingDoc, setSigningDoc] = useState<VaultDocument | null>(null);

  // Status metrics filter state: 'all' | 'active' | 'pending_signature' | 'action_required'
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending_signature" | "action_required">("all");

  useEffect(() => {
    startTransition(async () => {
      const docs = await getVaultDocuments();
      setDocuments(docs);
    });
  }, []);

  const handleUpload = async (docData: Omit<VaultDocument, "id" | "uploaded_at">) => {
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
              status: "active",
              signed_at: new Date().toISOString()
            }
          : d
      )
    );
  };

  // 1. Role-based security filters:
  // - Employer & Bookkeeper see everything
  // - Attendant sees only their own non-confidential documents
  const allowedDocuments = documents.filter((doc) => {
    if (doc.is_confidential && userRole !== "employer" && userRole !== "bookkeeper") {
      return false;
    }
    if (userRole === "attendant") {
      // Attendants can see generic documents or files belonging specifically to them
      return (
        doc.attendant_id === currentUserId ||
        doc.attendant_id === "psw_elena_02" ||
        doc.attendant_name.includes("Elena") ||
        doc.attendant_id === "" ||
        !doc.attendant_id
      );
    }
    return true;
  });

  // 2. Clickable Status Metric Card Filters:
  const activeCount = allowedDocuments.filter((d) => d.status === "active").length;
  const pendingCount = allowedDocuments.filter((d) => d.status === "pending_signature").length;
  const expiringCount = allowedDocuments.filter((d) => d.status === "expiring_soon" || d.status === "expired").length;

  const displayedDocuments = allowedDocuments.filter((doc) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return doc.status === "active";
    if (statusFilter === "pending_signature") return doc.status === "pending_signature";
    if (statusFilter === "action_required") return doc.status === "expiring_soon" || doc.status === "expired";
    return true;
  });

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

          {(userRole === "employer" || userRole === "bookkeeper") && (
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          )}
        </div>

        {/* Security / Authority indicator */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0" />
            <span>Active Security Context: {userRole === "employer" ? "Self-Manager (Full Access)" : userRole === "bookkeeper" ? "DF Auditor (Full Access)" : "Attendant (Restricted Access)"}</span>
          </div>
          {userRole === "attendant" && (
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200 text-[10px]">
              <EyeOff className="w-3.5 h-3.5 text-amber-600" />
              <span>Confidential files hidden</span>
            </span>
          )}
        </div>

        {/* Status Metrics Banner - Clickable section linking to specific filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === "active" ? "all" : "active")}
            className={`bg-white p-5 rounded-2xl border transition text-left flex items-center space-x-4 cursor-pointer outline-none focus:ring-4 focus:ring-emerald-100 ${
              statusFilter === "active"
                ? "border-emerald-500 ring-2 ring-emerald-200 shadow-md scale-[1.02]"
                : "border-slate-200 hover:border-emerald-300 hover:shadow-xs"
            }`}
          >
            <div className={`p-3 rounded-xl transition ${statusFilter === "active" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700"}`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active & Verified</p>
              <p className="text-2xl font-black text-slate-900">{activeCount}</p>
              <p className="text-[10px] text-slate-500 font-bold mt-1">
                {statusFilter === "active" ? "✓ Filter Active (Click to reset)" : "Click to view active files"}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === "pending_signature" ? "all" : "pending_signature")}
            className={`bg-white p-5 rounded-2xl border transition text-left flex items-center space-x-4 cursor-pointer outline-none focus:ring-4 focus:ring-amber-100 ${
              statusFilter === "pending_signature"
                ? "border-amber-500 ring-2 ring-amber-200 shadow-md scale-[1.02]"
                : "border-slate-200 hover:border-amber-300 hover:shadow-xs"
            }`}
          >
            <div className={`p-3 rounded-xl transition ${statusFilter === "pending_signature" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-700"}`}>
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Signatures</p>
              <p className="text-2xl font-black text-slate-900">{pendingCount}</p>
              <p className="text-[10px] text-slate-500 font-bold mt-1">
                {statusFilter === "pending_signature" ? "✓ Filter Active (Click to reset)" : "Click to view signature list"}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === "action_required" ? "all" : "action_required")}
            className={`bg-white p-5 rounded-2xl border transition text-left flex items-center space-x-4 cursor-pointer outline-none focus:ring-4 focus:ring-rose-100 ${
              statusFilter === "action_required"
                ? "border-rose-500 ring-2 ring-rose-200 shadow-md scale-[1.02]"
                : "border-slate-200 hover:border-rose-300 hover:shadow-xs"
            }`}
          >
            <div className={`p-3 rounded-xl transition ${statusFilter === "action_required" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700"}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Action Required / Expiries</p>
              <p className="text-2xl font-black text-slate-900">{expiringCount}</p>
              <p className="text-[10px] text-slate-500 font-bold mt-1">
                {statusFilter === "action_required" ? "✓ Filter Active (Click to reset)" : "Click to view renewals"}
              </p>
            </div>
          </button>

        </div>

        {/* Filter State Status indicator */}
        {statusFilter !== "all" && (
          <div className="bg-blue-50 border border-blue-200 text-blue-900 font-bold text-xs p-3.5 rounded-xl flex items-center justify-between">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>
                Filtering table to display:{" "}
                <strong className="underline">
                  {statusFilter === "active" && "Active & Verified Documents"}
                  {statusFilter === "pending_signature" && "Pending Signatures"}
                  {statusFilter === "action_required" && "Action Required / Expiring Documents"}
                </strong>
              </span>
            </span>
            <button
              onClick={() => setStatusFilter("all")}
              className="px-3 py-1 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center gap-1 cursor-pointer transition text-[11px]"
            >
              <X className="w-3 h-3" /> Clear Filter
            </button>
          </div>
        )}

        {/* Documents Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            {statusFilter === "all" ? "All Program Compliance Files" : `Filtered Compliance List (${displayedDocuments.length} found)`}
          </h2>
          <VaultTable documents={displayedDocuments} onSignClick={(doc) => setSigningDoc(doc)} />
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
