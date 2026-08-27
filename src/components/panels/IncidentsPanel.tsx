'use client';

import React, { useState } from 'react';
import { Search, Flame, MapPin, Crosshair, Sparkles, Filter } from 'lucide-react';
import { useIntelligence } from '@/context/IntelligenceContext';
import { Hotspot } from '@/data/mockData';

export default function IncidentsPanel() {
  const { hotspots, selectedHotspot, selectHotspot, addToast } = useIntelligence();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'All' | 'Critical' | 'High' | 'Persistent'>('All');

  const filteredIncidents = hotspots.filter((h) => {
    if (filterSeverity === 'Critical' && h.severity !== 'critical') return false;
    if (filterSeverity === 'High' && h.severity !== 'high') return false;
    if (filterSeverity === 'Persistent' && h.classification !== 'Persistent Thermal Source' && h.persistenceScore <= 50) return false;

    if (searchQuery.trim()) {
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

  const handleIncidentClick = (incident: Hotspot) => {
    selectHotspot(incident, true);
    addToast(`Target locked: ${incident.name} (${incident.location})`, incident.severity === 'critical' ? 'warning' : 'info');
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search Input */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d9baa]" />
        <input
          type="text"
          placeholder="Filter incidents by location, SEZ, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl text-[11px] text-white bg-[rgba(255,255,255,0.035)] border border-[rgba(148,163,184,0.14)] focus:border-[#44d7ff] focus:outline-none placeholder-[#6b7a8c] transition-colors"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(['All', 'Critical', 'High', 'Persistent'] as const).map((sev) => {
          const count =
            sev === 'All'
              ? hotspots.length
              : sev === 'Critical'
              ? hotspots.filter((h) => h.severity === 'critical').length
              : sev === 'High'
              ? hotspots.filter((h) => h.severity === 'high').length
              : hotspots.filter((h) => h.classification === 'Persistent Thermal Source' || h.persistenceScore > 50).length;

          const isActive = filterSeverity === sev;

          return (
            <button
              key={sev}
              type="button"
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[rgba(68,215,255,0.15)] border border-[#44d7ff] text-[#44d7ff]'
                  : 'bg-[rgba(255,255,255,0.03)] border border-[rgba(148,163,184,0.12)] text-[#8d9baa] hover:text-white'
              }`}
            >
              <span>{sev}</span>
              <span className="text-[9px] opacity-75 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Incident Feed List */}
      <div className="flarex-status-list mt-1">
        {filteredIncidents.length === 0 ? (
          <div className="py-8 text-center text-[#8d9baa] text-[11px]">
            No thermal incidents matching criteria.
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const isSelected = selectedHotspot?.id === incident.id;
            const isCritical = incident.severity === 'critical';
            const isHigh = incident.severity === 'high';
            const isPersistent = incident.classification === 'Persistent Thermal Source' || incident.persistenceScore > 50;

            let badgeColor = 'text-[#20C997] bg-[rgba(32,201,151,0.1)] border-[rgba(32,201,151,0.25)]';
            if (isCritical) badgeColor = 'text-[#ff505d] bg-[rgba(255,80,93,0.12)] border-[rgba(255,80,93,0.3)] shadow-[0_0_8px_rgba(255,80,93,0.15)]';
            else if (isHigh) badgeColor = 'text-[#ffae42] bg-[rgba(255,174,66,0.12)] border-[rgba(255,174,66,0.3)]';
            else if (isPersistent) badgeColor = 'text-[#c084fc] bg-[rgba(192,132,252,0.12)] border-[rgba(192,132,252,0.3)]';

            return (
              <div
                key={incident.id}
                onClick={() => handleIncidentClick(incident)}
                className={`flarex-status-row !p-3 flex-col !items-stretch gap-2 transition-all ${
                  isSelected
                    ? '!border-[#44d7ff] !bg-[rgba(68,215,255,0.08)] shadow-[0_0_15px_rgba(68,215,255,0.12)]'
                    : isCritical
                    ? 'border-[rgba(255,80,93,0.2)]'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider border ${badgeColor}`}>
                      {incident.severity}
                    </span>
                    <span className="font-mono text-[9.5px] text-[#81909e] truncate">
                      {incident.id.split('-').slice(-2).join('-')}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-[#81909e] shrink-0">
                    {incident.timestamp.split(' ')[1]} IST
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flarex-status-name text-[12px]">{incident.name}</span>
                  <span className="font-mono font-bold text-[12px] text-[#ff505d]">{incident.frp} MW</span>
                </div>

                <div className="flex items-center justify-between text-[9.5px] text-[#81909e] pt-1.5 border-t border-[rgba(255,255,255,0.05)]">
                  <span className="flex items-center gap-1 truncate max-w-[190px]">
                    <MapPin size={11} className="text-[#44d7ff] shrink-0" />
                    {incident.location}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[#31d5a0]">{incident.confidence}% Conf.</span>
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
