export type ProtocolCategory = "transfer" | "hygiene" | "positioning" | "exercises" | "medical_care" | "domestic";

export interface ProtocolLog {
  id: string;
  protocol_id: string;
  protocol_title: string;
  category: ProtocolCategory;
  scheduled_time: string;
  completed_at: string;
  duration_minutes: number;
  performed_by_id: string;
  performed_by_name: string;
  assist_type: "1-person-assist" | "2-person-assist";
  status: "completed" | "partially_completed" | "skipped" | "postponed";
  equipment_used?: {
    device_name?: string;
    sling_model_size?: string;
    strap_loop_settings?: string;
    power_chair_powered_off?: boolean;
  };
  vital_and_physical_checks?: {
    skin_check_performed?: boolean;
    skin_condition?: "intact" | "redness_noted" | "breakdown_suspected";
    skin_notes?: string;
    comfort_rating?: number;
    spasms_experienced?: boolean;
  };
  exception_reason?: string;
  attendant_notes?: string;
  employer_acknowledged: boolean;
  created_at: string;
}
