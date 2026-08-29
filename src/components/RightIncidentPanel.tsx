'use client';

import React, { useState } from 'react';
import {
  Flame,
  Activity,
  Trees,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertOctagon,
  Copy,
  Crosshair,
  TrendingUp,
  Building2,
  Layers,
  Users,
  Eye,
  Satellite,
  Cpu,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { useIntelligence } from '../context/IntelligenceContext';

export const RightIncidentPanel: React.FC = () => {
  const {
    selectedHotspot,
    flyToCoords,
    addToast,
    isPresentationMode,
  } = useIntelligence();

  const [activeTab, setActiveTab] = useState<
    'Why?' | 'History' | 'AI Probabilities' | 'Sentinel-2' | 'Overview'
  >('Why?');

  if (isPresentationMode || !selectedHotspot) {
    return null;
  }

  const isCritical = selectedHotspot.severity === 'critical';
  const isNormalFlare = selectedHotspot.classification === 'Gas Flare';
  const isWildfire = selectedHotspot.classification === 'Wildfire';

  const severityBadgeClass =
    selectedHotspot.severity === 'critical'
      ? 'bg-red-100 text-red-700 border-red-200'
      : selectedHotspot.severity === 'high'
      ? 'bg-orange-100 text-orange-700 border-orange-200'
      : selectedHotspot.severity === 'medium'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-emerald-100 text-emerald-700 border-emerald-200';

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(
      `${selectedHotspot.coordinates[1]}, ${selectedHotspot.coordinates[0]}`
    );
    addToast('GPS Coordinates copied to clipboard', 'info');
  };

  const handleDispatchProtocol = () => {
    addToast(
      `Emergency Alert Dispatched: Fire & Industrial Safety notified for ${selectedHotspot.name}`,
      'warning'
    );
  };

  return (
    <aside className="w-[390px] h-full glass-panel p-3.5 flex flex-col gap-2.5 z-20 shrink-0 select-none overflow-y-auto relative bg-white border-l border-slate-200 shadow-sm">
      {/* Top Accent Line for Priority */}
      {isCritical && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
      )}

      {/* 1. VISUALLY DOMINANT CLASSIFICATION HEADER */}
      <div
        className={`p-3 rounded-2xl transition-all border ${
          isCritical
            ? 'bg-red-50/70 border-red-200'
            : isNormalFlare
            ? 'bg-emerald-50/60 border-emerald-200'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              {isCritical && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isCritical
                    ? 'bg-red-600'
                    : isNormalFlare
                    ? 'bg-emerald-600'
                    : 'bg-orange-500'
                }`}
              />
            </span>
            <span className="text-[10px] font-extrabold text-slate-600 tracking-wider uppercase">
              {selectedHotspot.classification.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${severityBadgeClass} tracking-wide uppercase`}
            >
              {selectedHotspot.severity}
            </span>
            <span className="font-mono text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              {selectedHotspot.eventId}
            </span>
          </div>
        </div>

        {/* Primary Classification Headline with Confidence */}
        <div className="mt-2 flex items-center justify-between">
          <h2 className="text-[16px] font-black text-slate-900 leading-tight flex items-center gap-1.5">
            {isCritical && <Flame className="w-4.5 h-4.5 text-red-600 shrink-0" />}
            {isWildfire && <Trees className="w-4.5 h-4.5 text-amber-600 shrink-0" />}
            <span>{selectedHotspot.classification}</span>
          </h2>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-700 text-[10.5px] font-bold font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{selectedHotspot.confidence}% AI</span>
          </div>
        </div>

        {/* Baseline Multiple Alert Banner */}
        <div className="mt-1.5">
          {selectedHotspot.baselineRatio >= 2.0 ? (
            <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-red-100 border border-red-300 text-red-800 text-[10.5px] font-bold">
              <TrendingUp className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>{selectedHotspot.baselineRatio}× ABOVE HISTORICAL BASELINE</span>
            </div>
          ) : selectedHotspot.status === 'NORMAL' ? (
            <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10.5px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Normal recurring baseline ({selectedHotspot.baselineRatio}× typical)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-orange-100 border border-orange-300 text-orange-900 text-[10.5px] font-semibold">
              <Activity className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span>{selectedHotspot.baselineRatio}× elevated emission</span>
            </div>
          )}
        </div>

        {/* Spatial, Land-Cover & Population Proximity Summary */}
        <div className="mt-2 pt-2 border-t border-slate-200 flex flex-col gap-1 text-[11px]">
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1 text-slate-500 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              {selectedHotspot.nearestFacility.distance} from {selectedHotspot.nearestFacility.name.split(' ')[0]}
            </span>
            <span className="text-slate-900 font-mono text-[10px] font-bold">
              {selectedHotspot.nearestFacility.distance}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              {selectedHotspot.landCover}
            </span>
            <span className="text-slate-500 font-mono font-medium">{selectedHotspot.state}</span>
          </div>

          {/* Population Proximity Feature */}
          <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-slate-200/60">
            <span className="flex items-center gap-1 text-slate-500">
              <Users className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              Population Proximity
            </span>
            <span className="font-mono text-rose-700 font-bold">
              {selectedHotspot.populationContext?.distanceMeters || 450} m ({selectedHotspot.populationContext?.densityCategory || 'Settlement'})
            </span>
          </div>
        </div>

        {/* Map Focus Action */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={() => flyToCoords(selectedHotspot.coordinates, 8.2, 30)}
            className="flex-1 py-1.5 px-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Focus on Map</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCoords}
            className="py-1.5 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-[10.5px] font-medium flex items-center gap-1 transition-all cursor-pointer shadow-xs"
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
        <div className="bg-white border border-slate-200 rounded-xl p-2 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current FRP</span>
            <Flame className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-[20px] font-black text-red-600 font-mono leading-none">
              {selectedHotspot.frp}
            </span>
            <span className="text-[10px] font-bold text-slate-400">MW</span>
          </div>
        </div>

        {/* Historical Baseline */}
        <div className="bg-white border border-slate-200 rounded-xl p-2 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hist. Baseline</span>
            <Clock className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-[20px] font-black text-slate-800 font-mono leading-none">
              {selectedHotspot.baselineFrp}
            </span>
            <span className="text-[10px] font-bold text-slate-400">MW</span>
          </div>
        </div>

        {/* Multi-Spectral Skin Temperature */}
        <div className="bg-white border border-slate-200 rounded-xl p-2 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Skin Temp (T4)</span>
            <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1 py-0.2 rounded">
              VIIRS
            </span>
          </div>
          <div className="mt-0.5 flex items-baseline gap-0.5">
            <span className="text-[20px] font-black text-slate-900 font-mono leading-none">
              {selectedHotspot.temperature}
            </span>
            <span className="text-[12px] font-bold text-amber-600">°C</span>
          </div>
        </div>

        {/* 30-Day Persistence Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-2 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recurrence</span>
            <span className="text-[9.5px] font-mono text-purple-700 font-bold">
              {selectedHotspot.persistenceDays}
            </span>
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-[20px] font-black text-purple-700 font-mono leading-none">
              {selectedHotspot.persistenceScore}
            </span>
            <span className="text-[10px] font-bold text-slate-400">/ 100</span>
          </div>
        </div>
      </div>

      {/* 3. INVESTIGATION TABS */}
      <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 overflow-x-auto">
        {(['Why?', 'History', 'AI Probabilities', 'Sentinel-2', 'Overview'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1 px-1 rounded-lg text-[10px] font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? 'bg-white text-orange-600 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
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
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col gap-2 shadow-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-orange-600" />
                <span className="text-[11.5px] font-extrabold text-slate-900">
                  Multi-Source Evidence Fusion
                </span>
              </div>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                Verified Rationale
              </span>
            </div>

            <p className="text-[10.5px] text-slate-600 leading-snug">
              Why did FlameX classify this as{' '}
              <strong className="text-slate-900 font-bold">{selectedHotspot.classification}</strong>?
            </p>

            <div className="flex flex-col gap-1.5 mt-0.5">
              {selectedHotspot.aiReasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{reason.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTORY TAB: 7-DAY FRP CURVE WITH BASELINE */}
        {activeTab === 'History' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col gap-1.5 shadow-xs">
            <div className="flex items-center justify-between text-[10.5px]">
              <span className="font-bold text-slate-900">7-Day Radiative Power Curve</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[9px] text-slate-500">
                  <span className="w-2.5 h-0.5 border-t border-dashed border-slate-400" /> Baseline ({selectedHotspot.baselineFrp} MW)
                </span>
                <span className="flex items-center gap-1 text-[9px] text-red-600 font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-600" /> FRP
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
                    tick={{ fill: '#64748B', fontSize: 9 }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 rounded-lg shadow-md text-[10px] text-slate-900 border border-slate-200">
                            <p className="text-slate-500 font-medium">{payload[0].payload.date}</p>
                            <p className="text-red-600 font-bold mt-0.5">FRP: {payload[0].value} MW</p>
                            <p className="text-slate-600 mt-0.5">Baseline: {payload[0].payload.baseline} MW</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={selectedHotspot.baselineFrp}
                    stroke="#94A3B8"
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="frp"
                    stroke="#DC2626"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#DC2626', stroke: '#FFFFFF', strokeWidth: 1 }}
                    activeDot={{ r: 5, fill: '#DC2626', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* AI PROBABILITIES TAB */}
        {activeTab === 'AI Probabilities' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col gap-2 shadow-xs">
            <span className="text-[10.5px] font-bold text-slate-800">
              6-Class AI Classifier Output Distribution
            </span>

            <div className="flex flex-col gap-1.5 mt-0.5">
              {[
                { label: 'Industrial Fire', val: selectedHotspot.probabilities.industrialFire, color: 'bg-red-500' },
                { label: 'Gas Flare', val: selectedHotspot.probabilities.gasFlare, color: 'bg-orange-500' },
                { label: 'Wildfire', val: selectedHotspot.probabilities.wildfire, color: 'bg-amber-500' },
                { label: 'Agricultural Burn', val: selectedHotspot.probabilities.agriculturalBurn, color: 'bg-yellow-500' },
                { label: 'Mining / Furnace', val: selectedHotspot.probabilities.mining, color: 'bg-purple-500' },
                { label: 'Unknown / Ambiguous', val: selectedHotspot.probabilities.unknown, color: 'bg-slate-400' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-700 font-medium">{item.label}</span>
                    <span className="font-mono font-bold text-slate-900">{item.val}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
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

        {/* SENTINEL-2 OPTICAL IMAGERY TAB */}
        {activeTab === 'Sentinel-2' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col gap-2 shadow-xs">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5 text-slate-700" />
                <span className="text-[11px] font-bold text-slate-900">Sentinel-2 MSI Optical Verification</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200 font-bold">
                10m Resol.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9px] text-slate-500 block">Sentinel Tile</span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedHotspot.sentinelImagery?.tileId || 'T43QBC'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9px] text-slate-500 block">Cloud Cover</span>
                <span className="font-mono font-bold text-emerald-700">
                  {selectedHotspot.sentinelImagery?.cloudCoverPct || 1.8}% (Clear)
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-[10.5px]">
              <div className="flex items-center gap-1 font-bold text-orange-950 mb-0.5">
                <Eye size={13} className="text-orange-600" />
                <span>Visual Optical Verification</span>
              </div>
              <p className="leading-snug text-slate-700">
                Multi-spectral true-color bands (B04, B03, B02) show localized smoke plume displacement over industrial structure.
              </p>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col gap-1.5 shadow-xs">
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5 text-slate-600" /> Sensor Stream
              </span>
              <span className="text-slate-800 font-semibold">{selectedHotspot.satellite}</span>
            </div>
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> Detection Time
              </span>
              <span className="text-slate-800 font-mono font-semibold">{selectedHotspot.timestamp}</span>
            </div>
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-slate-500">GIS Coordinates</span>
              <span className="text-slate-900 font-mono font-bold">
                {selectedHotspot.coordinates[1].toFixed(4)}°N, {selectedHotspot.coordinates[0].toFixed(4)}°E
              </span>
            </div>
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-slate-500">Land Cover</span>
              <span className="text-slate-800 font-semibold">{selectedHotspot.landCover}</span>
            </div>
            <div className="flex justify-between items-center text-[10.5px] pt-1 border-t border-slate-200">
              <span className="text-slate-500">Facility Proximity</span>
              <span className="text-slate-900 font-bold">{selectedHotspot.nearestFacility.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. EMERGENCY DISPATCH ACTION BUTTON */}
      {isCritical && (
        <button
          type="button"
          onClick={handleDispatchProtocol}
          className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11.5px] font-bold flex items-center justify-center gap-2 shadow-sm border border-red-700 transition-all cursor-pointer mt-auto"
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Dispatch Incident Alert Protocol</span>
        </button>
      )}
    </aside>
  );
};

export default RightIncidentPanel;
