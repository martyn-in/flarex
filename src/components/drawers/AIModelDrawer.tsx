'use client';

import React from 'react';
import { X, Cpu, CheckCircle2, Clock, Sparkles, Layers } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';

export const AIModelDrawer: React.FC = () => {
  const { activeDrawer, closeDrawer } = useIntelligence();

  if (activeDrawer !== 'ai') return null;

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
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[13px] font-bold text-white tracking-wider uppercase">
                FlareX AI Classification Engine
              </span>
              <span className="text-[10px] text-slate-400 block">Thermal Source Discrimination Core</span>
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

        {/* Model Status Card */}
        <div className="glass-card rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400">Classification Pipeline</span>
              <h3 className="text-[15px] font-bold text-white mt-0.5 flex items-center gap-1.5">
                XGBoost Thermal Ensemble <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              </h3>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[11px] font-semibold shadow-[0_0_8px_rgba(32,201,151,0.2)]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active</span>
            </div>
          </div>
        </div>

        {/* Feature Importance Card */}
        <div className="glass-card rounded-2xl p-4 flex flex-col gap-2.5">
          <span className="text-[12px] font-bold text-white flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" /> Inference Feature Vectors
          </span>
          <div className="flex flex-col gap-2 mt-1 text-[11.5px] text-slate-300">
            <div className="p-2.5 rounded-xl bg-black/25 border border-white/[0.06] flex items-center justify-between">
              <span className="text-white font-medium">FRP Radiance Power (MW)</span>
              <span className="font-mono text-[10.5px] text-red-400 font-bold bg-red-950/40 px-2 py-0.5 rounded border border-red-500/20">
                Weight 0.38
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/25 border border-white/[0.06] flex items-center justify-between">
              <span className="text-white font-medium">Temporal Persistence Index</span>
              <span className="font-mono text-[10.5px] text-purple-300 font-bold bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20">
                Weight 0.29
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/25 border border-white/[0.06] flex items-center justify-between">
              <span className="text-white font-medium">Industrial Buffer Proximity</span>
              <span className="font-mono text-[10.5px] text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                Weight 0.21
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/25 border border-white/[0.06] flex items-center justify-between">
              <span className="text-white font-medium">7-Day Baseline Delta</span>
              <span className="font-mono text-[10.5px] text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                Weight 0.12
              </span>
            </div>
          </div>
        </div>

        {/* Validation Status */}
        <div className="glass-card rounded-2xl p-4 flex flex-col gap-2 border-white/[0.1]">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-[12px] font-bold text-white">Validation Status</span>
          </div>
          <p className="text-[11.5px] text-slate-400 leading-relaxed mt-0.5">
            Model inference running on live satellite pass detections. Continuous backpropagation and calibration against verified industrial ground-truth datasets.
          </p>
        </div>
      </aside>
    </div>
  );
};
