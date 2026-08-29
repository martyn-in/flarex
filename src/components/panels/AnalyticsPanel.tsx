'use client';

import React from 'react';
import { TrendingUp, Flame, Building2, Trees, Activity, Layers, MapPin } from 'lucide-react';
import { useIntelligence } from '@/context/IntelligenceContext';

export default function AnalyticsPanel() {
  const { hotspots, calculatedStats, selectHotspot } = useIntelligence();

  // Dynamic Class Breakdown
  const industrialCount = hotspots.filter(
    (h) => h.classification === 'Industrial Fire' || h.classification === 'Gas Flare' || h.classification === 'Mining / Furnace Activity'
  ).length;

  const naturalCount = hotspots.filter(
    (h) => h.classification === 'Wildfire' || h.classification === 'Agricultural Burning'
  ).length;

  const total = hotspots.length || 1;
  const industrialPct = Math.round((industrialCount / total) * 100);
  const naturalPct = Math.round((naturalCount / total) * 100);

  // Group by State / Corridor
  const corridorMap = new Map<string, { count: number; peakFrp: number; hotspot: any }>();
  hotspots.forEach((h) => {
    const key = h.state || 'Other';
    const existing = corridorMap.get(key) || { count: 0, peakFrp: 0, hotspot: h };
    existing.count += 1;
    if (h.frp > existing.peakFrp) {
      existing.peakFrp = h.frp;
      existing.hotspot = h;
    }
    corridorMap.set(key, existing);
  });

  const corridorList = Array.from(corridorMap.entries()).map(([state, data]) => ({
    state,
    count: data.count,
    peakFrp: `${data.peakFrp} MW`,
    hotspot: data.hotspot,
  }));

  return (
    <div className="flex flex-col gap-3">
      {/* 2x2 Dynamic KPI Grid */}
      <div className="flarex-kpi-grid">
        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Total Thermal Radiance</span>
          <span className="flarex-kpi-value text-red-400">{calculatedStats.totalFrp} MW</span>
          <span className="flarex-kpi-meta">{calculatedStats.totalEvents} Active Clusters</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Industrial vs Natural</span>
          <span className="flarex-kpi-value text-[#ffa940]">{industrialPct}% / {naturalPct}%</span>
          <span className="flarex-kpi-meta">High Industrial Concentration</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Abnormal Heat Breaches</span>
          <span className="flarex-kpi-value text-red-400">{calculatedStats.abnormalSources}</span>
          <span className="flarex-kpi-meta">&gt; 2.0× historical baseline</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Persistent Sources</span>
          <span className="flarex-kpi-value text-purple-300">{calculatedStats.persistentSources}</span>
          <span className="flarex-kpi-meta">High 30-day recurrence</span>
        </div>
      </div>

      {/* Industrial vs Natural Breakdown Section */}
      <section className="flarex-section">
        <h3 className="flarex-section-title">Thermal Source Type Distribution</h3>
        <div className="flex flex-col gap-2.5">
          <div>
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                <Building2 size={13} className="text-[#ff7a45]" />
                Industrial Infrastructure Heat (Fires &amp; Flares)
              </span>
              <span className="font-mono font-bold text-white">{industrialCount} ({industrialPct}%)</span>
            </div>
            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: `${industrialPct}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                <Trees size={13} className="text-emerald-400" />
                Natural &amp; Biomass Burning (Wildfires &amp; Agriculture)
              </span>
              <span className="font-mono font-bold text-white">{naturalCount} ({naturalPct}%)</span>
            </div>
            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full" style={{ width: `${naturalPct}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* Regional Corridor Heat Density */}
      <section className="flarex-section">
        <h3 className="flarex-section-title">Regional Industrial Corridor Hotspots</h3>
        <div className="flarex-status-list">
          {corridorList.map((c) => (
            <div
              key={c.state}
              onClick={() => selectHotspot(c.hotspot, true)}
              className="flarex-status-row !p-2.5 cursor-pointer hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-cyan-400 shrink-0" />
                <div>
                  <span className="flarex-status-name text-[12px]">{c.state} Corridor</span>
                  <span className="text-[9.5px] text-slate-400 block">{c.count} active thermal clusters</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-[11px] font-bold text-red-400">{c.peakFrp} Peak</span>
                <span className="text-[8.5px] text-slate-400 block">Radiance</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FlareX Insight Card */}
      <section className="insight-card mt-1">
        <div className="insight-icon">
          <Flame size={17} />
        </div>
        <div>
          <span className="insight-label">FLAMEX INTELLIGENCE DIAGNOSIS</span>
          <h4>Persistent industrial flares dominate, but severe localized surges detected.</h4>
          <p>
            {calculatedStats.industrialFires} critical industrial fires identified with radiative intensity exceeding 3.0× nominal baseline.
          </p>
        </div>
      </section>
    </div>
  );
}

export { AnalyticsPanel };
