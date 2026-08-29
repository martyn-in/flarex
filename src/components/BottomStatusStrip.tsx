'use client';

import React from 'react';
import { Radio, Database, Cpu, Globe, Flame, ShieldCheck } from 'lucide-react';
import { useIntelligence } from '../context/IntelligenceContext';

export const BottomStatusStrip: React.FC = () => {
  const { isPresentationMode, setFilter, calculatedStats } = useIntelligence();

  if (isPresentationMode) {
    return null;
  }

  return (
    <footer className="w-full h-[36px] px-4 glass-panel border-t border-white/[0.08] flex items-center justify-between text-[11px] z-20 shrink-0 select-none">
      {/* Left Pipeline Components */}
      <div className="flex items-center gap-4 text-slate-400 overflow-x-auto">
        {/* FIRMS Ingestion */}
        <div className="flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-emerald-400" />
          <span>FIRMS NRT Stream:</span>
          <span className="font-semibold text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-beacon" /> Online
          </span>
        </div>

        <div className="w-[1px] h-3 bg-white/[0.08]" />

        {/* Thermal Model */}
        <div className="flex items-center gap-1.5">
          <Flame className="w-3 h-3 text-cyan-400" />
          <span>Thermal Analysis:</span>
          <span className="font-semibold text-cyan-300">Active</span>
        </div>

        <div className="w-[1px] h-3 bg-white/[0.08]" />

        {/* Geo Context */}
        <div className="flex items-center gap-1.5">
          <Globe className="w-3 h-3 text-blue-400" />
          <span>Industrial Buffer (OSM):</span>
          <span className="font-semibold text-slate-200">Synchronized</span>
        </div>

        <div className="w-[1px] h-3 bg-white/[0.08]" />

        {/* AI Engine */}
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3 h-3 text-purple-400" />
          <span>FlameX AI Engine:</span>
          <span className="font-semibold text-emerald-400">Operational</span>
        </div>
      </div>

      {/* Right Stats & Alerts */}
      <div className="flex items-center gap-4 text-slate-400 shrink-0">
        {/* Urgent Alerts Button */}
        <button
          type="button"
          onClick={() => setFilter('critical')}
          className="flex items-center gap-1.5 hover:text-red-400 transition-colors cursor-pointer"
        >
          <span className="text-slate-400">Critical Incidents:</span>
          <span className="font-bold text-red-400 px-1.5 py-0.2 rounded bg-red-950/60 border border-red-500/30">
            {calculatedStats.criticalAlerts} Active
          </span>
        </button>

        <div className="w-[1px] h-3 bg-white/[0.08]" />

        {/* Platform Integrity */}
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Integrity:</span>
          <span className="font-mono font-bold text-emerald-400">99.8%</span>
        </div>
      </div>
    </footer>
  );
};

export default BottomStatusStrip;
