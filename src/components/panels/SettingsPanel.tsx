'use client';

import React, { useState } from 'react';
import { Sliders, MapPin, Bell, Eye, Database, Shield, Volume2, Layers } from 'lucide-react';
import { useIntelligence } from '@/context/IntelligenceContext';

export default function SettingsPanel() {
  const {
    activeLayers,
    toggleLayer,
    isPresentationMode,
    togglePresentationMode,
    isLiveMode,
    toggleLiveMode,
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
              <Layers size={14} className="text-[#44d7ff]" />
              <div>
                <span className="text-[11.5px] font-semibold text-white block">GIS State &amp; District Boundaries</span>
                <span className="text-[9.5px] text-[#81909e] block">Administrative boundary overlay</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleLayer('boundaries')}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                activeLayers.boundaries ? 'bg-[#44d7ff]' : 'bg-[rgba(255,255,255,0.1)]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  activeLayers.boundaries ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.05)]">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#31d5a0]" />
              <div>
                <span className="text-[11.5px] font-semibold text-white block">Industrial Facility Clusters</span>
                <span className="text-[9.5px] text-[#81909e] block">SEZ &amp; petrochemical landmarks</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleLayer('industrial')}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                activeLayers.industrial ? 'bg-[#31d5a0]' : 'bg-[rgba(255,255,255,0.1)]'
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
              <span className="text-[#8d9baa]">Critical FRP Alert Trigger:</span>
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
              className="w-full h-1.5 bg-[rgba(255,255,255,0.1)] rounded-lg appearance-none cursor-pointer accent-[#ff505d]"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.05)]">
            <div className="flex items-center gap-2">
              <Volume2 size={14} className="text-[#ffae42]" />
              <div>
                <span className="text-[11.5px] font-semibold text-white block">Audio Alarm for Critical Incidents</span>
                <span className="text-[9.5px] text-[#81909e] block">Audible warning on FRP {'>'} 50MW</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setAudioAlerts(!audioAlerts);
                addToast(audioAlerts ? 'Audio alarms silenced' : 'Audio alarms enabled', 'info');
              }}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                audioAlerts ? 'bg-[#ffae42]' : 'bg-[rgba(255,255,255,0.1)]'
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
            <span className="text-[11px] text-[#8d9baa]">Temperature Unit</span>
            <div className="flex bg-[rgba(255,255,255,0.05)] p-0.5 rounded-lg border border-[rgba(255,255,255,0.1)]">
              <button
                type="button"
                onClick={() => setTempUnit('C')}
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  tempUnit === 'C' ? 'bg-[#44d7ff] text-[#02070d]' : 'text-[#8d9baa]'
                }`}
              >
                °C (Celsius)
              </button>
              <button
                type="button"
                onClick={() => setTempUnit('F')}
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  tempUnit === 'F' ? 'bg-[#44d7ff] text-[#02070d]' : 'text-[#8d9baa]'
                }`}
              >
                °F (Fahrenheit)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.05)]">
            <span className="text-[11px] text-[#8d9baa]">Satellite Cadence</span>
            <select
              value={syncCadence}
              onChange={(e) => {
                setSyncCadence(e.target.value);
                addToast(`Telemetry sync cadence set to ${e.target.value}`, 'info');
              }}
              className="bg-[rgba(10,20,32,0.9)] text-white text-[10.5px] border border-[rgba(148,163,184,0.2)] rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#44d7ff]"
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
