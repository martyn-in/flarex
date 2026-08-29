'use client';

import React from 'react';
import { Cpu, CheckCircle2, Activity, Layers, Flame } from 'lucide-react';
import { useIntelligence } from '@/context/IntelligenceContext';

export default function AIModelPanel() {
  const { calculatedStats, hotspots } = useIntelligence();

  const featureWeights = [
    { name: 'FRP Radiative Spike (Δ vs Baseline)', weight: 38, icon: Activity },
    { name: 'Multi-Day Temporal Persistence Score', weight: 28, icon: Flame },
    { name: 'Industrial Buffer / SEZ Proximity (OSM)', weight: 20, icon: Layers },
    { name: 'Multi-Spectral Skin Temperature (°C)', weight: 14, icon: Cpu },
  ];

  const total = hotspots.length || 1;
  const industrialFires = hotspots.filter((h) => h.classification === 'Industrial Fire').length;
  const gasFlares = hotspots.filter((h) => h.classification === 'Gas Flare').length;
  const wildfires = hotspots.filter((h) => h.classification === 'Wildfire').length;
  const agricultural = hotspots.filter((h) => h.classification === 'Agricultural Burning').length;

  const classifications = [
    { label: 'Industrial Fires', count: `${Math.round((industrialFires / total) * 100)}% (${industrialFires})`, color: 'bg-red-500' },
    { label: 'Gas Flares (Normal/Persistent)', count: `${Math.round((gasFlares / total) * 100)}% (${gasFlares})`, color: 'bg-emerald-500' },
    { label: 'Wildfires', count: `${Math.round((wildfires / total) * 100)}% (${wildfires})`, color: 'bg-amber-500' },
    { label: 'Agricultural Burning', count: `${Math.round((agricultural / total) * 100)}% (${agricultural})`, color: 'bg-yellow-500' },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* 2x2 KPI Grid */}
      <div className="flarex-kpi-grid">
        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Model Status</span>
          <div className="flex items-center gap-1.5 mt-1">
            <CheckCircle2 size={16} className="text-[#ffa940]" />
            <span className="text-[15px] font-bold text-white">ONLINE</span>
          </div>
          <span className="flarex-kpi-meta">FlameX ML v1.2 Ensemble</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Inference Confidence</span>
          <span className="flarex-kpi-value text-[#ff7a45]">
            {calculatedStats.averageConfidence}%
          </span>
          <span className="flarex-kpi-meta">Multi-source verified</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Inference Latency</span>
          <span className="flarex-kpi-value">8.4ms</span>
          <span className="flarex-kpi-meta">Real-time XGBoost + Spatial</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Active Events</span>
          <span className="flarex-kpi-value text-[#ffa940]">{calculatedStats.totalEvents}</span>
          <span className="flarex-kpi-meta">Telemetry stream</span>
        </div>
      </div>

      {/* Feature Importance Section */}
      <section className="flarex-section">
        <h3 className="flarex-section-title">Feature Importance &amp; Weighting</h3>
        <div className="flex flex-col gap-3">
          {featureWeights.map((f) => (
            <div key={f.name} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10.5px]">
                <span className="text-[#fef8f6] flex items-center gap-1.5">
                  <f.icon size={13} className="text-[#ff7a45]" />
                  {f.name}
                </span>
                <span className="font-mono font-bold text-[#ff7a45]">{f.weight}%</span>
              </div>
              <div className="flarex-severity-track">
                <div
                  className="flarex-severity-fill"
                  style={{ width: `${f.weight * 2.5}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Classification Mix Section */}
      <section className="flarex-section">
        <h3 className="flarex-section-title">Dynamic Classification Mix (Active Detections)</h3>
        <div className="flarex-status-list">
          {classifications.map((c) => (
            <div key={c.label} className="flarex-status-row">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${c.color} shadow-[0_0_6px_currentColor]`} />
                <span className="flarex-status-name">{c.label}</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-white">{c.count}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export { AIModelPanel };
