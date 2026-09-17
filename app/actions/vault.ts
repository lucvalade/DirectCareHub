'use server';

import { VaultDocument } from '@/types/vault';

// In-memory / server state fallback for documents
let mockDocuments: VaultDocument[] = [
  {
    id: 'doc_contract_01',
    title: 'Direct Funding Attendant Employment Agreement',
    doc_type: 'employment_contract',
    attendant_id: 'psw_elena_02',
    attendant_name: 'Elena Rostova',
    employer_id: 'emp_ontario_01',
    status: 'active',
    uploaded_at: '2026-01-15T10:00:00Z',
    signed_at: '2026-01-15T14:30:00Z',
    signed_by: ['emp_ontario_01', 'psw_elena_02']
  },
  {
    id: 'doc_cpr_01',
    title: 'Standard First Aid & CPR Level C (BLS)',
    doc_type: 'cpr_first_aid',
    attendant_id: 'psw_elena_02',
    attendant_name: 'Elena Rostova',
    employer_id: 'emp_ontario_01',
    status: 'active',
    uploaded_at: '2025-06-10T09:00:00Z',
    expires_at: '2027-06-10T00:00:00Z'
  },
  {
    id: 'doc_vsc_01',
    title: 'Police Vulnerable Sector Check (OPP/TPS)',
    doc_type: 'vulnerable_sector_check',
    attendant_id: 'psw_elena_02',
    attendant_name: 'Elena Rostova',
    employer_id: 'emp_ontario_01',
    status: 'active',
    uploaded_at: '2025-11-20T11:00:00Z',
    expires_at: '2026-11-20T00:00:00Z'
  },
  {
    id: 'doc_wsib_01',
    title: 'WSIB Ontario e-Clearance Certificate',
    doc_type: 'wsib_clearance',
    attendant_id: 'psw_elena_02',
    attendant_name: 'Elena Rostova',
    employer_id: 'emp_ontario_01',
    status: 'expiring_soon',
    uploaded_at: '2026-07-01T08:00:00Z',
    expires_at: '2026-09-30T00:00:00Z'
  }
];

export async function getVaultDocuments(userId?: string): Promise<VaultDocument[]> {
  return mockDocuments;
}

export async function addVaultDocument(doc: Omit<VaultDocument, 'id' | 'uploaded_at'>): Promise<VaultDocument> {
  const newDoc: VaultDocument = {
    ...doc,
    id: `doc_${Date.now()}`,
    uploaded_at: new Date().toISOString()
  };
  mockDocuments = [newDoc, ...mockDocuments];
  return newDoc;
}

export async function signVaultDocument(docId: string, signerId: string): Promise<boolean> {
  mockDocuments = mockDocuments.map((doc) => {
    if (doc.id === docId) {
      const currentSigners = doc.signed_by || [];
      const updatedSigners = currentSigners.includes(signerId) ? currentSigners : [...currentSigners, signerId];
      return {
        ...doc,
        signed_by: updatedSigners,
        status: updatedSigners.length >= 2 ? 'active' : 'pending_signature',
        signed_at: new Date().toISOString()
      };
    }
    return doc;
  });
  return true;
}
