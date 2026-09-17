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
  const { hotspots, selectHotspot, selectedHotspot, closeDrawer, formatTemp } = useIntelligence();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'normal' | 'abnormal'>('all');

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
          <span className="flarex-kpi-value text-[#431407]">{totalPersistentCount}</span>
          <span className="flarex-kpi-meta">Refinery &amp; Chemical Corridors</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Normal Baseline</span>
          <span className="flarex-kpi-value text-emerald-600">{normalCount}</span>
          <span className="flarex-kpi-meta">Within operational bound</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Abnormal Surges</span>
          <span className="flarex-kpi-value text-red-600">{abnormalCount}</span>
          <span className="flarex-kpi-meta">&gt; 1.5× baseline multiplier</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Avg Persistence</span>
          <span className="flarex-kpi-value text-purple-700">26.4 days</span>
          <span className="flarex-kpi-meta">30-day temporal window</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-2">
        <div className="flex rounded-xl p-1 border bg-[#fff7ed] border-[#fed7aa]">
          {(['all', 'normal', 'abnormal'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`flex-1 py-1 px-2 rounded-lg text-[10.5px] font-bold uppercase transition-all cursor-pointer ${
                filterType === t
                  ? 'bg-[#ea580c] text-white'
                  : 'text-[#7c2d12] hover:text-[#431407]'
              }`}
            >
              {t === 'all' ? `All (${totalPersistentCount})` : t === 'normal' ? `Normal (${normalCount})` : `Abnormal (${abnormalCount})`}
            </button>
          ))}
        </div>

        <div className="search-box !w-full">
          <Search size={14} className="text-[#7c2d12] shrink-0" />
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
        {displayList.map((spot) => {
          const isSelected = selectedHotspot?.id === spot.id;
          const isNormal = spot.status === 'NORMAL';

          return (
            <div
              key={spot.id}
              onClick={() => handleSelect(spot)}
              className={`p-3 rounded-xl border flex flex-col gap-2.5 transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#ea580c] bg-[#ffedd5]'
                  : isNormal
                  ? 'bg-white border-[#fed7aa] hover:bg-[#fff7ed]'
                  : 'border-red-200 bg-red-50/50 hover:bg-red-50'
              }`}
            >
              {/* Top Row: Facility Name & Status Pill */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-[12.5px] font-extrabold leading-snug text-[#431407]">
                    {spot.nearestFacility.name}
                  </h4>
                  <span className="text-[10px] flex items-center gap-1 mt-0.5 font-medium text-[#7c2d12]">
                    <MapPin size={11} className="text-[#ea580c] shrink-0" />
                    {spot.location}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase border shrink-0 ${
                    isNormal
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-red-50 border-red-300 text-red-700'
                  }`}
                >
                  {isNormal ? 'NORMAL' : 'ABNORMAL'}
                </span>
              </div>

              {/* Middle Row: Recurrence & Radiance Comparison */}
              <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl border text-center bg-[#fffbf8] border-[#fed7aa]">
                <div>
                  <span className="text-[9px] block font-semibold text-[#7c2d12]">30-Day Recurrence</span>
                  <span className="font-mono text-[11px] font-bold text-purple-700">
                    {spot.persistenceDays}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] block font-semibold text-[#7c2d12]">Typical FRP</span>
                  <span className="font-mono text-[11px] font-bold text-[#431407]">
                    {spot.baselineFrp} MW
                  </span>
                </div>
                <div>
                  <span className="text-[9px] block font-semibold text-[#7c2d12]">Current FRP</span>
                  <span className={`font-mono text-[11px] font-bold ${isNormal ? 'text-emerald-600' : 'text-red-600'}`}>
                    {spot.frp} MW
                  </span>
                </div>
              </div>

              {/* Bottom: Classification & Multiplier */}
              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#fed7aa] text-[#7c2d12]">
                <span className="font-semibold text-[#431407]">{spot.classification}</span>
                <span className={`font-mono font-bold ${isNormal ? 'text-emerald-600' : 'text-red-600'}`}>
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
