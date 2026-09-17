export interface EmergencyContact {
  full_name: string;
  phone: string;
  relationship: string;
  relationship_other?: string;
  legal_authority: "none" | "poa_care" | "poa_property" | "both_poa" | "sdm" | "pgt";
  has_key_or_lockbox_code?: boolean;
}

export interface EmployerProfile {
  address: string;
  buzzer_code?: string;
  lockbox_code?: string;
  parking_instructions?: string;
  primary_emergency_contact: EmergencyContact;
  funding_program: string;
  cilt_file_number?: string;
  monthly_allocated_hours: number;
  base_hourly_rate: number;
  cra_business_number?: string;
  wsib_account_number?: string;
}

export function formatPhoneNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '').substring(0, 10);
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (!match) return value;
  if (!match[2]) return match[1] ? `(${match[1]}` : '';
  if (!match[3]) return `(${match[1]}) ${match[2]}`;
  return `(${match[1]}) ${match[2]}-${match[3]}`;
}

export function toTitleCase(value?: string | null): string {
  if (!value || typeof value !== 'string') return '';
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map(word => (word && word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
    .join(' ');
}

export function validateCRAandWSIB(craNumber: string, wsibNumber: string) {
  const cleanedCRA = craNumber.replace(/\s+/g, '').toUpperCase();
  const isCRAValid = !craNumber || /^\d{9}RP\d{4}$/.test(cleanedCRA);

  const cleanedWSIB = wsibNumber.replace(/\D/g, '');
  const isWSIBValid = !wsibNumber || /^\d{7}$/.test(cleanedWSIB);

  return {
    isCRAValid,
    isWSIBValid,
    formattedCRA: isCRAValid && craNumber ? `${cleanedCRA.slice(0, 9)} RP ${cleanedCRA.slice(11)}` : craNumber,
    formattedWSIB: isWSIBValid && wsibNumber ? cleanedWSIB : wsibNumber
  };
}

export interface AttendantProfile {
  legal_name: string;
  mailing_address: string;
  is_active: boolean;
  is_backup_roster: boolean;
  hourly_rate_override?: number;
  payment_method: "etransfer" | "direct_deposit" | "cheque";
  payment_email?: string;
  banking_info?: { institution: string; transit: string; account: string };
  td1_claim_code_federal: number;
  td1_claim_code_ontario: number;
  masked_sin?: string;
  trained_skills: string[];
}

export interface BookkeeperProfile {
  firm_name?: string;
  export_format_preference: "csv" | "quickbooks" | "wagepoint";
  notify_on_payrun_ready: boolean;
  notify_on_budget_threshold: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  role: "employer" | "attendant" | "bookkeeper";
  created_at: string;
  updated_at: string;
  employer_profile?: EmployerProfile;
  attendant_profile?: AttendantProfile;
  bookkeeper_profile?: BookkeeperProfile;
}

// Mock initial database for profiles in localStorage
const DEFAULT_PROFILES: Record<string, UserProfile> = {
  'employer_1': {
    uid: 'employer_1',
    email: 'luc.valade@gmail.com',
    displayName: 'Luc Valade',
    phone: '(416) 555-0192',
    role: 'employer',
    created_at: '2026-01-15',
    updated_at: '2026-09-15',
    employer_profile: {
      address: '142 Queen St West, Suite 402, Toronto, ON',
      buzzer_code: '#4092',
      lockbox_code: '8821 (Side Door)',
      parking_instructions: 'Visitor parking stall #12 in rear underground garage.',
      primary_emergency_contact: {
        full_name: 'Chantal Valade',
        phone: '(416) 555-9831',
        relationship: 'Sibling',
        legal_authority: 'both_poa',
        has_key_or_lockbox_code: true
      },
      funding_program: 'Direct Funding Program (CILT)',
      cilt_file_number: 'DF-ONT-88392',
      monthly_allocated_hours: 160.0,
      base_hourly_rate: 20.00,
      cra_business_number: '883921094RP0001',
      wsib_account_number: 'WSIB-994821'
    }
  },
  'attendant_1': {
    uid: 'attendant_1',
    email: 'sarah.jenkins@directcarehub.on.ca',
    displayName: 'Sarah Jenkins, PSW',
    phone: '(647) 555-3829',
    role: 'attendant',
    created_at: '2026-02-10',
    updated_at: '2026-09-14',
    attendant_profile: {
      legal_name: 'Sarah Elizabeth Jenkins',
      mailing_address: '88 Spadina Ave, Toronto, ON',
      is_active: true,
      is_backup_roster: true,
      hourly_rate_override: 21.50,
      payment_method: 'etransfer',
      payment_email: 'sarah.jenkins@directcarehub.on.ca',
      td1_claim_code_federal: 1,
      td1_claim_code_ontario: 1,
      masked_sin: '***-***-891',
      trained_skills: ['Arjo Ceiling Lift Trained', 'Bowel Routine Trained', 'Manual Wheelchair Loading']
    }
  },
  'bookkeeper_1': {
    uid: 'bookkeeper_1',
    email: 'bookkeeper@directcarehub.on.ca',
    displayName: 'Marcus Vance, CPA',
    phone: '(416) 555-7721',
    role: 'bookkeeper',
    created_at: '2026-01-20',
    updated_at: '2026-09-01',
    bookkeeper_profile: {
      firm_name: 'Vance & Associates Accounting LLP',
      export_format_preference: 'quickbooks',
      notify_on_payrun_ready: true,
      notify_on_budget_threshold: true
    }
  }
};

export async function getUserProfile(uid: string): Promise<UserProfile> {
  const fallback = DEFAULT_PROFILES[uid] || DEFAULT_PROFILES['employer_1'];
  if (typeof window === 'undefined') {
    return fallback;
  }
  try {
    const saved = localStorage.getItem(`care_direct_user_${uid}`);
    if (saved) {
      return JSON.parse(saved);
    }
    localStorage.setItem(`care_direct_user_${uid}`, JSON.stringify(fallback));
  } catch (e) {
    console.warn('Failed to access user profile from localStorage:', e);
  }
  return fallback;
}

export async function updateEmployerProfile(uid: string, data: Partial<EmployerProfile>): Promise<UserProfile> {
  const profile = await getUserProfile(uid);
  const updated: UserProfile = {
    ...profile,
    employer_profile: {
      ...(profile.employer_profile || {
        address: '',
        primary_emergency_contact: { full_name: '', phone: '', relationship: 'Sibling', legal_authority: 'none' },
        funding_program: 'Direct Funding (CILT)',
        monthly_allocated_hours: 160,
        base_hourly_rate: 20
      }),
      ...data
    },
    updated_at: new Date().toISOString().split('T')[0]
  };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`care_direct_user_${uid}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save employer profile:', e);
    }
  }
  return updated;
}

export async function updateAttendantProfile(uid: string, data: Partial<AttendantProfile>): Promise<UserProfile> {
  const profile = await getUserProfile(uid);
  const updated: UserProfile = {
    ...profile,
    attendant_profile: {
      ...(profile.attendant_profile || {
        legal_name: profile.displayName,
        mailing_address: '',
        is_active: true,
        is_backup_roster: false,
        payment_method: 'etransfer',
        td1_claim_code_federal: 1,
        td1_claim_code_ontario: 1,
        trained_skills: []
      }),
      ...data
    },
    updated_at: new Date().toISOString().split('T')[0]
  };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`care_direct_user_${uid}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save attendant profile:', e);
    }
  }
  return updated;
}

