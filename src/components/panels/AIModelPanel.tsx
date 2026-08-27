'use client';

import React from 'react';
import { Cpu, CheckCircle2, Sparkles, Activity, ShieldCheck, Layers } from 'lucide-react';
import { SYSTEM_OPERATIONAL_STATS } from '@/data/mockData';

export default function AIModelPanel() {
  const featureWeights = [
    { name: 'FRP Radiative Spike (Δ vs Baseline)', weight: 38, icon: Activity },
    { name: 'Multi-Day Temporal Persistence Score', weight: 28, icon: Sparkles },
    { name: 'Industrial Buffer / SEZ Proximity (OSM)', weight: 20, icon: Layers },
    { name: 'Multi-Spectral Skin Temperature (°C)', weight: 14, icon: Cpu },
  ];

  const classifications = [
    { label: 'Persistent Industrial Heat', count: '71.5%', color: 'bg-[#bd7cf7]' },
    { label: 'Ambient / Agricultural Burn', count: '23.7%', color: 'bg-[#31d4ac]' },
    { label: 'High-Temperature Process Anomaly', count: '3.8%', color: 'bg-[#ffae42]' },
    { label: 'Uncontrolled Critical Fire', count: '1.0%', color: 'bg-[#ff505d]' },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* 2x2 KPI Grid */}
      <div className="flarex-kpi-grid">
        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Model Status</span>
          <div className="flex items-center gap-1.5 mt-1">
            <CheckCircle2 size={16} className="text-[#31d5a0]" />
            <span className="text-[15px] font-bold text-white">ONLINE</span>
          </div>
          <span className="flarex-kpi-meta">v4.2.1-NRT Ensemble</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Inference Confidence</span>
          <span className="flarex-kpi-value text-[#44d7ff]">
            {SYSTEM_OPERATIONAL_STATS.averageConfidence}%
          </span>
          <span className="flarex-kpi-meta">Validation Accuracy 96.4%</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Inference Latency</span>
          <span className="flarex-kpi-value">{SYSTEM_OPERATIONAL_STATS.latency}</span>
          <span className="flarex-kpi-meta">Real-time GPU pipeline</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">False Positive Rate</span>
          <span className="flarex-kpi-value text-[#31d5a0]">1.2%</span>
          <span className="flarex-kpi-meta">Solar glint filtered</span>
        </div>
      </div>

      {/* Feature Importance Section */}
      <section className="flarex-section">
        <h3 className="flarex-section-title">Feature Importance &amp; Weighting</h3>
        <div className="flex flex-col gap-3">
          {featureWeights.map((f) => (
            <div key={f.name} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10.5px]">
                <span className="text-[#e7edf3] flex items-center gap-1.5">
                  <f.icon size={13} className="text-[#44d7ff]" />
                  {f.name}
                </span>
                <span className="font-mono font-bold text-[#44d7ff]">{f.weight}%</span>
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

      {/* Classification Output Section */}
      <section className="flarex-section">
        <h3 className="flarex-section-title">Ensemble Classification Mix</h3>
        <div className="flarex-status-list">
          {classifications.map((c) => (
            <div key={c.label} className="flarex-status-row">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${c.color}`} />
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
