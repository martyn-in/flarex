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
  CheckCircle2,
  Layers,
  Trees,
  TrendingUp,
  Activity,
  Users,
  Eye,
} from 'lucide-react';
import { useIntelligence } from '../context/IntelligenceContext';

export const RightIncidentPanel: React.FC = () => {
  const { selectedHotspot, flyToCoords, addToast } = useIntelligence();
  const [activeTab, setActiveTab] = useState<'Why?' | 'History' | 'AI Probabilities' | 'Sentinel-2' | 'Overview'>('Why?');

  if (!selectedHotspot) {
    return (
      <aside className="w-[390px] h-full glass-panel p-5 flex flex-col justify-center items-center text-center text-slate-400 z-20 shrink-0 select-none border-l border-white/[0.08]">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-400 mb-3">
          <MapPin className="w-6 h-6" />
        </div>
        <h3 className="text-[14px] font-bold text-slate-200">No Thermal Event Selected</h3>
        <p className="text-[11.5px] text-slate-400 mt-1 max-w-[240px]">
          Click any thermal marker on the satellite map to inspect real-time AI classification &amp; geospatial evidence.
        </p>
      </aside>
    );
  }

  const isCritical = selectedHotspot.severity === 'critical' || selectedHotspot.status === 'CRITICAL_FIRE';
  const isHigh = selectedHotspot.severity === 'high' || selectedHotspot.status === 'ABNORMAL';
  const isNormalFlare = selectedHotspot.classification === 'Gas Flare' && selectedHotspot.status === 'NORMAL';
  const isWildfire = selectedHotspot.classification === 'Wildfire';

  const severityBadgeClass = isCritical
    ? 'bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_12px_rgba(255,77,79,0.3)]'
    : isHigh
    ? 'bg-orange-500/20 border-orange-500/40 text-orange-400 shadow-[0_0_12px_rgba(255,138,61,0.25)]'
    : isNormalFlare
    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
    : 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300';

  const handleCopyCoords = () => {
    const coordStr = `${selectedHotspot.coordinates[1].toFixed(4)}°N, ${selectedHotspot.coordinates[0].toFixed(4)}°E`;
    navigator.clipboard?.writeText(coordStr);
    addToast(`Coordinates copied: ${coordStr}`, 'success');
  };

  const handleDispatchProtocol = () => {
    addToast(`Emergency Alert Dispatched: Fire & Industrial Safety notified for ${selectedHotspot.name}`, 'warning');
  };

  return (
    <aside className="w-[390px] h-full glass-panel p-3.5 flex flex-col gap-2.5 z-20 shrink-0 select-none border-l border-white/[0.08] overflow-y-auto relative">
      {/* Top Accent Line for Priority */}
      {isCritical && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 via-orange-500 to-red-500 shadow-[0_0_14px_#FF4D4F]" />
      )}

      {/* 1. VISUALLY DOMINANT CLASSIFICATION HEADER */}
      <div className={`p-3 rounded-2xl transition-all ${isCritical ? 'glass-card-critical' : 'glass-card'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              {isCritical && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isCritical ? 'bg-red-500' : isNormalFlare ? 'bg-emerald-400' : 'bg-orange-400'}`} />
            </span>
            <span className="text-[10px] font-bold text-slate-300 tracking-wider uppercase">
              {selectedHotspot.classification.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${severityBadgeClass} tracking-wide uppercase`}>
              {selectedHotspot.severity}
            </span>
            <span className="font-mono text-[10px] text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.08]">
              {selectedHotspot.eventId}
            </span>
          </div>
        </div>

        {/* Primary Classification Headline with Confidence */}
        <div className="mt-2 flex items-center justify-between">
          <h2 className="text-[16px] font-black text-white leading-tight flex items-center gap-1.5">
            {isCritical && <Flame className="w-4.5 h-4.5 text-red-500 shrink-0" />}
            {isWildfire && <Trees className="w-4.5 h-4.5 text-amber-500 shrink-0" />}
            <span>{selectedHotspot.classification}</span>
          </h2>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[10.5px] font-bold font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{selectedHotspot.confidence}% AI</span>
          </div>
        </div>

        {/* Baseline Multiple Alert Banner */}
        <div className="mt-1.5">
          {selectedHotspot.baselineRatio >= 2.0 ? (
            <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-red-950/70 border border-red-500/40 text-red-300 text-[10.5px] font-bold shadow-[0_0_10px_rgba(255,77,79,0.2)]">
              <TrendingUp className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>{selectedHotspot.baselineRatio}× ABOVE HISTORICAL BASELINE</span>
            </div>
          ) : selectedHotspot.status === 'NORMAL' ? (
            <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-[10.5px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Normal recurring baseline ({selectedHotspot.baselineRatio}× typical)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-orange-950/60 border border-orange-500/30 text-orange-300 text-[10.5px] font-semibold">
              <Activity className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>{selectedHotspot.baselineRatio}× elevated emission</span>
            </div>
          )}
        </div>

        {/* Spatial, Land-Cover & Population Proximity Summary */}
        <div className="mt-2 pt-2 border-t border-white/[0.08] flex flex-col gap-1 text-[11px]">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1 text-slate-400 font-medium">
              <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              {selectedHotspot.nearestFacility.distance} from {selectedHotspot.nearestFacility.name.split(' ')[0]}
            </span>
            <span className="text-cyan-300 font-mono text-[10px]">
              {selectedHotspot.nearestFacility.distance}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              {selectedHotspot.landCover}
            </span>
            <span className="text-slate-400 font-mono">{selectedHotspot.state}</span>
          </div>

          {/* 👥 Population Proximity Feature */}
          <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-white/[0.04]">
            <span className="flex items-center gap-1 text-slate-400">
              <Users className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              Population Proximity
            </span>
            <span className="font-mono text-rose-300 font-bold">
              {selectedHotspot.populationContext?.distanceMeters || 450} m ({selectedHotspot.populationContext?.densityCategory || 'Settlement'})
            </span>
          </div>
        </div>

        {/* Map Focus Action */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => flyToCoords(selectedHotspot.coordinates, 8.2, 30)}
            className="flex-1 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(56,189,248,0.3)] transition-all cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Focus on Map</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCoords}
            className="py-1.5 px-3 rounded-xl glass-pill text-slate-300 hover:text-white text-[10.5px] font-medium flex items-center gap-1 transition-all cursor-pointer"
            title="Copy GIS Coordinates"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>GIS</span>
          </button>
        </div>
      </div>

      {/* 2. PRIMARY TELEMETRY METRIC GRID */}
      <div className="grid grid-cols-2 gap-1.5">
        {/* Current FRP */}
        <div className="glass-card rounded-xl p-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-slate-400">Current FRP</span>
            <Flame className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-[20px] font-black text-red-400 font-mono leading-none">
              {selectedHotspot.frp}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">MW</span>
          </div>
        </div>

        {/* Historical Baseline */}
        <div className="glass-card rounded-xl p-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-slate-400">Hist. Baseline</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-[20px] font-black text-cyan-300 font-mono leading-none">
              {selectedHotspot.baselineFrp}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">MW</span>
          </div>
        </div>

        {/* Multi-Spectral Skin Temperature */}
        <div className="glass-card rounded-xl p-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-slate-400">Skin Temp (T4)</span>
            <span className="text-[9px] font-bold text-amber-400 bg-amber-950/40 px-1 py-0.2 rounded">
              VIIRS
            </span>
          </div>
          <div className="mt-0.5 flex items-baseline gap-0.5">
            <span className="text-[20px] font-black text-white font-mono leading-none">
              {selectedHotspot.temperature}
            </span>
            <span className="text-[12px] font-bold text-amber-400">°C</span>
          </div>
        </div>

        {/* 30-Day Persistence Score */}
        <div className="glass-card rounded-xl p-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-slate-400">Recurrence</span>
            <span className="text-[9.5px] font-mono text-purple-300 font-bold">
              {selectedHotspot.persistenceDays}
            </span>
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-[20px] font-black text-purple-400 font-mono leading-none">
              {selectedHotspot.persistenceScore}
            </span>
            <span className="text-[10px] text-slate-400">/ 100</span>
          </div>
        </div>
      </div>

      {/* 3. INVESTIGATION TABS */}
      <div className="flex rounded-xl glass-dock p-1 border border-white/[0.08] overflow-x-auto">
        {(['Why?', 'History', 'AI Probabilities', 'Sentinel-2', 'Overview'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1 px-1 rounded-lg text-[10px] font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? 'bg-gradient-to-r from-blue-600/80 to-cyan-600/80 text-white shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 4. TAB CONTENTS */}
      <div className="flex-1 flex flex-col gap-2">
        {/* WHY? EXPLAINABILITY TAB (THE HERO FEATURE) */}
        {activeTab === 'Why?' && (
          <div className="glass-card rounded-2xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11.5px] font-bold text-white">
                  Multi-Source Evidence Fusion
                </span>
              </div>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Verified Rationale
              </span>
            </div>

            <p className="text-[10.5px] text-slate-400 leading-snug">
              Why did FlameX classify this as{' '}
              <strong className="text-white">{selectedHotspot.classification}</strong>?
            </p>

            <div className="flex flex-col gap-1.5 mt-0.5">
              {selectedHotspot.aiReasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{reason.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTORY TAB: 7-DAY FRP CURVE WITH BASELINE */}
        {activeTab === 'History' && (
          <div className="glass-card rounded-2xl p-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10.5px]">
              <span className="font-bold text-slate-200">7-Day Radiative Power Curve</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[9px] text-slate-400">
                  <span className="w-2.5 h-0.5 border-t border-dashed border-slate-400" /> Baseline ({selectedHotspot.baselineFrp} MW)
                </span>
                <span className="flex items-center gap-1 text-[9px] text-red-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#FF4D4F]" /> FRP
                </span>
              </div>
            </div>

            <div className="w-full h-[145px] mt-1">
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
                            <p className="text-slate-400 mt-0.5">Baseline: {payload[0].payload.baseline} MW</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={selectedHotspot.baselineFrp}
                    stroke="#38BDF8"
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
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

        {/* AI PROBABILITIES TAB */}
        {activeTab === 'AI Probabilities' && (
          <div className="glass-card rounded-2xl p-3 flex flex-col gap-2">
            <span className="text-[10.5px] font-bold text-slate-300">
              6-Class AI Classifier Output Distribution
            </span>

            <div className="flex flex-col gap-1.5 mt-0.5">
              {[
                { label: 'Industrial Fire', val: selectedHotspot.probabilities.industrialFire, color: 'bg-red-500' },
                { label: 'Gas Flare', val: selectedHotspot.probabilities.gasFlare, color: 'bg-orange-500' },
                { label: 'Wildfire', val: selectedHotspot.probabilities.wildfire, color: 'bg-amber-500' },
                { label: 'Agricultural Burn', val: selectedHotspot.probabilities.agriculturalBurn, color: 'bg-yellow-500' },
                { label: 'Mining / Furnace', val: selectedHotspot.probabilities.mining, color: 'bg-purple-500' },
                { label: 'Unknown / Ambiguous', val: selectedHotspot.probabilities.unknown, color: 'bg-slate-500' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="font-mono font-bold text-white">{item.val}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-300`}
                      style={{ width: `${item.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🛰️ SENTINEL-2 OPTICAL IMAGERY TAB */}
        {activeTab === 'Sentinel-2' && (
          <div className="glass-card rounded-2xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-bold text-white">Sentinel-2 MSI Optical Verification</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                10m Resol.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-300">
              <div className="p-2 rounded-xl bg-black/30 border border-white/[0.06]">
                <span className="text-[9px] text-slate-400 block">Sentinel Tile</span>
                <span className="font-mono font-bold text-cyan-300">
                  {selectedHotspot.sentinelImagery?.tileId || 'T43QBC'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-black/30 border border-white/[0.06]">
                <span className="text-[9px] text-slate-400 block">Cloud Cover</span>
                <span className="font-mono font-bold text-emerald-400">
                  {selectedHotspot.sentinelImagery?.cloudCoverPct || 1.8}% (Clear)
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[10.5px] text-cyan-200">
              <div className="flex items-center gap-1 font-bold text-white mb-0.5">
                <Eye size={13} className="text-cyan-400" />
                <span>Visual Optical Verification</span>
              </div>
              <p className="leading-snug text-slate-300">
                Multi-spectral true-color bands (B04, B03, B02) show localized smoke plume displacement over industrial structure.
              </p>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <div className="glass-card rounded-2xl p-3 flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5 text-cyan-400" /> Sensor Stream
              </span>
              <span className="text-slate-200 font-medium">{selectedHotspot.satellite}</span>
            </div>
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Detection Time
              </span>
              <span className="text-slate-200 font-mono">{selectedHotspot.timestamp}</span>
            </div>
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-slate-400">GIS Coordinates</span>
              <span className="text-cyan-300 font-mono font-medium">
                {selectedHotspot.coordinates[1].toFixed(4)}°N, {selectedHotspot.coordinates[0].toFixed(4)}°E
              </span>
            </div>
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-slate-400">Land Cover</span>
              <span className="text-slate-200 font-medium">{selectedHotspot.landCover}</span>
            </div>
            <div className="flex justify-between items-center text-[10.5px] pt-1 border-t border-white/[0.06]">
              <span className="text-slate-400">Facility Proximity</span>
              <span className="text-white font-bold">{selectedHotspot.nearestFacility.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. EMERGENCY DISPATCH ACTION BUTTON */}
      {isCritical && (
        <button
          type="button"
          onClick={handleDispatchProtocol}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white text-[11.5px] font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,77,79,0.4)] border border-red-400/40 transition-all cursor-pointer mt-auto"
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Dispatch Incident Alert Protocol</span>
        </button>
      )}
    </aside>
  );
};

export default RightIncidentPanel;
