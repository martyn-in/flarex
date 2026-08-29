'use client';

import React, { useState } from 'react';
import { Activity, Flame, MapPin, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useIntelligence } from '@/context/IntelligenceContext';
import { Hotspot } from '@/types';

export default function PersistentSourcesPanel() {
  const { hotspots, selectedHotspot, selectHotspot, addToast } = useIntelligence();
  const [filterState, setFilterState] = useState<'ALL' | 'NORMAL' | 'ABNORMAL'>('ALL');

  // Filter persistent or high recurrence thermal sources
  const persistentList = hotspots.filter((h) => {
    const isPersistent =
      h.classification === 'Gas Flare' ||
      h.classification === 'Mining / Furnace Activity' ||
      h.persistenceScore >= 40;

    if (!isPersistent) return false;

    if (filterState === 'NORMAL') return h.status === 'NORMAL';
    if (filterState === 'ABNORMAL') return h.status === 'ABNORMAL' || h.status === 'CRITICAL_FIRE' || h.baselineRatio >= 1.8;

    return true;
  });

  const normalCount = hotspots.filter(
    (h) => (h.classification === 'Gas Flare' || h.persistenceScore >= 40) && h.status === 'NORMAL'
  ).length;

  const abnormalCount = hotspots.filter(
    (h) => (h.classification === 'Gas Flare' || h.persistenceScore >= 40) && (h.status === 'ABNORMAL' || h.status === 'CRITICAL_FIRE' || h.baselineRatio >= 1.8)
  ).length;

  const handleSelect = (spot: Hotspot) => {
    selectHotspot(spot, true);
    addToast(`Persistent Source: ${spot.name} (${spot.status})`, spot.status === 'NORMAL' ? 'info' : 'warning');
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 gap-2">
        <div
          onClick={() => setFilterState('NORMAL')}
          className={`glass-card p-3 rounded-xl cursor-pointer transition-all ${filterState === 'NORMAL' ? 'border-emerald-500 bg-emerald-950/20' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Normal Flares</span>
            <CheckCircle2 size={15} className="text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-[20px] font-black text-emerald-400 font-mono">{normalCount}</span>
            <span className="text-[10px] text-slate-400">≤ 1.5× baseline</span>
          </div>
        </div>

        <div
          onClick={() => setFilterState('ABNORMAL')}
          className={`glass-card p-3 rounded-xl cursor-pointer transition-all ${filterState === 'ABNORMAL' ? 'border-red-500 bg-red-950/20' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Abnormal Surges</span>
            <AlertTriangle size={15} className="text-red-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-[20px] font-black text-red-400 font-mono">{abnormalCount}</span>
            <span className="text-[10px] text-slate-400">&gt; 2.0× baseline</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 pb-1">
        {(['ALL', 'NORMAL', 'ABNORMAL'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setFilterState(mode)}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
              filterState === mode
                ? 'bg-[rgba(255,90,45,0.18)] border border-[#ff5a3c] text-[#ff7a45] shadow-[0_0_10px_rgba(255,90,60,0.25)]'
                : 'bg-[rgba(255,90,45,0.04)] border border-[rgba(255,106,61,0.15)] text-[#a3928c] hover:text-white'
            }`}
          >
            {mode === 'ALL' ? 'ALL RECURRING' : mode}
          </button>
        ))}
      </div>

      {/* Persistent Sources Cards */}
      <div className="flarex-status-list mt-1">
        {persistentList.map((spot) => {
          const isSelected = selectedHotspot?.id === spot.id;
          const isNormal = spot.status === 'NORMAL';

          return (
            <div
              key={spot.id}
              onClick={() => handleSelect(spot)}
              className={`flarex-status-row !p-3 flex-col !items-stretch gap-2.5 transition-all cursor-pointer ${
                isSelected
                  ? '!border-[#ff5a3c] !bg-[rgba(255,90,45,0.12)] shadow-[0_0_15px_rgba(255,90,60,0.25)]'
                  : isNormal
                  ? 'hover:bg-white/[0.04]'
                  : 'border-red-500/30 bg-red-950/10 hover:bg-red-950/20'
              }`}
            >
              {/* Top Row: Facility Name & Status Pill */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-[12.5px] font-bold text-white leading-snug">
                    {spot.nearestFacility.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={11} className="text-cyan-400 shrink-0" />
                    {spot.location}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase border shrink-0 ${
                    isNormal
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                      : 'bg-red-950/60 border-red-500/40 text-red-400 shadow-[0_0_8px_rgba(255,77,79,0.3)]'
                  }`}
                >
                  {isNormal ? '🟢 NORMAL' : '🔴 ABNORMAL'}
                </span>
              </div>

              {/* Middle Row: Recurrence & Radiance Comparison */}
              <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-black/30 border border-white/[0.06] text-center">
                <div>
                  <span className="text-[9px] text-slate-400 block">30-Day Recurrence</span>
                  <span className="font-mono text-[11px] font-bold text-purple-300">
                    {spot.persistenceDays}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">Typical FRP</span>
                  <span className="font-mono text-[11px] font-bold text-slate-200">
                    {spot.baselineFrp} MW
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">Current FRP</span>
                  <span className={`font-mono text-[11px] font-bold ${isNormal ? 'text-emerald-400' : 'text-red-400'}`}>
                    {spot.frp} MW
                  </span>
                </div>
              </div>

              {/* Bottom: Classification & Multiplier */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/[0.06]">
                <span className="text-slate-300 font-medium">{spot.classification}</span>
                <span className={`font-mono font-bold ${isNormal ? 'text-emerald-400' : 'text-red-400'}`}>
                  {spot.baselineRatio}× baseline
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { PersistentSourcesPanel };
