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
          <span className={`flarex-kpi-value ${theme === 'dark' ? 'text-white' : 'text-[#261006]'}`}>{persistentList.length}</span>
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
        <div className={`flex rounded-xl p-1 border ${theme === 'dark' ? 'bg-[rgba(32,15,9,0.85)] border-[rgba(255,106,61,0.3)]' : 'bg-[#ffedd5] border-[#fed7aa]'}`}>
          {(['all', 'normal', 'abnormal'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`flex-1 py-1 px-2 rounded-lg text-[10.5px] font-bold uppercase transition-all cursor-pointer ${
                filterType === t
                  ? theme === 'dark'
                    ? 'bg-[rgba(255,85,45,0.25)] text-white shadow-xs border border-[rgba(255,106,61,0.5)]'
                    : 'bg-white text-[#ea580c] shadow-xs border border-[#fed7aa]'
                  : theme === 'dark'
                  ? 'text-[#ffcaa6] hover:text-white'
                  : 'text-[#7c2d12] hover:text-[#261006]'
              }`}
            >
              {t === 'all' ? `All (${persistentList.length})` : t === 'normal' ? `Normal (${normalCount})` : `Abnormal (${abnormalCount})`}
            </button>
          ))}
        </div>

        <div className="search-box !w-full">
          <Search size={14} className="text-[#9a3412] shrink-0" />
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
                    ? 'border-[#ff5a3c] bg-[rgba(255,90,45,0.2)] shadow-[0_0_15px_rgba(255,90,60,0.3)]'
                    : 'border-[#ea580c] bg-[#ffedd5] shadow-sm'
                  : isNormal
                  ? theme === 'dark'
                    ? 'bg-[rgba(32,15,9,0.7)] border-[rgba(255,106,61,0.25)] hover:bg-[rgba(40,18,11,0.85)]'
                    : 'bg-white border-[#fed7aa] hover:bg-[#fff7ed]'
                  : theme === 'dark'
                  ? 'border-red-500/40 bg-[rgba(50,15,10,0.7)] hover:bg-[rgba(60,18,12,0.85)]'
                  : 'border-red-200 bg-red-50/50 hover:bg-red-50'
              }`}
            >
              {/* Top Row: Facility Name & Status Pill */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className={`text-[12.5px] font-extrabold leading-snug ${theme === 'dark' ? 'text-white' : 'text-[#261006]'}`}>
                    {spot.nearestFacility.name}
                  </h4>
                  <span className={`text-[10px] flex items-center gap-1 mt-0.5 font-medium ${theme === 'dark' ? 'text-[#ffcaa6]' : 'text-[#7c2d12]'}`}>
                    <MapPin size={11} className={`${theme === 'dark' ? 'text-[#ff7a45]' : 'text-[#ea580c]'} shrink-0`} />
                    {spot.location}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase border shrink-0 ${
                    isNormal
                      ? theme === 'dark'
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : theme === 'dark'
                      ? 'bg-red-950/60 border-red-500/50 text-red-300'
                        : 'bg-red-50 border-red-300 text-red-700'
                  }`}
                >
                  {isNormal ? 'NORMAL' : 'ABNORMAL'}
                </span>
              </div>

              {/* Middle Row: Recurrence & Radiance Comparison */}
              <div className={`grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl border text-center ${
                theme === 'dark' ? 'bg-[rgba(38,18,11,0.85)] border-[rgba(255,106,61,0.3)]' : 'bg-[#fff7ed] border-[#fed7aa]'
              }`}>
                <div>
                  <span className={`text-[9px] block font-semibold ${theme === 'dark' ? 'text-[#ffcaa6]' : 'text-[#7c2d12]'}`}>30-Day Recurrence</span>
                  <span className="font-mono text-[11px] font-bold text-purple-600">
                    {spot.persistenceDays}
                  </span>
                </div>
                <div>
                  <span className={`text-[9px] block font-semibold ${theme === 'dark' ? 'text-[#ffcaa6]' : 'text-[#7c2d12]'}`}>Typical FRP</span>
                  <span className={`font-mono text-[11px] font-bold ${theme === 'dark' ? 'text-white' : 'text-[#261006]'}`}>
                    {spot.baselineFrp} MW
                  </span>
                </div>
                <div>
                  <span className={`text-[9px] block font-semibold ${theme === 'dark' ? 'text-[#a3928c]' : 'text-[#7c2d12]'}`}>Current FRP</span>
                  <span className={`font-mono text-[11px] font-bold ${isNormal ? 'text-emerald-500' : 'text-red-500'}`}>
                    {spot.frp} MW
                  </span>
                </div>
              </div>

              {/* Bottom: Classification & Multiplier */}
              <div className={`flex items-center justify-between text-[10px] pt-1 border-t ${
                theme === 'dark' ? 'border-white/10 text-[#a3928c]' : 'border-[#fed7aa] text-[#7c2d12]'
              }`}>
                <span className={`font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-[#261006]'}`}>{spot.classification}</span>
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
