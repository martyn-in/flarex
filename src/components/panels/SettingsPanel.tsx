'use client';

import React, { useState } from 'react';
import { Sliders, MapPin, Bell, Eye, Database, Shield, Volume2, Layers, Flame, Sun, Moon, Sparkles } from 'lucide-react';
import { useIntelligence } from '@/context/IntelligenceContext';

export default function SettingsPanel() {
  const {
    activeLayers,
    toggleLayer,
    addToast,
    theme,
    setTheme,
  } = useIntelligence();

  const [minFrpThreshold, setMinFrpThreshold] = useState<number>(15);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [syncCadence, setSyncCadence] = useState<string>('30s');
  const [audioAlerts, setAudioAlerts] = useState<boolean>(true);

  return (
    <div className="flex flex-col gap-3">
      {/* 0. VISUAL THEME & APPEARANCE */}
      <section className="flarex-section">
        <h3 className="flarex-section-title flex items-center justify-between">
          <span>Theme &amp; Appearance</span>
          <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-[rgba(255,85,45,0.12)] text-[#ff7a45] uppercase tracking-wider">
            {theme === 'dark' ? 'Flame Dark' : 'Arctic Light'}
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
              theme === 'dark'
                ? 'bg-[rgba(255,85,45,0.14)] border-[#ff5533] shadow-[0_0_18px_rgba(255,85,45,0.25)]'
                : 'bg-[#0f0705] border-[#ff5533]/30 hover:border-[#ff5533] shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ff5a3c]/30 to-[#b32400]/20 border border-[#ff6a3d]/40 flex items-center justify-center">
                <Flame size={15} className="text-[#ff5533] fill-[#ff5533]/60" />
              </div>
              {theme === 'dark' ? (
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

          {/* Radiant Orange Light Mode Card */}
          <div
            onClick={() => {
              setTheme('light');
              addToast('Radiant Orange Light Mode activated', 'info');
            }}
            className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 relative overflow-hidden ${
              theme === 'light'
                ? 'bg-[#ffedd5] border-[#ea580c] shadow-[0_0_16px_rgba(234,88,12,0.25)]'
                : 'bg-white/[0.06] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-[#fff7ed] border border-[#fed7aa] flex items-center justify-center">
                <Sun size={15} className="text-[#ea580c]" />
              </div>
              {theme === 'light' ? (
                <span className="w-2 h-2 rounded-full bg-[#ea580c] shadow-[0_0_8px_#ea580c]" />
              ) : (
                <span className="text-[8.5px] font-bold text-[#ea580c] uppercase tracking-wider">Switch</span>
              )}
            </div>
            <div>
              <span className={`text-[11.5px] font-bold block ${theme === 'light' ? 'text-[#261006]' : 'text-white'}`}>
                Orange Light Mode
              </span>
              <span className={`text-[9px] block font-medium mt-0.5 ${theme === 'light' ? 'text-[#7c2d12]' : 'text-[#a3928c]'}`}>
                Warm amber &amp; luminous daylight
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
                <span className={`text-[11.5px] font-bold block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  GIS State &amp; District Boundaries
                </span>
                <span className={`text-[9.5px] block font-medium ${theme === 'dark' ? 'text-[#a3928c]' : 'text-slate-500'}`}>
                  Administrative boundary overlay
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleLayer('boundaries')}
              className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${
                activeLayers.boundaries
                  ? 'bg-orange-600'
                  : theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                  activeLayers.boundaries ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className={`flex items-center justify-between pt-2 border-t ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-amber-500" />
              <div>
                <span className={`text-[11.5px] font-bold block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Industrial Facility Clusters
                </span>
                <span className={`text-[9.5px] block font-medium ${theme === 'dark' ? 'text-[#a3928c]' : 'text-slate-500'}`}>
                  SEZ &amp; petrochemical landmarks
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleLayer('industrial')}
              className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${
                activeLayers.industrial
                  ? 'bg-orange-600'
                  : theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'
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
              <span className={`font-semibold ${theme === 'dark' ? 'text-[#d1b8af]' : 'text-slate-600'}`}>
                Critical FRP Alert Trigger:
              </span>
              <span className="font-mono font-bold text-red-500">{minFrpThreshold} MW</span>
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
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-orange-500 ${
                theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'
              }`}
            />
          </div>

          <div className={`flex items-center justify-between pt-2 border-t ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
            <div className="flex items-center gap-2">
              <Volume2 size={14} className="text-orange-500" />
              <div>
                <span className={`text-[11.5px] font-bold block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Audio Alarm for Critical Incidents
                </span>
                <span className={`text-[9.5px] block font-medium ${theme === 'dark' ? 'text-[#a3928c]' : 'text-slate-500'}`}>
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
                  ? 'bg-orange-600'
                  : theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'
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
            <span className={`text-[11px] font-semibold ${theme === 'dark' ? 'text-[#d1b8af]' : 'text-slate-700'}`}>
              Temperature Unit
            </span>
            <div className={`flex p-0.5 rounded-lg border ${theme === 'dark' ? 'bg-[rgba(32,15,9,0.85)] border-[rgba(255,106,61,0.3)]' : 'bg-slate-100 border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setTempUnit('C')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  tempUnit === 'C'
                    ? theme === 'dark'
                      ? 'bg-[rgba(255,85,45,0.25)] text-white shadow-xs border border-[rgba(255,106,61,0.45)]'
                      : 'bg-white text-orange-600 shadow-xs border border-slate-200'
                    : theme === 'dark'
                    ? 'text-[#ffcaa6] hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                °C (Celsius)
              </button>
              <button
                type="button"
                onClick={() => setTempUnit('F')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  tempUnit === 'F'
                    ? theme === 'dark'
                      ? 'bg-[rgba(255,85,45,0.25)] text-white shadow-xs border border-[rgba(255,106,61,0.45)]'
                      : 'bg-white text-orange-600 shadow-xs border border-slate-200'
                    : theme === 'dark'
                    ? 'text-[#ffcaa6] hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                °F (Fahrenheit)
              </button>
            </div>
          </div>

          <div className={`flex items-center justify-between pt-2 border-t ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
            <span className={`text-[11px] font-semibold ${theme === 'dark' ? 'text-[#d1b8af]' : 'text-slate-700'}`}>
              Satellite Cadence
            </span>
            <select
              value={syncCadence}
              onChange={(e) => {
                setSyncCadence(e.target.value);
                addToast(`Telemetry sync cadence set to ${e.target.value}`, 'info');
              }}
              className={`text-[10.5px] font-semibold border rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer shadow-xs ${
                theme === 'dark'
                  ? 'bg-[#140a07] text-[#fef8f6] border-[rgba(255,106,61,0.25)] focus:border-[#ff5a3c]'
                  : 'bg-white text-slate-900 border-slate-200 focus:border-orange-500'
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
    </div>
  );
}

export { SettingsPanel };

