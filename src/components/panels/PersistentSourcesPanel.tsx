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
import { useIntelligence, isPersistentSource } from '@/context/IntelligenceContext';
import { Hotspot } from '@/types';

export default function PersistentSourcesPanel() {
  const { hotspots, selectHotspot, selectedHotspot, closeDrawer, formatTemp, theme } = useIntelligence();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'normal' | 'abnormal'>('all');

  const isDark = theme === 'dark';

  // Filter persistent sources (>10 days recurrence or Gas Flare / Blast Furnace)
  const allPersistent = hotspots.filter(isPersistentSource);

  const normalCount = allPersistent.filter((h) => h.status === 'NORMAL').length;
  const abnormalCount = allPersistent.filter((h) => h.status !== 'NORMAL').length;
  const totalPersistentCount = allPersistent.length;

  const displayList = allPersistent
    .filter((h) => {
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
          <span className={`flarex-kpi-value ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>{totalPersistentCount}</span>
          <span className="flarex-kpi-meta">Refinery &amp; Chemical Corridors</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Normal Baseline</span>
          <span className="flarex-kpi-value text-emerald-400">{normalCount}</span>
          <span className="flarex-kpi-meta">Within operational bound</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Abnormal Surges</span>
          <span className="flarex-kpi-value text-red-400">{abnormalCount}</span>
          <span className="flarex-kpi-meta">&gt; 1.5× baseline multiplier</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Avg Persistence</span>
          <span className="flarex-kpi-value text-purple-400">26.4 days</span>
          <span className="flarex-kpi-meta">30-day temporal window</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-2">
        <div className={`flex rounded-xl p-1 border ${
          isDark ? 'bg-black/40 border-white/10' : 'bg-[#f0f5fa] border-[#cfe0f0]'
        }`}>
          {(['all', 'normal', 'abnormal'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`flex-1 py-1 px-2 rounded-lg text-[10.5px] font-bold uppercase transition-all cursor-pointer ${
                filterType === t
                  ? 'bg-[#ff5533] text-white shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-[#4e6b8c] hover:text-[#0c2340]'
              }`}
            >
              {t === 'all' ? `All (${totalPersistentCount})` : t === 'normal' ? `Normal (${normalCount})` : `Abnormal (${abnormalCount})`}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            placeholder="Filter by facility name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-[11px] focus:outline-none transition-colors border ${
              isDark
                ? 'text-white bg-black/40 border-white/10 focus:border-[#ff5533] placeholder-slate-500'
                : 'text-[#0c2340] bg-white border-[#cfe0f0] focus:border-[#0284c7] placeholder-slate-400'
            }`}
          />
        </div>
      </div>

      {/* Persistent Sources Cards */}
      <div className="flarex-status-list mt-1">
        {displayList.map((spot) => {
          const isSelected = selectedHotspot?.id === spot.id;
          const isNormal = spot.status === 'NORMAL';

          return (
            <div
              key={spot.id}
              onClick={() => handleSelect(spot)}
              className={`p-3 rounded-2xl border flex flex-col gap-2.5 transition-all cursor-pointer ${
                isSelected
                  ? isDark
                    ? '!border-[#ff5533] !bg-[#ff5533]/15 shadow-[0_0_12px_rgba(255,85,45,0.2)]'
                    : '!border-[#0284c7] !bg-[#e0f2fe]'
                  : isNormal
                  ? isDark
                    ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07]'
                    : 'bg-white border-[#cfe0f0] hover:bg-[#f8fbfe]'
                  : isDark
                  ? 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20'
                  : 'border-red-200 bg-red-50/50 hover:bg-red-50'
              }`}
            >
              {/* Top Row: Facility Name & Status Pill */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className={`text-[12.5px] font-extrabold leading-snug ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
                    {spot.nearestFacility.name}
                  </h4>
                  <span className={`text-[10px] flex items-center gap-1 mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <MapPin size={11} className="text-[#ff5533] shrink-0" />
                    {spot.location}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase border shrink-0 ${
                    isNormal
                      ? isDark ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : isDark ? 'bg-red-500/20 border-red-500/30 text-red-300' : 'bg-red-50 border-red-300 text-red-700'
                  }`}
                >
                  {isNormal ? 'NORMAL' : 'ABNORMAL'}
                </span>
              </div>

              {/* Middle Row: Recurrence & Radiance Comparison */}
              <div className={`grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl border text-center ${
                isDark ? 'bg-black/40 border-white/10' : 'bg-[#f8fbfe] border-[#cfe0f0]'
              }`}>
                <div>
                  <span className={`text-[9px] block font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>30-Day Recurrence</span>
                  <span className="font-mono text-[11px] font-bold text-purple-400">
                    {spot.persistenceDays}
                  </span>
                </div>
                <div>
                  <span className={`text-[9px] block font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Typical FRP</span>
                  <span className={`font-mono text-[11px] font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
                    {spot.baselineFrp} MW
                  </span>
                </div>
                <div>
                  <span className={`text-[9px] block font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Current FRP</span>
                  <span className={`font-mono text-[11px] font-bold ${isNormal ? 'text-emerald-400' : 'text-red-400'}`}>
                    {spot.frp} MW
                  </span>
                </div>
              </div>

              {/* Bottom: Classification & Multiplier */}
              <div className={`flex items-center justify-between text-[10px] pt-1 border-t ${
                isDark ? 'border-white/10 text-slate-400' : 'border-[#cfe0f0] text-slate-600'
              }`}>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>{spot.classification}</span>
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
