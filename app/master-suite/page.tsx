// Developed by VertexAgent.io
// Project: DirectCare Hub - Complete Master Compliance & Payroll Suite Route

import NavigationHeader from '@/components/NavigationHeader';
import DirectCareHubMasterEngine from '@/components/DirectCareHubMasterEngine';

export const metadata = {
  title: 'Master Compliance Suite • DirectCare Hub',
  description: 'Complete Canadian Self-Managed Care Payroll, Tax, WSIB, Geofenced Runbook & CPA 005 Master Suite',
};

export default function MasterSuitePage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <NavigationHeader />
      <main className="py-8">
        <DirectCareHubMasterEngine />
      </main>
    </div>
  );
}
