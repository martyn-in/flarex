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
        ? 'bg-red-500/25 text-red-300 border-red-500/50 shadow-[0_0_10px_rgba(255,77,79,0.4)]'
        : 'bg-red-100 text-red-700 border-red-200'
      : selectedHotspot.severity === 'high'
      ? theme === 'dark'
        ? 'bg-orange-500/25 text-orange-300 border-orange-500/50 shadow-[0_0_10px_rgba(255,138,61,0.35)]'
        : 'bg-orange-100 text-orange-700 border-orange-200'
      : selectedHotspot.severity === 'medium'
      ? theme === 'dark'
        ? 'bg-amber-500/25 text-amber-200 border-amber-500/50'
        : 'bg-amber-100 text-amber-800 border-amber-200'
      : theme === 'dark'
      ? 'bg-emerald-500/25 text-emerald-200 border-emerald-500/50'
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
    <aside className={`w-full h-full right-panel p-2.5 flex flex-col gap-2 z-20 shrink-0 select-none overflow-y-auto relative ${
      theme === 'dark'
        ? 'bg-[#120805]/95 border-l border-[rgba(255,106,61,0.35)] shadow-[0_0_30px_rgba(0,0,0,0.6)]'
        : 'bg-gradient-to-b from-white to-[#fff7ed] border-l border-[#fed7aa] shadow-sm'
    }`}>
      {/* Top Accent Line for Priority */}
      {isCritical && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 via-orange-500 to-red-500 shadow-[0_0_12px_#ff4d4f]" />
      )}

      {/* 1. COMPACT CLASSIFICATION HEADER (LUMINOUS & HIGH CONTRAST) */}
      <div
        className={`p-2.5 rounded-xl transition-all border ${
          isCritical
            ? theme === 'dark'
              ? 'bg-gradient-to-b from-[rgba(255,59,48,0.25)] to-[rgba(36,14,10,0.96)] border-red-500/50 shadow-[0_0_20px_rgba(255,59,48,0.25)]'
              : 'bg-gradient-to-b from-white to-red-50/85 border-red-200'
            : isNormalFlare
            ? theme === 'dark'
              ? 'bg-gradient-to-b from-[rgba(32,201,151,0.2)] to-[rgba(20,16,12,0.96)] border-emerald-500/40 shadow-[0_0_16px_rgba(32,201,151,0.2)]'
              : 'bg-gradient-to-b from-white to-emerald-50/75 border-emerald-200'
            : theme === 'dark'
            ? 'bg-gradient-to-b from-[rgba(255,85,45,0.2)] to-[rgba(32,15,9,0.96)] border-[rgba(255,106,61,0.45)] shadow-[0_0_20px_rgba(255,85,45,0.2)]'
            : 'bg-gradient-to-b from-white to-[#fff7ed] border-[#fed7aa]'
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
                    ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                    : isNormalFlare
                    ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                    : 'bg-[#ea580c] shadow-[0_0_8px_#ea580c]'
                }`}
              />
            </span>
            <span className={`text-[9.5px] font-black tracking-wider uppercase ${theme === 'dark' ? 'text-[#ffcaa6]' : 'text-[#ea580c]'}`}>
              {selectedHotspot.classification.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span
              className={`px-1.5 py-0.2 rounded-full text-[8.5px] font-extrabold border ${severityBadgeClass} tracking-wide uppercase`}
            >
              {selectedHotspot.severity}
            </span>
            <span className={`font-mono text-[9px] font-bold px-1.5 py-0.2 rounded border ${
              theme === 'dark'
                ? 'text-white bg-[rgba(255,85,45,0.2)] border-[rgba(255,106,61,0.4)]'
                : 'text-[#7c2d12] bg-white border-[#fed7aa]'
            }`}>
              {selectedHotspot.eventId}
            </span>
          </div>
        </div>

        {/* Primary Classification Headline with Confidence */}
        <div className="mt-1.5 flex items-center justify-between">
          <h2 className={`text-[14px] font-black leading-tight flex items-center gap-1.5 ${theme === 'dark' ? 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]' : 'text-[#261006]'}`}>
            {isCritical && <Flame className="w-3.5 h-3.5 text-red-500 shrink-0" />}
            {isWildfire && <Trees className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
            <span>{selectedHotspot.classification}</span>
          </h2>
          <div className={`flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[9.5px] font-bold font-mono border ${
            theme === 'dark'
              ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
              : 'bg-emerald-50 border-emerald-300 text-emerald-700'
          }`}>
            <ShieldCheck className="w-3 h-3" />
            <span>{selectedHotspot.confidence}% AI</span>
          </div>
        </div>

        {/* Baseline Multiple Alert Banner */}
        <div className="mt-1">
          {selectedHotspot.baselineRatio >= 2.0 ? (
            <div className={`flex items-center gap-1 py-0.5 px-2 rounded-md text-[9.5px] font-bold border ${
              theme === 'dark'
                ? 'bg-red-500/25 border-red-500/50 text-red-200 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                : 'bg-red-100 border-red-300 text-red-800'
            }`}>
              <TrendingUp className="w-3 h-3 text-red-400 shrink-0" />
              <span>{selectedHotspot.baselineRatio}× ABOVE HISTORICAL BASELINE</span>
            </div>
          ) : selectedHotspot.status === 'NORMAL' ? (
            <div className={`flex items-center gap-1 py-0.5 px-2 rounded-md text-[9.5px] font-semibold border ${
              theme === 'dark'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                : 'bg-emerald-100 border-emerald-300 text-emerald-800'
            }`}>
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Normal recurring baseline ({selectedHotspot.baselineRatio}× typical)</span>
            </div>
          ) : (
            <div className={`flex items-center gap-1 py-0.5 px-2 rounded-md text-[9.5px] font-semibold border ${
              theme === 'dark'
                ? 'bg-orange-500/20 border-orange-500/40 text-orange-200'
                : 'bg-orange-100 border-orange-300 text-orange-900'
            }`}>
              <Activity className="w-3 h-3 text-orange-400 shrink-0" />
              <span>{selectedHotspot.baselineRatio}× elevated emission</span>
            </div>
          )}
        </div>

        {/* Spatial, Land-Cover & Population Proximity Summary */}
        <div className={`mt-1.5 pt-1.5 border-t flex flex-col gap-0.5 text-[10px] ${theme === 'dark' ? 'border-[rgba(255,106,61,0.25)]' : 'border-[#fed7aa]'}`}>
          <div className="flex items-center justify-between">
            <span className={`flex items-center gap-1 font-medium truncate ${theme === 'dark' ? 'text-[#ffeedd]' : 'text-[#7c2d12]'}`}>
              <Building2 className="w-3 h-3 text-[#ff7a45] shrink-0" />
              <span className="truncate">{selectedHotspot.nearestFacility.distance} from {selectedHotspot.nearestFacility.name.split(' ')[0]}</span>
            </span>
            <span className={`font-mono text-[9.5px] font-bold shrink-0 ml-1 ${theme === 'dark' ? 'text-white' : 'text-[#261006]'}`}>
              {selectedHotspot.nearestFacility.distance}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className={`flex items-center gap-1 truncate ${theme === 'dark' ? 'text-[#ffeedd]' : 'text-[#7c2d12]'}`}>
              <Layers className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="truncate">{selectedHotspot.landCover}</span>
            </span>
            <span className={`font-mono font-medium text-[9px] shrink-0 ml-1 ${theme === 'dark' ? 'text-[#ffcaa6]' : 'text-[#9a3412]'}`}>{selectedHotspot.state}</span>
          </div>

          {/* Population Proximity Feature */}
          <div className={`flex items-center justify-between pt-0.5 border-t ${theme === 'dark' ? 'border-[rgba(255,106,61,0.2)]' : 'border-[#fed7aa]/60'}`}>
            <span className={`flex items-center gap-1 ${theme === 'dark' ? 'text-[#ffeedd]' : 'text-[#7c2d12]'}`}>
              <Users className="w-3 h-3 text-rose-500 shrink-0" />
              Pop. Proximity
            </span>
            <span className={`font-mono font-bold text-[9.5px] ${theme === 'dark' ? 'text-rose-300' : 'text-rose-700'}`}>
              {selectedHotspot.populationContext?.distanceMeters || 450}m ({selectedHotspot.populationContext?.densityCategory || 'Settlement'})
            </span>
          </div>
        </div>

        {/* Map Focus Action & GIS Button */}
        <div className={`flex items-center gap-1.5 mt-1.5 pt-1.5 border-t ${theme === 'dark' ? 'border-[rgba(255,106,61,0.3)]' : 'border-[#fed7aa]'}`}>
          <button
            type="button"
            onClick={() => flyToCoords(selectedHotspot.coordinates, 8.2, 30)}
            className="flex-1 py-1.5 px-2 rounded-lg bg-gradient-to-r from-[#ff5533] via-[#ff7a45] to-[#ea580c] hover:brightness-110 text-white text-[10.5px] font-extrabold flex items-center justify-center gap-1.5 shadow-[0_3px_14px_rgba(255,85,45,0.45)] border border-[#ff9166] transition-all cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Focus Map</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCoords}
            className={`py-1.5 px-2.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
              theme === 'dark'
                ? 'bg-[rgba(255,85,45,0.22)] border-[rgba(255,106,61,0.5)] text-white hover:bg-[rgba(255,85,45,0.35)] shadow-[0_2px_8px_rgba(0,0,0,0.5)]'
                : 'bg-white border-[#fed7aa] text-[#7c2d12] hover:text-[#ea580c] hover:bg-[#ffedd5] shadow-xs'
            }`}
            title="Copy GIS Coordinates"
          >
            <Copy className={`w-3 h-3 ${theme === 'dark' ? 'text-[#ff7a45]' : 'text-[#ea580c]'}`} />
            <span>GIS</span>
          </button>
        </div>
      </div>

      {/* 2. COMPACT TELEMETRY METRIC GRID (2x2) - NO BLACK VOIDS */}
      <div className="grid grid-cols-2 gap-1.5">
        {/* Current FRP */}
        <div className={`border rounded-lg p-1.5 flex flex-col justify-between shadow-sm ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-[rgba(255,85,45,0.2)] to-[rgba(32,14,8,0.96)] border-[rgba(255,106,61,0.45)]'
            : 'bg-gradient-to-b from-white to-[#fff7ed] border-[#fed7aa]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[8.5px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-[#ffcaa6]' : 'text-[#ea580c]'}`}>Current FRP</span>
            <Flame className="w-3 h-3 text-red-500" />
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-[16px] font-black text-red-500 font-mono leading-none drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]">
              {selectedHotspot.frp}
            </span>
            <span className={`text-[9px] font-bold ${theme === 'dark' ? 'text-[#ff7a45]' : 'text-[#c2410c]'}`}>MW</span>
          </div>
        </div>

        {/* Historical Baseline */}
        <div className={`border rounded-lg p-1.5 flex flex-col justify-between shadow-sm ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-[rgba(38,18,11,0.96)] to-[rgba(24,11,6,0.96)] border-[rgba(255,106,61,0.35)]'
            : 'bg-gradient-to-b from-white to-[#fff7ed] border-[#fed7aa]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[8.5px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-[#ffeedd]' : 'text-[#7c2d12]'}`}>Baseline</span>
            <Clock className="w-3 h-3 text-[#ff7a45]" />
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className={`text-[16px] font-black font-mono leading-none ${theme === 'dark' ? 'text-white' : 'text-[#261006]'}`}>
              {selectedHotspot.baselineFrp}
            </span>
            <span className={`text-[9px] font-bold ${theme === 'dark' ? 'text-[#ffcaa6]' : 'text-[#9a3412]'}`}>MW</span>
          </div>
        </div>

        {/* Multi-Spectral Skin Temperature */}
        <div className={`border rounded-lg p-1.5 flex flex-col justify-between shadow-sm ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-[rgba(38,18,11,0.96)] to-[rgba(24,11,6,0.96)] border-[rgba(255,106,61,0.35)]'
            : 'bg-gradient-to-b from-white to-[#fff7ed] border-[#fed7aa]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[8.5px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-[#ffeedd]' : 'text-[#7c2d12]'}`}>Skin Temp</span>
            <span className={`text-[8px] font-bold px-1 py-0.2 rounded ${
              theme === 'dark' ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30' : 'text-amber-800 bg-amber-100 border border-amber-200'
            }`}>
              VIIRS
            </span>
          </div>
          <div className="mt-0.5 flex items-baseline gap-0.5">
            <span className={`text-[16px] font-black font-mono leading-none ${theme === 'dark' ? 'text-white' : 'text-[#261006]'}`}>
              {selectedHotspot.temperature}
            </span>
            <span className="text-[10px] font-bold text-amber-500">°C</span>
          </div>
        </div>

        {/* 30-Day Persistence Score */}
        <div className={`border rounded-lg p-1.5 flex flex-col justify-between shadow-sm ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-[rgba(38,18,11,0.96)] to-[rgba(24,11,6,0.96)] border-[rgba(255,106,61,0.35)]'
            : 'bg-gradient-to-b from-white to-[#fff7ed] border-[#fed7aa]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[8.5px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-[#ffeedd]' : 'text-[#7c2d12]'}`}>Recurrence</span>
            <span className="text-[8.5px] font-mono text-purple-600 font-bold">
              {selectedHotspot.persistenceDays}d
            </span>
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-[16px] font-black text-purple-600 font-mono leading-none">
              {selectedHotspot.persistenceScore}
            </span>
            <span className={`text-[9px] font-bold ${theme === 'dark' ? 'text-[#ffcaa6]' : 'text-[#9a3412]'}`}>/100</span>
          </div>
        </div>
      </div>

      {/* 3. COMPACT INVESTIGATION TABS (HIGH VISIBILITY, VIBRANT PILLS) */}
      <div className={`flex rounded-lg p-1 border gap-1 overflow-x-auto ${
        theme === 'dark'
          ? 'bg-[rgba(32,15,9,0.96)] border-[rgba(255,106,61,0.4)] shadow-md'
          : 'bg-[#ffedd5] border-[#fed7aa] shadow-xs'
      }`}>
        {(['Why?', 'History', 'AI Probabilities', 'Sentinel-2', 'Overview'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1 px-1.5 rounded text-[9.5px] transition-all duration-150 cursor-pointer whitespace-nowrap text-center font-black ${
                isActive
                  ? 'bg-gradient-to-r from-[#ff5533] via-[#ff7a45] to-[#ea580c] text-white shadow-sm border border-[#ffaa80]'
                  : theme === 'dark'
                  ? 'bg-[rgba(255,255,255,0.08)] text-[#ffffff] hover:bg-[rgba(255,85,45,0.3)] hover:text-white border border-white/10'
                  : 'bg-white text-[#431407] border border-[#fed7aa] hover:bg-[#ffedd5] hover:text-[#ea580c] shadow-xs'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* 4. TAB CONTENTS (CLEAR, LUMINOUS & EASY TO READ) */}
      <div className="flex flex-col gap-1.5">
        {/* WHY? EXPLAINABILITY TAB */}
        {activeTab === 'Why?' && (
          <div className={`border rounded-xl p-2.5 flex flex-col gap-1.5 shadow-md ${
            theme === 'dark'
              ? 'bg-gradient-to-b from-[rgba(32,15,9,0.96)] to-[rgba(22,10,6,0.96)] border-[rgba(255,106,61,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
              : 'bg-gradient-to-b from-white to-[#fff7ed] border-[#fed7aa]'
          }`}>
            <div className={`flex items-center justify-between pb-1 border-b ${
              theme === 'dark' ? 'border-[rgba(255,106,61,0.25)]' : 'border-[#fed7aa]'
            }`}>
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#ff7a45]" />
                <span className={`text-[10.5px] font-black ${theme === 'dark' ? 'text-white' : 'text-[#261006]'}`}>
                  Multi-Source Evidence Fusion
                </span>
              </div>
              <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-full border ${
                theme === 'dark'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-300'
              }`}>
                Verified Rationale
              </span>
            </div>

            <p className={`text-[9.5px] font-bold ${theme === 'dark' ? 'text-[#ffcaa6]' : 'text-[#ea580c]'}`}>
              Why classified as <span className="underline decoration-[#ff7a45] font-black">{selectedHotspot.classification}</span>:
            </p>

            <div className="flex flex-col gap-1 mt-0.5">
              {selectedHotspot.aiReasons.map((reason, idx) => (
                <div key={idx} className={`flex items-start gap-1.5 text-[9.5px] ${theme === 'dark' ? 'text-[#fef8f6]' : 'text-[#261006]'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-tight">{reason.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTORY TAB: 7-DAY FRP CURVE WITH BASELINE */}
        {activeTab === 'History' && (
          <div className={`border rounded-xl p-2.5 flex flex-col gap-1 shadow-md ${
            theme === 'dark'
              ? 'bg-gradient-to-b from-[rgba(32,15,9,0.96)] to-[rgba(22,10,6,0.96)] border-[rgba(255,106,61,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
              : 'bg-gradient-to-b from-white to-[#fff7ed] border-[#fed7aa]'
          }`}>
            <div className="flex items-center justify-between text-[9.5px]">
              <span className={`font-black ${theme === 'dark' ? 'text-white' : 'text-[#261006]'}`}>7-Day Radiative Power Curve</span>
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1 text-[8.5px] ${theme === 'dark' ? 'text-[#ffeedd]' : 'text-[#7c2d12]'}`}>
                  <span className="w-2 h-2 rounded-full bg-[#FF4D4F]" /> FRP
                </span>
                <span className={`flex items-center gap-1 text-[8.5px] ${theme === 'dark' ? 'text-[#ffeedd]' : 'text-[#7c2d12]'}`}>
                  <span className="w-2.5 h-0.5 bg-[#FF7A45]" /> Base
                </span>
              </div>
            </div>

            <div className="h-[110px] w-full mt-0.5">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={selectedHotspot.history}
                  margin={{ top: 6, right: 6, left: -24, bottom: 0 }}
                >
                  <XAxis
                    dataKey="date"
                    tick={{ fill: theme === 'dark' ? '#FFCAA6' : '#7C2D12', fontSize: 8 }}
                    axisLine={{ stroke: theme === 'dark' ? 'rgba(255,106,61,0.35)' : '#FED7AA' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: theme === 'dark' ? '#FFCAA6' : '#7C2D12', fontSize: 8 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className={`p-1.5 rounded-md shadow-md text-[9px] border ${
                            theme === 'dark'
                              ? 'bg-[#180a06] text-[#fef8f6] border-[rgba(255,106,61,0.45)]'
                              : 'bg-white text-[#261006] border-[#fed7aa]'
                          }`}>
                            <p className={`font-medium ${theme === 'dark' ? 'text-[#ffcaa6]' : 'text-[#7c2d12]'}`}>{payload[0].payload.date}</p>
                            <p className="text-red-500 font-bold">FRP: {payload[0].value} MW</p>
                            <p className={`${theme === 'dark' ? 'text-[#ffeedd]' : 'text-[#7c2d12]'}`}>Base: {payload[0].payload.baseline} MW</p>
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
                    strokeWidth={1.4}
                  />
                  <Line
                    type="monotone"
                    dataKey="frp"
                    stroke="#FF4D4F"
                    strokeWidth={2.2}
                    dot={{ r: 3, fill: '#FF4D4F', stroke: '#FFFFFF', strokeWidth: 1 }}
                    activeDot={{ r: 4.5, fill: '#FF4D4F', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* AI PROBABILITIES TAB */}
        {activeTab === 'AI Probabilities' && (
          <div className={`border rounded-xl p-2.5 flex flex-col gap-1.5 shadow-md ${
            theme === 'dark'
              ? 'bg-gradient-to-b from-[rgba(32,15,9,0.96)] to-[rgba(22,10,6,0.96)] border-[rgba(255,106,61,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
              : 'bg-gradient-to-b from-white to-[#fff7ed] border-[#fed7aa]'
          }`}>
            <span className={`text-[10px] font-black ${theme === 'dark' ? 'text-white' : 'text-[#261006]'}`}>
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
                <div key={item.label} className="flex flex-col gap-0.5">
                  <div className="flex justify-between items-center text-[9.5px]">
                    <span className={`font-bold ${theme === 'dark' ? 'text-[#ffeedd]' : 'text-[#261006]'}`}>{item.label}</span>
                    <span className={`font-mono font-black ${theme === 'dark' ? 'text-white' : 'text-[#261006]'}`}>{item.val}%</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden border ${
                    theme === 'dark' ? 'bg-white/15 border-white/10' : 'bg-[#ffedd5] border-[#fed7aa]'
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
          <div className={`border rounded-xl p-2.5 flex flex-col gap-1.5 shadow-md ${
            theme === 'dark'
              ? 'bg-gradient-to-b from-[rgba(32,15,9,0.96)] to-[rgba(22,10,6,0.96)] border-[rgba(255,106,61,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
              : 'bg-gradient-to-b from-white to-[#fff7ed] border-[#fed7aa]'
          }`}>
            <div className={`flex items-center justify-between pb-1 border-b ${
              theme === 'dark' ? 'border-[rgba(255,106,61,0.25)]' : 'border-[#fed7aa]'
            }`}>
              <div className="flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5 text-[#ff7a45]" />
                <span className={`text-[10px] font-black ${theme === 'dark' ? 'text-white' : 'text-[#261006]'}`}>
                  Sentinel-2 MSI Optical Verification
                </span>
              </div>
              <span className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded border font-bold ${
                theme === 'dark'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'text-emerald-800 bg-emerald-100 border-emerald-300'
              }`}>
                10m Resol.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[9.5px]">
              <div className={`p-1.5 rounded-lg border ${
                theme === 'dark' ? 'bg-[rgba(255,85,45,0.15)] border-[rgba(255,106,61,0.35)]' : 'bg-[#fff7ed] border-[#fed7aa]'
              }`}>
                <span className={`text-[8.5px] font-bold block ${theme === 'dark' ? 'text-[#ffcaa6]' : 'text-[#7c2d12]'}`}>Sentinel Tile</span>
                <span className={`font-mono font-black ${theme === 'dark' ? 'text-white' : 'text-[#261006]'}`}>
                  {selectedHotspot.sentinelImagery?.tileId || 'T43QBC'}
                </span>
              </div>
              <div className={`p-1.5 rounded-lg border ${
                theme === 'dark' ? 'bg-[rgba(255,85,45,0.15)] border-[rgba(255,106,61,0.35)]' : 'bg-[#fff7ed] border-[#fed7aa]'
              }`}>
                <span className={`text-[8.5px] font-bold block ${theme === 'dark' ? 'text-[#ffcaa6]' : 'text-[#7c2d12]'}`}>Cloud Cover</span>
                <span className="font-mono font-black text-emerald-600">
                  {selectedHotspot.sentinelImagery?.cloudCoverPct || 1.8}%
                </span>
              </div>
            </div>

            <div className={`p-2 rounded-lg border text-[9.5px] ${
              theme === 'dark' ? 'bg-[rgba(255,85,45,0.12)] border-[rgba(255,106,61,0.35)]' : 'bg-[#fff7ed] border-[#fed7aa]'
            }`}>
              <div className={`flex items-center gap-1 font-bold mb-0.5 ${theme === 'dark' ? 'text-[#ff7a45]' : 'text-[#c2410c]'}`}>
                <Eye size={12} className="text-[#ff7a45]" />
                <span>Visual Optical Verification</span>
              </div>
              <p className={`leading-snug font-medium ${theme === 'dark' ? 'text-[#ffeedd]' : 'text-[#431407]'}`}>
                Multi-spectral true-color bands (B04, B03, B02) show localized smoke plume displacement over industrial structure.
              </p>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB (HIGH CONTRAST LABELS & VALUES) */}
        {activeTab === 'Overview' && (
          <div className={`border rounded-xl p-2.5 flex flex-col gap-1 shadow-md ${
            theme === 'dark'
              ? 'bg-gradient-to-b from-[rgba(32,15,9,0.96)] to-[rgba(22,10,6,0.96)] border-[rgba(255,106,61,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
              : 'bg-gradient-to-b from-white to-[#fff7ed] border-[#fed7aa]'
          }`}>
            <div className="flex justify-between items-center text-[9.5px] py-0.5">
              <span className={`flex items-center gap-1.5 font-bold ${theme === 'dark' ? 'text-[#ffcaa6]' : 'text-[#7c2d12]'}`}>
                <Satellite className="w-3.5 h-3.5 text-[#ff7a45]" /> Sensor
              </span>
              <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-[#261006]'}`}>{selectedHotspot.satellite}</span>
            </div>
            <div className="flex justify-between items-center text-[9.5px] py-0.5 border-t border-[rgba(255,106,61,0.2)]">
              <span className={`flex items-center gap-1.5 font-bold ${theme === 'dark' ? 'text-[#ffcaa6]' : 'text-[#7c2d12]'}`}>
                <Clock className="w-3.5 h-3.5 text-[#ff7a45]" /> Time
              </span>
              <span className={`font-mono font-bold ${theme === 'dark' ? 'text-white' : 'text-[#261006]'}`}>{selectedHotspot.timestamp}</span>
            </div>
            <div className="flex justify-between items-center text-[9.5px] py-0.5 border-t border-[rgba(255,106,61,0.2)]">
              <span className={`font-bold ${theme === 'dark' ? 'text-[#ffcaa6]' : 'text-[#7c2d12]'}`}>GIS Coords</span>
              <span className={`font-mono font-black ${theme === 'dark' ? 'text-white' : 'text-[#261006]'}`}>
                {selectedHotspot.coordinates[1].toFixed(4)}°N, {selectedHotspot.coordinates[0].toFixed(4)}°E
              </span>
            </div>
            <div className="flex justify-between items-center text-[9.5px] py-0.5 border-t border-[rgba(255,106,61,0.2)]">
              <span className={`font-bold ${theme === 'dark' ? 'text-[#ffcaa6]' : 'text-[#7c2d12]'}`}>Land Cover</span>
              <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-[#261006]'}`}>{selectedHotspot.landCover}</span>
            </div>
            <div className={`flex justify-between items-center text-[9.5px] pt-1 border-t ${theme === 'dark' ? 'border-[rgba(255,106,61,0.3)]' : 'border-[#fed7aa]'}`}>
              <span className={`font-bold ${theme === 'dark' ? 'text-[#ffcaa6]' : 'text-[#7c2d12]'}`}>Facility</span>
              <span className={`font-black truncate max-w-[200px] ${theme === 'dark' ? 'text-[#ff7a45]' : 'text-[#ea580c]'}`}>{selectedHotspot.nearestFacility.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. COMPACT EMERGENCY UNITS & PLUME DISPERSION */}
      <div className={`border rounded-xl p-2 flex flex-col gap-1.5 shadow-md ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-[rgba(32,15,9,0.96)] to-[rgba(22,10,6,0.96)] border-[rgba(255,106,61,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
          : 'bg-gradient-to-b from-white to-[#fff7ed] border-[#fed7aa]'
      }`}>
        <div className={`flex items-center justify-between pb-1 border-b ${theme === 'dark' ? 'border-[rgba(255,106,61,0.25)]' : 'border-[#fed7aa]'}`}>
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[#ff7a45]" />
            <span className={`text-[10px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-[#261006]'}`}>
              Emergency Units &amp; Plume
            </span>
          </div>
          <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-full border ${
            theme === 'dark'
              ? 'bg-[rgba(255,85,45,0.25)] text-[#ff7a45] border-[rgba(255,106,61,0.4)] shadow-[0_0_8px_rgba(255,85,45,0.3)]'
              : 'text-[#c2410c] bg-[#ffedd5] border-[#fed7aa]'
          }`}>
            SOP Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1 text-[9.5px]">
          <div className={`p-1.5 rounded-lg border ${
            theme === 'dark' ? 'bg-[rgba(255,85,45,0.15)] border-[rgba(255,106,61,0.35)]' : 'bg-white border-[#fed7aa]'
          }`}>
            <span className={`text-[8.5px] block font-bold ${theme === 'dark' ? 'text-[#ffcaa6]' : 'text-[#7c2d12]'}`}>Nearest Station</span>
            <span className={`font-black block truncate ${theme === 'dark' ? 'text-white' : 'text-[#261006]'}`}>
              {selectedHotspot.nearestFacility.name.split(' ')[0]} Unit
            </span>
            <span className="text-[8.5px] text-[#ff7a45] font-mono font-black">2.4 km (~5m)</span>
          </div>
          <div className={`p-1.5 rounded-lg border ${
            theme === 'dark' ? 'bg-[rgba(255,85,45,0.15)] border-[rgba(255,106,61,0.35)]' : 'bg-white border-[#fed7aa]'
          }`}>
            <span className={`text-[8.5px] block font-bold flex items-center gap-1 ${theme === 'dark' ? 'text-[#ffcaa6]' : 'text-[#7c2d12]'}`}>
              <Wind size={9} className="text-[#ff7a45]" /> Plume Vector
            </span>
            <span className={`font-black block truncate ${theme === 'dark' ? 'text-white' : 'text-[#261006]'}`}>
              12 km/h SW→NE
            </span>
            <span className={`text-[8.5px] font-mono font-black ${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'}`}>Buf: 850m</span>
          </div>
        </div>

        <div className={`flex items-center justify-between text-[9px] pt-0.5 border-t ${
          theme === 'dark' ? 'text-[#ffeedd] border-[rgba(255,106,61,0.2)]' : 'text-[#7c2d12] border-[#fed7aa]/80'
        }`}>
          <span className="flex items-center gap-1 font-bold">
            <Radio className="w-2.5 h-2.5 text-[#ff7a45]" />
            SPCB Telemetry:
          </span>
          <span className="font-mono font-black text-emerald-500">ONLINE (Active)</span>
        </div>
      </div>

      {/* 6. EMERGENCY DISPATCH ACTION BUTTON */}
      {isCritical && (
        <button
          type="button"
          onClick={handleDispatchProtocol}
          className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[10.5px] font-black flex items-center justify-center gap-1.5 shadow-md border border-red-700 transition-all cursor-pointer mt-auto"
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Dispatch Incident Alert Protocol</span>
        </button>
      )}
    </aside>
  );
};

export default RightIncidentPanel;
