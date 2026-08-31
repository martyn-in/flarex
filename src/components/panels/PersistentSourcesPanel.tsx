'use client';

import React, { useState } from 'react';
import {
  Activity,
  Flame,
  Search,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import { useIntelligence } from '@/context/IntelligenceContext';
import { Hotspot } from '@/types';

export default function PersistentSourcesPanel() {
  const { hotspots, selectHotspot, selectedHotspot, closeDrawer, theme } = useIntelligence();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'normal' | 'abnormal'>('all');

  // Filter persistent sources (>10 days recurrence or Gas Flare / Blast Furnace)
  const persistentList = hotspots
    .filter((h) => {
      const isPersistent =
        h.classification === 'Gas Flare' ||
        h.classification === 'Mining / Furnace Activity' ||
        parseInt(h.persistenceDays) >= 10;
      if (!isPersistent) return false;

      if (filterType === 'normal') return h.status === 'NORMAL';
      if (filterType === 'abnormal') return h.status !== 'NORMAL';
      return true;
    })
    .filter(
      (h) =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.nearestFacility.name.toLowerCase().includes(search.toLowerCase()) ||
        h.location.toLowerCase().includes(search.toLowerCase())
    );

  const normalCount = hotspots.filter(
    (h) => (h.classification === 'Gas Flare' || parseInt(h.persistenceDays) >= 10) && h.status === 'NORMAL'
  ).length;

  const abnormalCount = hotspots.filter(
    (h) => (h.classification === 'Gas Flare' || parseInt(h.persistenceDays) >= 10) && h.status !== 'NORMAL'
  ).length;

  const handleSelect = (spot: Hotspot) => {
    selectHotspot(spot, true);
    closeDrawer();
  };

  return (
    <div className="flex flex-col gap-3.5">
      {/* 2x2 KPI Summary Grid */}
      <div className="flarex-kpi-grid">
        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Tracked Flares</span>
          <span className={`flarex-kpi-value ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{persistentList.length}</span>
          <span className="flarex-kpi-meta">Refinery &amp; Chemical Corridors</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Normal Baseline</span>
          <span className="flarex-kpi-value text-emerald-500">{normalCount}</span>
          <span className="flarex-kpi-meta">Within operational bound</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Abnormal Surges</span>
          <span className="flarex-kpi-value text-red-500">{abnormalCount}</span>
          <span className="flarex-kpi-meta">&gt; 1.5× baseline multiplier</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Avg Persistence</span>
          <span className="flarex-kpi-value text-purple-400">22.4 d</span>
          <span className="flarex-kpi-meta">30-day temporal window</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-2">
        <div className={`flex rounded-xl p-1 border ${theme === 'dark' ? 'bg-black/30 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
          {(['all', 'normal', 'abnormal'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`flex-1 py-1 px-2 rounded-lg text-[10.5px] font-bold uppercase transition-all cursor-pointer ${
                filterType === t
                  ? theme === 'dark'
                    ? 'bg-[rgba(255,85,45,0.22)] text-[#ff7a45] shadow-xs border border-[rgba(255,106,61,0.35)]'
                    : 'bg-white text-orange-600 shadow-xs border border-slate-200'
                  : theme === 'dark'
                  ? 'text-[#a3928c] hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t === 'all' ? `All (${persistentList.length})` : t === 'normal' ? `Normal (${normalCount})` : `Abnormal (${abnormalCount})`}
            </button>
          ))}
        </div>

        <div className="search-box !w-full">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Filter by facility name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
              className={`p-3 rounded-xl border flex flex-col gap-2.5 transition-all cursor-pointer ${
                isSelected
                  ? theme === 'dark'
                    ? 'border-[#ff5a3c] bg-[rgba(255,90,45,0.14)] shadow-[0_0_15px_rgba(255,90,60,0.25)]'
                    : 'border-orange-500 bg-orange-50/60 shadow-sm'
                  : isNormal
                  ? theme === 'dark'
                    ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                  : theme === 'dark'
                  ? 'border-red-500/30 bg-red-950/20 hover:bg-red-950/30'
                  : 'border-red-200 bg-red-50/50 hover:bg-red-50'
              }`}
            >
              {/* Top Row: Facility Name & Status Pill */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className={`text-[12.5px] font-extrabold leading-snug ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {spot.nearestFacility.name}
                  </h4>
                  <span className={`text-[10px] flex items-center gap-1 mt-0.5 font-medium ${theme === 'dark' ? 'text-[#a3928c]' : 'text-slate-500'}`}>
                    <MapPin size={11} className={`${theme === 'dark' ? 'text-[#ff7a45]' : 'text-slate-400'} shrink-0`} />
                    {spot.location}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase border shrink-0 ${
                    isNormal
                      ? theme === 'dark'
                        ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : theme === 'dark'
                      ? 'bg-red-950/50 border-red-500/40 text-red-400'
                      : 'bg-red-50 border-red-300 text-red-700'
                  }`}
                >
                  {isNormal ? 'NORMAL' : 'ABNORMAL'}
                </span>
              </div>

              {/* Middle Row: Recurrence & Radiance Comparison */}
              <div className={`grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl border text-center ${
                theme === 'dark' ? 'bg-black/25 border-white/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className={`text-[9px] block font-semibold ${theme === 'dark' ? 'text-[#a3928c]' : 'text-slate-500'}`}>30-Day Recurrence</span>
                  <span className="font-mono text-[11px] font-bold text-purple-400">
                    {spot.persistenceDays}
                  </span>
                </div>
                <div>
                  <span className={`text-[9px] block font-semibold ${theme === 'dark' ? 'text-[#a3928c]' : 'text-slate-500'}`}>Typical FRP</span>
                  <span className={`font-mono text-[11px] font-bold ${theme === 'dark' ? 'text-[#d1b8af]' : 'text-slate-700'}`}>
                    {spot.baselineFrp} MW
                  </span>
                </div>
                <div>
                  <span className={`text-[9px] block font-semibold ${theme === 'dark' ? 'text-[#a3928c]' : 'text-slate-500'}`}>Current FRP</span>
                  <span className={`font-mono text-[11px] font-bold ${isNormal ? 'text-emerald-500' : 'text-red-500'}`}>
                    {spot.frp} MW
                  </span>
                </div>
              </div>

              {/* Bottom: Classification & Multiplier */}
              <div className={`flex items-center justify-between text-[10px] pt-1 border-t ${
                theme === 'dark' ? 'border-white/10 text-[#a3928c]' : 'border-slate-200 text-slate-500'
              }`}>
                <span className={`font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{spot.classification}</span>
                <span className={`font-mono font-bold ${isNormal ? 'text-emerald-500' : 'text-red-500'}`}>
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
