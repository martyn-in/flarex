'use client';

import React from 'react';
import { FileText, Download, FileSpreadsheet, Map } from 'lucide-react';
import { REPORTS_LIST } from '@/data/mockData';
import { useIntelligence } from '@/context/IntelligenceContext';

export default function ReportsPanel() {
  const { hotspots, addToast, theme } = useIntelligence();
  const isDark = theme === 'dark';

  const handleDownload = (report: (typeof REPORTS_LIST)[0]) => {
    let url = `/api/reports/download?type=pdf`;
    if (report.type.toLowerCase().includes('geojson') || report.type.toLowerCase().includes('gis')) {
      url = `/api/reports/download?type=geojson`;
    } else if (report.type.toLowerCase().includes('csv')) {
      url = `/api/reports/download?type=csv`;
    }
    window.open(url, '_blank');
    addToast(`Generating and downloading ${report.name} (${report.type})...`, 'success');
  };

  const handleExportGeoJSON = () => {
    window.open('/api/reports/download?type=geojson', '_blank');
    addToast('GeoJSON FeatureCollection export generated and downloaded.', 'success');
  };

  const handleExportCSV = () => {
    window.open('/api/reports/download?type=csv', '_blank');
    addToast('Full telemetry CSV dataset exported and downloaded.', 'success');
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Quick Export Triggers */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleExportGeoJSON}
          className={`flex items-center justify-center gap-1.5 h-9 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
            isDark
              ? 'bg-white/5 hover:bg-white/10 text-white border-white/10'
              : 'bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0284c7] border-[#bae6fd]'
          }`}
        >
          <Map size={13} />
          <span>Export GeoJSON</span>
        </button>

        <button
          type="button"
          onClick={handleExportCSV}
          className={`flex items-center justify-center gap-1.5 h-9 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
            isDark
              ? 'bg-white/5 hover:bg-white/10 text-white border-white/10'
              : 'bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0284c7] border-[#bae6fd]'
          }`}
        >
          <FileSpreadsheet size={13} />
          <span>Export CSV Manifest</span>
        </button>
      </div>

      {/* Generated Reports List */}
      <section className="flarex-section">
        <h3 className="flarex-section-title">Automated Intelligence Briefings</h3>
        <div className="flarex-status-list">
          {REPORTS_LIST.map((rep) => (
            <div key={rep.id} className={`flarex-status-row !items-start rounded-xl border p-2.5 ${
              isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-[#cfe0f0]'
            }`}>
              <div className="flex items-start gap-2.5 min-w-0">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                  isDark ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' : 'bg-[#e0f2fe] border-[#bae6fd] text-[#0284c7]'
                }`}>
                  <FileText size={14} />
                </div>
                <div className="min-w-0">
                  <span className={`flarex-status-name block ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>{rep.name}</span>
                  <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {rep.type} • {rep.date} ({rep.size})
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDownload(rep)}
                className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                    : 'bg-[#f0f5fa] border-[#cfe0f0] text-[#4e6b8c] hover:text-[#0c2340] hover:bg-[#e0f2fe]'
                }`}
                title={`Download ${rep.name}`}
              >
                <Download size={13} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export { ReportsPanel };