export async function updateBookkeeperProfile(uid: string, data: Partial<BookkeeperProfile>): Promise<UserProfile> {
  const profile = await getUserProfile(uid);
  const updated: UserProfile = {
    ...profile,
    bookkeeper_profile: {
      ...(profile.bookkeeper_profile || {
        export_format_preference: 'quickbooks',
        notify_on_payrun_ready: true,
        notify_on_budget_threshold: true
      }),
      ...data
    },
    updated_at: new Date().toISOString().split('T')[0]
  };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`care_direct_user_${uid}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save bookkeeper profile:', e);
    }
  }
  return updated;
}

export async function getAttendantsList(): Promise<UserProfile[]> {
  const defaultList = [
    DEFAULT_PROFILES['attendant_1'],
    {
      uid: 'attendant_2',
      email: 'michael.chang@directcarehub.on.ca',
      displayName: 'Michael Chang, PSW',
      phone: '(416) 555-4921',
      role: 'attendant' as const,
      created_at: '2026-03-01',
      updated_at: '2026-09-12',
      attendant_profile: {
        legal_name: 'Michael David Chang',
        mailing_address: '120 College St, Toronto, ON',
        is_active: true,
        is_backup_roster: false,
        hourly_rate_override: 20.00,
        payment_method: 'direct_deposit' as const,
        banking_info: { institution: '003', transit: '28192', account: '9182391' },
        td1_claim_code_federal: 1,
        td1_claim_code_ontario: 1,
        masked_sin: '***-***-302',
        trained_skills: ['Manual Wheelchair Loading', 'Emergency First Aid']
      }
    }
  ];

  if (typeof window === 'undefined') {
    return defaultList;
  }
  try {
    const savedList = localStorage.getItem('care_direct_attendants_list');
    if (savedList) {
      return JSON.parse(savedList);
    }
    localStorage.setItem('care_direct_attendants_list', JSON.stringify(defaultList));
  } catch (e) {
    console.warn('Failed to access attendants list in localStorage:', e);
  }
  return defaultList;
}

export async function saveAttendantsList(list: UserProfile[]): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('care_direct_attendants_list', JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save attendants list:', e);
    }
  }
}
