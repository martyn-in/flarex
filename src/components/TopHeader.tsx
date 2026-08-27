'use client';

import React from 'react';
import { Bell, Monitor, Flame, Radio, Activity, ShieldCheck, RefreshCw } from 'lucide-react';
import { useIntelligence } from '../context/IntelligenceContext';
import { SYSTEM_OPERATIONAL_STATS } from '../data/mockData';

export const TopHeader: React.FC = () => {
  const {
    isPresentationMode,
    togglePresentationMode,
    isLiveMode,
    toggleLiveMode,
    isNotificationsOpen,
    setIsNotificationsOpen,
    resetMapView,
    addToast,
  } = useIntelligence();

  return (
    <header className="w-full h-[60px] px-4 glass-panel border-b border-white/[0.08] flex items-center justify-between z-30 select-none shrink-0 relative">
      {/* Ambient Top Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent pointer-events-none" />

      {/* Left: Brand / Platform Logo & Title */}
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={resetMapView}
        title="Reset camera view to national overview"
      >
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400/60 group-hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all">
          <Flame className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#060D17]" />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-bold tracking-wider text-white font-sans bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              FlareX
            </span>
            <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 tracking-wider uppercase">
              COMMAND CENTER
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Industrial Fire &amp; Geospatial Thermal Intelligence
          </span>
        </div>
      </div>

      {/* Center: Realtime Telemetry Status */}
      <div className="hidden lg:flex items-center gap-5 text-[12px] text-slate-300">
        {/* LIVE Telemetry Stream Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-emerald-500/25 bg-emerald-950/20 shadow-[0_0_12px_rgba(32,201,151,0.15)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 live-beacon" />
          <span className="font-semibold text-emerald-300 tracking-wide text-[11px]">LIVE STREAM</span>
        </div>

        {/* Constellation Satellites */}
        <div className="flex items-center gap-1.5 text-slate-300">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Sensors:</span>
          <span className="text-slate-200 font-medium font-mono">VIIRS + MODIS</span>
        </div>

        <div className="w-[1px] h-3 bg-white/10" />

        {/* Last Sync */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Last Sync:</span>
          <span className="text-slate-200 font-mono font-medium">{SYSTEM_OPERATIONAL_STATS.lastSync}</span>
        </div>

        <div className="w-[1px] h-3 bg-white/10" />

        {/* Ingestion Latency */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Latency:</span>
          <span className="text-emerald-400 font-mono font-semibold">{SYSTEM_OPERATIONAL_STATS.latency}</span>
        </div>
      </div>

      {/* Right: Operational Command Controls */}
      <div className="flex items-center gap-2">
        {/* Refresh Sync Button */}
        <button
          type="button"
          onClick={() => addToast('Synchronizing latest VIIRS/MODIS thermal pass data...', 'info')}
          className="p-2 rounded-xl glass-pill text-slate-300 hover:text-white hover:border-white/20 transition-all cursor-pointer"
          title="Manual Telemetry Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Notifications / Alerts trigger */}
        <button
          type="button"
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className={`relative p-2 rounded-xl glass-pill transition-all cursor-pointer ${
            isNotificationsOpen
              ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_12px_rgba(56,189,248,0.25)]'
              : 'text-slate-300 hover:text-white'
          }`}
          title="Active Incident Alerts (12 Urgent)"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9.5px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(255,77,79,0.6)]">
            12
          </span>
        </button>

        {/* Presentation Mode Toggle */}
        <button
          type="button"
          onClick={togglePresentationMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11.5px] font-medium glass-pill transition-all cursor-pointer ${
            isPresentationMode
              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_14px_rgba(56,189,248,0.3)]'
              : 'text-slate-300 hover:text-white'
          }`}
          title="Toggle Presentation Mode (Full Canvas Focus)"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isPresentationMode ? 'Exit View' : 'Presentation'}</span>
        </button>

        {/* Live Intelligence Ingestion Toggle */}
        <button
          type="button"
          onClick={toggleLiveMode}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11.5px] font-medium transition-all cursor-pointer ${
            isLiveMode
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border border-cyan-400/40 shadow-[0_0_16px_rgba(56,189,248,0.3)]'
              : 'glass-pill text-slate-300 hover:text-white'
          }`}
          title="Toggle Real-Time Satellite Feed"
        >
          <Radio className={`w-3.5 h-3.5 ${isLiveMode ? 'text-white' : 'text-emerald-400'}`} />
          <span>{isLiveMode ? 'Live Ingestion' : 'Paused'}</span>
        </button>

        {/* Operator Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/[0.1]">
          <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-[11px] font-bold text-cyan-400 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
        </div>
      </div>
    </header>
  );
};
