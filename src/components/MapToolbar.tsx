'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Minus, RotateCcw, Layers, Check, Crosshair, Filter } from 'lucide-react';
import { useIntelligence, MapLayersState } from '../context/IntelligenceContext';

export const MapToolbar: React.FC = () => {
  const {
    zoomIn,
    zoomOut,
    resetMapView,
    focusActiveIncident,
    activeLayers,
    toggleLayer,
    activeFilter,
    setFilter,
    is3DMode,
    toggle3DMode,
    hotspots,
    theme,
  } = useIntelligence();

  const isDark = theme === 'dark';
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsLayersOpen(false);
        setIsFilterOpen(false);
      }
    };
    if (isLayersOpen || isFilterOpen) {
      window.addEventListener('mousedown', handleOutsideClick);
    }
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [isLayersOpen, isFilterOpen]);

  const layerOptions: { key: keyof MapLayersState; label: string; desc: string; color: string }[] = [
    { key: 'satellite', label: 'Satellite Base', desc: 'Esri World Imagery (High-Res)', color: isDark ? 'text-cyan-400' : 'text-cyan-600' },
    { key: 'heatmap', label: 'Thermal Density', desc: 'FRP Kernel Density Surface', color: isDark ? 'text-amber-400' : 'text-amber-600' },
    { key: 'industrial', label: 'Industrial SEZ', desc: 'Refineries, Plants & Corridors', color: isDark ? 'text-orange-400' : 'text-orange-600' },
    { key: 'boundaries', label: 'Boundaries & GIS', desc: 'Administrative Borders & Labels', color: isDark ? 'text-emerald-400' : 'text-emerald-600' },
  ];

  return (
    <div className="absolute right-4 bottom-6 z-20 pointer-events-auto flex flex-col items-end gap-2 select-none" ref={popoverRef}>
      {/* 1. Layers Popover Menu */}
      {isLayersOpen && (
        <div className={`w-[250px] rounded-2xl p-3 border shadow-2xl flex flex-col gap-1.5 z-30 animate-in fade-in zoom-in-95 duration-150 mb-1 ${
          isDark ? 'glass-panel-elevated bg-[rgba(20,10,7,0.95)] border-[rgba(255,106,61,0.25)] text-white' : 'bg-white border-[#cfe0f0] text-[#0c2340]'
        }`}>
          <div className={`flex items-center justify-between px-2 py-1 border-b mb-1 ${
            isDark ? 'border-white/10' : 'border-[#cfe0f0]'
          }`}>
            <span className={`text-[11px] font-bold tracking-wider uppercase ${isDark ? 'text-slate-300' : 'text-[#0c2340]'}`}>
              Map GIS Layers
            </span>
            <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-[#ff7a45]' : 'text-[#0284c7]'}`}>4 Active Sources</span>
          </div>
          {layerOptions.map((opt) => {
            const isActive = activeLayers[opt.key];
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => toggleLayer(opt.key)}
                className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between text-left transition-all duration-150 cursor-pointer ${
                  isActive
                    ? isDark
                      ? 'bg-white/[0.08] text-white border border-white/[0.12]'
                      : 'bg-[#e0f2fe] text-[#0c2340] border border-[#0284c7]'
                    : isDark
                    ? 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent'
                    : 'text-[#4e6b8c] hover:bg-[#f0f5fa] hover:text-[#0c2340] border border-transparent'
                }`}
              >
                <div>
                  <span className={`text-[12px] font-semibold block ${isActive ? (isDark ? 'text-white' : 'text-[#0c2340]') : (isDark ? 'text-slate-300' : 'text-[#4e6b8c]')}`}>
                    {opt.label}
                  </span>
                  <span className={`text-[10px] block leading-tight ${isDark ? 'text-slate-400' : 'text-[#627d9c]'}`}>{opt.desc}</span>
                </div>
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                    isActive
                      ? isDark
                        ? 'bg-[#ff5533] border-[#ff7a45] text-white shadow-[0_0_8px_rgba(255,85,45,0.5)]'
                        : 'bg-[#0284c7] border-[#0284c7] text-white'
                      : isDark
                      ? 'border-white/20 bg-black/30'
                      : 'border-[#cfe0f0] bg-white'
                  }`}
                >
                  {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Quick Incident Filter Popover */}
      {isFilterOpen && (
        <div className={`w-[220px] rounded-2xl p-2.5 border shadow-2xl flex flex-col gap-1.5 z-30 animate-in fade-in zoom-in-95 duration-150 mb-1 ${
          isDark ? 'glass-panel-elevated bg-[rgba(20,10,7,0.95)] border-[rgba(255,106,61,0.25)] text-white' : 'bg-white border-[#cfe0f0] text-[#0c2340]'
        }`}>
          <div className={`px-2 py-1 text-[11px] font-bold tracking-wider uppercase border-b mb-0.5 ${
            isDark ? 'border-white/10 text-slate-300' : 'border-[#cfe0f0] text-[#0c2340]'
          }`}>
            Filter Incidents
          </div>
          {[
            { key: null, label: 'All Hotspots', count: `${hotspots.length}`, color: isDark ? 'text-slate-200' : 'text-[#0c2340]' },
            { key: 'critical', label: 'Critical Only', count: `${hotspots.filter((h) => h.severity === 'critical' || h.status === 'CRITICAL_FIRE').length}`, color: 'text-red-400' },
            { key: 'high', label: 'High Severity', count: `${hotspots.filter((h) => h.severity === 'high' || h.status === 'ABNORMAL').length}`, color: 'text-orange-400' },
            { key: 'persistent', label: 'Persistent Flares', count: `${hotspots.filter((h) => h.classification === 'Gas Flare' || h.persistenceScore >= 50).length}`, color: 'text-purple-400' },
          ].map((f) => {
            const isSelected = activeFilter === f.key;
            return (
              <button
                key={f.label}
                type="button"
                onClick={() => {
                  setFilter(f.key as any);
                  setIsFilterOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 rounded-xl flex items-center justify-between text-[11.5px] transition-all cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-[#ff5533]/25 text-white border border-[#ff5533]/50 font-semibold'
                      : 'bg-[#0284c7]/15 text-[#0284c7] border border-[#0284c7]/40 font-semibold'
                    : isDark
                    ? 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                    : 'text-[#4e6b8c] hover:bg-[#f0f5fa] hover:text-[#0c2340]'
                }`}
              >
                <span className={isSelected ? 'text-white font-bold' : f.color}>{f.label}</span>
                <span className={`font-mono text-[10.5px] ${isSelected ? 'text-white' : isDark ? 'text-slate-400' : 'text-[#627d9c]'}`}>{f.count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Floating Dock Bar */}
      <div className={`rounded-2xl p-1.5 flex flex-col items-center gap-1 border shadow-2xl ${
        isDark ? 'glass-dock bg-[rgba(14,7,5,0.92)] border-[rgba(255,106,61,0.22)]' : 'bg-white border-[#cfe0f0]'
      }`}>
        {/* Zoom In */}
        <button
          type="button"
          onClick={zoomIn}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            isDark ? 'text-slate-300 hover:text-white hover:bg-white/[0.08]' : 'text-[#4e6b8c] hover:text-[#0c2340] hover:bg-[#f0f5fa]'
          }`}
          title="Zoom In (+)"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={zoomOut}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            isDark ? 'text-slate-300 hover:text-white hover:bg-white/[0.08]' : 'text-[#4e6b8c] hover:text-[#0c2340] hover:bg-[#f0f5fa]'
          }`}
          title="Zoom Out (-)"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className={`w-5 h-[1px] my-0.5 ${isDark ? 'bg-white/10' : 'bg-[#cfe0f0]'}`} />

        {/* 2D / 3D Perspective Digital Twin Mode */}
        <button
          type="button"
          onClick={toggle3DMode}
          className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-[10.5px] transition-all cursor-pointer ${
            is3DMode
              ? 'bg-[#ff5533] text-white border border-[#ff7a45] shadow-[0_0_12px_rgba(255,85,45,0.4)]'
              : isDark
              ? 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              : 'text-[#4e6b8c] hover:text-[#0c2340] hover:bg-[#f0f5fa]'
          }`}
          title={is3DMode ? 'Switch to 2D Tactical Plan View' : 'Switch to 3D Perspective Digital Twin View'}
        >
          {is3DMode ? '3D' : '2D'}
        </button>

        {/* Focus on Selected Incident */}
        <button
          type="button"
          onClick={focusActiveIncident}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            isDark
              ? 'text-[#ff7a45] hover:text-[#ff9977] hover:bg-[#ff5533]/20 hover:shadow-[0_0_12px_rgba(255,85,45,0.4)]'
              : 'text-[#0284c7] hover:text-[#0284c7] hover:bg-[#e0f2fe]'
          }`}
          title="Focus on Active Incident (Target Lock)"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        {/* Reset Camera to National View */}
        <button
          type="button"
          onClick={resetMapView}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            isDark ? 'text-slate-300 hover:text-white hover:bg-white/[0.08]' : 'text-[#4e6b8c] hover:text-[#0c2340] hover:bg-[#f0f5fa]'
          }`}
          title="Reset Camera View to India Overview"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className={`w-5 h-[1px] my-0.5 ${isDark ? 'bg-white/10' : 'bg-[#cfe0f0]'}`} />

        {/* Filter Trigger */}
        <button
          type="button"
          onClick={() => {
            setIsFilterOpen(!isFilterOpen);
            setIsLayersOpen(false);
          }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            isFilterOpen || activeFilter !== null
              ? 'bg-[#ff5533] text-white border border-[#ff7a45] shadow-[0_0_10px_rgba(255,85,45,0.4)]'
              : isDark
              ? 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              : 'text-[#4e6b8c] hover:text-[#0c2340] hover:bg-[#f0f5fa]'
          }`}
          title="Filter Hotspots by Severity"
        >
          <Filter className="w-4 h-4" />
        </button>

        {/* Layers Popover Trigger */}
        <button
          type="button"
          onClick={() => {
            setIsLayersOpen(!isLayersOpen);
            setIsFilterOpen(false);
          }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            isLayersOpen
              ? 'bg-[#ff5533] text-white border border-[#ff7a45] shadow-[0_0_10px_rgba(255,85,45,0.4)]'
              : isDark
              ? 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
              : 'text-[#4e6b8c] hover:text-[#0c2340] hover:bg-[#f0f5fa]'
          }`}
          title="Toggle Geospatial Layers (Satellite, Heatmap, SEZ, GIS Boundaries)"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MapToolbar;
