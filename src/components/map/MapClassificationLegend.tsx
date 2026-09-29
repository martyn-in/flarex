'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Filter } from 'lucide-react';
import { useIntelligence } from '@/context/IntelligenceContext';
import { Hotspot } from '@/types';

export interface ClassLegendItem {
  label: string;
  color: string;
  dotColor: string;
  glow: string;
  filterKey: string;
  match: (h: Hotspot) => boolean;
}

export const CLASS_ITEMS: ClassLegendItem[] = [
  {
    label: 'Industrial Fire',
    color: '#dc2626',
    dotColor: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.65)',
    filterKey: 'industrial_fires',
    match: (h) => h.classification === 'Industrial Fire',
  },
  {
    label: 'Gas Flare',
    color: '#ea580c',
    dotColor: '#f97316',
    glow: 'rgba(249, 115, 22, 0.65)',
    filterKey: 'class_Gas Flare',
    match: (h) => h.classification === 'Gas Flare',
  },
  {
    label: 'Wildfire',
    color: '#16a34a',
    dotColor: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.65)',
    filterKey: 'class_Wildfire',
    match: (h) => h.classification === 'Wildfire',
  },
  {
    label: 'Agricultural Burning',
    color: '#ca8a04',
    dotColor: '#eab308',
    glow: 'rgba(234, 179, 8, 0.65)',
    filterKey: 'class_Agricultural Burning',
    match: (h) => h.classification === 'Agricultural Burning',
  },
  {
    label: 'Mining/Furnace',
    color: '#9333ea',
    dotColor: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.65)',
    filterKey: 'class_Mining/Furnace',
    match: (h) =>
      h.classification === 'Mining / Furnace Activity' ||
      (h.classification as string)?.toLowerCase().includes('mining') ||
      (h.classification as string)?.toLowerCase().includes('furnace'),
  },
];

