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
          <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-[#ffedd5] text-[#ea580c] uppercase tracking-wider">
            Radiant Orange Theme
          </span>
        </h3>
        
        <div className="grid grid-cols-2 gap-2.5">
          {/* Radiant Orange Mode Card */}
          <div
            onClick={() => {
              setTheme('light');
              addToast('Radiant Orange Theme active', 'success');
            }}
            className="p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 relative overflow-hidden bg-[#fff7ed] border-[#ea580c]"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ffedd5] to-[#fee2e2] border border-[#fed7aa] flex items-center justify-center">
                <Flame size={15} className="text-[#ea580c] fill-[#ea580c]/60" />
              </div>
              <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
            </div>
            <div>
              <span className="text-[11.5px] font-bold block text-[#431407]">Radiant Orange</span>
              <span className="text-[9px] text-[#7c2d12] block font-medium mt-0.5">
                Crisp high-contrast thermal UI
              </span>
            </div>
          </div>

          {/* Daylight Warm Card */}
          <div
            onClick={() => {
              setTheme('light');
              addToast('Daylight View active', 'info');
            }}
            className="p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 relative overflow-hidden bg-[#fffbf8] border-[#fed7aa] hover:border-[#fdba74]"
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-[#fff7ed] border border-[#fed7aa] flex items-center justify-center">
                <Sun size={15} className="text-[#ea580c]" />
              </div>
            </div>
            <div>
              <span className="text-[11.5px] font-bold block text-[#431407]">
                Daylight Ambient
              </span>
              <span className="text-[9px] block font-medium mt-0.5 text-[#9a3412]">
                Zero-shadow clean design
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
              <Layers size={14} className="text-[#ea580c]" />
              <div>
                <span className="text-[11.5px] font-bold block text-[#431407]">
                  GIS State &amp; District Boundaries
                </span>
                <span className="text-[9.5px] block font-medium text-[#7c2d12]">
                  Administrative boundary overlay
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleLayer('boundaries')}
              className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${
                activeLayers.boundaries
                  ? 'bg-[#ea580c]'
                  : 'bg-[#ffedd5]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  activeLayers.boundaries ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#fed7aa]/60">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-amber-600" />
              <div>
                <span className="text-[11.5px] font-bold block text-[#431407]">
                  Industrial Facility Clusters
                </span>
                <span className="text-[9.5px] block font-medium text-[#7c2d12]">
                  SEZ &amp; petrochemical landmarks
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleLayer('industrial')}
              className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${
                activeLayers.industrial
                  ? 'bg-[#ea580c]'
                  : 'bg-[#ffedd5]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
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
              <span className="font-semibold text-[#7c2d12]">
                Critical FRP Alert Trigger:
              </span>
              <span className="font-mono font-bold text-red-600">{criticalFrpThreshold} MW</span>
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
                addToast(`Critical FRP threshold updated to ${val} MW`, 'info');
              }}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#ea580c] bg-[#ffedd5]"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#fed7aa]/60">
            <div className="flex items-center gap-2">
              <Volume2 size={14} className="text-[#ea580c]" />
              <div>
                <span className="text-[11.5px] font-bold block text-[#431407]">
                  Audio Alarm for Critical Incidents
                </span>
                <span className="text-[9.5px] block font-medium text-[#7c2d12]">
                  Synthesized web audio chime on critical anomalies
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !audioAlerts;
                setAudioAlerts(next);
                addToast(next ? 'Audio alarms enabled' : 'Audio alarms silenced', 'info');
              }}
              className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${
                audioAlerts
                  ? 'bg-[#ea580c]'
                  : 'bg-[#ffedd5]'
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
            <span className="text-[11px] font-semibold text-[#7c2d12]">
              Temperature Unit
            </span>
            <div className="flex p-0.5 rounded-lg border bg-[#fff7ed] border-[#fed7aa]">
              <button
                type="button"
                onClick={() => {
                  setTempUnit('C');
                  addToast('Temperature unit set to Celsius (°C)', 'info');
                }}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  tempUnit === 'C'
                    ? 'bg-[#ea580c] text-white'
                    : 'text-[#7c2d12] hover:text-[#431407]'
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
                    ? 'bg-[#ea580c] text-white'
                    : 'text-[#7c2d12] hover:text-[#431407]'
                }`}
              >
                °F (Fahrenheit)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#fed7aa]/60">
            <span className="text-[11px] font-semibold text-[#7c2d12]">
              Satellite Cadence
            </span>
            <select
              value={syncCadence}
              onChange={(e) => {
                setSyncCadence(e.target.value);
                addToast(`Telemetry sync cadence set to ${e.target.value}`, 'info');
              }}
              className="text-[10.5px] font-semibold border rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer bg-white text-[#431407] border-[#fed7aa] focus:border-[#ea580c]"
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
        className="w-full py-2 px-3 rounded-xl border bg-[#fff7ed] hover:bg-[#ffedd5] text-[#7c2d12] hover:text-[#431407] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1"
      >
        <RotateCcw size={13} />
        <span>Restore Documented Defaults</span>
      </button>
    </div>
  );
}

export { SettingsPanel };
