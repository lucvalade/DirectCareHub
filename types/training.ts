export type TrainingCategory = 
  | 'mechanical_lift' 
  | 'transfer_technique' 
  | 'bowel_bladder_care' 
  | 'emergency_fire_safety' 
  | 'infection_control' 
  | 'other';

export interface TrainingLogEntry {
  id: string;
  attendant_id: string;
  attendant_name: string;
  employer_id: string;
  category: TrainingCategory;
  skill_title: string;          // e.g., "Arjo Ceiling Lift & Loop Configuration"
  equipment_model?: string;      // e.g., "Arjo Maxi Sky 440 / Medium Clip-to-Loop"
  training_date: string;         // YYYY-MM-DD
  notes: string;
  
  // Legal Attestation & Verification
  employer_signed_at: string;    // ISO timestamp
  attendant_acknowledged: boolean;
  attendant_acknowledged_at?: string;
  expiry_or_renewal_date?: string; // Optional annual refresher date
}
