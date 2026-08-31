'use client';

import React, { useState } from 'react';
import { Search, Flame, MapPin, TrendingUp, AlertTriangle } from 'lucide-react';
import { useIntelligence } from '@/context/IntelligenceContext';
import { Hotspot } from '@/types';

export default function IncidentsPanel() {
  const { hotspots, selectedHotspot, selectHotspot, addToast, theme } = useIntelligence();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Fires' | 'Abnormal' | 'Critical'>('All');

  const filtered = hotspots.filter((h) => {
    if (filterType === 'Fires' && h.classification !== 'Industrial Fire') return false;
    if (filterType === 'Abnormal' && h.status !== 'ABNORMAL' && h.baselineRatio < 1.8) return false;
    if (filterType === 'Critical' && h.severity !== 'critical' && h.status !== 'CRITICAL_FIRE') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        h.name.toLowerCase().includes(q) ||
        h.location.toLowerCase().includes(q) ||
        h.eventId.toLowerCase().includes(q) ||
        h.state.toLowerCase().includes(q) ||
        h.classification.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleIncidentClick = (incident: Hotspot) => {
    selectHotspot(incident, true);
    addToast(`Target locked: ${incident.name} (${incident.location})`, incident.severity === 'critical' ? 'warning' : 'info');
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search Input */}
      <div className="relative">
        <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-[#a3928c]' : 'text-slate-400'}`} />
        <input
          type="text"
          placeholder="Filter by facility, SEZ, or Event ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-9 pr-3 py-2 rounded-xl text-[11px] focus:outline-none transition-colors border ${
            theme === 'dark'
              ? 'text-white bg-[rgba(255,90,45,0.04)] border-[rgba(255,106,61,0.2)] focus:border-[#ff5a3c] placeholder-[#7d6e68]'
              : 'text-[#261006] bg-[#fff7ed] border-[#fed7aa] focus:border-[#ea580c] placeholder-[#9a3412]'
          }`}
        />
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(['All', 'Fires', 'Abnormal', 'Critical'] as const).map((tab) => {
          const count =
            tab === 'All'
              ? hotspots.length
              : tab === 'Fires'
              ? hotspots.filter((h) => h.classification === 'Industrial Fire').length
              : tab === 'Abnormal'
              ? hotspots.filter((h) => h.status === 'ABNORMAL' || h.baselineRatio >= 1.8).length
              : hotspots.filter((h) => h.severity === 'critical').length;

          const isActive = filterType === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterType(tab)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isActive
                  ? theme === 'dark'
                    ? 'bg-[rgba(255,90,45,0.18)] border-[#ff5a3c] text-[#ff7a45] shadow-[0_0_10px_rgba(255,90,60,0.25)]'
                    : 'bg-[#ffedd5] border-[#ea580c] text-[#c2410c] font-bold shadow-xs'
                  : theme === 'dark'
                  ? 'bg-[rgba(255,90,45,0.04)] border-[rgba(255,106,61,0.15)] text-[#a3928c] hover:text-white'
                  : 'bg-white border-[#fed7aa] text-[#7c2d12] hover:text-[#ea580c] hover:bg-[#ffedd5]'
              }`}
            >
              <span>{tab}</span>
              <span className="text-[9px] opacity-80 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Incidents Table / List */}
      <div className="flarex-status-list mt-1">
        {filtered.length === 0 ? (
          <div className={`py-8 text-center text-[11px] ${theme === 'dark' ? 'text-[#a3928c]' : 'text-[#7c2d12]'}`}>
            No thermal incidents matching criteria.
          </div>
        ) : (
          filtered.map((incident) => {
            const isSelected = selectedHotspot?.id === incident.id;
            const isCritical = incident.severity === 'critical' || incident.status === 'CRITICAL_FIRE';
            const isAbnormal = incident.status === 'ABNORMAL' || incident.baselineRatio >= 2.0;

            let badgeColor =
              theme === 'dark'
                ? 'text-[#ffa940] bg-[rgba(255,169,64,0.12)] border-[rgba(255,169,64,0.3)]'
                : 'text-amber-700 bg-amber-100 border-amber-200';

            if (isCritical) {
              badgeColor =
                theme === 'dark'
                  ? 'text-[#ff4949] bg-[rgba(255,73,73,0.15)] border-[rgba(255,73,73,0.35)] shadow-[0_0_8px_rgba(255,73,73,0.25)]'
                  : 'text-red-700 bg-red-100 border-red-200';
            } else if (isAbnormal) {
              badgeColor =
                theme === 'dark'
                  ? 'text-[#ff8a42] bg-[rgba(255,138,66,0.14)] border-[rgba(255,138,66,0.35)]'
                  : 'text-orange-700 bg-orange-100 border-orange-200';
            }

            return (
              <div
                key={incident.id}
                onClick={() => handleIncidentClick(incident)}
                className={`flarex-status-row !p-3 flex-col !items-stretch gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? theme === 'dark'
                      ? '!border-[#ff5a3c] !bg-[rgba(255,90,45,0.14)] shadow-[0_0_15px_rgba(255,90,60,0.25)]'
                      : '!border-[#ea580c] !bg-[#ffedd5] shadow-xs'
                    : isCritical
                    ? theme === 'dark'
                      ? 'border-[rgba(255,73,73,0.28)] hover:bg-white/[0.04]'
                      : 'border-red-200 hover:bg-red-50/50'
                    : theme === 'dark'
                    ? 'hover:bg-white/[0.04]'
                    : 'hover:bg-[#ffedd5]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider border ${badgeColor}`}>
                      {incident.severity}
                    </span>
                    <span className={`font-mono text-[10px] font-bold ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-700'}`}>
                      {incident.eventId}
                    </span>
                    <span className={`text-[10px] font-semibold truncate ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                      {incident.nearestFacility.name}
                    </span>
                  </div>
                  <span className={`font-mono text-[9px] shrink-0 ${theme === 'dark' ? 'text-[#8c766e]' : 'text-slate-400'}`}>
                    {incident.timestamp.split(' ')[1]} IST
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {isCritical ? (
                      <Flame size={14} className="text-red-500" />
                    ) : (
                      <AlertTriangle size={14} className="text-orange-500" />
                    )}
                    <span className="flarex-status-name text-[12px]">{incident.classification}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {incident.baselineRatio >= 1.5 && (
                      <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        theme === 'dark'
                          ? 'text-red-400 bg-red-950/60 border-red-500/20'
                          : 'text-red-700 bg-red-100 border-red-200'
                      }`}>
                        {incident.baselineRatio}× baseline
                      </span>
                    )}
                    <span className={`font-mono font-bold text-[12px] ${theme === 'dark' ? 'text-[#ff505d]' : 'text-red-600'}`}>{incident.frp} MW</span>
                  </div>
                </div>

                <div className={`flex items-center justify-between text-[9.5px] pt-1.5 border-t ${
                  theme === 'dark' ? 'border-[rgba(255,106,61,0.08)] text-[#8c766e]' : 'border-[#fed7aa] text-[#7c2d12]'
                }`}>
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin size={11} className={`${theme === 'dark' ? 'text-[#ff7a45]' : 'text-[#ea580c]'} shrink-0`} />
                    {incident.location}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className={theme === 'dark' ? 'text-[#ffa940]' : 'text-amber-700'}>{incident.confidence}% Conf.</span>
                    <span>{incident.temperature}°C</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export { IncidentsPanel };
