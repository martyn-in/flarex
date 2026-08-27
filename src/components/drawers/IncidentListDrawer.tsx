'use client';

import React, { useState } from 'react';
import { X, Search, Flame, Clock, Crosshair, MapPin } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';

export const IncidentListDrawer: React.FC = () => {
  const { activeDrawer, closeDrawer, selectHotspot, selectedHotspot, hotspots } = useIntelligence();
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'All' | 'Critical' | 'High' | 'Persistent'>('All');

  if (activeDrawer !== 'incidents') return null;

  const filteredIncidents = hotspots.filter((h) => {
    // Filter by category
    if (severityFilter === 'Critical' && h.severity !== 'critical') return false;
    if (severityFilter === 'High' && h.severity !== 'high') return false;
    if (severityFilter === 'Persistent' && h.classification !== 'Persistent Thermal Source' && h.persistenceScore <= 50) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        h.name.toLowerCase().includes(q) ||
        h.location.toLowerCase().includes(q) ||
        h.id.toLowerCase().includes(q) ||
        h.state.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-40 flex pointer-events-auto select-none animate-in fade-in duration-200">
      {/* Subtle backdrop */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-black/40 backdrop-blur-[3px] cursor-pointer"
      />

      {/* Glass Drawer */}
      <aside className="relative w-[440px] max-w-[90vw] h-full glass-panel-elevated p-4 flex flex-col gap-3 shadow-2xl z-50 border-r border-white/[0.12] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[13px] font-bold text-white tracking-wider uppercase">
                Active Incidents Directory
              </span>
              <span className="text-[10px] text-slate-400 block">{filteredIncidents.length} Telemetry Hotspots</span>
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

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search incident, SEZ facility, jurisdiction..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/30 border border-white/[0.1] text-white text-[12px] placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/40 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5">
          {(['All', 'Critical', 'High', 'Persistent'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setSeverityFilter(filter)}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-150 cursor-pointer ${
                severityFilter === filter
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_12px_rgba(56,189,248,0.3)] border border-cyan-400/40'
                  : 'glass-pill text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Incidents List Cards */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 mt-1">
          {filteredIncidents.map((spot) => {
            const isSelected = selectedHotspot?.id === spot.id;
            const isCrit = spot.severity === 'critical';
            const isHigh = spot.severity === 'high';
            const isPersist = spot.classification === 'Persistent Thermal Source' || spot.persistenceScore > 50;

            const badgeColor = isCrit
              ? 'bg-red-500/20 border-red-500/40 text-red-400'
              : isPersist
              ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
              : isHigh
              ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
              : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400';

            return (
              <div
                key={spot.id}
                onClick={() => {
                  selectHotspot(spot, true);
                  closeDrawer();
                }}
                className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-white/[0.08] border-cyan-400/60 shadow-[0_0_18px_rgba(56,189,248,0.25)]'
                    : isCrit
                    ? 'glass-card-critical'
                    : 'glass-card'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-extrabold border ${badgeColor} uppercase tracking-wider`}>
                    {spot.severity}
                  </span>
                  <span className="text-[10.5px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {spot.timestamp.split(' ')[1]} IST
                  </span>
                </div>

                {/* Name & Location */}
                <h4 className="text-[13.5px] font-bold text-white mt-1.5 leading-snug">
                  {spot.name}
                </h4>
                <p className="text-[11.5px] text-slate-300 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                  {spot.location}
                </p>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/[0.06] text-[11px]">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Radiance</span>
                    <span className="font-bold text-red-400 font-mono">{spot.frp} MW</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Confidence</span>
                    <span className="font-bold text-emerald-400 font-mono">{spot.confidence}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Temperature</span>
                    <span className="font-bold text-white font-mono">{spot.temperature}°C</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
};
