'use client';

import React from 'react';
import {
  X,
  TrendingUp,
  Activity,
  Flame,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { SYSTEM_OPERATIONAL_STATS } from '../../data/mockData';

export type AnalyticsDrawerProps = {
  open?: boolean;
  onClose?: () => void;
};

const defaultChartValues = [305, 330, 370, 355, 405, 430, 464];

const severityData = [
  {
    name: 'Critical Fire Alert',
    count: 12,
    percent: 1.0,
    type: 'critical',
  },
  {
    name: 'High Severity',
    count: 48,
    percent: 3.8,
    type: 'high',
  },
  {
    name: 'Persistent Flare / Slag',
    count: 892,
    percent: 71.5,
    type: 'persistent',
  },
  {
    name: 'Low / Ambient Heat',
    count: 295,
    percent: 23.7,
    type: 'low',
  },
];

export function AnalyticsDrawer({
  open,
  onClose,
}: AnalyticsDrawerProps) {
  const context = useIntelligence();

  const isOpen = open !== undefined ? open : context.activeDrawer === 'analytics';
  const handleClose = onClose || context.closeDrawer;

  if (!isOpen) return null;

  return (
    <>
      <div
        className="drawer-overlay"
        onClick={handleClose}
      />

      <aside className="analytics-drawer">
        {/* HEADER */}
        <header className="drawer-header">
          <div className="drawer-title-area">
            <div className="drawer-icon">
              <BarChart3 size={18} />
            </div>

            <div>
              <h2>Thermal Intelligence</h2>
              <p>7-day regional analytics</p>
            </div>
          </div>

          <button
            className="drawer-close"
            onClick={handleClose}
            aria-label="Close analytics"
          >
            <X size={18} />
          </button>
        </header>

        <div className="drawer-content">
          {/* KPI GRID */}
          <section className="metric-grid">
            <MetricCard
              label="Total FRP Radiance"
              value={`${SYSTEM_OPERATIONAL_STATS.totalFrp}`}
              unit="MW"
              note="+14% vs baseline"
              icon={<TrendingUp size={16} />}
              accent="positive"
            />

            <MetricCard
              label="Average Anomaly"
              value={`${SYSTEM_OPERATIONAL_STATS.avgAnomaly}`}
              unit="/10"
              note="Elevated regional index"
              icon={<Activity size={16} />}
              accent="warning"
            />

            <MetricCard
              label="Critical Incidents"
              value={`${SYSTEM_OPERATIONAL_STATS.criticalAlerts}`}
              unit=""
              note="Requires response"
              icon={<Flame size={16} />}
              accent="critical"
            />

            <MetricCard
              label="Persistent Flares"
              value={`${SYSTEM_OPERATIONAL_STATS.persistentSources}`}
              unit=""
              note="Industrial furnace tracking"
              icon={<Sparkles size={16} />}
              accent="purple"
            />
          </section>

          {/* RADIATIVE ACTIVITY CHART */}
          <section className="analytics-section">
            <div className="section-top">
              <div>
                <h3>Radiative Activity</h3>
                <p>Fire Radiative Power • Last 7 days</p>
              </div>

              <div className="trend-badge">
                <TrendingUp size={13} />
                +49.6%
              </div>
            </div>

            <SmoothChart values={defaultChartValues} />

            <div className="chart-days">
              <span>18 May</span>
              <span>19 May</span>
              <span>20 May</span>
              <span>21 May</span>
              <span>22 May</span>
              <span>23 May</span>
              <span>24 May</span>
            </div>
          </section>

          {/* SEVERITY BREAKDOWN */}
          <section className="analytics-section">
            <div className="section-top">
              <div>
                <h3>Incident Severity</h3>
                <p>Distribution across detected hotspots</p>
              </div>
            </div>

            <div className="severity-list">
              {severityData.map((item) => (
                <div
                  className="severity-row"
                  key={item.name}
                >
                  <div className="severity-info">
                    <div className="severity-left">
                      <span
                        className={`severity-dot ${item.type}`}
                      />
                      <span>{item.name}</span>
                    </div>

                    <div className="severity-right">
                      <strong>{item.count}</strong>
                      <span>{item.percent}%</span>
                    </div>
                  </div>

                  <div className="severity-track">
                    <div
                      className={`severity-fill ${item.type}`}
                      style={{
                        width: `${Math.max(
                          item.percent,
                          2
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* INSIGHT */}
          <section className="insight-card">
            <div className="insight-icon">
              <Sparkles size={17} />
            </div>

            <div>
              <span className="insight-label">
                FLAREX INSIGHT
              </span>

              <h4>
                Persistent industrial heat dominates
                current detections.
              </h4>

              <p>
                71.5% of recorded events are persistent
                thermal sources rather than immediate
                critical incidents.
              </p>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}

function MetricCard({
  label,
  value,
  unit,
  note,
  icon,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  note: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <article className={`metric-card ${accent}`}>
      <div className="metric-top">
        <span className="metric-icon">{icon}</span>
        <span className="metric-label">{label}</span>
      </div>

      <div className="metric-value">
        {value}
        {unit && <span>{unit}</span>}
      </div>

      <p>{note}</p>
    </article>
  );
}

function SmoothChart({
  values,
}: {
  values: number[];
}) {
  const width = 420;
  const height = 150;
  const padding = 12;

  const min = Math.min(...values);
  const max = Math.max(...values);

  const points = values.map((value, index) => {
    const x =
      padding +
      (index / (values.length - 1)) *
        (width - padding * 2);

    const y =
      height -
      padding -
      ((value - min) / (max - min || 1)) *
        (height - padding * 2 - 20);

    return { x, y };
  });

  const path = points
    .map(
      (p, i) =>
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    )
    .join(' ');

  const areaPath = `${path} L ${
    points[points.length - 1].x
  } ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="chart-wrapper">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="analytics-chart"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="chartGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#38bdf8"
              stopOpacity="0.28"
            />
            <stop
              offset="100%"
              stopColor="#38bdf8"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {[35, 70, 105].map((y) => (
          <line
            key={y}
            x1="0"
            x2={width}
            y1={y}
            y2={y}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        ))}

        <path
          d={areaPath}
          fill="url(#chartGradient)"
        />

        <path
          d={path}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="3"
            fill="#08111c"
            stroke="#38bdf8"
            strokeWidth="2"
          />
        ))}
      </svg>
    </div>
  );
}

export default AnalyticsDrawer;
