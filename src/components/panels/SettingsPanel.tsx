'use client';

import React, { useState } from 'react';
import { Sliders, MapPin, Bell, Eye, Database, Shield, Volume2, Layers } from 'lucide-react';
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
              <Layers size={14} className="text-[#ea580c]" />
              <div>
                <span className="text-[11.5px] font-bold block text-[#261006]">
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
                  : 'bg-[#fed7aa]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                  activeLayers.boundaries ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#fed7aa]">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#ea580c]" />
              <div>
                <span className="text-[11.5px] font-bold block text-[#261006]">
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
                  : 'bg-[#fed7aa]'
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
              <span className="font-semibold text-[#7c2d12]">
                Critical FRP Alert Trigger:
              </span>
              <span className="font-mono font-bold text-red-600">{minFrpThreshold} MW</span>
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
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#ea580c] bg-[#fed7aa]"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#fed7aa]">
            <div className="flex items-center gap-2">
              <Volume2 size={14} className="text-[#ea580c]" />
              <div>
                <span className="text-[11.5px] font-bold block text-[#261006]">
                  Audio Alarm for Critical Incidents
                </span>
                <span className="text-[9.5px] block font-medium text-[#7c2d12]">
                  Audible warning on FRP {'>'} 50MW
                </span>
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
                  ? 'bg-[#ea580c]'
                  : 'bg-[#fed7aa]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
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
            <div className="flex p-0.5 rounded-lg border bg-[#ffedd5] border-[#fed7aa]">
              <button
                type="button"
                onClick={() => setTempUnit('C')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  tempUnit === 'C'
                    ? 'bg-white text-[#ea580c] shadow-xs border border-[#fed7aa]'
                    : 'text-[#7c2d12] hover:text-[#261006]'
                }`}
              >
                °C (Celsius)
              </button>
              <button
                type="button"
                onClick={() => setTempUnit('F')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  tempUnit === 'F'
                    ? 'bg-white text-[#ea580c] shadow-xs border border-[#fed7aa]'
                    : 'text-[#7c2d12] hover:text-[#261006]'
                }`}
              >
                °F (Fahrenheit)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#fed7aa]">
            <span className="text-[11px] font-semibold text-[#7c2d12]">
              Satellite Cadence
            </span>
            <select
              value={syncCadence}
              onChange={(e) => {
                setSyncCadence(e.target.value);
                addToast(`Telemetry sync cadence set to ${e.target.value}`, 'info');
              }}
              className="text-[10.5px] font-semibold border rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer shadow-xs bg-white text-[#261006] border-[#fed7aa] focus:border-[#ea580c]"
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
