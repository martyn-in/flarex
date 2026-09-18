'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface LegendItem {
  label: string;
  color: string;
  glow: string;
  description: string;
}

const LEGEND_ITEMS: LegendItem[] = [
  { label: 'Industrial Fire', color: '#dc2626', glow: 'rgba(220,38,38,0.7)', description: 'Critical thermal event at industrial site' },
  { label: 'Gas Flare',       color: '#ea580c', glow: 'rgba(234,88,12,0.7)',  description: 'Routine / abnormal gas flaring' },
  { label: 'Wildfire',        color: '#16a34a', glow: 'rgba(22,163,74,0.7)',  description: 'Active forest or grassland fire' },
  { label: 'Agricultural Burn', color: '#ca8a04', glow: 'rgba(202,138,4,0.6)', description: 'Crop residue burning' },
  { label: 'Mining / Furnace', color: '#9333ea', glow: 'rgba(147,51,234,0.6)', description: 'Smelting, kiln or mining thermal' },
];

interface MapLegendProps {
  className?: string;
}

export const MapLegend: React.FC<MapLegendProps> = ({ className = '' }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`map-legend-panel ${className}`}
      style={{
        position: 'absolute',
        bottom: '80px',
        left: '16px',
        zIndex: 30,
        background: 'rgba(12, 5, 3, 0.88)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,106,61,0.25)',
        borderRadius: '14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(255,106,61,0.1)',
        minWidth: '192px',
        maxWidth: '220px',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#fca07a',
          fontSize: '9.5px',
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#ff5533',
              boxShadow: '0 0 6px rgba(255,85,45,0.8)',
              display: 'inline-block',
            }}
          />
          CLASS LEGEND
        </span>
        {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
      </button>

      {/* Items */}
      {!collapsed && (
        <div style={{ padding: '2px 12px 10px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {LEGEND_ITEMS.map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              {/* Dot */}
              <span
                style={{
                  width: '11px',
                  height: '11px',
                  borderRadius: '50%',
                  background: item.color,
                  border: '1.5px solid rgba(255,255,255,0.35)',
                  boxShadow: `0 0 8px ${item.glow}`,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#f5e8e0',
                  lineHeight: 1.2,
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
          <div
            style={{
              marginTop: '4px',
              paddingTop: '6px',
              borderTop: '1px solid rgba(255,106,61,0.15)',
              fontSize: '8.5px',
              color: 'rgba(255,200,180,0.45)',
              lineHeight: 1.4,
            }}
          >
            Dots blink on critical events · Click to inspect
          </div>
        </div>
      )}
    </div>
  );
};

export default MapLegend;
