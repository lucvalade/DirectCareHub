'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

export default function AuditExportButton({ employerId, qStart, qEnd }: { employerId: string, qStart: string, qEnd: string }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleExport = async () => {
    setIsDownloading(true);
    try {
      const url = `/api/export/audit-pdf?employerId=${employerId}&start=${qStart}&end=${qEnd}`;
      
      // Navigate to the API route to trigger the native browser download
      window.location.href = url;
    } finally {
      // Small timeout to allow the browser to initiate the download before resetting state
      setTimeout(() => setIsDownloading(false), 2000);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={isDownloading}
      className="flex items-center gap-2 bg-[#0224bb] hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-bold transition-colors focus:ring-4 focus:ring-blue-300 disabled:opacity-50 cursor-pointer min-h-[48px]"
    >
      {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
      {isDownloading ? 'Compiling Report...' : 'Download Q3 Audit PDF'}
    </button>
  );
}
