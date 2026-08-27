'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  Flame,
  Crosshair,
  MapPin,
  Clock,
  Satellite,
  Building2,
  Cpu,
  Copy,
  AlertOctagon,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useIntelligence } from '../context/IntelligenceContext';

export const RightIncidentPanel: React.FC = () => {
  const { selectedHotspot, flyToCoords, addToast } = useIntelligence();
  const [activeTab, setActiveTab] = useState<'Overview' | 'History' | 'Context' | 'AI'>('Overview');

  if (!selectedHotspot) {
    return (
      <aside className="w-[380px] h-full glass-panel p-5 flex flex-col justify-center items-center text-center text-slate-400 z-20 shrink-0 select-none border-l border-white/[0.08]">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-400 mb-3">
          <MapPin className="w-6 h-6" />
        </div>
        <h3 className="text-[14px] font-bold text-slate-200">No Incident Selected</h3>
        <p className="text-[11.5px] text-slate-400 mt-1 max-w-[220px]">
          Click any thermal marker on the satellite map to inspect real-time telemetry.
        </p>
      </aside>
    );
  }

  const isCritical = selectedHotspot.severity === 'critical';
  const isHigh = selectedHotspot.severity === 'high';
  const isMedium = selectedHotspot.severity === 'medium';
  const isPersistent = selectedHotspot.classification === 'Persistent Thermal Source' || selectedHotspot.persistenceScore > 50;

  const severityBadgeClass = isCritical
    ? 'bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_12px_rgba(255,77,79,0.3)]'
    : isHigh
    ? 'bg-orange-500/20 border-orange-500/40 text-orange-400 shadow-[0_0_12px_rgba(255,138,61,0.25)]'
    : isPersistent
    ? 'bg-purple-500/20 border-purple-500/40 text-purple-400 shadow-[0_0_12px_rgba(165,110,255,0.25)]'
    : isMedium
    ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400';

  const handleCopyCoords = () => {
    const coordStr = `${selectedHotspot.coordinates[1].toFixed(4)}°N, ${selectedHotspot.coordinates[0].toFixed(4)}°E`;
    navigator.clipboard?.writeText(coordStr);
    addToast(`Coordinates copied: ${coordStr}`, 'success');
  };

  const handleDispatchProtocol = () => {
    addToast(`Emergency Alert Dispatched: Local Fire & State Disaster Authority notified for ${selectedHotspot.name}`, 'warning');
  };

  return (
    <aside className="w-[390px] h-full glass-panel p-4 flex flex-col gap-3.5 z-20 shrink-0 select-none border-l border-white/[0.08] overflow-y-auto relative">
      {/* Top Accent Gradient for Critical Incident Priority */}
      {isCritical && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-orange-500 to-red-500 shadow-[0_0_12px_#FF4D4F]" />
      )}

      {/* 1. Visually Dominant Header Card */}
      <div className={`p-3.5 rounded-2xl transition-all ${isCritical ? 'glass-card-critical' : 'glass-card'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              {isCritical && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isCritical ? 'bg-red-500' : 'bg-cyan-400'}`} />
            </span>
            <span className="text-[10.5px] font-bold text-slate-300 tracking-wider uppercase">
              {isCritical ? 'CRITICAL THERMAL INCIDENT' : 'ACTIVE THERMAL TELEMETRY'}
            </span>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${severityBadgeClass} tracking-wide uppercase`}>
            {selectedHotspot.severity}
          </span>
        </div>

        {/* Incident Name & Classification */}
        <h2 className="text-[16px] font-bold text-white leading-snug mt-2">
          {selectedHotspot.name}
        </h2>

        <div className="flex items-center justify-between text-[11.5px] text-slate-300 mt-1">
          <span className="flex items-center gap-1 text-slate-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            {selectedHotspot.location}
          </span>
          <span className="font-mono text-[10.5px] text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">
            {selectedHotspot.id.split('-').slice(-2).join('-')}
          </span>
        </div>

        {/* Focus on Map & Copy Coordinate Actions */}
        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => flyToCoords(selectedHotspot.coordinates, 8.5, 30)}
            className="flex-1 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-[11.5px] font-semibold flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(56,189,248,0.3)] transition-all cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Focus on Map</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCoords}
            className="py-1.5 px-3 rounded-xl glass-pill text-slate-300 hover:text-white text-[11.5px] font-medium flex items-center gap-1 transition-all cursor-pointer"
            title="Copy Latitude & Longitude"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>GIS</span>
          </button>
        </div>
      </div>

      {/* 2. High-Impact Primary Metric Grid (3-Second Scan) */}
      <div className="grid grid-cols-2 gap-2">
        {/* Fire Radiative Power */}
        <div className="glass-card rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Radiative Power (FRP)</span>
            <Flame className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-[24px] font-black text-red-400 font-mono leading-none">
              {selectedHotspot.frp}
            </span>
            <span className="text-[12px] font-semibold text-slate-400">MW</span>
          </div>
        </div>

        {/* Temperature */}
        <div className="glass-card rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Skin Temp</span>
            <span className="text-[10px] text-amber-400 font-bold bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-500/20">
              THERMAL
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-0.5">
            <span className="text-[24px] font-black text-white font-mono leading-none">
              {selectedHotspot.temperature}
            </span>
            <span className="text-[14px] font-bold text-amber-400">°C</span>
          </div>
        </div>

        {/* AI Confidence with Gauge Bar */}
        <div className="glass-card rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">AI Confidence</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-[22px] font-extrabold text-emerald-400 font-mono leading-none">
              {selectedHotspot.confidence}%
            </span>
            <div className="w-full h-1.5 bg-black/40 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full shadow-[0_0_8px_#20C997]"
                style={{ width: `${selectedHotspot.confidence}%` }}
              />
            </div>
          </div>
        </div>

        {/* Anomaly & Persistence */}
        <div className="glass-card rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Anomaly Index</span>
            <span className="text-[10.5px] font-mono text-purple-300 font-bold">
              {selectedHotspot.persistence}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-[22px] font-black text-yellow-300 font-mono leading-none">
              {selectedHotspot.anomalyScore}
            </span>
            <span className="text-[11px] text-slate-400">/ 10</span>
          </div>
        </div>
      </div>

      {/* 3. Incident Navigation Tabs */}
      <div className="flex rounded-xl glass-dock p-1 border border-white/[0.08]">
        {(['Overview', 'History', 'Context', 'AI'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 rounded-lg text-[11.5px] font-semibold transition-all duration-150 cursor-pointer ${
              activeTab === tab
                ? 'bg-gradient-to-r from-blue-600/80 to-cyan-600/80 text-white shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 4. Tab Content Area */}
      <div className="flex-1 flex flex-col gap-2">
        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <div className="glass-card rounded-2xl p-3.5 flex flex-col gap-2.5">
            <div className="flex justify-between items-center text-[11.5px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5 text-cyan-400" /> Sensor Stream
              </span>
              <span className="text-slate-200 font-medium">{selectedHotspot.satellite}</span>
            </div>
            <div className="flex justify-between items-center text-[11.5px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Detection Time
              </span>
              <span className="text-slate-200 font-mono">{selectedHotspot.timestamp}</span>
            </div>
            <div className="flex justify-between items-center text-[11.5px]">
              <span className="text-slate-400">GIS Coordinates</span>
              <span className="text-cyan-300 font-mono font-medium">
                {selectedHotspot.coordinates[1].toFixed(4)}°N, {selectedHotspot.coordinates[0].toFixed(4)}°E
              </span>
            </div>
            <div className="flex justify-between items-center text-[11.5px]">
              <span className="text-slate-400">Jurisdiction</span>
              <span className="text-slate-200 font-medium">{selectedHotspot.state}</span>
            </div>
            <div className="flex justify-between items-center text-[11.5px] pt-1.5 border-t border-white/[0.06]">
              <span className="text-slate-400">AI Classification</span>
              <span className="text-cyan-400 font-bold">{selectedHotspot.classification}</span>
            </div>
          </div>
        )}

        {/* HISTORY TAB (7-Day FRP Radiative History) */}
        {activeTab === 'History' && (
          <div className="glass-card rounded-2xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-200">7-Day Radiative Power Curve</span>
              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span className="w-2.5 h-0.5 border-t border-dashed border-slate-400" /> Baseline
                </span>
                <span className="flex items-center gap-1 text-[10px] text-red-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#FF4D4F]" /> FRP
                </span>
              </div>
            </div>

            <div className="w-full h-[155px] mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={selectedHotspot.history}
                  margin={{ top: 8, right: 8, left: -22, bottom: 0 }}
                >
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#94A3B8', fontSize: 9 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#94A3B8', fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="glass-panel-elevated p-2 rounded-lg shadow-xl text-[10px] text-white border border-white/20">
                            <p className="text-slate-400 font-medium">{payload[0].payload.date}</p>
                            <p className="text-red-400 font-bold mt-0.5">FRP: {payload[0].value} MW</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={selectedHotspot.history[0]?.baseline || 24}
                    stroke="#64748B"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                  <Line
                    type="monotone"
                    dataKey="frp"
                    stroke="#FF4D4F"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#FF4D4F', stroke: '#FFFFFF', strokeWidth: 1 }}
                    activeDot={{ r: 5, fill: '#FF4D4F', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CONTEXT TAB */}
        {activeTab === 'Context' && (
          <div className="glass-card rounded-2xl p-3.5 flex flex-col gap-2.5">
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nearest Industrial Facility
                </span>
                <p className="text-[13px] font-bold text-white mt-0.5">
                  {selectedHotspot.nearestFacility.name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
              <div>
                <span className="text-[10px] text-slate-400 block">Sector / Category</span>
                <span className="text-[11.5px] font-semibold text-slate-200 mt-0.5 block">
                  {selectedHotspot.nearestFacility.category}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Spatial Proximity</span>
                <span className="text-[12px] font-mono font-bold text-cyan-400 mt-0.5 block">
                  {selectedHotspot.nearestFacility.distance}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex justify-between items-center">
              <span className="text-[11px] text-slate-400">Facility Hazard Rating</span>
              <span className="px-2.5 py-0.5 rounded-full bg-red-950/60 border border-red-500/40 text-[10px] font-bold text-red-400 shadow-[0_0_8px_rgba(255,77,79,0.2)]">
                {selectedHotspot.nearestFacility.hazardRating}
              </span>
            </div>
          </div>
        )}

        {/* AI TAB */}
        {activeTab === 'AI' && (
          <div className="glass-card rounded-2xl p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11.5px] font-bold text-white">AI Classification Rationale</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Validated
              </span>
            </div>
            <ul className="flex flex-col gap-2 text-[12px] text-slate-300">
              {selectedHotspot.aiReasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-snug">
                  <span className="text-cyan-400 mt-0.5 font-bold">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 5. Key Action Button: Emergency Dispatch */}
      {isCritical && (
        <button
          type="button"
          onClick={handleDispatchProtocol}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white text-[12px] font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,77,79,0.4)] border border-red-400/40 transition-all cursor-pointer mt-auto"
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Dispatch Incident Alert Protocol</span>
        </button>
      )}
    </aside>
  );
};
