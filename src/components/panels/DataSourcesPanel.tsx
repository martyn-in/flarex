'use client';

import React from 'react';
import { Database, Radio, Satellite, ShieldCheck, RefreshCw } from 'lucide-react';
import { DATA_SOURCES_LIST, SYSTEM_OPERATIONAL_STATS } from '@/data/mockData';

export default function DataSourcesPanel() {
  return (
    <div className="flex flex-col gap-3">
      {/* 2x2 Network Health KPIs */}
      <div className="flarex-kpi-grid">
        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Constellation Health</span>
          <span className="flarex-kpi-value text-[#31d5a0]">
            {SYSTEM_OPERATIONAL_STATS.systemHealth}%
          </span>
          <span className="flarex-kpi-meta">6 / 6 Streams Synchronized</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Telemetry Ingestion Lag</span>
          <span className="flarex-kpi-value text-[#44d7ff]">{SYSTEM_OPERATIONAL_STATS.latency}</span>
          <span className="flarex-kpi-meta">Last Sync: {SYSTEM_OPERATIONAL_STATS.lastSync}</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Active Sensors</span>
          <span className="flarex-kpi-value">4 Orbiters</span>
          <span className="flarex-kpi-meta">VIIRS (375m) + MODIS (1km)</span>
        </div>

        <div className="flarex-kpi">
          <span className="flarex-kpi-label">Ground Validation</span>
          <span className="flarex-kpi-value text-white">OSM + SEZ</span>
          <span className="flarex-kpi-meta">8 Industrial Corridors</span>
        </div>
      </div>

      {/* Satellite Feeds List */}
      <section className="flarex-section">
        <h3 className="flarex-section-title">Satellite Feeds &amp; Ingestion Pipelines</h3>
        <div className="flarex-status-list">
          {DATA_SOURCES_LIST.map((source) => (
            <div key={source.name} className="flarex-status-row">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[rgba(68,215,255,0.1)] border border-[rgba(68,215,255,0.2)] flex items-center justify-center text-[#44d7ff] shrink-0">
                  <Satellite size={14} />
                </div>
                <div className="min-w-0">
                  <span className="flarex-status-name block">{source.name}</span>
                  <span className="flarex-status-meta block truncate">{source.sensor}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#31d5a0] shadow-[0_0_6px_#31d5a0]" />
                  <span className="text-[10px] font-semibold text-[#31d5a0]">{source.status}</span>
                </div>
                <span className="font-mono text-[9px] text-[#81909e] mt-0.5 block">{source.latency} lag</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export { DataSourcesPanel };
