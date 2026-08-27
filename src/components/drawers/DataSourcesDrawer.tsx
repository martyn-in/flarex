'use client';

import React from 'react';
import { X, Database, CheckCircle2, Radio, Server } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { DATA_SOURCES_LIST } from '../../data/mockData';

export const DataSourcesDrawer: React.FC = () => {
  const { activeDrawer, closeDrawer } = useIntelligence();

  if (activeDrawer !== 'datasources') return null;

  return (
    <div className="fixed inset-0 z-40 flex pointer-events-auto select-none animate-in fade-in duration-200">
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-black/40 backdrop-blur-[3px] cursor-pointer"
      />

      <aside className="relative w-[420px] max-w-[90vw] h-full glass-panel-elevated p-4 flex flex-col gap-3.5 shadow-2xl z-50 border-r border-white/[0.12] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[13px] font-bold text-white tracking-wider uppercase">
                Data Sources &amp; Constellation
              </span>
              <span className="text-[10px] text-slate-400 block">Active Ingestion Pipelines</span>
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

        {/* Data Source Cards */}
        <div className="flex flex-col gap-2.5">
          {DATA_SOURCES_LIST.map((source, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl p-3.5 flex items-center justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-white">{source.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{source.sensor}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center gap-1 shadow-[0_0_8px_rgba(32,201,151,0.2)]">
                  <CheckCircle2 className="w-3 h-3" />
                  {source.status}
                </span>
                <span className="text-[10px] font-mono text-slate-400">Lag: {source.latency}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pipeline Info */}
        <div className="glass-card rounded-2xl p-3.5 mt-auto flex flex-col gap-2 border-cyan-500/20">
          <div className="flex items-center gap-2 text-cyan-400">
            <Server className="w-4 h-4" />
            <span className="text-[12px] font-bold text-white">Edge Processing Network</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Data is streamed directly via NASA LANCE FIRMS and geospatial vector endpoints with sub-3s automated filtering and thermal signature classification.
          </p>
        </div>
      </aside>
    </div>
  );
};
