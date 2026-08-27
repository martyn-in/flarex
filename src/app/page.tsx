'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  LayoutDashboard,
  Map as MapIcon,
  Flame,
  ChartNoAxesCombined,
  Database,
  BrainCircuit,
  FileText,
  Settings,
  Bell,
  Search,
  Radio,
  Thermometer,
  Activity,
  ShieldCheck,
  MapPin,
  Satellite,
  Clock3,
  ArrowUpRight,
} from 'lucide-react';
import { IntelligenceProvider, useIntelligence } from '@/context/IntelligenceContext';
import { SYSTEM_OPERATIONAL_STATS } from '@/data/mockData';
import { IncidentListDrawer } from '@/components/drawers/IncidentListDrawer';
import { AnalyticsDrawer } from '@/components/drawers/AnalyticsDrawer';
import { DataSourcesDrawer } from '@/components/drawers/DataSourcesDrawer';
import { ReportsDrawer } from '@/components/drawers/ReportsDrawer';
import { AIModelDrawer } from '@/components/drawers/AIModelDrawer';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { NotificationsPopover } from '@/components/modals/NotificationsPopover';
import { ToastContainer } from '@/components/ToastContainer';

// Dynamically import FlareX MapLibre component with SSR disabled
const FlareXMap = dynamic(
  () => import('@/components/FlareXMap').then((mod) => mod.FlareXMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#05070a] text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-[#ff5a3c]/30 border-t-[#ff5a3c] animate-spin" />
      </div>
    ),
  }
);

