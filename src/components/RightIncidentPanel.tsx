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
  ShieldAlert,
  Radio,
  Wind,
  FileCheck,
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
    theme,
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
      ? theme === 'dark'
        ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_10px_rgba(255,77,79,0.3)]'
        : 'bg-red-100 text-red-700 border-red-200'
      : selectedHotspot.severity === 'high'
      ? theme === 'dark'
        ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-[0_0_10px_rgba(255,138,61,0.25)]'
        : 'bg-orange-100 text-orange-700 border-orange-200'
      : selectedHotspot.severity === 'medium'
      ? theme === 'dark'
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        : 'bg-amber-100 text-amber-800 border-amber-200'
      : theme === 'dark'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
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
    <aside className={`w-[390px] h-full right-panel p-3.5 flex flex-col gap-2.5 z-20 shrink-0 select-none overflow-y-auto relative ${theme === 'dark' ? 'border-l border-[rgba(255,106,61,0.2)]' : 'bg-white border-l border-[#cfe0f0] shadow-sm'}`}>
      {/* Top Accent Line for Priority */}
      {isCritical && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 via-orange-500 to-red-500 shadow-[0_0_12px_#ff4d4f]" />
      )}

      {/* 1. VISUALLY DOMINANT CLASSIFICATION HEADER */}
      <div
        className={`p-3 rounded-2xl transition-all border ${
          isCritical
            ? theme === 'dark'
              ? 'bg-[rgba(255,59,48,0.15)] border-red-500/40 shadow-[0_0_20px_rgba(255,59,48,0.15)]'
              : 'bg-red-50/70 border-red-200'
            : isNormalFlare
            ? theme === 'dark'
              ? 'bg-[rgba(32,201,151,0.1)] border-emerald-500/30'
              : 'bg-emerald-50/60 border-emerald-200'
            : theme === 'dark'
            ? 'bg-[rgba(255,85,45,0.1)] border-[rgba(255,106,61,0.25)]'
            : 'bg-[#fff7ed] border-[#fed7aa]'
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
                    ? 'bg-red-500'
                    : isNormalFlare
                    ? 'bg-emerald-500'
                    : 'bg-[#ff7a45]'
                }`}
              />
            </span>
            <span className={`text-[10px] font-extrabold tracking-wider uppercase ${theme === 'dark' ? 'text-[#d1b8af]' : 'text-[#3b5677]'}`}>
              {selectedHotspot.classification.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${severityBadgeClass} tracking-wide uppercase`}
            >
              {selectedHotspot.severity}
            </span>
            <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border ${
              theme === 'dark'
                ? 'text-[#d1b8af] bg-white/[0.04] border-white/10'
                : 'text-[#3b5677] bg-white border-[#cfe0f0]'
            }`}>
              {selectedHotspot.eventId}
            </span>
          </div>
        </div>

        {/* Primary Classification Headline with Confidence */}
        <div className="mt-2 flex items-center justify-between">
          <h2 className={`text-[16px] font-black leading-tight flex items-center gap-1.5 ${theme === 'dark' ? 'text-white' : 'text-[#0c2340]'}`}>
            {isCritical && <Flame className="w-4.5 h-4.5 text-red-500 shrink-0" />}
            {isWildfire && <Trees className="w-4.5 h-4.5 text-amber-500 shrink-0" />}
            <span>{selectedHotspot.classification}</span>
          </h2>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-bold font-mono border ${
            theme === 'dark'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400'
              : 'bg-emerald-50 border-emerald-300 text-emerald-700'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{selectedHotspot.confidence}% AI</span>
          </div>
        </div>

        {/* Baseline Multiple Alert Banner */}
        <div className="mt-1.5">
          {selectedHotspot.baselineRatio >= 2.0 ? (
            <div className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-[10.5px] font-bold border ${
              theme === 'dark'
                ? 'bg-red-500/20 border-red-500/40 text-red-300'
                : 'bg-red-100 border-red-300 text-red-800'
            }`}>
              <TrendingUp className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>{selectedHotspot.baselineRatio}× ABOVE HISTORICAL BASELINE</span>
            </div>
          ) : selectedHotspot.status === 'NORMAL' ? (
            <div className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-[10.5px] font-semibold border ${
              theme === 'dark'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-emerald-100 border-emerald-300 text-emerald-800'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Normal recurring baseline ({selectedHotspot.baselineRatio}× typical)</span>
            </div>
          ) : (
            <div className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-[10.5px] font-semibold border ${
              theme === 'dark'
                ? 'bg-orange-500/15 border-orange-500/30 text-orange-300'
                : 'bg-orange-100 border-orange-300 text-orange-900'
            }`}>
              <Activity className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span>{selectedHotspot.baselineRatio}× elevated emission</span>
            </div>
          )}
        </div>

        {/* Spatial, Land-Cover & Population Proximity Summary */}
        <div className={`mt-2 pt-2 border-t flex flex-col gap-1 text-[11px] ${theme === 'dark' ? 'border-white/10' : 'border-[#cfe0f0]'}`}>
          <div className="flex items-center justify-between">
            <span className={`flex items-center gap-1 font-medium ${theme === 'dark' ? 'text-[#d1b8af]' : 'text-[#5b7596]'}`}>
              <Building2 className="w-3.5 h-3.5 text-[#ff7a45] shrink-0" />
              {selectedHotspot.nearestFacility.distance} from {selectedHotspot.nearestFacility.name.split(' ')[0]}
            </span>
            <span className={`font-mono text-[10px] font-bold ${theme === 'dark' ? 'text-white' : 'text-[#0c2340]'}`}>
              {selectedHotspot.nearestFacility.distance}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-[#d1b8af]' : 'text-[#3b5677]'}`}>
              <Layers className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              {selectedHotspot.landCover}
            </span>
            <span className={`font-mono font-medium ${theme === 'dark' ? 'text-[#a3928c]' : 'text-[#5b7596]'}`}>{selectedHotspot.state}</span>
          </div>

          {/* Population Proximity Feature */}
          <div className={`flex items-center justify-between pt-1 border-t ${theme === 'dark' ? 'border-white/10' : 'border-[#cfe0f0]/60'}`}>
            <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-[#d1b8af]' : 'text-[#5b7596]'}`}>
              <Users className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              Population Proximity
            </span>
            <span className="font-mono text-rose-400 font-bold">
              {selectedHotspot.populationContext?.distanceMeters || 450} m ({selectedHotspot.populationContext?.densityCategory || 'Settlement'})
            </span>
          </div>
        </div>

        {/* Map Focus Action (Vibrant Flame Gradient) */}
        <div className={`flex items-center gap-2 mt-2 pt-2 border-t ${theme === 'dark' ? 'border-white/10' : 'border-[#cfe0f0]'}`}>
          <button
            type="button"
            onClick={() => flyToCoords(selectedHotspot.coordinates, 8.2, 30)}
            className="flex-1 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#c2410c] hover:from-[#f97316] hover:to-[#ea580c] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-[0_2px_10px_rgba(234,88,12,0.25)] transition-all cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Focus on Map</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCoords}
            className={`py-1.5 px-3 rounded-xl text-[10.5px] font-medium flex items-center gap-1 transition-all cursor-pointer shadow-xs border ${
              theme === 'dark'
                ? 'bg-white/5 border-white/10 text-[#d1b8af] hover:text-white hover:bg-white/10'
                : 'bg-white border-[#cfe0f0] text-[#244265] hover:text-[#0c2340] hover:bg-[#fff7ed]'
            }`}
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
        <div className={`border rounded-xl p-2 flex flex-col justify-between shadow-xs ${
          theme === 'dark'
            ? 'bg-[rgba(255,85,45,0.08)] border-[rgba(255,106,61,0.25)]'
            : 'bg-[#fff7ed] border-[#fed7aa]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-[#ff7a45]' : 'text-[#ea580c]'}`}>Current FRP</span>
            <Flame className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-[20px] font-black text-red-500 font-mono leading-none">
              {selectedHotspot.frp}
            </span>
            <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-[#ff7a45]' : 'text-[#c2410c]'}`}>MW</span>
          </div>
        </div>

        {/* Historical Baseline */}
        <div className={`border rounded-xl p-2 flex flex-col justify-between shadow-xs ${
          theme === 'dark'
            ? 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,106,61,0.18)]'
            : 'bg-[#f8fbfe] border-[#cfe0f0]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-[#a3928c]' : 'text-[#5b7596]'}`}>Hist. Baseline</span>
            <Clock className="w-3.5 h-3.5 text-[#ff7a45]" />
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className={`text-[20px] font-black font-mono leading-none ${theme === 'dark' ? 'text-white' : 'text-[#0c2340]'}`}>
              {selectedHotspot.baselineFrp}
            </span>
            <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-[#a3928c]' : 'text-[#7b95b3]'}`}>MW</span>
          </div>
        </div>

        {/* Multi-Spectral Skin Temperature */}
        <div className={`border rounded-xl p-2 flex flex-col justify-between shadow-xs ${
          theme === 'dark'
            ? 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,106,61,0.18)]'
            : 'bg-[#f8fbfe] border-[#cfe0f0]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-[#a3928c]' : 'text-[#5b7596]'}`}>Skin Temp (T4)</span>
            <span className={`text-[9px] font-bold px-1 py-0.2 rounded ${
              theme === 'dark' ? 'bg-amber-950/60 text-amber-400' : 'text-amber-700 bg-amber-100'
            }`}>
              VIIRS
            </span>
          </div>
          <div className="mt-0.5 flex items-baseline gap-0.5">
            <span className={`text-[20px] font-black font-mono leading-none ${theme === 'dark' ? 'text-white' : 'text-[#0c2340]'}`}>
              {selectedHotspot.temperature}
            </span>
            <span className="text-[12px] font-bold text-amber-500">°C</span>
          </div>
        </div>

        {/* 30-Day Persistence Score */}
        <div className={`border rounded-xl p-2 flex flex-col justify-between shadow-xs ${
          theme === 'dark'
            ? 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,106,61,0.18)]'
            : 'bg-[#f8fbfe] border-[#cfe0f0]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-[#a3928c]' : 'text-[#5b7596]'}`}>Recurrence</span>
            <span className="text-[9.5px] font-mono text-purple-400 font-bold">
              {selectedHotspot.persistenceDays}
            </span>
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-[20px] font-black text-purple-400 font-mono leading-none">
              {selectedHotspot.persistenceScore}
            </span>
            <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-[#a3928c]' : 'text-[#7b95b3]'}`}>/ 100</span>
          </div>
        </div>
      </div>

      {/* 3. INVESTIGATION TABS */}
      <div className={`flex rounded-xl p-1 border overflow-x-auto ${
        theme === 'dark' ? 'bg-[rgba(0,0,0,0.35)] border-[rgba(255,106,61,0.2)]' : 'bg-[#e6f0fa] border-[#cfe0f0]'
      }`}>
        {(['Why?', 'History', 'AI Probabilities', 'Sentinel-2', 'Overview'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1 px-1 rounded-lg text-[10px] font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? theme === 'dark'
                  ? 'bg-[rgba(255,85,45,0.25)] text-white shadow-xs border border-[#ff5533]'
                  : 'bg-white text-[#ea580c] shadow-xs border border-[#fed7aa]'
                : theme === 'dark'
                ? 'text-[#a3928c] hover:text-white'
                : 'text-[#4e6b8c] hover:text-[#0c2340]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 4. TAB CONTENTS */}
      <div className="flex flex-col gap-2">
        {/* WHY? EXPLAINABILITY TAB (THE HERO FEATURE) */}
        {activeTab === 'Why?' && (
          <div className={`border rounded-2xl p-3 flex flex-col gap-2 shadow-xs ${
            theme === 'dark'
              ? 'bg-[rgba(16,8,5,0.92)] border-[rgba(255,106,61,0.25)]'
              : 'bg-[#fff7ed] border-[#fed7aa]'
          }`}>
            <div className={`flex items-center justify-between pb-1.5 border-b ${
              theme === 'dark' ? 'border-white/10' : 'border-[#fed7aa]'
            }`}>
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#ff7a45]" />
                <span className={`text-[11.5px] font-extrabold ${theme === 'dark' ? 'text-white' : 'text-[#0c2340]'}`}>
                  Multi-Source Evidence Fusion
                </span>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                theme === 'dark'
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                  : 'text-emerald-700 bg-emerald-100 border-emerald-200'
              }`}>
                Verified Rationale
              </span>
            </div>

            <p className={`text-[10.5px] leading-snug ${theme === 'dark' ? 'text-[#d1b8af]' : 'text-[#3b5677]'}`}>
              Why did FLAREX classify this as{' '}
              <strong className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-[#0c2340]'}`}>{selectedHotspot.classification}</strong>?
            </p>

            <div className="flex flex-col gap-1.5 mt-0.5">
              {selectedHotspot.aiReasons.map((reason, idx) => (
                <div key={idx} className={`flex items-start gap-1.5 text-[11px] ${theme === 'dark' ? 'text-[#fef8f6]' : 'text-[#0c2340]'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{reason.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTORY TAB: 7-DAY FRP CURVE WITH BASELINE */}
        {activeTab === 'History' && (
          <div className={`border rounded-2xl p-3 flex flex-col gap-1.5 shadow-xs ${
            theme === 'dark'
              ? 'bg-[rgba(16,8,5,0.92)] border-[rgba(255,106,61,0.2)]'
              : 'bg-white border-[#cfe0f0]'
          }`}>
            <div className="flex items-center justify-between text-[10.5px]">
              <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-[#0c2340]'}`}>7-Day Radiative Power Curve</span>
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1 text-[9px] ${theme === 'dark' ? 'text-[#a3928c]' : 'text-[#5b7596]'}`}>
                  <span className="w-2.5 h-0.5 border-t border-dashed border-current" /> Baseline ({selectedHotspot.baselineFrp} MW)
                </span>
                <span className="flex items-center gap-1 text-[9px] text-red-500 font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> FRP
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
                    tick={{ fill: theme === 'dark' ? '#A3928C' : '#5B7596', fontSize: 9 }}
                    axisLine={{ stroke: theme === 'dark' ? 'rgba(255,106,61,0.2)' : '#CFE0F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: theme === 'dark' ? '#A3928C' : '#5B7596', fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className={`p-2 rounded-lg shadow-md text-[10px] border ${
                            theme === 'dark'
                              ? 'bg-[#140a07] text-[#fef8f6] border-[rgba(255,106,61,0.3)]'
                              : 'bg-white text-[#0c2340] border-[#cfe0f0]'
                          }`}>
                            <p className={`font-medium ${theme === 'dark' ? 'text-[#a3928c]' : 'text-[#5b7596]'}`}>{payload[0].payload.date}</p>
                            <p className="text-red-500 font-bold mt-0.5">FRP: {payload[0].value} MW</p>
                            <p className={`mt-0.5 ${theme === 'dark' ? 'text-[#a3928c]' : 'text-[#5b7596]'}`}>Baseline: {payload[0].payload.baseline} MW</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={selectedHotspot.baselineFrp}
                    stroke="#FF7A45"
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
          <div className={`border rounded-2xl p-3 flex flex-col gap-2 shadow-xs ${
            theme === 'dark'
              ? 'bg-[rgba(16,8,5,0.92)] border-[rgba(255,106,61,0.2)]'
              : 'bg-white border-[#cfe0f0]'
          }`}>
            <span className={`text-[10.5px] font-bold ${theme === 'dark' ? 'text-white' : 'text-[#0c2340]'}`}>
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
                    <span className={`font-medium ${theme === 'dark' ? 'text-[#d1b8af]' : 'text-[#3b5677]'}`}>{item.label}</span>
                    <span className={`font-mono font-bold ${theme === 'dark' ? 'text-white' : 'text-[#0c2340]'}`}>{item.val}%</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden border ${
                    theme === 'dark' ? 'bg-white/10 border-white/5' : 'bg-[#e6f0fa] border-[#cfe0f0]/60'
                  }`}>
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
          <div className={`border rounded-2xl p-3 flex flex-col gap-2 shadow-xs ${
            theme === 'dark'
              ? 'bg-[rgba(16,8,5,0.92)] border-[rgba(255,106,61,0.2)]'
              : 'bg-white border-[#cfe0f0]'
          }`}>
            <div className={`flex items-center justify-between pb-1 border-b ${
              theme === 'dark' ? 'border-white/10' : 'border-[#cfe0f0]'
            }`}>
              <div className="flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5 text-[#ff7a45]" />
                <span className={`text-[11px] font-bold ${theme === 'dark' ? 'text-white' : 'text-[#0c2340]'}`}>
                  Sentinel-2 MSI Optical Verification
                </span>
              </div>
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold ${
                theme === 'dark'
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                  : 'text-emerald-700 bg-emerald-100 border-emerald-200'
              }`}>
                10m Resol.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className={`p-2 rounded-xl border ${
                theme === 'dark' ? 'bg-[rgba(255,85,45,0.06)] border-[rgba(255,106,61,0.2)]' : 'bg-[#fff7ed] border-[#fed7aa]'
              }`}>
                <span className={`text-[9px] block ${theme === 'dark' ? 'text-[#a3928c]' : 'text-[#5b7596]'}`}>Sentinel Tile</span>
                <span className={`font-mono font-bold ${theme === 'dark' ? 'text-white' : 'text-[#0c2340]'}`}>
                  {selectedHotspot.sentinelImagery?.tileId || 'T43QBC'}
                </span>
              </div>
              <div className={`p-2 rounded-xl border ${
                theme === 'dark' ? 'bg-[rgba(255,85,45,0.06)] border-[rgba(255,106,61,0.2)]' : 'bg-[#fff7ed] border-[#fed7aa]'
              }`}>
                <span className={`text-[9px] block ${theme === 'dark' ? 'text-[#a3928c]' : 'text-[#5b7596]'}`}>Cloud Cover</span>
                <span className="font-mono font-bold text-emerald-500">
                  {selectedHotspot.sentinelImagery?.cloudCoverPct || 1.8}% (Clear)
                </span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border text-[10.5px] ${
              theme === 'dark' ? 'bg-[rgba(255,85,45,0.06)] border-[rgba(255,106,61,0.2)]' : 'bg-[#fff7ed] border-[#fed7aa]'
            }`}>
              <div className={`flex items-center gap-1 font-bold mb-0.5 ${theme === 'dark' ? 'text-[#ff7a45]' : 'text-[#c2410c]'}`}>
                <Eye size={13} className="text-[#ff7a45]" />
                <span>Visual Optical Verification</span>
              </div>
              <p className={`leading-snug ${theme === 'dark' ? 'text-[#d1b8af]' : 'text-[#244265]'}`}>
                Multi-spectral true-color bands (B04, B03, B02) show localized smoke plume displacement over industrial structure.
              </p>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <div className={`border rounded-2xl p-3 flex flex-col gap-1.5 shadow-xs ${
            theme === 'dark'
              ? 'bg-[rgba(16,8,5,0.92)] border-[rgba(255,106,61,0.2)]'
              : 'bg-white border-[#cfe0f0]'
          }`}>
            <div className="flex justify-between items-center text-[10.5px]">
              <span className={`flex items-center gap-1.5 ${theme === 'dark' ? 'text-[#a3928c]' : 'text-[#5b7596]'}`}>
                <Satellite className="w-3.5 h-3.5 text-[#ff7a45]" /> Sensor Stream
              </span>
              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-[#0c2340]'}`}>{selectedHotspot.satellite}</span>
            </div>
            <div className="flex justify-between items-center text-[10.5px]">
              <span className={`flex items-center gap-1.5 ${theme === 'dark' ? 'text-[#a3928c]' : 'text-[#5b7596]'}`}>
                <Clock className="w-3.5 h-3.5" /> Detection Time
              </span>
              <span className={`font-mono font-semibold ${theme === 'dark' ? 'text-white' : 'text-[#0c2340]'}`}>{selectedHotspot.timestamp}</span>
            </div>
            <div className="flex justify-between items-center text-[10.5px]">
              <span className={theme === 'dark' ? 'text-[#a3928c]' : 'text-[#5b7596]'}>GIS Coordinates</span>
              <span className={`font-mono font-bold ${theme === 'dark' ? 'text-white' : 'text-[#0c2340]'}`}>
                {selectedHotspot.coordinates[1].toFixed(4)}°N, {selectedHotspot.coordinates[0].toFixed(4)}°E
              </span>
            </div>
            <div className="flex justify-between items-center text-[10.5px]">
              <span className={theme === 'dark' ? 'text-[#a3928c]' : 'text-[#5b7596]'}>Land Cover</span>
              <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-[#0c2340]'}`}>{selectedHotspot.landCover}</span>
            </div>
            <div className={`flex justify-between items-center text-[10.5px] pt-1 border-t ${theme === 'dark' ? 'border-white/10' : 'border-[#cfe0f0]'}`}>
              <span className={theme === 'dark' ? 'text-[#a3928c]' : 'text-[#5b7596]'}>Facility Proximity</span>
              <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-[#0c2340]'}`}>{selectedHotspot.nearestFacility.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. OPERATIONAL EMERGENCY CONTEXT & PLUME DISPERSION */}
      <div className={`border rounded-2xl p-3 flex flex-col gap-2 shadow-xs ${
        theme === 'dark'
          ? 'bg-[rgba(255,85,45,0.08)] border-[rgba(255,106,61,0.25)]'
          : 'bg-[#fff7ed] border-[#fed7aa]'
      }`}>
        <div className={`flex items-center justify-between pb-1.5 border-b ${theme === 'dark' ? 'border-white/10' : 'border-[#fed7aa]'}`}>
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[#ff7a45]" />
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-[#0c2340]'}`}>
              Emergency Units &amp; Plume
            </span>
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
            theme === 'dark'
              ? 'bg-[rgba(255,85,45,0.2)] text-[#ff7a45] border-[rgba(255,106,61,0.3)]'
              : 'text-[#c2410c] bg-[#ffedd5] border-[#fed7aa]'
          }`}>
            SOP Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
          <div className={`p-2 rounded-xl border ${
            theme === 'dark' ? 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,106,61,0.2)]' : 'bg-white border-[#fed7aa]'
          }`}>
            <span className={`text-[9px] block font-semibold ${theme === 'dark' ? 'text-[#a3928c]' : 'text-[#5b7596]'}`}>Nearest Station</span>
            <span className={`font-bold block truncate ${theme === 'dark' ? 'text-white' : 'text-[#0c2340]'}`}>
              {selectedHotspot.nearestFacility.name.split(' ')[0]} Fire Unit
            </span>
            <span className="text-[9px] text-[#ff7a45] font-mono font-bold">2.4 km (~5 mins)</span>
          </div>
          <div className={`p-2 rounded-xl border ${
            theme === 'dark' ? 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,106,61,0.2)]' : 'bg-white border-[#fed7aa]'
          }`}>
            <span className={`text-[9px] block font-semibold flex items-center gap-1 ${theme === 'dark' ? 'text-[#a3928c]' : 'text-[#5b7596]'}`}>
              <Wind size={10} className="text-[#ff7a45]" /> Plume Vector
            </span>
            <span className={`font-bold block truncate ${theme === 'dark' ? 'text-white' : 'text-[#0c2340]'}`}>
              12 km/h SW → NE
            </span>
            <span className={`text-[9px] font-mono font-bold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'}`}>Buffer: 850m</span>
          </div>
        </div>

        <div className={`flex items-center justify-between text-[10px] pt-1 border-t ${
          theme === 'dark' ? 'text-[#d1b8af] border-white/10' : 'text-[#3b5677] border-[#fed7aa]/80'
        }`}>
          <span className="flex items-center gap-1 font-medium">
            <Radio className="w-3 h-3 text-[#ff7a45]" />
            SPCB Telemetry Ingestion:
          </span>
          <span className="font-mono font-bold text-emerald-500">ONLINE (Active)</span>
        </div>
      </div>

      {/* 6. EMERGENCY DISPATCH ACTION BUTTON */}
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
