'use client';

import React from 'react';
import { FileText, Download, FileSpreadsheet, Map } from 'lucide-react';
import { REPORTS_LIST } from '@/data/mockData';
import { useIntelligence } from '@/context/IntelligenceContext';

export default function ReportsPanel() {
  const { hotspots, addToast } = useIntelligence();

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
          className="flex items-center justify-center gap-1.5 h-9 rounded-xl text-[11px] font-bold bg-[#fff7ed] hover:bg-[#ffedd5] text-[#ea580c] border border-[#fed7aa] transition-all cursor-pointer"
        >
          <Map size={13} />
          <span>Export GeoJSON</span>
        </button>

        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-1.5 h-9 rounded-xl text-[11px] font-bold bg-[#fff7ed] hover:bg-[#ffedd5] text-[#ea580c] border border-[#fed7aa] transition-all cursor-pointer"
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
            <div key={rep.id} className="flarex-status-row !items-start">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 bg-[#fff7ed] border-[#fed7aa] text-[#ea580c]">
                  <FileText size={14} />
                </div>
                <div className="min-w-0">
                  <span className="flarex-status-name block text-[#431407]">{rep.name}</span>
                  <span className="text-[10px] text-[#9a3412] block">
                    {rep.type} • {rep.date} ({rep.size})
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDownload(rep)}
                className="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-colors cursor-pointer bg-white border-[#fed7aa] text-[#7c2d12] hover:text-[#ea580c] hover:border-[#ea580c] hover:bg-[#fff7ed]"
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
