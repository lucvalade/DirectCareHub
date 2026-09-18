export type DocumentType = 
  | 'employment_contract'
  | 'cpr_first_aid'
  | 'vulnerable_sector_check'
  | 'wsib_clearid'
  | 'wsib_clearance'
  | 'direct_deposit_form'
  | 'confidentiality_agreement'
  | 'care_protocol_acknowledgment'
  | 'budget_allocation';

export type DocumentStatus = 'draft' | 'pending_signature' | 'active' | 'expiring_soon' | 'expired';

export interface VaultDocument {
  id: string;
  title: string;
  doc_type: DocumentType;
  attendant_id: string;
  attendant_name: string;
  employer_id: string;
  status: DocumentStatus;
  file_url?: string;
  uploaded_at: string;
  expires_at?: string;
  signed_at?: string;
  signed_by?: string[];
  is_confidential?: boolean;
  metadata?: Record<string, any>;
}
