'use client';

import React, { useState } from 'react';
import { Database, Radio, Satellite, ShieldCheck, RefreshCw, Layers, CheckCircle2, Cpu } from 'lucide-react';
import { DATA_SOURCES_LIST } from '@/data/mockData';
import { useIntelligence } from '@/context/IntelligenceContext';

export default function DataSourcesPanel() {
  const { calculatedStats, refreshHotspots, addToast, dataSourceMode } = useIntelligence();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    addToast('Synchronizing with NASA FIRMS VIIRS/MODIS and OSM cache...', 'info');
    await refreshHotspots();
    setTimeout(() => {
      setIsSyncing(false);
      addToast('Data pipeline successfully refreshed with latest satellite pass.', 'success');
    }, 900);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 2x2 Network Health KPIs */}
      <div className="flarex-kpi-grid">
        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Pipeline Status</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#20C997]" />
            <span className="text-[14px] font-bold text-[#261006]">ALL CONNECTED</span>
          </div>
          <span className="flarex-kpi-meta">5 / 5 Sources Active</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Active Thermal Count</span>
          <span className="flarex-kpi-value text-[#ea580c]">{calculatedStats.totalEvents}</span>
          <span className="flarex-kpi-meta">Pan-India Bounding Box</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">ML Inference Model</span>
          <span className="flarex-kpi-value text-[#261006]">v1.2-NRT</span>
          <span className="flarex-kpi-meta">Validation Acc. 96.4%</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Telemetry Ingestion Lag</span>
          <span className="flarex-kpi-value text-amber-700">1.8s</span>
          <span className="flarex-kpi-meta">Mode: {dataSourceMode}</span>
        </div>
      </div>

      {/* Manual Sync Action Button */}
      <button
        type="button"
        onClick={handleSync}
        disabled={isSyncing}
        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#ff5533] via-[#ff7a45] to-[#ea580c] hover:brightness-105 text-white text-[11.5px] font-bold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(234,88,12,0.3)] transition-all cursor-pointer disabled:opacity-50"
      >
        <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
        <span>{isSyncing ? 'Synchronizing Ingestion Pipelines...' : 'Sync Satellite & GIS Feeds Now'}</span>
      </button>

      {/* Data Sources List */}
      <section className="flarex-section">
        <h3 className="flarex-section-title">Connected Geospatial &amp; AI Intelligence Streams</h3>
        <div className="flarex-status-list">
          {DATA_SOURCES_LIST.map((source) => (
            <div key={source.name} className="flarex-status-row !p-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 bg-orange-50 border-orange-200 text-[#ea580c]">
                  {source.type === 'Satellite Constellation' ? (
                    <Satellite size={16} />
                  ) : source.type === 'GIS Context' ? (
                    <Layers size={16} />
                  ) : source.type === 'AI Inference' ? (
                    <Cpu size={16} />
                  ) : (
                    <Database size={16} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="flarex-status-name block font-bold text-[12px] text-[#261006]">{source.name}</span>
                    <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold border bg-[#ffedd5] text-[#7c2d12] border-[#fed7aa]">
                      {source.type}
                    </span>
                  </div>
                  <p className="text-[10px] mt-0.5 leading-snug text-[#7c2d12]">{source.description}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#20C997]" />
                  <span className="text-[10px] font-bold text-emerald-600">{source.status}</span>
                </div>
                <span className="font-mono text-[9px] mt-0.5 block text-[#9a3412]">{source.latency} lag</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export { DataSourcesPanel };
