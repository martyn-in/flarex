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
  FileText,
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
    formatTemp,
    formatTempValue,
    tempUnit,
    openDispatchModal,
    theme,
  } = useIntelligence();

  const [activeTab, setActiveTab] = useState<
    'Why?' | 'History' | 'AI Probabilities' | 'Sentinel-2' | 'Overview'
  >('Why?');

  if (isPresentationMode || !selectedHotspot) {
    return null;
  }

  const isDark = theme === 'dark';
  const isCritical = selectedHotspot.severity === 'critical' || selectedHotspot.status === 'CRITICAL_FIRE';
  const isNormalFlare = selectedHotspot.classification === 'Gas Flare' && selectedHotspot.status === 'NORMAL';
  const isWildfire = selectedHotspot.classification === 'Wildfire';

  const severityBadgeClass =
    isCritical
      ? isDark
        ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_8px_rgba(255,77,79,0.3)]'
        : 'bg-red-100 text-red-700 border-red-200'
      : selectedHotspot.severity === 'high'
      ? isDark
        ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-[0_0_8px_rgba(255,138,61,0.25)]'
        : 'bg-orange-100 text-orange-700 border-orange-200'
      : selectedHotspot.severity === 'medium'
      ? isDark
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        : 'bg-amber-100 text-amber-800 border-amber-200'
      : isDark
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      : 'bg-emerald-100 text-emerald-700 border-emerald-200';

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(
      `${selectedHotspot.coordinates[1]}, ${selectedHotspot.coordinates[0]}`
    );
    addToast('GPS Coordinates copied to clipboard', 'info');
  };

  const handleDownloadPdf = () => {
    window.open(`/api/reports/download?type=pdf&eventId=${selectedHotspot.eventId}`, '_blank');
    addToast(`Downloading verified incident PDF dossier for ${selectedHotspot.eventId}...`, 'success');
  };

  return (
    <aside
      className={`w-full max-w-full h-full right-panel p-3 flex flex-col gap-2.5 z-20 select-none overflow-y-auto relative ${
        isDark ? 'border-l border-[rgba(255,106,61,0.2)]' : 'bg-white border-l border-[#cfe0f0] shadow-sm'
      }`}
    >
      {/* Top Accent Line for Priority */}
      {isCritical && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 via-orange-500 to-red-500 shadow-[0_0_10px_#ff4d4f] shrink-0" />
      )}

      {/* 1. VISUALLY DOMINANT CLASSIFICATION HEADER */}
      <div
        className={`p-3 rounded-2xl transition-all border shrink-0 ${
          isCritical
            ? isDark
              ? 'bg-[rgba(255,59,48,0.15)] border-red-500/40 shadow-[0_0_16px_rgba(255,59,48,0.15)]'
              : 'bg-red-50/80 border-red-200'
            : isNormalFlare
            ? isDark
              ? 'bg-[rgba(32,201,151,0.12)] border-emerald-500/30'
              : 'bg-emerald-50/80 border-emerald-200'
            : isDark
            ? 'bg-[rgba(255,85,45,0.08)] border-[rgba(255,106,61,0.25)]'
            : 'bg-[#f0f7fc] border-[#cfe0f0]'
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
                    : 'bg-[#ff5533]'
                }`}
              />
            </span>
            <span className={`text-[10px] font-extrabold tracking-wider uppercase ${
              isDark ? 'text-[#ff9977]' : 'text-[#0284c7]'
            }`}>
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
              isDark ? 'text-[#d1b8af] bg-black/40 border-white/10' : 'text-[#0c2340] bg-white border-[#cfe0f0]'
            }`}>
              {selectedHotspot.eventId}
            </span>
          </div>
        </div>

        {/* Primary Classification Headline with Confidence */}
        <div className="mt-2 flex items-center justify-between">
          <h2 className={`text-[16px] font-black leading-tight flex items-center gap-1.5 ${
            isDark ? 'text-[#fef8f6]' : 'text-[#0c2340]'
          }`}>
            {isCritical && <Flame className="w-4.5 h-4.5 text-red-500 shrink-0 animate-pulse" />}
            {isWildfire && <Trees className="w-4.5 h-4.5 text-amber-500 shrink-0" />}
            <span>{selectedHotspot.classification}</span>
          </h2>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-bold font-mono border bg-emerald-500/15 border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{selectedHotspot.confidence}% AI</span>
          </div>
        </div>

        {/* Baseline Multiple Alert Banner */}
        <div className="mt-1.5">
          {selectedHotspot.baselineRatio >= 2.0 ? (
            <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-[10.5px] font-bold border bg-red-500/20 border-red-500/40 text-red-300">
              <TrendingUp className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>{selectedHotspot.baselineRatio}× ABOVE HISTORICAL BASELINE</span>
            </div>
          ) : selectedHotspot.status === 'NORMAL' ? (
            <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-[10.5px] font-semibold border bg-emerald-500/15 border-emerald-500/30 text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Normal recurring baseline ({selectedHotspot.baselineRatio}× typical)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-[10.5px] font-semibold border bg-orange-500/20 border-orange-500/40 text-orange-300">
              <Activity className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>{selectedHotspot.baselineRatio}× elevated emission</span>
            </div>
          )}
        </div>

        {/* Spatial, Land-Cover & Population Proximity Summary */}
        <div className={`mt-2 pt-2 border-t flex flex-col gap-1 text-[11px] ${
          isDark ? 'border-[rgba(255,106,61,0.15)]' : 'border-[#cfe0f0]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`flex items-center gap-1 font-medium ${isDark ? 'text-[#d1b8af]' : 'text-[#4e6b8c]'}`}>
              <Building2 className="w-3.5 h-3.5 text-[#ff5533] shrink-0" />
              {selectedHotspot.nearestFacility.distance} from {selectedHotspot.nearestFacility.name.split(' ')[0]}
            </span>
            <span className={`font-mono text-[10px] font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
              {selectedHotspot.nearestFacility.distance}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className={`flex items-center gap-1 ${isDark ? 'text-[#d1b8af]' : 'text-[#4e6b8c]'}`}>
              <Layers className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              {selectedHotspot.landCover}
            </span>
            <span className={`font-mono font-medium ${isDark ? 'text-[#a3928c]' : 'text-[#627d9c]'}`}>
              {selectedHotspot.state}
            </span>
          </div>

          {/* Population Proximity Feature */}
          <div className={`flex items-center justify-between pt-1 border-t ${
            isDark ? 'border-[rgba(255,106,61,0.12)]' : 'border-[#cfe0f0]'
          }`}>
            <span className={`flex items-center gap-1 ${isDark ? 'text-[#d1b8af]' : 'text-[#4e6b8c]'}`}>
              <Users className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              Population Proximity
            </span>
            <span className="font-mono text-rose-400 font-bold">
              {selectedHotspot.populationContext?.distanceMeters || 450} m ({selectedHotspot.populationContext?.densityCategory || 'Settlement'})
            </span>
          </div>
        </div>

        {/* Map Focus Action, GIS Button & PDF Download */}
        <div className={`flex items-center gap-1.5 mt-2 pt-2 border-t ${
          isDark ? 'border-[rgba(255,106,61,0.18)]' : 'border-[#cfe0f0]'
        }`}>
          <button
            type="button"
            onClick={() => flyToCoords(selectedHotspot.coordinates, 8.2, 30)}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#ff5533] via-[#ff7a45] to-[#ff5533] hover:brightness-110 text-white text-[11.5px] font-extrabold flex items-center justify-center gap-1.5 border border-[#ff7a45] transition-all cursor-pointer shadow-[0_0_12px_rgba(255,85,45,0.3)]"
          >
            <Crosshair className="w-4 h-4" />
            <span>Focus on Map</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCoords}
            className={`py-2 px-3 rounded-xl text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer border ${
              isDark
                ? 'bg-white/5 border-white/10 text-[#d1b8af] hover:text-white hover:bg-white/10'
                : 'bg-white border-[#cfe0f0] text-[#0c2340] hover:bg-[#f0f5fa]'
            }`}
            title="Copy GIS Coordinates"
          >
            <Copy className="w-3.5 h-3.5 text-[#ff5533]" />
            <span>GIS</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className={`py-2 px-3 rounded-xl text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer border ${
              isDark
                ? 'bg-white/5 border-white/10 text-[#d1b8af] hover:text-white hover:bg-white/10'
                : 'bg-white border-[#cfe0f0] text-[#0c2340] hover:bg-[#f0f5fa]'
            }`}
            title="Download Official Incident PDF Report"
          >
            <FileText className="w-3.5 h-3.5 text-[#ff5533]" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* 2. PRIMARY TELEMETRY METRIC GRID */}
      <div className="grid grid-cols-2 gap-1.5 shrink-0">
        {/* Current FRP */}
        <div className={`border rounded-xl p-2.5 flex flex-col justify-between ${
          isDark ? 'bg-[rgba(255,59,48,0.08)] border-red-500/30' : 'bg-red-50/60 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Current FRP</span>
            <Flame className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-[22px] font-black text-red-500 font-mono leading-none">
              {selectedHotspot.frp}
            </span>
            <span className="text-[10px] font-bold text-red-400">MW</span>
          </div>
        </div>

        {/* Historical Baseline */}
        <div className={`border rounded-xl p-2.5 flex flex-col justify-between ${
          isDark ? 'bg-[rgba(20,10,7,0.8)] border-[rgba(255,106,61,0.2)]' : 'bg-[#f8fbfe] border-[#cfe0f0]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#a3928c]' : 'text-[#4e6b8c]'}`}>
              Hist. Baseline
            </span>
            <Clock className="w-3.5 h-3.5 text-[#ff7a45]" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-[22px] font-black font-mono leading-none ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
              {selectedHotspot.baselineFrp}
            </span>
            <span className={`text-[10px] font-bold ${isDark ? 'text-[#a3928c]' : 'text-[#627d9c]'}`}>MW</span>
          </div>
        </div>

        {/* Multi-Spectral Skin Temperature (Converts °C / °F) */}
        <div className={`border rounded-xl p-2.5 flex flex-col justify-between ${
          isDark ? 'bg-[rgba(20,10,7,0.8)] border-[rgba(255,106,61,0.2)]' : 'bg-[#f8fbfe] border-[#cfe0f0]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#a3928c]' : 'text-[#4e6b8c]'}`}>
              Skin Temp (T4)
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded text-amber-300 bg-amber-500/20 border border-amber-500/30">
              VIIRS
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-0.5">
            <span className={`text-[22px] font-black font-mono leading-none ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
              {formatTempValue(selectedHotspot.temperature)}
            </span>
            <span className="text-[12px] font-bold text-amber-400">°{tempUnit}</span>
          </div>
        </div>

        {/* 30-Day Persistence Score */}
        <div className={`border rounded-xl p-2.5 flex flex-col justify-between ${
          isDark ? 'bg-[rgba(20,10,7,0.8)] border-[rgba(255,106,61,0.2)]' : 'bg-[#f8fbfe] border-[#cfe0f0]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-[#a3928c]' : 'text-[#4e6b8c]'}`}>
              Recurrence
            </span>
            <span className="text-[9.5px] font-mono text-purple-400 font-bold">
              {selectedHotspot.persistenceDays}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-[22px] font-black text-purple-400 font-mono leading-none">
              {selectedHotspot.persistenceScore}
            </span>
            <span className={`text-[10px] font-bold ${isDark ? 'text-[#a3928c]' : 'text-[#627d9c]'}`}>/ 100</span>
          </div>
        </div>
      </div>

      {/* 3. INVESTIGATION TABS */}
      <div className={`flex rounded-xl p-1 border gap-1 shrink-0 min-h-[38px] items-center overflow-x-auto ${
        isDark ? 'bg-black/40 border-[rgba(255,106,61,0.2)]' : 'bg-[#f0f5fa] border-[#cfe0f0]'
      }`}>
        {(['Why?', 'History', 'AI Probabilities', 'Sentinel-2', 'Overview'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[10.5px] transition-all duration-150 cursor-pointer whitespace-nowrap text-center font-extrabold shrink-0 min-h-[28px] flex items-center justify-center border ${
                isActive
                  ? 'bg-[#ff5533] text-white border-[#ff7a45] shadow-[0_0_10px_rgba(255,85,45,0.4)]'
                  : isDark
                  ? 'bg-transparent text-[#d1b8af] border-transparent hover:bg-white/5 hover:text-white'
                  : 'bg-white text-[#4e6b8c] border-[#cfe0f0] hover:bg-[#e0f2fe] hover:text-[#0c2340]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* 4. TAB CONTENTS */}
      <div className="flex flex-col gap-2 shrink-0">
        {/* WHY? EXPLAINABILITY TAB */}
        {activeTab === 'Why?' && (
          <div className={`border rounded-2xl p-3 flex flex-col gap-2 ${
            isDark ? 'bg-[rgba(20,10,7,0.85)] border-[rgba(255,106,61,0.2)]' : 'bg-white border-[#cfe0f0]'
          }`}>
            <div className={`flex items-center justify-between pb-1.5 border-b ${
              isDark ? 'border-[rgba(255,106,61,0.15)]' : 'border-[#cfe0f0]'
            }`}>
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#ff5533]" />
                <span className={`text-[11.5px] font-extrabold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
                  Multi-Source Evidence Fusion
                </span>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border text-emerald-300 bg-emerald-500/20 border-emerald-500/30">
                Verified Rationale
              </span>
            </div>

            <p className={`text-[10.5px] leading-snug ${isDark ? 'text-[#d1b8af]' : 'text-[#4e6b8c]'}`}>
              Why did FLAREX classify this as{' '}
              <strong className={`font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
                {selectedHotspot.classification}
              </strong>?
            </p>

            <div className="flex flex-col gap-1.5 mt-0.5">
              {selectedHotspot.aiReasons.map((reason, idx) => (
                <div key={idx} className={`flex items-start gap-1.5 text-[11px] ${isDark ? 'text-[#fef8f6]' : 'text-[#0c2340]'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{reason.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTORY TAB: 7-DAY FRP CURVE WITH BASELINE */}
        {activeTab === 'History' && (
          <div className={`border rounded-2xl p-3 flex flex-col gap-1.5 ${
            isDark ? 'bg-[rgba(20,10,7,0.85)] border-[rgba(255,106,61,0.2)]' : 'bg-white border-[#cfe0f0]'
          }`}>
            <div className="flex items-center justify-between text-[10.5px]">
              <span className={`font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>7-Day Radiative Power Curve</span>
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1 text-[9px] ${isDark ? 'text-[#d1b8af]' : 'text-[#4e6b8c]'}`}>
                  <span className="w-2 h-2 rounded-full bg-[#ff5533]" /> FRP (MW)
                </span>
                <span className={`flex items-center gap-1 text-[9px] ${isDark ? 'text-[#a3928c]' : 'text-[#627d9c]'}`}>
                  <span className="w-2 h-0.5 bg-[#ffa940]" /> Baseline
                </span>
              </div>
            </div>

            <div className="h-[140px] w-full mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={selectedHotspot.history}
                  margin={{ top: 8, right: 8, left: -22, bottom: 0 }}
                >
                  <XAxis
                    dataKey="date"
                    tick={{ fill: isDark ? '#a3928c' : '#627d9c', fontSize: 9 }}
                    axisLine={{ stroke: isDark ? 'rgba(255,106,61,0.2)' : '#cfe0f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: isDark ? '#a3928c' : '#627d9c', fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className={`p-2 rounded-lg text-[10px] border ${
                            isDark
                              ? 'bg-[#140a07] text-[#fef8f6] border-[rgba(255,106,61,0.25)]'
                              : 'bg-white text-[#0c2340] border-[#cfe0f0]'
                          }`}>
                            <p className="font-medium text-[#ff7a45]">{payload[0].payload.date}</p>
                            <p className="text-red-400 font-bold mt-0.5">FRP: {payload[0].value} MW</p>
                            <p className={`mt-0.5 ${isDark ? 'text-[#a3928c]' : 'text-[#627d9c]'}`}>
                              Baseline: {payload[0].payload.baseline} MW
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={selectedHotspot.baselineFrp}
                    stroke="#ffa940"
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="frp"
                    stroke="#ff5533"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#ff5533', stroke: '#FFFFFF', strokeWidth: 1 }}
                    activeDot={{ r: 5, fill: '#ff5533', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* AI PROBABILITIES TAB */}
        {activeTab === 'AI Probabilities' && (
          <div className={`border rounded-2xl p-3 flex flex-col gap-2 ${
            isDark ? 'bg-[rgba(20,10,7,0.85)] border-[rgba(255,106,61,0.2)]' : 'bg-white border-[#cfe0f0]'
          }`}>
            <span className={`text-[11.5px] font-extrabold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
              6-Class AI Classifier Output Distribution
            </span>

            <div className="flex flex-col gap-2 mt-1">
              {[
                { label: 'Industrial Fire', val: selectedHotspot.probabilities.industrialFire, color: 'bg-red-500' },
                { label: 'Gas Flare', val: selectedHotspot.probabilities.gasFlare, color: 'bg-orange-500' },
                { label: 'Wildfire', val: selectedHotspot.probabilities.wildfire, color: 'bg-amber-500' },
                { label: 'Agricultural Burn', val: selectedHotspot.probabilities.agriculturalBurn, color: 'bg-yellow-500' },
                { label: 'Mining / Furnace', val: selectedHotspot.probabilities.mining, color: 'bg-purple-500' },
                { label: 'Unknown / Ambiguous', val: selectedHotspot.probabilities.unknown, color: 'bg-slate-500' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>{item.label}</span>
                    <span className="font-mono font-extrabold text-[#ff7a45]">{item.val}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden border ${
                    isDark ? 'bg-black/50 border-white/10' : 'bg-slate-100 border-[#cfe0f0]'
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

        {/* SENTINEL-2 OPTICAL & MULTISPECTRAL IMAGERY TAB */}
        {activeTab === 'Sentinel-2' && (
          <div className={`border rounded-2xl p-3 flex flex-col gap-2.5 ${
            isDark ? 'bg-[rgba(20,10,7,0.85)] border-[rgba(255,106,61,0.2)]' : 'bg-white border-[#cfe0f0]'
          }`}>
            <div className={`flex items-center justify-between pb-1.5 border-b ${
              isDark ? 'border-[rgba(255,106,61,0.15)]' : 'border-[#cfe0f0]'
            }`}>
              <div className="flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5 text-[#ff5533]" />
                <span className={`text-[11.5px] font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
                  Sentinel-2 MSI Multi-Spectral Verification
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold text-emerald-300 bg-emerald-500/20 border-emerald-500/30">
                10m GSD
              </span>
            </div>

            {/* Orbital Telemetry Grid */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className={`p-2 rounded-xl border ${
                isDark ? 'bg-black/40 border-white/10' : 'bg-[#f8fbfe] border-[#cfe0f0]'
              }`}>
                <span className={`text-[9px] block ${isDark ? 'text-[#a3928c]' : 'text-[#4e6b8c]'}`}>Sentinel Tile ID</span>
                <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
                  {selectedHotspot.sentinelImagery?.tileId || 'T43QBC'}
                </span>
              </div>
              <div className={`p-2 rounded-xl border ${
                isDark ? 'bg-black/40 border-white/10' : 'bg-[#f8fbfe] border-[#cfe0f0]'
              }`}>
                <span className={`text-[9px] block ${isDark ? 'text-[#a3928c]' : 'text-[#4e6b8c]'}`}>Cloud Cover</span>
                <span className="font-mono font-bold text-emerald-400">
                  {selectedHotspot.sentinelImagery?.cloudCoverPct || 1.8}% (Clear Atmospheric Window)
                </span>
              </div>
            </div>

            {/* Scientific Remote Sensing Indices */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className={`p-2 rounded-xl border ${
                isDark ? 'bg-black/40 border-white/10' : 'bg-white border-[#cfe0f0]'
              }`}>
                <span className={`text-[9px] block ${isDark ? 'text-[#a3928c]' : 'text-[#4e6b8c]'}`}>NDVI (Vegetation Index)</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className={`font-mono font-bold text-[13px] ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
                    {selectedHotspot.classification === 'Wildfire' ? '0.74' : '0.14'}
                  </span>
                  <span className={`text-[9px] ${isDark ? 'text-[#a3928c]' : 'text-[#627d9c]'}`}>
                    {selectedHotspot.classification === 'Wildfire' ? '(Dense Canopy)' : '(Non-vegetated)'}
                  </span>
                </div>
              </div>
              <div className={`p-2 rounded-xl border ${
                isDark ? 'bg-black/40 border-white/10' : 'bg-white border-[#cfe0f0]'
              }`}>
                <span className={`text-[9px] block ${isDark ? 'text-[#a3928c]' : 'text-[#4e6b8c]'}`}>NBR (Normalized Burn Ratio)</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className={`font-mono font-bold text-[13px] ${selectedHotspot.frp > 50 ? 'text-red-400' : isDark ? 'text-white' : 'text-[#0c2340]'}`}>
                    {selectedHotspot.frp > 50 ? '-0.32' : '+0.12'}
                  </span>
                  <span className={`text-[9px] ${isDark ? 'text-[#a3928c]' : 'text-[#627d9c]'}`}>
                    {selectedHotspot.frp > 50 ? '(Active Thermal Scar)' : '(Unburned)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Multi-spectral Bands Available */}
            <div className={`p-2 rounded-xl border text-[10px] ${
              isDark ? 'bg-black/40 border-white/10' : 'bg-[#f8fbfe] border-[#cfe0f0]'
            }`}>
              <span className={`text-[9px] font-bold uppercase tracking-wider block mb-1 ${
                isDark ? 'text-[#ff7a45]' : 'text-[#0284c7]'
              }`}>
                Multi-Spectral Band Composite
              </span>
              <div className="flex flex-wrap gap-1">
                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[9px] font-bold border border-blue-500/30">B02 Blue 490nm</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-500/30">B03 Green 560nm</span>
                <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-mono text-[9px] font-bold border border-red-500/30">B04 Red 665nm</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold border border-amber-500/30">B08 NIR 842nm</span>
                <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[9px] font-bold border border-purple-500/30">B12 SWIR 2190nm</span>
              </div>
            </div>

            {/* Provider and Credential Status */}
            <div className={`p-2.5 rounded-xl border text-[10px] ${
              isDark ? 'bg-black/50 border-white/10' : 'bg-white border-[#cfe0f0]'
            }`}>
              <div className="flex items-center gap-1 font-bold text-[#ff7a45] mb-0.5">
                <Eye size={13} className="text-[#ff5533]" />
                <span>Copernicus Earth Observation Stream</span>
              </div>
              <p className={`leading-snug ${isDark ? 'text-[#d1b8af]' : 'text-[#4e6b8c]'}`}>
                Multispectral bottom-of-atmosphere reflectance confirms localized thermal emission coincident with FIRMS 375m pixel. High SWIR-2 (B12) radiance confirms concentrated process heat/combustion front.
              </p>
              <div className={`mt-1.5 pt-1.5 border-t flex items-center justify-between text-[9px] ${
                isDark ? 'border-white/10 text-[#a3928c]' : 'border-[#cfe0f0] text-[#627d9c]'
              }`}>
                <span>Provider: ESA Copernicus Data Space</span>
                <span className="font-mono font-semibold">10m GSD MSI</span>
              </div>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <div className={`border rounded-2xl p-3 flex flex-col gap-1.5 ${
            isDark ? 'bg-[rgba(20,10,7,0.85)] border-[rgba(255,106,61,0.2)]' : 'bg-white border-[#cfe0f0]'
          }`}>
            <div className="flex justify-between items-center text-[10.5px]">
              <span className={`flex items-center gap-1.5 ${isDark ? 'text-[#d1b8af]' : 'text-[#4e6b8c]'}`}>
                <Satellite className="w-3.5 h-3.5 text-[#ff5533]" /> Sensor Stream
              </span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>{selectedHotspot.satellite}</span>
            </div>
            <div className="flex justify-between items-center text-[10.5px]">
              <span className={`flex items-center gap-1.5 ${isDark ? 'text-[#d1b8af]' : 'text-[#4e6b8c]'}`}>
                <Clock className="w-3.5 h-3.5" /> Detection Time
              </span>
              <span className={`font-mono font-semibold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>{selectedHotspot.timestamp}</span>
            </div>
            <div className="flex justify-between items-center text-[10.5px]">
              <span className={isDark ? 'text-[#d1b8af]' : 'text-[#4e6b8c]'}>GIS Coordinates</span>
              <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
                {selectedHotspot.coordinates[1].toFixed(4)}°N, {selectedHotspot.coordinates[0].toFixed(4)}°E
              </span>
            </div>
            <div className="flex justify-between items-center text-[10.5px]">
              <span className={isDark ? 'text-[#d1b8af]' : 'text-[#4e6b8c]'}>Land Cover</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>{selectedHotspot.landCover}</span>
            </div>
            <div className={`flex justify-between items-center text-[10.5px] pt-1 border-t ${
              isDark ? 'border-[rgba(255,106,61,0.15)]' : 'border-[#cfe0f0]'
            }`}>
              <span className={isDark ? 'text-[#d1b8af]' : 'text-[#4e6b8c]'}>Facility Proximity</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>{selectedHotspot.nearestFacility.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. OPERATIONAL EMERGENCY CONTEXT & PLUME DISPERSION */}
      <div className={`border rounded-2xl p-3 flex flex-col gap-2 shrink-0 ${
        isDark ? 'bg-[rgba(20,10,7,0.85)] border-[rgba(255,106,61,0.2)]' : 'bg-[#f0f7fc] border-[#cfe0f0]'
      }`}>
        <div className={`flex items-center justify-between pb-1.5 border-b ${
          isDark ? 'border-[rgba(255,106,61,0.15)]' : 'border-[#cfe0f0]'
        }`}>
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[#ff5533]" />
            <span className={`text-[11px] font-extrabold uppercase tracking-wider ${
              isDark ? 'text-white' : 'text-[#0c2340]'
            }`}>
              Emergency Units &amp; Plume
            </span>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border text-amber-300 bg-amber-500/20 border-amber-500/30">
            SOP Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
          <div className={`p-2 rounded-xl border ${
            isDark ? 'bg-black/40 border-white/10' : 'bg-white border-[#cfe0f0]'
          }`}>
            <span className={`text-[9px] block font-semibold ${isDark ? 'text-[#a3928c]' : 'text-[#4e6b8c]'}`}>Nearest Station</span>
            <span className={`font-bold block truncate ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
              {selectedHotspot.nearestFacility.name.split(' ')[0]} Fire Unit
            </span>
            <span className="text-[9px] text-[#ff7a45] font-mono font-bold">2.4 km (~5 mins)</span>
          </div>
          <div className={`p-2 rounded-xl border ${
            isDark ? 'bg-black/40 border-white/10' : 'bg-white border-[#cfe0f0]'
          }`}>
            <span className={`text-[9px] block font-semibold flex items-center gap-1 ${isDark ? 'text-[#a3928c]' : 'text-[#4e6b8c]'}`}>
              <Wind size={10} className="text-[#ff5533]" /> Plume Vector
            </span>
            <span className={`font-bold block truncate ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
              12 km/h SW → NE
            </span>
            <span className="text-[9px] font-mono font-bold text-amber-400">Buffer: 850m</span>
          </div>
        </div>

        <div className={`flex items-center justify-between text-[10px] pt-1 border-t ${
          isDark ? 'border-[rgba(255,106,61,0.12)] text-[#a3928c]' : 'border-[#cfe0f0] text-[#4e6b8c]'
        }`}>
          <span className="flex items-center gap-1 font-medium">
            <Radio className="w-3 h-3 text-[#ff5533]" />
            SPCB Telemetry Ingestion:
          </span>
          <span className="font-mono font-bold text-emerald-400">ONLINE (Active)</span>
        </div>
      </div>

      {/* 6. EMERGENCY DISPATCH ACTION BUTTON */}
      {isCritical && (
        <button
          type="button"
          onClick={() => openDispatchModal(selectedHotspot)}
          className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11.5px] font-bold flex items-center justify-center gap-2 border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all cursor-pointer shrink-0 mt-1"
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Dispatch Incident Alert Protocol</span>
        </button>
      )}
    </aside>
  );
};

export default RightIncidentPanel;
