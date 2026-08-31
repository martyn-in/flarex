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
  } = useIntelligence();

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
    { key: 'satellite', label: 'Satellite Base', desc: 'Esri World Imagery (High-Res)', color: 'text-[#ea580c]' },
    { key: 'heatmap', label: 'Thermal Density', desc: 'FRP Kernel Density Surface', color: 'text-amber-600' },
    { key: 'industrial', label: 'Industrial SEZ', desc: 'Refineries, Plants & Corridors', color: 'text-orange-600' },
    { key: 'boundaries', label: 'Boundaries & GIS', desc: 'Administrative Borders & Labels', color: 'text-emerald-600' },
  ];

  return (
    <div className="absolute right-4 bottom-6 z-20 pointer-events-auto flex flex-col items-end gap-2 select-none" ref={popoverRef}>
      {/* 1. Layers Popover Menu */}
      {isLayersOpen && (
        <div className="w-[250px] bg-white/95 rounded-2xl p-3 shadow-xl border border-[#fed7aa] flex flex-col gap-1.5 z-30 animate-in fade-in zoom-in-95 duration-150 mb-1 backdrop-blur-md">
          <div className="flex items-center justify-between px-2 py-1 border-b border-[#fed7aa] mb-1">
            <span className="text-[11px] font-bold text-[#261006] tracking-wider uppercase">
              Map GIS Layers
            </span>
            <span className="text-[10px] text-[#ea580c] font-mono font-bold">4 Active Sources</span>
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
                    ? 'bg-[#ffedd5] text-[#261006] border border-[#fed7aa]'
                    : 'text-[#7c2d12] hover:bg-[#fff7ed] hover:text-[#ea580c] border border-transparent'
                }`}
              >
                <div>
                  <span className={`text-[12px] font-semibold block ${isActive ? 'text-[#261006]' : 'text-[#7c2d12]'}`}>
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-[#9a3412] block leading-tight">{opt.desc}</span>
                </div>
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                    isActive
                      ? 'bg-[#ea580c] border-[#ea580c] text-white shadow-xs'
                      : 'border-[#fed7aa] bg-white'
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
        <div className="w-[220px] bg-white/95 rounded-2xl p-2.5 shadow-xl border border-[#fed7aa] flex flex-col gap-1.5 z-30 animate-in fade-in zoom-in-95 duration-150 mb-1 backdrop-blur-md">
          <div className="px-2 py-1 text-[11px] font-bold text-[#261006] tracking-wider uppercase border-b border-[#fed7aa] mb-0.5">
            Filter Incidents
          </div>
          {[
            { key: null, label: 'All Hotspots', count: '1,247', color: 'text-[#261006]' },
            { key: 'critical', label: 'Critical Only', count: '12', color: 'text-red-600' },
            { key: 'high', label: 'High Severity', count: '48', color: 'text-orange-600' },
            { key: 'persistent', label: 'Persistent Flares', count: '892', color: 'text-purple-600' },
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
                    ? 'bg-[#ffedd5] text-[#c2410c] border border-[#ea580c] font-bold'
                    : 'text-[#7c2d12] hover:bg-[#fff7ed] hover:text-[#261006]'
                }`}
              >
                <span className={f.color}>{f.label}</span>
                <span className="font-mono text-[10.5px] text-[#9a3412]">{f.count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Floating Glass Dock Bar */}
      <div className="bg-white/95 rounded-2xl p-1.5 flex flex-col items-center gap-1 shadow-xl border border-[#fed7aa] backdrop-blur-md">
        {/* Zoom In */}
        <button
          type="button"
          onClick={zoomIn}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#7c2d12] hover:text-[#ea580c] hover:bg-[#ffedd5] transition-all cursor-pointer"
          title="Zoom In (+)"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={zoomOut}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#7c2d12] hover:text-[#ea580c] hover:bg-[#ffedd5] transition-all cursor-pointer"
          title="Zoom Out (-)"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="w-5 h-[1px] bg-[#fed7aa] my-0.5" />

        {/* Focus on Selected Incident */}
        <button
          type="button"
          onClick={focusActiveIncident}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#ea580c] hover:text-white hover:bg-[#ea580c] shadow-xs transition-all cursor-pointer"
          title="Focus on Active Incident (Target Lock)"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        {/* Reset Camera to National View */}
        <button
          type="button"
          onClick={resetMapView}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#7c2d12] hover:text-[#ea580c] hover:bg-[#ffedd5] transition-all cursor-pointer"
          title="Reset Camera View to India Overview"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="w-5 h-[1px] bg-[#fed7aa] my-0.5" />

        {/* Filter Trigger */}
        <button
          type="button"
          onClick={() => {
            setIsFilterOpen(!isFilterOpen);
            setIsLayersOpen(false);
          }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            isFilterOpen || activeFilter !== null
              ? 'bg-[#ffedd5] text-[#ea580c] border border-[#ea580c] shadow-xs'
              : 'text-[#7c2d12] hover:text-[#ea580c] hover:bg-[#ffedd5]'
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
              ? 'bg-[#ea580c] text-white shadow-md'
              : 'text-[#7c2d12] hover:text-[#ea580c] hover:bg-[#ffedd5]'
          }`}
          title="Toggle Geospatial Layers (Satellite, Heatmap, SEZ, GIS Boundaries)"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
