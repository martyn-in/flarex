'use client';

import React, { useState } from 'react';
import { Search, Flame, MapPin, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useIntelligence } from '@/context/IntelligenceContext';
import { Hotspot } from '@/types';

const CLASS_DEFS = [
  { label: 'Industrial Fire',     color: '#dc2626', dot: 'bg-red-500' },
  { label: 'Gas Flare',           color: '#ea580c', dot: 'bg-orange-500' },
  { label: 'Wildfire',            color: '#16a34a', dot: 'bg-green-600' },
  { label: 'Agricultural Burning',color: '#ca8a04', dot: 'bg-yellow-600' },
  { label: 'Mining/Furnace',      color: '#9333ea', dot: 'bg-purple-500' },
] as const;

type ClassName = typeof CLASS_DEFS[number]['label'] | 'All' | 'Fires' | 'Abnormal' | 'Critical';

export default function IncidentsPanel() {
  const { hotspots, selectedHotspot, selectHotspot, addToast, formatTemp, theme, flyToCoords } = useIntelligence();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Fires' | 'Abnormal' | 'Critical'>('All');
  const [classFilter, setClassFilter] = useState<string | null>(null);
  const [classExpanded, setClassExpanded] = useState(true);

  const isDark = theme === 'dark';

  const filtered = hotspots.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.eventId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Class filter takes priority over tab filter
    if (classFilter) return h.classification === classFilter;

    if (filterType === 'Fires') return h.classification === 'Industrial Fire';
    if (filterType === 'Abnormal') return h.status === 'ABNORMAL' || h.baselineRatio >= 1.8;
    if (filterType === 'Critical') return h.severity === 'critical';

    return true;
  });

  const handleIncidentClick = (incident: Hotspot) => {
    selectHotspot(incident, true);
    addToast(`Selected Incident ${incident.eventId}: ${incident.name}`, 'info');
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search Input */}
      <div className="relative">
        <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
        <input
          type="text"
          placeholder="Filter by facility, SEZ, or Event ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-9 pr-3 py-2 rounded-xl text-[11px] focus:outline-none transition-colors border ${
            isDark
              ? 'text-white bg-black/40 border-white/10 focus:border-[#ff5533] placeholder-slate-500'
              : 'text-[#0c2340] bg-white border-[#cfe0f0] focus:border-[#0284c7] placeholder-slate-400'
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
                  ? 'bg-[#ff5533] border-[#ff7a45] text-white font-bold shadow-[0_0_8px_rgba(255,85,45,0.35)]'
                  : isDark
                  ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                  : 'bg-white border-[#cfe0f0] text-[#4e6b8c] hover:text-[#0c2340] hover:bg-[#f0f5fa]'
              }`}
            >
              <span>{tab}</span>
              <span className="text-[9px] opacity-80 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Classification Breakdown */}
      <div
        className={`rounded-2xl border overflow-hidden ${
          isDark ? 'border-white/10 bg-white/[0.03]' : 'border-[#cfe0f0] bg-white'
        }`}
      >
        <button
          type="button"
          onClick={() => setClassExpanded((v) => !v)}
          className={`w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
            isDark ? 'text-slate-300 hover:text-white' : 'text-[#4e6b8c] hover:text-[#0c2340]'
          }`}
        >
          <span>Classification</span>
          {classExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {classExpanded && (
          <div className="px-3 pb-3 flex flex-col gap-1.5">
            {/* All classes reset */}
            <button
              type="button"
              onClick={() => { setClassFilter(null); }}
              className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl text-[10px] font-semibold border transition-all cursor-pointer ${
                classFilter === null
                  ? 'bg-[#ff5533] border-[#ff7a45] text-white shadow-[0_0_8px_rgba(255,85,45,0.35)]'
                  : isDark
                  ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                  : 'bg-white border-[#cfe0f0] text-[#4e6b8c] hover:bg-[#f0f5fa] hover:text-[#0c2340]'
              }`}
            >
              <span>All Classes</span>
              <span className="font-mono text-[9px] opacity-80">({hotspots.length})</span>
            </button>

            {CLASS_DEFS.map((cls) => {
              const count = hotspots.filter((h) => h.classification === cls.label).length;
              const isActive = classFilter === cls.label;
              return (
                <button
                  key={cls.label}
                  type="button"
                  onClick={() => {
                    const next = isActive ? null : cls.label;
                    setClassFilter(next);
                    setFilterType('All');
                    if (next) {
                      const matches = hotspots.filter((h) => h.classification === cls.label);
                      if (matches.length > 0) {
                        // Fly to centroid of matched hotspots
                        const avgLng = matches.reduce((s, h) => s + h.coordinates[0], 0) / matches.length;
                        const avgLat = matches.reduce((s, h) => s + h.coordinates[1], 0) / matches.length;
                        const zoom = matches.length === 1 ? 10 : matches.length <= 5 ? 7 : 5;
                        flyToCoords([avgLng, avgLat], zoom, 30);
                        addToast(`Focused: ${matches.length} ${cls.label} event${matches.length > 1 ? 's' : ''}`, 'info');
                      }
                    }
                  }}
                  className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl text-[10px] font-semibold border transition-all cursor-pointer ${
                    isActive
                      ? 'border-transparent text-white'
                      : isDark
                      ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                      : 'bg-white border-[#cfe0f0] text-[#4e6b8c] hover:bg-[#f0f5fa] hover:text-[#0c2340]'
                  }`}
                  style={isActive ? { background: cls.color, borderColor: cls.color, boxShadow: `0 0 10px ${cls.color}55` } : {}}
                >
                  <span className="flex items-center gap-2">
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: cls.color,
                        border: '1.5px solid rgba(255,255,255,0.4)',
                        boxShadow: `0 0 5px ${cls.color}99`,
                        display: 'inline-block',
                        flexShrink: 0,
                      }}
                    />
                    {cls.label}
                  </span>
                  <span className="font-mono text-[9px] opacity-80">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Incidents Table / List */}
      <div className="flarex-status-list mt-1">
        {filtered.length === 0 ? (
          <div className={`py-8 text-center text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            No thermal incidents matching criteria.
          </div>
        ) : (
          filtered.map((incident) => {
            const isSelected = selectedHotspot?.id === incident.id;
            const isCritical = incident.severity === 'critical' || incident.status === 'CRITICAL_FIRE';
            const isAbnormal = incident.status === 'ABNORMAL' || incident.baselineRatio >= 2.0;

            let badgeColor = isDark
              ? 'text-amber-300 bg-amber-500/20 border-amber-500/30'
              : 'text-amber-800 bg-amber-100 border-amber-200';

            if (isCritical) {
              badgeColor = isDark
                ? 'text-red-300 bg-red-500/25 border-red-500/40'
                : 'text-red-700 bg-red-100 border-red-200';
            } else if (isAbnormal) {
              badgeColor = isDark
                ? 'text-orange-300 bg-orange-500/20 border-orange-500/30'
                : 'text-orange-800 bg-orange-100 border-orange-200';
            }

            return (
              <div
                key={incident.id}
                onClick={() => handleIncidentClick(incident)}
                className={`flarex-status-row !p-3 flex-col !items-stretch gap-2 transition-all cursor-pointer rounded-2xl border ${
                  isSelected
                    ? isDark
                      ? '!border-[#ff5533] !bg-[#ff5533]/15 shadow-[0_0_12px_rgba(255,85,45,0.2)]'
                      : '!border-[#0284c7] !bg-[#e0f2fe]'
                    : isCritical
                    ? isDark
                      ? 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10'
                      : 'border-red-200 bg-red-50/40 hover:bg-red-50/70'
                    : isDark
                    ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'
                    : 'border-[#cfe0f0] bg-white hover:bg-[#f8fbfe]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider border ${badgeColor}`}>
                      {incident.severity}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-[#ff7a45]">
                      {incident.eventId}
                    </span>
                    <span className={`text-[10px] font-semibold truncate ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
                      {incident.nearestFacility.name}
                    </span>
                  </div>
                  <span className={`font-mono text-[9px] shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {incident.timestamp.split(' ')[1]} IST
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {isCritical ? (
                      <Flame size={14} className="text-red-400" />
                    ) : (
                      <AlertTriangle size={14} className="text-[#ff7a45]" />
                    )}
                    <span className={`text-[12px] font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{incident.classification}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {incident.baselineRatio >= 1.5 && (
                      <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        isDark ? 'text-red-300 bg-red-500/20 border-red-500/30' : 'text-red-700 bg-red-100 border-red-200'
                      }`}>
                        {incident.baselineRatio}× baseline
                      </span>
                    )}
                    <span className="font-mono font-bold text-[12px] text-red-400">{incident.frp} MW</span>
                  </div>
                </div>

                <div className={`flex items-center justify-between text-[9.5px] pt-1.5 border-t ${
                  isDark ? 'border-white/10 text-slate-400' : 'border-[#cfe0f0] text-slate-600'
                }`}>
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin size={11} className="text-[#ff5533] shrink-0" />
                    {incident.location}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-amber-400">{incident.confidence}% Conf.</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>{formatTemp(incident.temperature)}</span>
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
