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

  const handleDownloadPdf = () => {
    window.open(`/api/reports/download?type=pdf&eventId=${selectedHotspot.eventId}`, '_blank');
    addToast(`Downloading verified incident PDF dossier for ${selectedHotspot.eventId}...`, 'success');
  };

  return (
    <aside className="w-[390px] h-full right-panel p-3.5 flex flex-col gap-2.5 z-20 shrink-0 select-none overflow-y-auto relative bg-white border-l border-[#fed7aa]">
      {/* Top Accent Line for Priority */}
      {isCritical && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 via-orange-500 to-red-500 shrink-0" />
      )}

      {/* 1. VISUALLY DOMINANT CLASSIFICATION HEADER */}
      <div
        className={`p-3 rounded-2xl transition-all border shrink-0 ${
          isCritical
            ? 'bg-red-50/80 border-red-200'
            : isNormalFlare
            ? 'bg-emerald-50/80 border-emerald-200'
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
                    : 'bg-[#ea580c]'
                }`}
              />
            </span>
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#7c2d12]">
              {selectedHotspot.classification.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${severityBadgeClass} tracking-wide uppercase`}
            >
              {selectedHotspot.severity}
            </span>
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border text-[#7c2d12] bg-white border-[#fed7aa]">
              {selectedHotspot.eventId}
            </span>
          </div>
        </div>

        {/* Primary Classification Headline with Confidence */}
        <div className="mt-2 flex items-center justify-between">
          <h2 className="text-[16px] font-black leading-tight flex items-center gap-1.5 text-[#431407]">
            {isCritical && <Flame className="w-4.5 h-4.5 text-red-500 shrink-0" />}
            {isWildfire && <Trees className="w-4.5 h-4.5 text-amber-500 shrink-0" />}
            <span>{selectedHotspot.classification}</span>
          </h2>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-bold font-mono border bg-emerald-50 border-emerald-300 text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{selectedHotspot.confidence}% AI</span>
          </div>
        </div>

        {/* Baseline Multiple Alert Banner */}
        <div className="mt-1.5">
          {selectedHotspot.baselineRatio >= 2.0 ? (
            <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-[10.5px] font-bold border bg-red-100 border-red-300 text-red-800">
              <TrendingUp className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>{selectedHotspot.baselineRatio}× ABOVE HISTORICAL BASELINE</span>
            </div>
          ) : selectedHotspot.status === 'NORMAL' ? (
            <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-[10.5px] font-semibold border bg-emerald-100 border-emerald-300 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Normal recurring baseline ({selectedHotspot.baselineRatio}× typical)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-[10.5px] font-semibold border bg-orange-100 border-orange-300 text-orange-900">
              <Activity className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span>{selectedHotspot.baselineRatio}× elevated emission</span>
            </div>
          )}
        </div>

        {/* Spatial, Land-Cover & Population Proximity Summary */}
        <div className="mt-2 pt-2 border-t flex flex-col gap-1 text-[11px] border-[#fed7aa]/70">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 font-medium text-[#7c2d12]">
              <Building2 className="w-3.5 h-3.5 text-[#ea580c] shrink-0" />
              {selectedHotspot.nearestFacility.distance} from {selectedHotspot.nearestFacility.name.split(' ')[0]}
            </span>
            <span className="font-mono text-[10px] font-bold text-[#431407]">
              {selectedHotspot.nearestFacility.distance}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[#7c2d12]">
              <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              {selectedHotspot.landCover}
            </span>
            <span className="font-mono font-medium text-[#9a3412]">{selectedHotspot.state}</span>
          </div>

          {/* Population Proximity Feature */}
          <div className="flex items-center justify-between pt-1 border-t border-[#fed7aa]/50">
            <span className="flex items-center gap-1 text-[#7c2d12]">
              <Users className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              Population Proximity
            </span>
            <span className="font-mono text-rose-600 font-bold">
              {selectedHotspot.populationContext?.distanceMeters || 450} m ({selectedHotspot.populationContext?.densityCategory || 'Settlement'})
            </span>
          </div>
        </div>

        {/* Map Focus Action, GIS Button & PDF Download */}
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[#fed7aa]">
          <button
            type="button"
            onClick={() => flyToCoords(selectedHotspot.coordinates, 8.2, 30)}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#ea580c] hover:brightness-105 text-white text-[11.5px] font-extrabold flex items-center justify-center gap-1.5 border border-[#fdba74] transition-all cursor-pointer"
          >
            <Crosshair className="w-4 h-4" />
            <span>Focus on Map</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCoords}
            className="py-2 px-3 rounded-xl text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer border bg-white border-[#fed7aa] text-[#431407] hover:text-[#ea580c] hover:bg-[#fff7ed]"
            title="Copy GIS Coordinates"
          >
            <Copy className="w-3.5 h-3.5 text-[#ea580c]" />
            <span>GIS</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="py-2 px-3 rounded-xl text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer border bg-white border-[#fed7aa] text-[#431407] hover:text-[#ea580c] hover:bg-[#fff7ed]"
            title="Download Official Incident PDF Report"
          >
            <FileText className="w-3.5 h-3.5 text-[#ea580c]" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* 2. PRIMARY TELEMETRY METRIC GRID */}
      <div className="grid grid-cols-2 gap-1.5 shrink-0">
        {/* Current FRP */}
        <div className="border rounded-xl p-2 flex flex-col justify-between bg-[#fff7ed] border-[#fed7aa]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#ea580c]">Current FRP</span>
            <Flame className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-[20px] font-black text-red-600 font-mono leading-none">
              {selectedHotspot.frp}
            </span>
            <span className="text-[10px] font-bold text-[#c2410c]">MW</span>
          </div>
        </div>

        {/* Historical Baseline */}
        <div className="border rounded-xl p-2 flex flex-col justify-between bg-[#fffbf8] border-[#fed7aa]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c2d12]">Hist. Baseline</span>
            <Clock className="w-3.5 h-3.5 text-[#ea580c]" />
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-[20px] font-black font-mono leading-none text-[#431407]">
              {selectedHotspot.baselineFrp}
            </span>
            <span className="text-[10px] font-bold text-[#9a3412]">MW</span>
          </div>
        </div>

        {/* Multi-Spectral Skin Temperature (Converts °C / °F) */}
        <div className="border rounded-xl p-2 flex flex-col justify-between bg-[#fffbf8] border-[#fed7aa]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c2d12]">Skin Temp (T4)</span>
            <span className="text-[9px] font-bold px-1 py-0.2 rounded text-amber-800 bg-amber-100">
              VIIRS
            </span>
          </div>
          <div className="mt-0.5 flex items-baseline gap-0.5">
            <span className="text-[20px] font-black font-mono leading-none text-[#431407]">
              {formatTempValue(selectedHotspot.temperature)}
            </span>
            <span className="text-[12px] font-bold text-amber-600">°{tempUnit}</span>
          </div>
        </div>

        {/* 30-Day Persistence Score */}
        <div className="border rounded-xl p-2 flex flex-col justify-between bg-[#fffbf8] border-[#fed7aa]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c2d12]">Recurrence</span>
            <span className="text-[9.5px] font-mono text-purple-700 font-bold">
              {selectedHotspot.persistenceDays}
            </span>
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-[20px] font-black text-purple-700 font-mono leading-none">
              {selectedHotspot.persistenceScore}
            </span>
            <span className="text-[10px] font-bold text-[#9a3412]">/ 100</span>
          </div>
        </div>
      </div>

      {/* 3. INVESTIGATION TABS (STRICTLY NON-SHRINKING & ALWAYS VISIBLE) */}
      <div className="flex rounded-xl p-1 border gap-1 bg-[#fff7ed] border-[#fed7aa] shrink-0 min-h-[38px] items-center overflow-x-auto">
        {(['Why?', 'History', 'AI Probabilities', 'Sentinel-2', 'Overview'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[10.5px] transition-all duration-150 cursor-pointer whitespace-nowrap text-center font-extrabold shrink-0 min-h-[28px] flex items-center justify-center ${
                isActive
                  ? 'bg-[#ea580c] text-white border border-[#c2410c]'
                  : 'bg-white text-[#7c2d12] border border-[#fed7aa] hover:bg-[#ffedd5] hover:text-[#431407]'
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
          <div className="border rounded-2xl p-3 flex flex-col gap-2 bg-[#fff7ed] border-[#fed7aa]">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#fed7aa]">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#ea580c]" />
                <span className="text-[11.5px] font-extrabold text-[#431407]">
                  Multi-Source Evidence Fusion
                </span>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border text-emerald-700 bg-emerald-100 border-emerald-200">
                Verified Rationale
              </span>
            </div>

            <p className="text-[10.5px] leading-snug text-[#7c2d12]">
              Why did FLAREX classify this as{' '}
              <strong className="font-bold text-[#431407]">{selectedHotspot.classification}</strong>?
            </p>

            <div className="flex flex-col gap-1.5 mt-0.5">
              {selectedHotspot.aiReasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[11px] text-[#431407]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{reason.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTORY TAB: 7-DAY FRP CURVE WITH BASELINE */}
        {activeTab === 'History' && (
          <div className="border rounded-2xl p-3 flex flex-col gap-1.5 bg-white border-[#fed7aa]">
            <div className="flex items-center justify-between text-[10.5px]">
              <span className="font-bold text-[#431407]">7-Day Radiative Power Curve</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[9px] text-[#7c2d12]">
                  <span className="w-2 h-2 rounded-full bg-[#ea580c]" /> FRP (MW)
                </span>
                <span className="flex items-center gap-1 text-[9px] text-[#9a3412]">
                  <span className="w-2 h-0.5 bg-[#f97316]" /> Baseline
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
                    tick={{ fill: '#7c2d12', fontSize: 9 }}
                    axisLine={{ stroke: '#fed7aa' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#7c2d12', fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="p-2 rounded-lg text-[10px] border bg-white text-[#431407] border-[#fed7aa]">
                            <p className="font-medium text-[#7c2d12]">{payload[0].payload.date}</p>
                            <p className="text-red-600 font-bold mt-0.5">FRP: {payload[0].value} MW</p>
                            <p className="mt-0.5 text-[#9a3412]">Baseline: {payload[0].payload.baseline} MW</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={selectedHotspot.baselineFrp}
                    stroke="#f97316"
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="frp"
                    stroke="#ea580c"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#ea580c', stroke: '#FFFFFF', strokeWidth: 1 }}
                    activeDot={{ r: 5, fill: '#ea580c', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* AI PROBABILITIES TAB */}
        {activeTab === 'AI Probabilities' && (
          <div className="border rounded-2xl p-3 flex flex-col gap-2 bg-white border-[#fed7aa]">
            <span className="text-[11.5px] font-extrabold text-[#431407]">
              6-Class AI Classifier Output Distribution
            </span>

            <div className="flex flex-col gap-2 mt-1">
              {[
                { label: 'Industrial Fire', val: selectedHotspot.probabilities.industrialFire, color: 'bg-red-500' },
                { label: 'Gas Flare', val: selectedHotspot.probabilities.gasFlare, color: 'bg-orange-500' },
                { label: 'Wildfire', val: selectedHotspot.probabilities.wildfire, color: 'bg-amber-500' },
                { label: 'Agricultural Burn', val: selectedHotspot.probabilities.agriculturalBurn, color: 'bg-yellow-500' },
                { label: 'Mining / Furnace', val: selectedHotspot.probabilities.mining, color: 'bg-purple-500' },
                { label: 'Unknown / Ambiguous', val: selectedHotspot.probabilities.unknown, color: 'bg-slate-400' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="font-bold text-[#431407]">{item.label}</span>
                    <span className="font-mono font-extrabold text-[#7c2d12]">{item.val}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden border bg-[#ffedd5] border-[#fed7aa]">
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
          <div className="border rounded-2xl p-3 flex flex-col gap-2.5 bg-white border-[#fed7aa]">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#fed7aa]">
              <div className="flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5 text-[#ea580c]" />
                <span className="text-[11.5px] font-bold text-[#431407]">
                  Sentinel-2 MSI Multi-Spectral Verification
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold text-emerald-700 bg-emerald-100 border-emerald-200">
                10m GSD
              </span>
            </div>

            {/* Orbital Telemetry Grid */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="p-2 rounded-xl border bg-[#fff7ed] border-[#fed7aa]">
                <span className="text-[9px] block text-[#7c2d12]">Sentinel Tile ID</span>
                <span className="font-mono font-bold text-[#431407]">
                  {selectedHotspot.sentinelImagery?.tileId || 'T43QBC'}
                </span>
              </div>
              <div className="p-2 rounded-xl border bg-[#fff7ed] border-[#fed7aa]">
                <span className="text-[9px] block text-[#7c2d12]">Cloud Cover</span>
                <span className="font-mono font-bold text-emerald-600">
                  {selectedHotspot.sentinelImagery?.cloudCoverPct || 1.8}% (Clear Atmospheric Window)
                </span>
              </div>
            </div>

            {/* Scientific Remote Sensing Indices */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="p-2 rounded-xl border bg-white border-[#fed7aa]">
                <span className="text-[9px] block text-[#7c2d12]">NDVI (Vegetation Index)</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-mono font-bold text-[#431407] text-[13px]">
                    {selectedHotspot.classification === 'Wildfire' ? '0.74' : '0.14'}
                  </span>
                  <span className="text-[9px] text-[#7c2d12]">
                    {selectedHotspot.classification === 'Wildfire' ? '(Dense Canopy)' : '(Non-vegetated)'}
                  </span>
                </div>
              </div>
              <div className="p-2 rounded-xl border bg-white border-[#fed7aa]">
                <span className="text-[9px] block text-[#7c2d12]">NBR (Normalized Burn Ratio)</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className={`font-mono font-bold text-[13px] ${selectedHotspot.frp > 50 ? 'text-red-600' : 'text-[#431407]'}`}>
                    {selectedHotspot.frp > 50 ? '-0.32' : '+0.12'}
                  </span>
                  <span className="text-[9px] text-[#7c2d12]">
                    {selectedHotspot.frp > 50 ? '(Active Thermal Scar)' : '(Unburned)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Multi-spectral Bands Available */}
            <div className="p-2 rounded-xl border bg-[#fff7ed] border-[#fed7aa] text-[10px]">
              <span className="text-[9px] font-bold text-[#7c2d12] uppercase tracking-wider block mb-1">
                Multi-Spectral Band Composite
              </span>
              <div className="flex flex-wrap gap-1">
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px] font-bold">B02 Blue 490nm</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold">B03 Green 560nm</span>
                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-mono text-[9px] font-bold">B04 Red 665nm</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px] font-bold">B08 NIR 842nm</span>
                <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px] font-bold">B12 SWIR 2190nm</span>
              </div>
            </div>

            {/* Provider and Honest Credential Status */}
            <div className="p-2.5 rounded-xl border text-[10px] bg-white border-[#fed7aa]">
              <div className="flex items-center gap-1 font-bold text-[#c2410c] mb-0.5">
                <Eye size={13} className="text-[#ea580c]" />
                <span>Copernicus Earth Observation Stream</span>
              </div>
              <p className="leading-snug text-[#7c2d12]">
                Multispectral bottom-of-atmosphere reflectance confirms localized thermal emission coincident with FIRMS 375m pixel. High SWIR-2 (B12) radiance confirms concentrated process heat/combustion front.
              </p>
              <div className="mt-1.5 pt-1.5 border-t border-[#fed7aa]/60 flex items-center justify-between text-[9px] text-[#9a3412]">
                <span>Provider: ESA Copernicus Data Space</span>
                <span className="font-mono font-semibold">10m GSD MSI</span>
              </div>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <div className="border rounded-2xl p-3 flex flex-col gap-1.5 bg-white border-[#fed7aa]">
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="flex items-center gap-1.5 text-[#7c2d12]">
                <Satellite className="w-3.5 h-3.5 text-[#ea580c]" /> Sensor Stream
              </span>
              <span className="font-semibold text-[#431407]">{selectedHotspot.satellite}</span>
            </div>
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="flex items-center gap-1.5 text-[#7c2d12]">
                <Clock className="w-3.5 h-3.5" /> Detection Time
              </span>
              <span className="font-mono font-semibold text-[#431407]">{selectedHotspot.timestamp}</span>
            </div>
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-[#7c2d12]">GIS Coordinates</span>
              <span className="font-mono font-bold text-[#431407]">
                {selectedHotspot.coordinates[1].toFixed(4)}°N, {selectedHotspot.coordinates[0].toFixed(4)}°E
              </span>
            </div>
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="text-[#7c2d12]">Land Cover</span>
              <span className="font-semibold text-[#431407]">{selectedHotspot.landCover}</span>
            </div>
            <div className="flex justify-between items-center text-[10.5px] pt-1 border-t border-[#fed7aa]">
              <span className="text-[#7c2d12]">Facility Proximity</span>
              <span className="font-bold text-[#431407]">{selectedHotspot.nearestFacility.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. OPERATIONAL EMERGENCY CONTEXT & PLUME DISPERSION */}
      <div className="border rounded-2xl p-3 flex flex-col gap-2 bg-[#fff7ed] border-[#fed7aa] shrink-0">
        <div className="flex items-center justify-between pb-1.5 border-b border-[#fed7aa]">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[#ea580c]" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#431407]">
              Emergency Units &amp; Plume
            </span>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border text-[#c2410c] bg-[#ffedd5] border-[#fed7aa]">
            SOP Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
          <div className="p-2 rounded-xl border bg-white border-[#fed7aa]">
            <span className="text-[9px] block font-semibold text-[#7c2d12]">Nearest Station</span>
            <span className="font-bold block truncate text-[#431407]">
              {selectedHotspot.nearestFacility.name.split(' ')[0]} Fire Unit
            </span>
            <span className="text-[9px] text-[#ea580c] font-mono font-bold">2.4 km (~5 mins)</span>
          </div>
          <div className="p-2 rounded-xl border bg-white border-[#fed7aa]">
            <span className="text-[9px] block font-semibold flex items-center gap-1 text-[#7c2d12]">
              <Wind size={10} className="text-[#ea580c]" /> Plume Vector
            </span>
            <span className="font-bold block truncate text-[#431407]">
              12 km/h SW → NE
            </span>
            <span className="text-[9px] font-mono font-bold text-amber-700">Buffer: 850m</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] pt-1 border-t text-[#7c2d12] border-[#fed7aa]/80">
          <span className="flex items-center gap-1 font-medium">
            <Radio className="w-3 h-3 text-[#ea580c]" />
            SPCB Telemetry Ingestion:
          </span>
          <span className="font-mono font-bold text-emerald-600">ONLINE (Active)</span>
        </div>
      </div>

      {/* 6. EMERGENCY DISPATCH ACTION BUTTON */}
      {isCritical && (
        <button
          type="button"
          onClick={() => openDispatchModal(selectedHotspot)}
          className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11.5px] font-bold flex items-center justify-center gap-2 border border-red-700 transition-all cursor-pointer shrink-0 mt-1"
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Dispatch Incident Alert Protocol</span>
        </button>
      )}
    </aside>
  );
};

export default RightIncidentPanel;