function DashboardContent() {
  const {
    selectedHotspot,
    selectHotspot,
    hotspots,
    activeFilter,
    setFilter,
    activeDrawer,
    openDrawer,
    closeDrawer,
    isSettingsOpen,
    setIsSettingsOpen,
    isNotificationsOpen,
    setIsNotificationsOpen,
    flyToCoords,
    resetMapView,
    addToast,
  } = useIntelligence();

  const [searchQuery, setSearchQuery] = useState('');

  // Active incident fallback
  const currentIncident = selectedHotspot || hotspots[0];

  // Navigation Structure
  const menu = [
    {
      section: 'MONITORING',
      items: [
        {
          name: 'Overview',
          icon: LayoutDashboard,
          active: !activeDrawer && !isSettingsOpen,
          action: () => {
            closeDrawer();
            setIsSettingsOpen(false);
            setFilter(null);
            resetMapView();
          },
        },
        {
          name: 'Map View',
          icon: MapIcon,
          active: false,
          action: () => {
            closeDrawer();
            setIsSettingsOpen(false);
            if (currentIncident) {
              flyToCoords(currentIncident.coordinates, 7.5, 20);
            }
          },
        },
        {
          name: 'Incidents',
          icon: Flame,
          badge: '12',
          active: activeDrawer === 'incidents',
          action: () => {
            if (activeDrawer === 'incidents') closeDrawer();
            else openDrawer('incidents');
          },
        },
      ],
    },
    {
      section: 'INTELLIGENCE',
      items: [
        {
          name: 'Analytics',
          icon: ChartNoAxesCombined,
          active: activeDrawer === 'analytics',
          action: () => {
            if (activeDrawer === 'analytics') closeDrawer();
            else openDrawer('analytics');
          },
        },
        {
          name: 'Data Sources',
          icon: Database,
          active: activeDrawer === 'datasources' || activeDrawer === 'data',
          action: () => {
            if (activeDrawer === 'datasources' || activeDrawer === 'data') closeDrawer();
            else openDrawer('datasources');
          },
        },
        {
          name: 'AI Model',
          icon: BrainCircuit,
          active: activeDrawer === 'ai',
          action: () => {
            if (activeDrawer === 'ai') closeDrawer();
            else openDrawer('ai');
          },
        },
      ],
    },
    {
      section: 'OPERATIONS',
      items: [
        {
          name: 'Reports',
          icon: FileText,
          active: activeDrawer === 'reports',
          action: () => {
            if (activeDrawer === 'reports') closeDrawer();
            else openDrawer('reports');
          },
        },
        {
          name: 'Settings',
          icon: Settings,
          active: isSettingsOpen || activeDrawer === 'settings',
          action: () => {
            if (isSettingsOpen || activeDrawer === 'settings') {
              closeDrawer();
              setIsSettingsOpen(false);
            } else {
              closeDrawer();
              setIsSettingsOpen(true);
            }
          },
        },
      ],
    },
  ];

  // 4 Top Stats
  const stats = [
    {
      label: 'Active Hotspots',
      value: SYSTEM_OPERATIONAL_STATS.activeHotspots.toLocaleString(),
      sub: '+18 detected today',
      icon: Flame,
      className: 'orange',
      action: () => {
        setFilter(null);
        resetMapView();
      },
      isActive: activeFilter === null,
    },
    {
      label: 'Critical Incidents',
      value: `${SYSTEM_OPERATIONAL_STATS.criticalAlerts}`,
      sub: 'Requires immediate action',
      icon: Radio,
      className: 'red',
      action: () => setFilter('critical'),
      isActive: activeFilter === 'critical',
    },
    {
      label: 'AI Confidence',
      value: `${SYSTEM_OPERATIONAL_STATS.averageConfidence}%`,
      sub: 'XGBoost ensemble score',
      icon: BrainCircuit,
      className: 'blue',
      action: () => openDrawer('ai'),
      isActive: activeDrawer === 'ai',
    },
    {
      label: 'System Health',
      value: `${SYSTEM_OPERATIONAL_STATS.systemHealth}%`,
      sub: 'All satellites operational',
      icon: ShieldCheck,
      className: 'green',
      action: () => openDrawer('datasources'),
      isActive: activeDrawer === 'datasources',
    },
  ];

  // Handle Search Execution
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const match = hotspots.find(
      (h) =>
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.state.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (match) {
      selectHotspot(match, true);
      addToast(`Located: ${match.name} (${match.location})`, 'info');
    } else {
      addToast(`No active thermal incident matching "${searchQuery}"`, 'warning');
    }
  };

  return (
    <main className="app-shell">
      {/* 1. SIDEBAR */}
      <aside className="sidebar glass-panel">
        {/* Brand */}
        <div
          className="brand"
          onClick={() => {
            closeDrawer();
            setIsSettingsOpen(false);
            setFilter(null);
            resetMapView();
          }}
          title="Reset to National Overview"
        >
          <div className="brand-icon">
            <Flame size={22} />
          </div>
          <div>
            <h2>
              Flare<span>X</span>
            </h2>
            <p>Geospatial Fire Intelligence</p>
          </div>
        </div>

        {/* Grouped Navigation */}
        <nav className="navigation">
          {menu.map((group) => (
            <div className="nav-group" key={group.section}>
              <p className="nav-label">{group.section}</p>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={item.action}
                    className={`nav-item ${item.active ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom System Status */}
        <div
          className="sidebar-status glass-card cursor-pointer"
          onClick={() => openDrawer('datasources')}
          title="View Data Ingestion Pipelines"
        >
          <div className="system-online">
            <span className="live-dot" />
            SYSTEM ONLINE
          </div>
          <p>Satellite feeds synchronized ({SYSTEM_OPERATIONAL_STATS.latency} lag)</p>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <section className="main-content">
        {/* TOPBAR */}
        <header className="topbar">
          <div>
            <p className="page-eyebrow">COMMAND CENTER</p>
            <h1>Fire Intelligence Overview</h1>
          </div>

          <div className="header-actions">
            {/* Real Search Box */}
            <form onSubmit={handleSearchSubmit} className="search-box glass-card">
              <Search size={17} className="shrink-0" />
              <input
                type="text"
                placeholder="Search location or incident..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`icon-button glass-card ${isNotificationsOpen ? 'bg-white/10' : ''}`}
              title="Active Notifications (12 Urgent Incidents)"
            >
              <Bell size={19} />
              <span className="notification-dot" />
            </button>

            {/* LIVE Pill */}
            <div
              className="live-pill cursor-pointer"
              onClick={() => addToast('Live Satellite Feed active: VIIRS NOAA-20 & MODIS', 'success')}
              title="Live Satellite Streaming"
            >
              <span className="live-dot" />
              LIVE
            </div>
          </div>
        </header>

        {/* 3. KPI STATS GRID */}
        <section className="stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article
                key={stat.label}
                onClick={stat.action}
                className={`stat-card glass-card ${stat.isActive ? 'active-filter' : ''}`}
              >
                <div className={`stat-icon ${stat.className}`}>
                  <Icon size={20} />
                </div>
                <div className="stat-info">
                  <p>{stat.label}</p>
                  <h3>{stat.value}</h3>
                  <span>{stat.sub}</span>
                </div>
              </article>
            );
          })}
        </section>

        {/* 4. COMMAND GRID: HERO MAP + CRITICAL ACTIVE INCIDENT */}
        <section className="command-grid">
          {/* MAP CARD */}
          <article className="map-card glass-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">GEOSPATIAL MONITOR</span>
                <h2>Live Thermal Intelligence</h2>
              </div>
              <button
                type="button"
                onClick={resetMapView}
                className="secondary-button"
                title="Reset Camera View to Full India Extent"
              >
                Full Map
                <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="map-area">
              <FlareXMap />
            </div>
          </article>

          {/* CRITICAL ACTIVE INCIDENT CARD */}
          <article className="incident-card glass-card">
            <div className="incident-top">
              <div className="critical-badge">
                <span className="pulse-dot" />
                {currentIncident.severity.toUpperCase()}
              </div>
              <span className="incident-id">
                {currentIncident.id.split('-').slice(-2).join('-')}
              </span>
            </div>

            <div className="incident-title">
              <div className="incident-flame">
                <Flame size={26} />
              </div>
              <div>
                <span>ACTIVE INCIDENT</span>
                <h2>{currentIncident.name}</h2>
              </div>
            </div>

            <div className="location">
              <MapPin size={17} className="text-[#ff5a3c] shrink-0" />
              <span>{currentIncident.location}</span>
            </div>

            <div className="incident-primary">
              <div>
                <span>TEMPERATURE</span>
                <strong>{currentIncident.temperature}°C</strong>
              </div>
              <div>
                <span>AI CONFIDENCE</span>
                <strong>{currentIncident.confidence}%</strong>
              </div>
            </div>

            <div className="confidence-bar">
              <div style={{ width: `${currentIncident.confidence}%` }} />
            </div>

            <div className="incident-details">
              <div>
                <Thermometer size={17} className="text-[#ff5a3c]" />
                <span>Thermal anomaly</span>
                <strong>+{(currentIncident.anomalyScore * 1.8).toFixed(1)}°C</strong>
              </div>
              <div>
                <Activity size={17} className="text-[#ff8a42]" />
                <span>Fire Radiative Power</span>
                <strong>{currentIncident.frp} MW</strong>
              </div>
              <div>
                <Satellite size={17} className="text-[#4ca7ff]" />
                <span>Satellite Sensor</span>
                <strong>{currentIncident.satellite.split(' ')[0]}</strong>
              </div>
              <div>
                <Clock3 size={17} className="text-slate-400" />
                <span>Detection Time</span>
                <strong>{currentIncident.timestamp.split(' ')[1]} IST</strong>
              </div>
            </div>

            <div className="incident-actions">
              <button
                type="button"
                onClick={() => {
                  flyToCoords(currentIncident.coordinates, 8.2, 30);
                  addToast(`Camera focused on ${currentIncident.name}`, 'info');
                }}
                className="primary-action"
              >
                <MapPin size={17} />
                Focus on Map
              </button>

              <button
                type="button"
                onClick={() => openDrawer('analytics')}
                className="ghost-action"
              >
                Investigate
                <ArrowUpRight size={16} />
              </button>
            </div>
          </article>
        </section>

        {/* 5. LOWER INFO: THREAT ANALYTICS + LIVE RECENT DETECTIONS FEED */}
        <section className="bottom-grid">
          {/* Threat Analytics Chart */}
          <article className="analytics-card glass-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">THREAT ANALYTICS</span>
                <h2>7-Day FRP Radiative Radiance</h2>
              </div>
              <button
                type="button"
                onClick={() => openDrawer('analytics')}
                className="secondary-button"
              >
                Detailed Trends
                <ArrowUpRight size={16} />
              </button>
            </div>

            {/* Dynamic Interactive Chart Columns */}
            <div className="fake-chart">
              {currentIncident.history.map((h, index) => {
                const maxFrp = 90;
                const heightPercent = Math.min(100, Math.max(20, (h.frp / maxFrp) * 100));
                return (
                  <div
                    key={index}
                    className="chart-column"
                    style={{ height: `${heightPercent}%` }}
                    title={`${h.date}: ${h.frp} MW (Baseline: ${h.baseline} MW)`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#788291] mt-2 pt-2 border-t border-white/[0.05]">
              <span>{currentIncident.history[0]?.date || '18 May'}</span>
              <span className="font-mono text-[#ff725d]">Peak: {currentIncident.frp} MW</span>
              <span>{currentIncident.history[currentIncident.history.length - 1]?.date || '24 May'}</span>
            </div>
          </article>

          {/* Live Recent Detections Feed */}
          <article className="feed-card glass-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">LIVE FEED</span>
                <h2>Recent Detections</h2>
              </div>
              <button
                type="button"
                onClick={() => openDrawer('incidents')}
                className="secondary-button"
              >
                View All ({hotspots.length})
                <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="flex flex-col">
              {hotspots.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    selectHotspot(item, true);
                    addToast(`Focused on ${item.name} (${item.location})`, 'info');
                  }}
                  className="feed-item"
                >
                  <span
                    className={`severity ${
                      item.severity === 'critical'
                        ? 'critical'
                        : item.severity === 'high'
                        ? 'warning'
                        : item.severity === 'medium'
                        ? 'moderate'
                        : 'low'
                    }`}
                  />
                  <div>
                    <strong>{item.name}</strong>
                    <p>
                      {item.location} • {item.timestamp.split(' ')[1]} IST
                    </p>
                  </div>
                  <span className="feed-temp">{item.temperature}°C</span>
                </div>
              ))}
            </div>
          </article>
        </section>
      </section>

      {/* 6. INTERACTIVE DRAWERS, MODALS & TOAST OVERLAYS */}
      <IncidentListDrawer />
      <AnalyticsDrawer />
      <DataSourcesDrawer />
      <ReportsDrawer />
      <AIModelDrawer />
      <SettingsModal />
      <NotificationsPopover />
      <ToastContainer />
    </main>
  );
}

export default function Home() {
  return (
    <IntelligenceProvider>
      <DashboardContent />
    </IntelligenceProvider>
  );
}
