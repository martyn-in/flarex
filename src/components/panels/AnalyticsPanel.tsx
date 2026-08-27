'use client';

import React from 'react';
import { TrendingUp, Sparkles, Flame } from 'lucide-react';
import { SYSTEM_OPERATIONAL_STATS } from '@/data/mockData';

export interface Metric {
  label: string;
  value: string | number;
  meta?: string;
}

export interface SeverityItem {
  name: string;
  value: number;
  total: number;
  type?: 'critical' | 'high' | 'persistent' | 'low';
}

export interface RegionalCorridor {
  region: string;
  peakFrp: string;
  count: number;
  status: string;
}

const REGIONAL_HOTSPOTS: RegionalCorridor[] = [
  { region: 'Gujarat (Dahej & Hazira SEZ)', peakFrp: '84.6 MW', count: 34, status: 'Critical' },
  { region: 'Jharkhand (Jharia & Bokaro)', peakFrp: '62.4 MW', count: 52, status: 'Critical' },
  { region: 'Chhattisgarh (Korba Power Basin)', peakFrp: '46.3 MW', count: 28, status: 'High' },
  { region: 'Assam (Digboi Oil & Gas)', peakFrp: '54.1 MW', count: 19, status: 'High' },
  { region: 'Punjab (Agricultural Fringe)', peakFrp: '38.2 MW', count: 64, status: 'High' },
];

const DEFAULT_TIMELINE_VALUES = [305, 330, 370, 355, 405, 430, 464];

interface AnalyticsPanelProps {
  metrics?: Metric[];
  severity?: SeverityItem[];
  chart?: React.ReactNode;
  regionalAnalysis?: React.ReactNode;
}

export default function AnalyticsPanel({
  metrics,
  severity,
  chart,
  regionalAnalysis,
}: AnalyticsPanelProps) {
  const displayMetrics: Metric[] = metrics || [
    {
      label: 'Total FRP Radiance',
      value: `${SYSTEM_OPERATIONAL_STATS.totalFrp.toFixed(1)} MW`,
      meta: '+14% vs baseline',
    },
    {
      label: 'Average Anomaly',
      value: `${SYSTEM_OPERATIONAL_STATS.avgAnomaly.toFixed(1)}/10`,
      meta: 'Elevated regional index',
    },
    {
      label: 'Critical Incidents',
      value: SYSTEM_OPERATIONAL_STATS.criticalAlerts,
      meta: 'Requires immediate action',
    },
    {
      label: 'Persistent Flares',
      value: SYSTEM_OPERATIONAL_STATS.persistentSources,
      meta: 'Industrial furnace baseline',
    },
  ];

  const totalDetections = SYSTEM_OPERATIONAL_STATS.activeHotspots;
  const displaySeverity: SeverityItem[] = severity || [
    {
      name: 'Critical Fire Alert',
      value: 12,
      total: totalDetections,
      type: 'critical',
    },
    {
      name: 'High Severity',
      value: 48,
      total: totalDetections,
      type: 'high',
    },
    {
      name: 'Persistent Flare / Slag',
      value: 892,
      total: totalDetections,
      type: 'persistent',
    },
    {
      name: 'Low / Ambient Heat',
      value: 295,
      total: totalDetections,
      type: 'low',
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* 2x2 KPI Grid */}
      <div className="flarex-kpi-grid">
        {displayMetrics.map((metric) => (
          <div className="flarex-kpi" key={metric.label}>
            <span className="flarex-kpi-label">{metric.label}</span>
            <span className="flarex-kpi-value">{metric.value}</span>
            {metric.meta && <span className="flarex-kpi-meta">{metric.meta}</span>}
          </div>
        ))}
      </div>

      {/* Temporal Radiative Analysis Chart */}
      <section className="flarex-section">
        <div className="flex items-center justify-between mb-3">
          <h3 className="flarex-section-title !mb-0">Temporal Radiative Analysis</h3>
          <div className="flex items-center gap-1 text-[9.5px] font-semibold text-[#ff7a45] bg-[rgba(255,90,45,0.12)] px-2 py-0.5 rounded-md border border-[rgba(255,106,61,0.25)]">
            <TrendingUp size={12} />
            <span>+49.6% weekly peak</span>
          </div>
        </div>

        {chart || <SmoothAnalyticsChart values={DEFAULT_TIMELINE_VALUES} />}
      </section>

      {/* Incident Severity Distribution */}
      {displaySeverity.length > 0 && (
        <section className="flarex-section">
          <h3 className="flarex-section-title">Incident Severity Distribution</h3>
          <div className="flex flex-col gap-2.5">
            {displaySeverity.map((item) => {
              const percentage =
                item.total > 0
                  ? Math.min(100, Math.max(1.5, (item.value / item.total) * 100))
                  : 0;

              return (
                <div className="flarex-severity-row" key={item.name}>
                  <span className="flarex-severity-label">{item.name}</span>
                  <div className="flarex-severity-track">
                    <div
                      className={`flarex-severity-fill ${item.type ?? ''}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="flarex-severity-value">{item.value}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Regional Hotspot Intelligence */}
      <section className="flarex-section">
        <h3 className="flarex-section-title">Regional Hotspot Intelligence</h3>
        {regionalAnalysis || (
          <div className="flarex-status-list">
            {REGIONAL_HOTSPOTS.map((r) => (
              <div key={r.region} className="flarex-status-row">
                <div className="flarex-status-left">
                  <span className="flarex-status-name">{r.region}</span>
                  <span className="flarex-status-meta">{r.count} confirmed thermal clusters</span>
                </div>
                <div className="text-right">
                  <span className={`font-mono text-[11px] font-bold ${r.status === 'Critical' ? 'text-[#ff505d]' : 'text-[#ffae42]'}`}>
                    {r.peakFrp}
                  </span>
                  <span className="block text-[8.5px] text-[#a3928c] uppercase tracking-wider mt-0.5">
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FlareX Insight Card */}
      <section className="insight-card mt-1">
        <div className="insight-icon">
          <Flame size={17} />
        </div>
        <div>
          <span className="insight-label">FLAREX INSIGHT</span>
          <h4>Persistent industrial heat dominates current detections.</h4>
          <p>
            71.5% of recorded events are persistent thermal sources rather than immediate critical incidents.
          </p>
        </div>
      </section>
    </div>
  );
}

function SmoothAnalyticsChart({ values }: { values: number[] }) {
  const width = 420;
  const height = 140;
  const padding = 12;

  const min = Math.min(...values);
  const max = Math.max(...values);

  const points = values.map((value, index) => {
    const x = padding + (index / (values.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / (max - min || 1)) * (height - padding * 2 - 16);
    return { x, y };
  });

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${path} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="w-full h-[145px] overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="fxFireChartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff5539" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#ff5539" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[30, 65, 100].map((y) => (
          <line
            key={y}
            x1="0"
            x2={width}
            y1={y}
            y2={y}
            stroke="rgba(255,106,61,0.08)"
            strokeWidth="1"
          />
        ))}

        <path d={areaPath} fill="url(#fxFireChartGradient)" />
        <path
          d={path}
          fill="none"
          stroke="#ff7a45"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="3.5"
            fill="#140a07"
            stroke="#ff7a45"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="flex justify-between items-center text-[9px] text-[#a3928c] mt-1 px-1">
        <span>18 May</span>
        <span>19 May</span>
        <span>20 May</span>
        <span>21 May</span>
        <span>22 May</span>
        <span>23 May</span>
        <span>24 May</span>
      </div>
    </div>
  );
}

export { AnalyticsPanel };
