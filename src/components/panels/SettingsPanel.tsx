'use client';

import React, { useState } from 'react';
import { Sliders, MapPin, Bell, Eye, Database, Shield, Volume2, Layers, Flame } from 'lucide-react';
import { useIntelligence } from '@/context/IntelligenceContext';

export default function SettingsPanel() {
  const {
    activeLayers,
    toggleLayer,
    addToast,
  } = useIntelligence();

  const [minFrpThreshold, setMinFrpThreshold] = useState<number>(15);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [syncCadence, setSyncCadence] = useState<string>('30s');
  const [audioAlerts, setAudioAlerts] = useState<boolean>(true);

  return (
    <div className="flex flex-col gap-3">
      {/* 1. MAP & GIS LAYERS */}
      <section className="flarex-section">
        <h3 className="flarex-section-title">Geospatial Map Layers</h3>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-[#ff7a45]" />
              <div>
                <span className="text-[11.5px] font-semibold text-white block">GIS State &amp; District Boundaries</span>
                <span className="text-[9.5px] text-[#a3928c] block">Administrative boundary overlay</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleLayer('boundaries')}
              className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${
                activeLayers.boundaries
                  ? 'bg-gradient-to-r from-[#ff5a3c] to-[#ff7a45] shadow-[0_0_10px_rgba(255,90,60,0.5)]'
                  : 'bg-[rgba(255,255,255,0.1)]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                  activeLayers.boundaries ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,106,61,0.1)]">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#ffa940]" />
              <div>
                <span className="text-[11.5px] font-semibold text-white block">Industrial Facility Clusters</span>
                <span className="text-[9.5px] text-[#a3928c] block">SEZ &amp; petrochemical landmarks</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleLayer('industrial')}
              className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${
                activeLayers.industrial
                  ? 'bg-gradient-to-r from-[#fa8c16] to-[#ffa940] shadow-[0_0_10px_rgba(250,140,22,0.5)]'
                  : 'bg-[rgba(255,255,255,0.1)]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
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
              <span className="text-[#d1b8af]">Critical FRP Alert Trigger:</span>
              <span className="font-mono font-bold text-[#ff505d]">{minFrpThreshold} MW</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={minFrpThreshold}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMinFrpThreshold(val);
              }}
              className="w-full h-1.5 bg-[rgba(255,255,255,0.1)] rounded-lg appearance-none cursor-pointer accent-[#ff5a3c]"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,106,61,0.1)]">
            <div className="flex items-center gap-2">
              <Volume2 size={14} className="text-[#ff7a45]" />
              <div>
                <span className="text-[11.5px] font-semibold text-white block">Audio Alarm for Critical Incidents</span>
                <span className="text-[9.5px] text-[#a3928c] block">Audible warning on FRP {'>'} 50MW</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setAudioAlerts(!audioAlerts);
                addToast(audioAlerts ? 'Audio alarms silenced' : 'Audio alarms enabled', 'info');
              }}
              className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${
                audioAlerts
                  ? 'bg-gradient-to-r from-[#ff5a3c] to-[#ff7a45] shadow-[0_0_10px_rgba(255,90,60,0.5)]'
                  : 'bg-[rgba(255,255,255,0.1)]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
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
            <span className="text-[11px] text-[#d1b8af]">Temperature Unit</span>
            <div className="flex bg-[rgba(255,90,45,0.06)] p-0.5 rounded-lg border border-[rgba(255,106,61,0.2)]">
              <button
                type="button"
                onClick={() => setTempUnit('C')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  tempUnit === 'C'
                    ? 'bg-gradient-to-r from-[#ff5a3c] to-[#ff7a45] text-white shadow-[0_0_10px_rgba(255,90,60,0.4)]'
                    : 'text-[#a3928c] hover:text-white'
                }`}
              >
                °C (Celsius)
              </button>
              <button
                type="button"
                onClick={() => setTempUnit('F')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  tempUnit === 'F'
                    ? 'bg-gradient-to-r from-[#ff5a3c] to-[#ff7a45] text-white shadow-[0_0_10px_rgba(255,90,60,0.4)]'
                    : 'text-[#a3928c] hover:text-white'
                }`}
              >
                °F (Fahrenheit)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,106,61,0.1)]">
            <span className="text-[11px] text-[#d1b8af]">Satellite Cadence</span>
            <select
              value={syncCadence}
              onChange={(e) => {
                setSyncCadence(e.target.value);
                addToast(`Telemetry sync cadence set to ${e.target.value}`, 'info');
              }}
              className="bg-[rgba(20,9,6,0.95)] text-white text-[10.5px] border border-[rgba(255,106,61,0.25)] rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#ff5a3c] cursor-pointer"
            >
              <option value="15s">15 Seconds (Rapid NRT)</option>
              <option value="30s">30 Seconds (Default)</option>
              <option value="60s">60 Seconds</option>
              <option value="5m">5 Minutes (Power Saver)</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
}

export { SettingsPanel };
