// Developed by VertexAgent.io
// Project: DirectCare Hub - Data Models and Mock Compliance Entities

export interface MasterStatement {
  id: string;
  payeeName: string;
  bankAccount: string;
  takeHomePay: number;
}

export interface RoeData {
  employeeName: string;
  sin: string;
  insurableEarnings: number;
  insurableHours: number;
}

export interface WaitlistSubmissionInput {
  email: string;
  role: string;
  fullName?: string;
  provinceProgram: string;
  browserTimezone?: string;
}

export const MOCK_MASTER_STATEMENTS: MasterStatement[] = [
  { id: 'st_01', payeeName: 'Sarah Jenkins', bankAccount: '1234-5678901', takeHomePay: 1781.12 },
  { id: 'st_02', payeeName: 'David Miller', bankAccount: '9876-5432109', takeHomePay: 1420.50 },
];

export const MOCK_ROE_DATA: RoeData[] = [
  { employeeName: 'Sarah Jenkins', sin: '987-654-321', insurableEarnings: 14250.00, insurableHours: 620 },
];
