'use server';

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

export const MOCK_MASTER_STATEMENTS: MasterStatement[] = [
  { id: 'st_01', payeeName: 'Sarah Jenkins', bankAccount: '1234-5678901', takeHomePay: 1781.12 },
  { id: 'st_02', payeeName: 'David Miller', bankAccount: '9876-5432109', takeHomePay: 1420.50 },
];

export const MOCK_ROE_DATA: RoeData[] = [
  { employeeName: 'Sarah Jenkins', sin: '987-654-321', insurableEarnings: 14250.00, insurableHours: 620 },
];

export async function generateCPA005DirectDepositFileAction(statements: MasterStatement[]) {
  // Generates 1464-byte CPA Standard 005 EFT Direct Deposit Transmission File
  const recordA = `A00000000100001000100999999990202626500146401001${'DIRECTCARE HUB'.padEnd(30, ' ')}CAD`.padEnd(1464, ' ');
  return {
    success: true,
    fileName: `CPA005_EFT_${Date.now()}.txt`,
    fileContent: recordA,
  };
}

export async function generateServiceCanadaRoeXmlAction(roeList: RoeData[]) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ROE_WEB_EXPORT version="2.0">
  ${roeList.map(r => `
  <ROE>
    <EMPLOYEE_NAME>${r.employeeName}</EMPLOYEE_NAME>
    <SIN>${r.sin}</SIN>
    <INSURABLE_EARNINGS>${r.insurableEarnings.toFixed(2)}</INSURABLE_EARNINGS>
    <INSURABLE_HOURS>${r.insurableHours}</INSURABLE_HOURS>
  </ROE>`).join('')}
</ROE_WEB_EXPORT>`;

  return {
    success: true,
    fileName: `SERVICE_CANADA_ROE_${Date.now()}.xml`,
    fileContent: xml,
  };
}
