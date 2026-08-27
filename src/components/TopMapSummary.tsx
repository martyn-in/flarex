'use client';

import React from 'react';
import { Flame, ShieldAlert, Cpu, CheckCircle2, Activity } from 'lucide-react';
import { useIntelligence } from '../context/IntelligenceContext';
import { SYSTEM_OPERATIONAL_STATS } from '../data/mockData';

export const TopMapSummary: React.FC = () => {
  const { activeFilter, setFilter } = useIntelligence();

  return (
    <div className="absolute top-3 left-4 right-4 z-20 pointer-events-auto flex justify-center">
      <div className="glass-dock rounded-2xl p-1.5 px-3 flex items-center gap-2 shadow-2xl border border-white/[0.12] max-w-full overflow-x-auto">
        {/* KPI 1: Active Hotspots */}
        <button
          type="button"
          onClick={() => setFilter(null)}
          className={`flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
            activeFilter === null
              ? 'bg-white/[0.08] border border-white/[0.15] shadow-[0_4px_16px_rgba(0,0,0,0.3)]'
              : 'hover:bg-white/[0.04] border border-transparent opacity-85 hover:opacity-100'
          }`}
          title="Display all active thermal hotspots"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Activity className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10.5px] font-semibold text-slate-400 tracking-wide uppercase">
              Active Hotspots
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[20px] font-bold text-white font-mono leading-none">
                {SYSTEM_OPERATIONAL_STATS.activeHotspots.toLocaleString()}
              </span>
              <span className="text-[10px] text-cyan-400 font-medium">Pan-India</span>
            </div>
          </div>
        </button>

        <div className="w-[1px] h-6 bg-white/[0.08]" />

        {/* KPI 2: Critical Urgent Incidents */}
        <button
          type="button"
          onClick={() => setFilter('critical')}
          className={`flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
            activeFilter === 'critical'
              ? 'bg-red-950/40 border border-red-500/50 shadow-[0_0_18px_rgba(255,77,79,0.3)] scale-[1.02]'
              : 'hover:bg-red-950/20 border border-transparent opacity-90 hover:opacity-100'
          }`}
          title="Click to isolate Critical Incidents"
        >
          <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 relative">
            <Flame className="w-4 h-4 text-red-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10.5px] font-bold text-red-400 tracking-wide uppercase flex items-center gap-1">
              Critical Fire
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[20px] font-extrabold text-red-400 font-mono leading-none">
                {SYSTEM_OPERATIONAL_STATS.criticalAlerts}
              </span>
              <span className="text-[10px] text-red-300 font-semibold px-1.5 py-0.2 rounded bg-red-950/60 border border-red-500/30">
                Action Req.
              </span>
            </div>
          </div>
        </button>

        <div className="w-[1px] h-6 bg-white/[0.08]" />

        {/* KPI 3: Persistent Industrial Sources */}
        <button
          type="button"
          onClick={() => setFilter('persistent')}
          className={`flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
            activeFilter === 'persistent'
              ? 'bg-purple-950/40 border border-purple-500/50 shadow-[0_0_18px_rgba(165,110,255,0.3)] scale-[1.02]'
              : 'hover:bg-purple-950/20 border border-transparent opacity-85 hover:opacity-100'
          }`}
          title="Click to isolate Persistent Industrial sources"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10.5px] font-semibold text-purple-300 tracking-wide uppercase">
              Persistent Flare
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[20px] font-bold text-purple-300 font-mono leading-none">
                {SYSTEM_OPERATIONAL_STATS.persistentSources}
              </span>
              <span className="text-[10px] text-slate-400">Industrial Baseline</span>
            </div>
          </div>
        </button>

        <div className="w-[1px] h-6 bg-white/[0.08]" />

        {/* KPI 4: AI Model Confidence */}
        <div className="flex items-center gap-3 px-3.5 py-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10.5px] font-semibold text-slate-400 tracking-wide uppercase">
              AI Confidence
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[20px] font-bold text-emerald-400 font-mono leading-none">
                {SYSTEM_OPERATIONAL_STATS.averageConfidence}%
              </span>
              <span className="text-[10px] text-emerald-300 flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" /> High
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
