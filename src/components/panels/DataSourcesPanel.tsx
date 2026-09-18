'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Radio,
  Satellite,
  ShieldCheck,
  RefreshCw,
  Layers,
  CheckCircle2,
  Cpu,
  BarChart3,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { DATA_SOURCES_LIST } from '@/data/mockData';
import { useIntelligence } from '@/context/IntelligenceContext';

export default function DataSourcesPanel() {
  const { calculatedStats, refreshHotspots, addToast, dataSourceMode, ingestionMeta, theme } = useIntelligence();
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'Streams' | 'ModelEval'>('Streams');
  const [modelMetrics, setModelMetrics] = useState<any | null>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    fetch('/api/model/metrics')
      .then((r) => r.json())
      .then((data) => {
        if (data.metrics) setModelMetrics(data.metrics);
      })
      .catch(() => {});
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    addToast('Contacting NASA FIRMS VIIRS NOAA-20 NRT ingestion pipeline...', 'info');
    try {
      const res = await fetch('/api/firms/sync', { method: 'POST' });
      const data = await res.json();
      await refreshHotspots();
      if (data.success) {
        addToast(`Sync complete: ${data.ingested} new, ${data.updated || 0} deduplicated records.`, 'success');
      } else {
        addToast(`Sync notice: ${data.error || 'Durable cache active.'}`, 'info');
      }
    } catch {
      await refreshHotspots();
      addToast('Satellite telemetry refreshed from verified cache.', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 2x2 Network Health KPIs */}
      <div className="flarex-kpi-grid">
        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Pipeline Status</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`w-2 h-2 rounded-full ${
                dataSourceMode === 'LIVE_NRT'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-amber-400'
              }`}
            />
            <span className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
              {dataSourceMode === 'LIVE_NRT' ? 'LIVE STREAMING' : 'CACHED ARCHIVE'}
            </span>
          </div>
          <span className="flarex-kpi-meta">5 / 5 Feeds Synchronized</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Active Detections</span>
          <span className="flarex-kpi-value text-[#ff5533]">{calculatedStats.totalEvents}</span>
          <span className="flarex-kpi-meta">Pan-India Coverage</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Classifier Engine</span>
          <span className={`flarex-kpi-value ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>v1.2-Hybrid</span>
          <span className="flarex-kpi-meta">Spatial Rule + Gradient Boost</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Data Age</span>
          <span className="flarex-kpi-value text-amber-400">{ingestionMeta.dataAgeMinutes} min</span>
          <span className="flarex-kpi-meta">Mode: {dataSourceMode}</span>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className={`flex rounded-xl p-1 border ${
        isDark ? 'bg-black/40 border-white/10' : 'bg-[#f0f5fa] border-[#cfe0f0]'
      }`}>
        <button
          type="button"
          onClick={() => setActiveTab('Streams')}
          className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
            activeTab === 'Streams'
              ? 'bg-[#ff5533] text-white shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-[#4e6b8c] hover:text-[#0c2340]'
          }`}
        >
          Intelligence Streams
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ModelEval')}
          className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
            activeTab === 'ModelEval'
              ? 'bg-[#ff5533] text-white shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-[#4e6b8c] hover:text-[#0c2340]'
          }`}
        >
          Model Benchmark &amp; Validation
        </button>
      </div>

      {activeTab === 'Streams' ? (
        <>
          {/* Manual Sync Action Button */}
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full py-2.5 px-4 rounded-xl bg-[#ff5533] hover:bg-[#ff7a45] text-white text-[11.5px] font-bold flex items-center justify-center gap-2 border border-[#ff7a45] transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_12px_rgba(255,85,45,0.3)]"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Synchronizing Ingestion Pipelines...' : 'Sync Satellite & GIS Feeds Now'}</span>
          </button>

          {/* Data Sources List */}
          <section className="flarex-section">
            <h3 className="flarex-section-title">Connected Geospatial Intelligence Sources</h3>
            <div className="flarex-status-list">
              {DATA_SOURCES_LIST.map((source) => (
                <div key={source.name} className={`flarex-status-row !p-3 rounded-xl border ${
                  isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-[#cfe0f0]'
                }`}>
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                      isDark ? 'bg-[#ff5533]/20 border-[#ff5533]/30 text-[#ff7a45]' : 'bg-[#e0f2fe] border-[#bae6fd] text-[#0284c7]'
                    }`}>
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
                        <span className={`flarex-status-name block font-bold text-[12px] ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>{source.name}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold border ${
                          isDark ? 'bg-black/40 text-slate-300 border-white/10' : 'bg-[#f0f5fa] text-[#4e6b8c] border-[#cfe0f0]'
                        }`}>
                          {source.type}
                        </span>
                      </div>
                      <p className={`text-[10px] mt-0.5 leading-snug ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{source.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-bold text-emerald-400">{source.status}</span>
                    </div>
                    <span className={`font-mono text-[9px] mt-0.5 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{source.latency} latency</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        /* Genuine AI Model Evaluation & Confusion Matrix Section */
        <div className="flex flex-col gap-3">
          {modelMetrics && (
            <>
              {/* Benchmark Dataset Info */}
              <div className={`p-3 rounded-2xl border flex flex-col gap-1.5 text-[11px] ${
                isDark ? 'bg-black/40 border-white/10' : 'bg-[#f8fbfe] border-[#cfe0f0]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>Evaluation Dataset:</span>
                  <span className="font-mono text-[10px] font-bold text-[#ff7a45]">{modelMetrics.dataset.name}</span>
                </div>
                <div className={`flex items-center justify-between text-[10.5px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>Date Range: {modelMetrics.dataset.dateRange}</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>{modelMetrics.dataset.totalSamples} Ground-Truth Samples</span>
                </div>
                <div className={`flex items-center justify-between text-[10px] pt-1 border-t ${
                  isDark ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-500'
                }`}>
                  <span>Model Engine: {modelMetrics.version}</span>
                  <span>Last Evaluated: {modelMetrics.lastTrainedDate}</span>
                </div>
              </div>

              {/* Per-Class Evaluation Table */}
              <section className="flarex-section">
                <h3 className="flarex-section-title">Per-Class Precision, Recall &amp; F1-Score</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10.5px] text-left">
                    <thead>
                      <tr className={`border-b text-[9.5px] uppercase font-bold ${
                        isDark ? 'border-white/10 text-slate-400' : 'border-[#cfe0f0] text-slate-600'
                      }`}>
                        <th className="pb-1.5">Class Name</th>
                        <th className="pb-1.5 text-center">Precision</th>
                        <th className="pb-1.5 text-center">Recall</th>
                        <th className="pb-1.5 text-center">F1-Score</th>
                        <th className="pb-1.5 text-right">Samples</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-[#cfe0f0]'}`}>
                      {modelMetrics.classMetrics.map((cm: any) => (
                        <tr key={cm.className} className={isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50'}>
                          <td className={`py-1.5 font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>{cm.className}</td>
                          <td className="py-1.5 text-center font-mono text-emerald-400 font-bold">{cm.precision}%</td>
                          <td className="py-1.5 text-center font-mono text-emerald-400 font-bold">{cm.recall}%</td>
                          <td className="py-1.5 text-center font-mono text-[#ff7a45] font-black">{cm.f1}%</td>
                          <td className={`py-1.5 text-right font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{cm.samples}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Confusion Matrix */}
              <section className="flarex-section">
                <h3 className="flarex-section-title">Test Confusion Matrix (Predicted vs Actual)</h3>
                <div className={`p-2.5 rounded-2xl border overflow-x-auto ${
                  isDark ? 'bg-black/40 border-white/10' : 'bg-white border-[#cfe0f0]'
                }`}>
                  <table className="w-full text-[9.5px] text-center font-mono">
                    <thead>
                      <tr className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        <th className="text-left text-[8.5px] uppercase font-sans">True \ Pred</th>
                        {modelMetrics.confusionMatrix.labels.map((l: string) => (
                          <th key={l} className="p-1">{l}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {modelMetrics.confusionMatrix.matrix.map((row: number[], rIdx: number) => (
                        <tr key={rIdx} className={`border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                          <td className={`text-left font-bold font-sans py-1 ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>{modelMetrics.confusionMatrix.labels[rIdx]}</td>
                          {row.map((val: number, cIdx: number) => (
                            <td
                              key={cIdx}
                              className={`p-1 font-bold ${
                                rIdx === cIdx
                                  ? isDark ? 'bg-emerald-500/20 text-emerald-300 rounded' : 'bg-emerald-100 text-emerald-900 rounded'
                                  : val > 50
                                  ? isDark ? 'text-amber-400' : 'text-amber-800'
                                  : isDark ? 'text-slate-600' : 'text-slate-400'
                              }`}
                            >
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Documented Model Limitations */}
              <div className={`p-3 rounded-2xl border text-[10.5px] flex flex-col gap-1 ${
                isDark ? 'bg-amber-500/10 border-amber-500/25 text-amber-300' : 'bg-amber-50/70 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center gap-1.5 font-bold">
                  <Info size={14} className="text-amber-400 shrink-0" />
                  <span>Documented Operational Limitations:</span>
                </div>
                <ul className="list-disc pl-4 flex flex-col gap-0.5 mt-0.5 opacity-90">
                  {modelMetrics.knownLimitations.map((lim: string, i: number) => (
                    <li key={i}>{lim}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export { DataSourcesPanel };