export const MapClassificationLegend: React.FC = () => {
  const {
    hotspots,
    activeFilter,
    setFilter,
    fitBoundsToHotspots,
    resetMapView,
    addToast,
    theme,
  } = useIntelligence();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const isDark = theme === 'dark';

  const isClassActive = (item: ClassLegendItem) => {
    if (!activeFilter) return false;
    if (item.label === 'Industrial Fire') {
      return (
        activeFilter === 'industrial_fires' ||
        activeFilter === 'Industrial Fire' ||
        activeFilter === 'class_Industrial Fire'
      );
    }
    if (item.label === 'Wildfire') {
      return (
        activeFilter === 'wildfires' ||
        activeFilter === 'Wildfire' ||
        activeFilter === 'class_Wildfire'
      );
    }
    return (
      activeFilter === item.filterKey ||
      activeFilter === item.label ||
      activeFilter === `class_${item.label}`
    );
  };

  const isAllActive =
    !activeFilter ||
    (!CLASS_ITEMS.some(isClassActive) &&
      activeFilter !== 'critical' &&
      activeFilter !== 'persistent' &&
      activeFilter !== 'persistent_sources');

  const handleResetAll = () => {
    setFilter(null);
    resetMapView();
    addToast('Displaying all active thermal hotspot classes', 'info');
  };

  const handleSelectClass = (item: ClassLegendItem) => {
    if (isClassActive(item)) {
      // Toggle off -> reset to all
      handleResetAll();
      return;
    }

    setFilter(item.filterKey);
    const matches = hotspots.filter(item.match);
    if (matches.length > 0) {
      fitBoundsToHotspots(matches);
      addToast(
        `Isolated ${matches.length} ${item.label} incident${matches.length === 1 ? '' : 's'} on radar`,
        'info'
      );
    } else {
      addToast(`No active ${item.label} incidents currently detected`, 'info');
    }
  };

  return (
    <aside
      aria-label="Thermal Event Classifications"
      className={`absolute top-3 right-3 z-20 pointer-events-auto select-none transition-all duration-200 ${
        isCollapsed ? 'w-auto' : 'w-[215px]'
      }`}
    >
      <div
        className={`rounded-2xl p-2.5 border flex flex-col gap-1.5 backdrop-blur-md transition-all duration-200 ${
          isDark
            ? 'bg-[rgba(10,5,3,0.38)] hover:bg-[rgba(14,7,5,0.7)] border-[rgba(255,106,61,0.25)] text-white shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
            : 'bg-[rgba(255,255,255,0.45)] hover:bg-[rgba(255,255,255,0.8)] border-[#cfe0f0]/70 text-[#0c2340] shadow-[0_8px_24px_rgba(12,35,64,0.1)]'
        }`}
      >
        {/* Subtle Header with Collapse Toggle */}
        <div
          className={`flex items-center justify-between pb-1 px-1 border-b cursor-pointer ${
            isDark ? 'border-white/10 text-slate-300' : 'border-[#0c2340]/10 text-[#0c2340]/80'
          }`}
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Click to expand classification legend' : 'Click to collapse'}
        >
          <div className="flex items-center gap-1.5">
            <Filter size={11} className={isDark ? 'text-[#ff7a45]' : 'text-[#0284c7]'} />
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider">
              Classification
            </span>
          </div>
          <button
            type="button"
            className="p-0.5 hover:opacity-100 opacity-70 transition-opacity"
            aria-label={isCollapsed ? 'Expand classifications' : 'Collapse classifications'}
          >
            {isCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </button>
        </div>

        {isCollapsed ? (
          /* Collapsed Mini Summary Pill */
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold border transition-colors cursor-pointer ${
              isDark
                ? 'bg-black/30 border-white/10 hover:bg-black/50 text-slate-200'
                : 'bg-white/40 border-[#cfe0f0]/60 hover:bg-white/70 text-[#0c2340]'
            }`}
          >
            <div className="flex items-center gap-1">
              {CLASS_ITEMS.map((c) => (
                <span
                  key={c.label}
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ backgroundColor: c.dotColor }}
                />
              ))}
            </div>
            <span className="font-mono text-[10px] opacity-80">({hotspots.length})</span>
          </button>
        ) : (
          /* Full Classification Filter Pill Stack */
          <div className="flex flex-col gap-1.5">
            {/* 1. All Classes Option */}
            <button
              type="button"
              onClick={handleResetAll}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all duration-150 cursor-pointer ${
                isAllActive
                  ? 'bg-gradient-to-r from-[#ff5533]/90 to-[#ea580c]/90 border-[#ff7a45] text-white shadow-[0_0_12px_rgba(255,85,45,0.4)] backdrop-blur-xs'
                  : isDark
                  ? 'bg-black/30 border-white/10 text-slate-300 hover:bg-black/50 hover:text-white backdrop-blur-xs'
                  : 'bg-white/40 border-[#cfe0f0]/60 text-[#0c2340] hover:bg-white/75 hover:border-[#93c5fd] backdrop-blur-xs'
              }`}
            >
              <span>All Classes</span>
              <span
                className={`font-mono text-[10px] shrink-0 ${
                  isAllActive ? 'text-white/95 font-black' : isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                ({hotspots.length})
              </span>
            </button>

            {/* 2. Individual Categories with Glowing Color Dots */}
            {CLASS_ITEMS.map((item) => {
              const count = hotspots.filter(item.match).length;
              const isActive = isClassActive(item);

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleSelectClass(item)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'text-white font-bold shadow-md'
                      : isDark
                      ? 'bg-black/30 border-white/10 text-slate-200 hover:bg-black/50 hover:text-white backdrop-blur-xs'
                      : 'bg-white/40 border-[#cfe0f0]/60 text-[#0c2340] hover:bg-white/75 hover:border-[#93c5fd] backdrop-blur-xs'
                  }`}
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(135deg, ${item.color}e6, ${item.dotColor}e6)`,
                          borderColor: item.dotColor,
                          boxShadow: `0 0 14px ${item.glow}`,
                        }
                      : {}
                  }
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Radar Halo Glowing Dot */}
                    <span className="relative flex items-center justify-center shrink-0 w-3.5 h-3.5">
                      <span
                        className="absolute inset-0 rounded-full blur-[2px] opacity-80"
                        style={{ backgroundColor: item.dotColor }}
                      />
                      <span
                        className="relative w-2 h-2 rounded-full border border-white/90"
                        style={{ backgroundColor: item.dotColor }}
                      />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  <span
                    className={`font-mono text-[10px] ml-2 shrink-0 ${
                      isActive
                        ? 'text-white/95 font-bold'
                        : isDark
                        ? 'text-slate-400'
                        : 'text-slate-500'
                    }`}
                  >
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default MapClassificationLegend;
