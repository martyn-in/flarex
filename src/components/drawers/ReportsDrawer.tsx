'use client';

import React from 'react';
import { X, FileText, Download, FileSpreadsheet, Sparkles } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { REPORTS_LIST } from '../../data/mockData';

export const ReportsDrawer: React.FC = () => {
  const { activeDrawer, closeDrawer, addToast } = useIntelligence();

  if (activeDrawer !== 'reports') return null;

  const handleDownload = (report: typeof REPORTS_LIST[0]) => {
    addToast(`Exporting ${report.name} (${report.type})...`, 'success');
  };

  return (
    <div className="fixed inset-0 z-40 flex pointer-events-auto select-none animate-in fade-in duration-200">
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-black/40 backdrop-blur-[3px] cursor-pointer"
      />

      <aside className="relative w-[430px] max-w-[90vw] h-full glass-panel-elevated p-4 flex flex-col gap-3.5 shadow-2xl z-50 border-r border-white/[0.12] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[13px] font-bold text-white tracking-wider uppercase">
                Intelligence Reports
              </span>
              <span className="text-[10px] text-slate-400 block">Automated Dispatch &amp; Spatial Manifests</span>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="w-7 h-7 rounded-lg glass-pill flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reports List */}
        <div className="flex flex-col gap-3">
          {REPORTS_LIST.map((rep) => (
            <div
              key={rep.id}
              className="glass-card rounded-2xl p-4 flex flex-col gap-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-[13.5px] font-bold text-white leading-tight">{rep.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{rep.type} • {rep.date}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-300 bg-white/[0.06] px-2 py-0.5 rounded-full border border-white/[0.1]">
                  {rep.size}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDownload(rep)}
                className="mt-1 w-full py-2 rounded-xl glass-pill hover:bg-cyan-500/20 hover:border-cyan-400/50 text-slate-200 hover:text-white text-[11.5px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Download Report</span>
              </button>
            </div>
          ))}

          {/* Export Full Dataset */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/60 to-cyan-950/60 border border-cyan-500/30 flex flex-col gap-2.5 mt-2">
            <div className="flex items-center gap-2 text-cyan-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-[12.5px] font-bold text-white">Full GIS Spatial Manifest</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Export high-resolution geo-referenced vector telemetry (Shapefile, GeoJSON, CSV) for GIS integration.
            </p>
            <button
              type="button"
              onClick={() => addToast('Exporting complete active incidents manifest (CSV/GeoJSON)...', 'info')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-[12px] font-bold flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(56,189,248,0.3)] transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Full Hotspot Manifest (CSV)</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
