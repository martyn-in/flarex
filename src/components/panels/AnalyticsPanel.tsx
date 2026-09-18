'use client';

import React from 'react';
import { TrendingUp, Flame, Building2, Trees, Activity, Layers, MapPin } from 'lucide-react';
import { useIntelligence } from '@/context/IntelligenceContext';

export default function AnalyticsPanel() {
  const { hotspots, calculatedStats, selectHotspot, theme } = useIntelligence();

  const isDark = theme === 'dark';

  // Dynamic Class Breakdown
  const industrialCount = hotspots.filter(
    (h) => h.classification === 'Industrial Fire' || h.classification === 'Gas Flare' || h.classification === 'Mining / Furnace Activity'
  ).length;
  const naturalCount = hotspots.filter(
    (h) => h.classification === 'Wildfire' || h.classification === 'Agricultural Burning'
  ).length;
  const totalClassified = industrialCount + naturalCount || 1;

  const industrialPct = Math.round((industrialCount / totalClassified) * 100);
  const naturalPct = Math.round((naturalCount / totalClassified) * 100);

  // Group by State/Corridor
  const stateAgg: Record<string, { count: number; totalFrp: number; peakFrp: number; hotspot: any }> = {};
  hotspots.forEach((h) => {
    const s = h.state || 'Other';
    if (!stateAgg[s]) {
      stateAgg[s] = { count: 0, totalFrp: 0, peakFrp: 0, hotspot: h };
    }
    stateAgg[s].count += 1;
    stateAgg[s].totalFrp += h.frp;
    if (h.frp > stateAgg[s].peakFrp) {
      stateAgg[s].peakFrp = h.frp;
      stateAgg[s].hotspot = h;
    }
  });

  const corridorList = Object.entries(stateAgg).map(([state, data]) => ({
    state,
    count: data.count,
    peakFrp: data.peakFrp,
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
          <span className="flarex-kpi-value text-amber-400">{industrialPct}% / {naturalPct}%</span>
          <span className="flarex-kpi-meta">High Industrial Concentration</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Abnormal Heat Breaches</span>
          <span className="flarex-kpi-value text-red-400">{calculatedStats.abnormalSources}</span>
          <span className="flarex-kpi-meta">&gt; 2.0× historical baseline</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Persistent Sources</span>
          <span className="flarex-kpi-value text-purple-400">{calculatedStats.persistentSources}</span>
          <span className="flarex-kpi-meta">High 30-day recurrence</span>
        </div>
      </div>

      {/* Industrial vs Natural Breakdown Section */}
      <section className="flarex-section">
        <h3 className="flarex-section-title">Thermal Source Type Distribution</h3>
        <div className="flex flex-col gap-2.5">
          <div>
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <Building2 size={13} className="text-[#ff5533]" />
                Industrial Infrastructure Heat (Fires &amp; Flares)
              </span>
              <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>{industrialCount} ({industrialPct}%)</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-black/40' : 'bg-slate-200'}`}>
              <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: `${industrialPct}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <Trees size={13} className="text-emerald-400" />
                Natural &amp; Biomass Burning (Wildfires &amp; Agriculture)
              </span>
              <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>{naturalCount} ({naturalPct}%)</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-black/40' : 'bg-slate-200'}`}>
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
              className={`flarex-status-row !p-2.5 cursor-pointer rounded-xl border ${
                isDark ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.08]' : 'bg-white border-[#cfe0f0] hover:bg-[#f0f5fa]'
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-[#ff5533] shrink-0" />
                <div>
                  <span className={`flarex-status-name text-[12px] font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>{c.state} Corridor</span>
                  <span className={`text-[9.5px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{c.count} active thermal clusters</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-[11px] font-bold text-red-400">{c.peakFrp} Peak</span>
                <span className={`text-[8.5px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Radiance</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FlareX Insight Card */}
      <section className={`p-3 rounded-2xl border flex items-start gap-3 mt-1 ${
        isDark ? 'bg-[rgba(255,85,45,0.08)] border-[rgba(255,106,61,0.25)] text-white' : 'bg-[#e0f2fe] border-[#0284c7]/30 text-[#0c2340]'
      }`}>
        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
          isDark ? 'border-[rgba(255,106,61,0.3)] bg-black/40 text-[#ff7a45]' : 'border-[#0284c7]/40 bg-white text-[#0284c7]'
        }`}>
          <Flame size={17} />
        </div>
        <div>
          <span className={`text-[9.5px] font-bold tracking-wider uppercase block ${isDark ? 'text-[#ff7a45]' : 'text-[#0284c7]'}`}>
            FLAREX INTELLIGENCE DIAGNOSIS
          </span>
          <h4 className={`text-[12px] font-bold mt-0.5 ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
            Persistent industrial flares dominate, but severe localized surges detected.
          </h4>
          <p className={`text-[11px] mt-1 ${isDark ? 'text-[#d1b8af]' : 'text-slate-600'}`}>
            {calculatedStats.industrialFires} critical industrial fires identified with radiative intensity exceeding 3.0× nominal baseline.
          </p>
        </div>
      </section>
    </div>
  );
}

export { AnalyticsPanel };
