'use client';

import React from 'react';
import { Sliders, MapPin, Bell, Eye, Database, Shield, Volume2, Layers, Flame, Sun, RotateCcw } from 'lucide-react';
import { useIntelligence } from '@/context/IntelligenceContext';

export default function SettingsPanel() {
  const {
    activeLayers,
    toggleLayer,
    addToast,
    theme,
    setTheme,
    tempUnit,
    setTempUnit,
    criticalFrpThreshold,
    setMinFrpThreshold,
    syncCadence,
    setSyncCadence,
    audioAlerts,
    setAudioAlerts,
  } = useIntelligence();

  const isDark = theme === 'dark';

  const handleResetDefaults = () => {
    setTempUnit('C');
    setMinFrpThreshold(15);
    setSyncCadence('30s');
    setAudioAlerts(true);
    addToast('System settings restored to operational baseline defaults.', 'success');
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 0. VISUAL THEME & APPEARANCE */}
      <section className="flarex-section">
        <h3 className="flarex-section-title flex items-center justify-between">
          <span>Theme &amp; Appearance</span>
          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
            isDark ? 'bg-[rgba(255,85,45,0.15)] text-[#ff7a45]' : 'bg-[#e0f2fe] text-[#0284c7]'
          }`}>
            {isDark ? 'Dark Flame Mode' : 'Arctic Light Mode'}
          </span>
        </h3>
        
        <div className="grid grid-cols-2 gap-2.5">
          {/* Flame Dark Mode Card */}
          <div
            onClick={() => {
              setTheme('dark');
              addToast('Dark Flame Theme activated', 'success');
            }}
            className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 relative overflow-hidden ${
              isDark
                ? 'bg-[rgba(255,85,45,0.14)] border-[#ff5533] shadow-[0_0_18px_rgba(255,85,45,0.25)]'
                : 'bg-[#0f0705] border-[#ff5533]/30 hover:border-[#ff5533]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ff5a3c]/30 to-[#b32400]/20 border border-[#ff6a3d]/40 flex items-center justify-center">
                <Flame size={15} className="text-[#ff5533] fill-[#ff5533]/60" />
              </div>
              {isDark ? (
                <span className="w-2 h-2 rounded-full bg-[#ff5533] shadow-[0_0_8px_#ff5533]" />
              ) : (
                <span className="text-[8.5px] font-bold text-[#ff7a45] uppercase tracking-wider">Switch</span>
              )}
            </div>
            <div>
              <span className="text-[11.5px] font-bold block text-white">Flame Dark Mode</span>
              <span className="text-[9px] text-[#a3928c] block font-medium mt-0.5">
                Obsidian thermal magma theme
              </span>
            </div>
          </div>

          {/* Arctic Light Mode Card */}
          <div
            onClick={() => {
              setTheme('light');
              addToast('Arctic Light Mode activated', 'info');
            }}
            className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 relative overflow-hidden ${
              !isDark
                ? 'bg-[#e0f2fe] border-[#0284c7] shadow-[0_0_16px_rgba(2,132,199,0.2)]'
                : 'bg-white/[0.06] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-[#e0f2fe] border border-[#bae6fd] flex items-center justify-center">
                <Sun size={15} className="text-[#0284c7]" />
              </div>
              {!isDark ? (
                <span className="w-2 h-2 rounded-full bg-[#0284c7] shadow-[0_0_8px_#0284c7]" />
              ) : (
                <span className="text-[8.5px] font-bold text-[#0284c7] uppercase tracking-wider">Switch</span>
              )}
            </div>
            <div>
              <span className={`text-[11.5px] font-bold block ${!isDark ? 'text-[#0c2340]' : 'text-white'}`}>
                Arctic Light Mode
              </span>
              <span className={`text-[9px] block font-medium mt-0.5 ${!isDark ? 'text-[#5b7596]' : 'text-[#a3928c]'}`}>
                Clean bluish-white daylight
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 1. MAP & GIS LAYERS */}
      <section className="flarex-section">
        <h3 className="flarex-section-title">Geospatial Map Layers</h3>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-orange-500" />
              <div>
                <span className={`text-[11.5px] font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  GIS State &amp; District Boundaries
                </span>
                <span className={`text-[9.5px] block font-medium ${isDark ? 'text-[#a3928c]' : 'text-slate-500'}`}>
                  Administrative boundary overlay
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleLayer('boundaries')}
              className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${
                activeLayers.boundaries
                  ? 'bg-[#ff5533]'
                  : isDark ? 'bg-white/10' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                  activeLayers.boundaries ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className={`flex items-center justify-between pt-2 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-amber-500" />
              <div>
                <span className={`text-[11.5px] font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Industrial Facility Clusters
                </span>
                <span className={`text-[9.5px] block font-medium ${isDark ? 'text-[#a3928c]' : 'text-slate-500'}`}>
                  SEZ &amp; petrochemical landmarks
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleLayer('industrial')}
              className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${
                activeLayers.industrial
                  ? 'bg-[#ff5533]'
                  : isDark ? 'bg-white/10' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                  activeLayers.industrial ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 2. ALERTS & THRESHOLDS */}
      <section className="flarex-section">
        <h3 className="flarex-section-title">Telemetry Alert Thresholds</h3>
        <div className="flex flex-col gap-3">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className={`font-semibold ${isDark ? 'text-[#d1b8af]' : 'text-slate-600'}`}>
                Critical FRP Alert Trigger:
              </span>
              <span className="font-mono font-bold text-red-500">{criticalFrpThreshold} MW</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={criticalFrpThreshold}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMinFrpThreshold(val);
              }}
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#ff5533] ${
                isDark ? 'bg-white/10' : 'bg-slate-200'
              }`}
            />
          </div>

          <div className={`flex items-center justify-between pt-2 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            <div className="flex items-center gap-2">
              <Volume2 size={14} className="text-orange-500" />
              <div>
                <span className={`text-[11.5px] font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Audio Alarm for Critical Incidents
                </span>
                <span className={`text-[9.5px] block font-medium ${isDark ? 'text-[#a3928c]' : 'text-slate-500'}`}>
                  Synthesized web audio chime on critical anomalies
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAudioAlerts(!audioAlerts)}
              className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${
                audioAlerts
                  ? 'bg-[#ff5533]'
                  : isDark ? 'bg-white/10' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  audioAlerts ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 3. DISPLAY & SYSTEM CADENCE */}
      <section className="flarex-section">
        <h3 className="flarex-section-title">Display &amp; Telemetry Stream</h3>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold ${isDark ? 'text-[#d1b8af]' : 'text-slate-700'}`}>
              Temperature Unit
            </span>
            <div className={`flex p-0.5 rounded-lg border ${
              isDark ? 'bg-black/40 border-white/10' : 'bg-white border-[#cfe0f0]'
            }`}>
              <button
                type="button"
                onClick={() => {
                  setTempUnit('C');
                  addToast('Temperature unit set to Celsius (°C)', 'info');
                }}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  tempUnit === 'C'
                    ? 'bg-[#ff5533] text-white shadow-xs'
                    : isDark ? 'text-[#d1b8af] hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                °C (Celsius)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTempUnit('F');
                  addToast('Temperature unit set to Fahrenheit (°F)', 'info');
                }}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  tempUnit === 'F'
                    ? 'bg-[#ff5533] text-white shadow-xs'
                    : isDark ? 'text-[#d1b8af] hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                °F (Fahrenheit)
              </button>
            </div>
          </div>

          <div className={`flex items-center justify-between pt-2 border-t ${isDark ? 'border-white/10' : 'border-[#cfe0f0]'}`}>
            <span className={`text-[11px] font-semibold ${isDark ? 'text-[#d1b8af]' : 'text-slate-700'}`}>
              Satellite Cadence
            </span>
            <select
              value={syncCadence}
              onChange={(e) => {
                setSyncCadence(e.target.value);
                addToast(`Telemetry sync cadence set to ${e.target.value}`, 'info');
              }}
              className={`text-[10.5px] font-semibold border rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer ${
                isDark
                  ? 'bg-black/40 text-white border-white/10 focus:border-[#ff5533]'
                  : 'bg-white text-[#0c2340] border-[#cfe0f0] focus:border-[#0284c7]'
              }`}
            >
              <option value="15s">15 Seconds (Rapid NRT)</option>
              <option value="30s">30 Seconds (Default)</option>
              <option value="60s">60 Seconds</option>
              <option value="5m">5 Minutes (Power Saver)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Reset Defaults Action */}
      <button
        type="button"
        onClick={handleResetDefaults}
        className={`w-full py-2 px-3 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1 ${
          isDark
            ? 'bg-white/5 hover:bg-white/10 text-[#d1b8af] hover:text-white border-white/10'
            : 'bg-[#f0f5fa] hover:bg-[#e0f2fe] text-[#4e6b8c] hover:text-[#0c2340] border-[#cfe0f0]'
        }`}
      >
        <RotateCcw size={13} />
        <span>Restore Operational Defaults</span>
      </button>
    </div>
  );
}

export { SettingsPanel };
