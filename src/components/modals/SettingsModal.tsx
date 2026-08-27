'use client';

import React, { useState } from 'react';
import { X, Settings as SettingsIcon, MapPin, Bell, Database, Eye, Shield, Sliders } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, addToast } = useIntelligence();
  const [activeSection, setActiveSection] = useState<'Map' | 'Alerts' | 'Data' | 'Appearance'>('Map');

  // Setting local states
  const [minFrpThreshold, setMinFrpThreshold] = useState(15);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [autoSyncInterval, setAutoSyncInterval] = useState('30s');
  const [audioAlerts, setAudioAlerts] = useState(true);

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto select-none animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        onClick={() => setIsSettingsOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-[4px] cursor-pointer"
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg rounded-3xl glass-panel-elevated p-6 shadow-2xl z-50 overflow-hidden flex flex-col gap-4 border border-white/[0.14]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[14.5px] font-bold text-white tracking-wide">
                FlareX Platform Settings
              </h3>
              <span className="text-[10px] text-slate-400">Telemetry &amp; Display Preferences</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="w-8 h-8 rounded-xl glass-pill flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex rounded-2xl glass-dock p-1 border border-white/[0.08]">
          {(['Map', 'Alerts', 'Data', 'Appearance'] as const).map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setActiveSection(sec)}
              className={`flex-1 py-2 rounded-xl text-[11.5px] font-semibold transition-all duration-150 cursor-pointer ${
                activeSection === sec
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Section Content */}
        <div className="flex flex-col gap-3 text-[12px] text-slate-300 min-h-[190px]">
          {/* MAP SECTION */}
          {activeSection === 'Map' && (
            <div className="flex flex-col gap-3">
              <div className="glass-card rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Default View Extent</span>
                  <span className="text-[11px] text-slate-400">National Geographic Centroid (Pan-India)</span>
                </div>
                <span className="text-[11px] font-mono text-cyan-300 bg-white/[0.06] px-3 py-1 rounded-xl border border-white/[0.1]">
                  80.5°E, 22.5°N
                </span>
              </div>

              <div className="glass-card rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Satellite Tile Source</span>
                  <span className="text-[11px] text-slate-400">Esri World Imagery High-Resolution</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Active (Maxar/Esri)
                </span>
              </div>
            </div>
          )}

          {/* ALERTS SECTION */}
          {activeSection === 'Alerts' && (
            <div className="flex flex-col gap-3">
              <div className="glass-card rounded-2xl p-3.5 flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">Minimum FRP Alert Threshold</span>
                  <span className="text-[14px] font-mono font-bold text-red-400">{minFrpThreshold} MW</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={minFrpThreshold}
                  onChange={(e) => setMinFrpThreshold(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="text-[10.5px] text-slate-400">Hotspots below {minFrpThreshold} MW are tagged as ambient / non-critical</span>
              </div>

              <div className="glass-card rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Acoustic Critical Alert Alarm</span>
                  <span className="text-[11px] text-slate-400">Audio beacon trigger on confirmed industrial fires</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAudioAlerts(!audioAlerts)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                    audioAlerts ? 'bg-cyan-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]' : 'bg-white/10'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${audioAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          )}

          {/* DATA SECTION */}
          {activeSection === 'Data' && (
            <div className="flex flex-col gap-3">
              <div className="glass-card rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Telemetry Ingestion Cadence</span>
                  <span className="text-[11px] text-slate-400">Interval between satellite pass queries</span>
                </div>
                <select
                  value={autoSyncInterval}
                  onChange={(e) => {
                    setAutoSyncInterval(e.target.value);
                    addToast(`Sync cadence set to ${e.target.value}`, 'info');
                  }}
                  className="bg-black/40 border border-white/[0.15] text-white text-[11.5px] px-3 py-1.5 rounded-xl focus:outline-none focus:border-cyan-400"
                >
                  <option value="15s">15 Seconds (Fast)</option>
                  <option value="30s">30 Seconds (Default)</option>
                  <option value="1m">1 Minute</option>
                  <option value="5m">5 Minutes</option>
                </select>
              </div>

              <div className="glass-card rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">NASA FIRMS API Key</span>
                  <span className="text-[11px] text-slate-400">Server-side managed secure environment token</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Secured &amp; Active
                </span>
              </div>
            </div>
          )}

          {/* APPEARANCE SECTION */}
          {activeSection === 'Appearance' && (
            <div className="flex flex-col gap-3">
              <div className="glass-card rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Temperature Scale</span>
                  <span className="text-[11px] text-slate-400">Standard industrial metric</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTempUnit('C');
                      addToast('Scale set to Celsius (°C)', 'info');
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-[11.5px] font-semibold cursor-pointer transition-all ${
                      tempUnit === 'C'
                        ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                        : 'glass-pill text-slate-400'
                    }`}
                  >
                    °C (Celsius)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempUnit('F');
                      addToast('Scale set to Fahrenheit (°F)', 'info');
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-[11.5px] font-semibold cursor-pointer transition-all ${
                      tempUnit === 'F'
                        ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                        : 'glass-pill text-slate-400'
                    }`}
                  >
                    °F (Fahrenheit)
                  </button>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Command Center Theme</span>
                  <span className="text-[11px] text-slate-400">Glassmorphism Dark Premium</span>
                </div>
                <span className="text-[11px] font-bold text-cyan-300">FlareX Deep Obsidian</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.08] flex justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              setIsSettingsOpen(false);
              addToast('Platform configuration saved successfully', 'success');
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-[12px] font-bold shadow-[0_0_16px_rgba(56,189,248,0.35)] transition-all cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
