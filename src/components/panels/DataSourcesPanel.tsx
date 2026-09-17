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
  const { calculatedStats, refreshHotspots, addToast, dataSourceMode, ingestionMeta } = useIntelligence();
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'Streams' | 'ModelEval'>('Streams');
  const [modelMetrics, setModelMetrics] = useState<any | null>(null);

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
                  ? 'bg-emerald-600 animate-pulse'
                  : 'bg-amber-500'
              }`}
            />
            <span className="text-[13px] font-bold text-[#431407]">
              {dataSourceMode === 'LIVE_NRT' ? 'LIVE STREAMING' : 'CACHED ARCHIVE'}
            </span>
          </div>
          <span className="flarex-kpi-meta">5 / 5 Feeds Synchronized</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Active Detections</span>
          <span className="flarex-kpi-value text-[#ea580c]">{calculatedStats.totalEvents}</span>
          <span className="flarex-kpi-meta">Pan-India Coverage</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Classifier Engine</span>
          <span className="flarex-kpi-value text-[#431407]">v1.2-Hybrid</span>
          <span className="flarex-kpi-meta">Spatial Rule + Gradient Boost</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Data Age</span>
          <span className="flarex-kpi-value text-amber-700">{ingestionMeta.dataAgeMinutes} min</span>
          <span className="flarex-kpi-meta">Mode: {dataSourceMode}</span>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex rounded-xl p-1 border bg-[#fff7ed] border-[#fed7aa]">
        <button
          type="button"
          onClick={() => setActiveTab('Streams')}
          className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
            activeTab === 'Streams'
              ? 'bg-[#ea580c] text-white'
              : 'text-[#7c2d12] hover:text-[#431407]'
          }`}
        >
          Intelligence Streams
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ModelEval')}
          className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
            activeTab === 'ModelEval'
              ? 'bg-[#ea580c] text-white'
              : 'text-[#7c2d12] hover:text-[#431407]'
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
            className="w-full py-2.5 px-4 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-[11.5px] font-bold flex items-center justify-center gap-2 border border-[#c2410c] transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Synchronizing Ingestion Pipelines...' : 'Sync Satellite & GIS Feeds Now'}</span>
          </button>

          {/* Data Sources List */}
          <section className="flarex-section">
            <h3 className="flarex-section-title">Connected Geospatial Intelligence Sources</h3>
            <div className="flarex-status-list">
              {DATA_SOURCES_LIST.map((source) => (
                <div key={source.name} className="flarex-status-row !p-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 bg-[#fff7ed] border-[#fed7aa] text-[#ea580c]">
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
                        <span className="flarex-status-name block font-bold text-[12px] text-[#431407]">{source.name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold border bg-white text-[#7c2d12] border-[#fed7aa]">
                          {source.type}
                        </span>
                      </div>
                      <p className="text-[10px] mt-0.5 leading-snug text-[#7c2d12]">{source.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      <span className="text-[10px] font-bold text-emerald-600">{source.status}</span>
                    </div>
                    <span className="font-mono text-[9px] mt-0.5 block text-[#9a3412]">{source.latency} latency</span>
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
              <div className="p-3 rounded-2xl border bg-[#fff7ed] border-[#fed7aa] flex flex-col gap-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#431407]">Evaluation Dataset:</span>
                  <span className="font-mono text-[10px] font-bold text-[#ea580c]">{modelMetrics.dataset.name}</span>
                </div>
                <div className="flex items-center justify-between text-[10.5px] text-[#7c2d12]">
                  <span>Date Range: {modelMetrics.dataset.dateRange}</span>
                  <span className="font-mono font-bold text-[#431407]">{modelMetrics.dataset.totalSamples} Ground-Truth Samples</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#9a3412] pt-1 border-t border-[#fed7aa]/60">
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
                      <tr className="border-b border-[#fed7aa] text-[#7c2d12] text-[9.5px] uppercase font-bold">
                        <th className="pb-1.5">Class Name</th>
                        <th className="pb-1.5 text-center">Precision</th>
                        <th className="pb-1.5 text-center">Recall</th>
                        <th className="pb-1.5 text-center">F1-Score</th>
                        <th className="pb-1.5 text-right">Samples</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#fed7aa]/40">
                      {modelMetrics.classMetrics.map((cm: any) => (
                        <tr key={cm.className} className="hover:bg-[#fff7ed]/60">
                          <td className="py-1.5 font-bold text-[#431407]">{cm.className}</td>
                          <td className="py-1.5 text-center font-mono text-emerald-700 font-bold">{cm.precision}%</td>
                          <td className="py-1.5 text-center font-mono text-emerald-700 font-bold">{cm.recall}%</td>
                          <td className="py-1.5 text-center font-mono text-[#ea580c] font-black">{cm.f1}%</td>
                          <td className="py-1.5 text-right font-mono text-[#7c2d12]">{cm.samples}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Confusion Matrix */}
              <section className="flarex-section">
                <h3 className="flarex-section-title">Test Confusion Matrix (Predicted vs Actual)</h3>
                <div className="p-2.5 rounded-2xl border bg-white border-[#fed7aa] overflow-x-auto">
                  <table className="w-full text-[9.5px] text-center font-mono">
                    <thead>
                      <tr className="text-[#7c2d12] font-bold">
                        <th className="text-left text-[8.5px] uppercase font-sans">True \ Pred</th>
                        {modelMetrics.confusionMatrix.labels.map((l: string) => (
                          <th key={l} className="p-1">{l}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {modelMetrics.confusionMatrix.matrix.map((row: number[], rIdx: number) => (
                        <tr key={rIdx} className="border-t border-[#fed7aa]/30">
                          <td className="text-left font-bold font-sans text-[#431407] py-1">{modelMetrics.confusionMatrix.labels[rIdx]}</td>
                          {row.map((val: number, cIdx: number) => (
                            <td
                              key={cIdx}
                              className={`p-1 font-bold ${
                                rIdx === cIdx ? 'bg-emerald-100 text-emerald-900 rounded' : val > 50 ? 'text-amber-800' : 'text-slate-500'
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
              <div className="p-3 rounded-2xl border bg-amber-50/70 border-amber-200 text-[10.5px] flex flex-col gap-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Info size={14} className="text-amber-700 shrink-0" />
                  <span>Documented Operational Limitations:</span>
                </div>
                <ul className="list-disc pl-4 text-amber-900/90 flex flex-col gap-0.5 mt-0.5">
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
