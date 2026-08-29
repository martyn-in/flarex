'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  LayoutDashboard,
  Flame,
  Activity,
  ShieldAlert,
  ChartNoAxesCombined,
  BrainCircuit,
  Database,
  FileText,
  Settings,
  Bell,
  Search,
  Radio,
  Thermometer,
  ShieldCheck,
  MapPin,
  Satellite,
  Clock3,
  ArrowUpRight,
  Globe,
  TrendingUp,
  Layers,
  Trees,
} from 'lucide-react';
import { useIntelligence } from '@/context/IntelligenceContext';
import { IncidentListDrawer } from '@/components/drawers/IncidentListDrawer';
import { PersistentSourcesDrawer } from '@/components/drawers/PersistentSourcesDrawer';
import { AlertCenterDrawer } from '@/components/drawers/AlertCenterDrawer';
import { AnalyticsDrawer } from '@/components/drawers/AnalyticsDrawer';
import { DataSourcesDrawer } from '@/components/drawers/DataSourcesDrawer';
import { ReportsDrawer } from '@/components/drawers/ReportsDrawer';
import { AIModelDrawer } from '@/components/drawers/AIModelDrawer';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { NotificationsPopover } from '@/components/modals/NotificationsPopover';
import { ToastContainer } from '@/components/ToastContainer';
import { RightIncidentPanel } from '@/components/RightIncidentPanel';

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

interface FlareXDashboardProps {
  onReturnToLanding?: () => void;
}

export function FlareXDashboard({ onReturnToLanding }: FlareXDashboardProps) {
  const {
    selectedHotspot,
    selectHotspot,
    hotspots,
    activeFilter,
    setFilter,
    calculatedStats,
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

  // Navigation Structure matching exact Blueprint
  const menu = [
    {
      section: 'MONITORING',
      items: [
        {
          name: 'Dashboard',
          icon: LayoutDashboard,
          active: !activeDrawer && !isSettingsOpen && activeFilter === null,
          action: () => {
            closeDrawer();
            setIsSettingsOpen(false);
            setFilter(null);
            resetMapView();
          },
        },
        {
          name: 'Industrial Fires',
          icon: Flame,
          badge: `${calculatedStats.industrialFires}`,
          active: activeDrawer === 'incidents' || activeFilter === 'industrial_fires',
          action: () => {
            if (activeDrawer === 'incidents') {
              closeDrawer();
            } else {
              setFilter('industrial_fires');
              openDrawer('incidents');
            }
          },
        },
        {
          name: 'Persistent Sources',
          icon: Activity,
          badge: `${calculatedStats.persistentSources}`,
          active: activeDrawer === 'persistent_sources' || activeFilter === 'persistent_sources',
          action: () => {
            if (activeDrawer === 'persistent_sources') {
              closeDrawer();
            } else {
              setFilter('persistent_sources');
              openDrawer('persistent_sources');
            }
          },
        },
        {
          name: 'Alert Center',
          icon: ShieldAlert,
          badge: `${calculatedStats.criticalAlerts}`,
          badgeColor: 'bg-red-500',
          active: activeDrawer === 'alerts' || activeFilter === 'critical',
          action: () => {
            if (activeDrawer === 'alerts') {
              closeDrawer();
            } else {
              setFilter('critical');
              openDrawer('alerts');
            }
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
          name: 'AI Assistant',
          icon: BrainCircuit,
          badge: 'Live',
          active: activeDrawer === 'ai',
          action: () => {
            if (activeDrawer === 'ai') closeDrawer();
            else openDrawer('ai');
          },
        },
        {
          name: 'Data & Model',
          icon: Database,
          active: activeDrawer === 'datasources' || activeDrawer === 'data',
          action: () => {
            if (activeDrawer === 'datasources' || activeDrawer === 'data') closeDrawer();
            else openDrawer('datasources');
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

  // 4 Top Stats (Calculated Dynamically!)
  const stats = [
    {
      label: 'Thermal Events',
      value: `${calculatedStats.totalEvents}`,
      sub: 'Pan-India Active Feeds',
      icon: Radio,
      className: 'blue',
      action: () => {
        setFilter(null);
        resetMapView();
      },
      isActive: activeFilter === null,
    },
    {
      label: 'Industrial Fires',
      value: `${calculatedStats.industrialFires}`,
      sub: 'Severe Radiance Surge',
      icon: Flame,
      className: 'red',
      action: () => setFilter('industrial_fires'),
      isActive: activeFilter === 'industrial_fires',
    },
    {
      label: 'Persistent Sources',
      value: `${calculatedStats.persistentSources}`,
      sub: 'Recurring Operational Flares',
      icon: Activity,
      className: 'orange',
      action: () => setFilter('persistent_sources'),
      isActive: activeFilter === 'persistent_sources',
    },
    {
      label: 'Critical Alerts',
      value: `${calculatedStats.criticalAlerts}`,
      sub: '> 2.0× Historical Baseline',
      icon: ShieldAlert,
      className: 'red',
      action: () => openDrawer('alerts'),
      isActive: activeDrawer === 'alerts' || activeFilter === 'critical',
    },
  ];

  // Search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const q = searchQuery.toLowerCase();
    const match = hotspots.find(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.location.toLowerCase().includes(q) ||
        h.eventId.toLowerCase().includes(q) ||
        h.state.toLowerCase().includes(q) ||
        h.classification.toLowerCase().includes(q)
    );

    if (match) {
      selectHotspot(match, true);
      addToast(`Located: ${match.name} (${match.location})`, 'info');
    } else {
      addToast(`No active thermal incident matching "${searchQuery}"`, 'warning');
    }
  };

  return (
    <main className="app-shell flex h-screen w-full overflow-hidden bg-[#0a0706]">
      {/* 1. SIDEBAR */}
      <aside className="sidebar glass-panel shrink-0 flex flex-col justify-between">
        <div>
          {/* Brand */}
          <div
            className="brand cursor-pointer"
            onClick={() => {
              if (onReturnToLanding) {
                onReturnToLanding();
              } else {
                closeDrawer();
                setIsSettingsOpen(false);
                setFilter(null);
                resetMapView();
              }
            }}
            title="Return to Globe Intro"
          >
            <div className="brand-icon">
              <Flame size={22} />
            </div>
            <div>
              <h2>
                Flame<span>X</span>
              </h2>
              <p>Thermal Intelligence Layer</p>
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
                      <Icon size={17} />
                      <span>{item.name}</span>
                      {item.badge && <span className="nav-badge">{item.badge}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        <div>
          {/* Cinematic Globe Switcher Button */}
          {onReturnToLanding && (
            <button
              type="button"
              onClick={onReturnToLanding}
              className="flex items-center justify-center gap-2 w-full mb-3 py-2 px-3 rounded-xl text-[10px] font-bold tracking-wider text-[#d1b8af] bg-[#ff5533]/[0.06] border border-[#ff6a1a]/20 hover:bg-[#ff5533]/[0.15] hover:text-white transition-all cursor-pointer"
              title="Switch to 3D Globe Overview"
            >
              <Globe size={14} className="text-[#ff7a45]" />
              <span>3D EARTH GLOBE</span>
            </button>
          )}

          {/* Bottom System Status */}
          <div
            className="sidebar-status glass-card cursor-pointer"
            onClick={() => openDrawer('datasources')}
            title="View Data Ingestion Pipelines"
          >
            <div className="system-online">
              <span className="live-dot" />
              INTELLIGENCE ACTIVE
            </div>
            <p>NASA FIRMS + OSM + ESA WorldCover</p>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <section className="main-content flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* TOPBAR */}
        <header className="topbar">
          <div>
            <p className="page-eyebrow">GEOSPATIAL INTELLIGENCE PLATFORM</p>
            <h1>Thermal Anomaly Intelligence</h1>
          </div>

          <div className="header-actions">
            {/* Real Search Box */}
            <form onSubmit={handleSearchSubmit} className="search-box glass-card">
              <Search size={16} className="shrink-0" />
              <input
                type="text"
                placeholder="Search facility, SEZ, or Event ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* AI Assistant Quick Launcher */}
            <button
              type="button"
              onClick={() => openDrawer('ai')}
              className="py-1.5 px-3 rounded-xl glass-pill text-cyan-300 hover:text-white text-[11px] font-bold flex items-center gap-1.5 border border-cyan-500/30 bg-cyan-950/30 cursor-pointer shadow-[0_0_10px_rgba(56,189,248,0.2)]"
              title="Open Grounded AI Assistant"
            >
              <BrainCircuit size={15} />
              <span>AI Copilot</span>
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`icon-button glass-card ${isNotificationsOpen ? 'bg-white/10' : ''}`}
              title="Active Critical Alerts"
            >
              <Bell size={18} />
              {calculatedStats.criticalAlerts > 0 && <span className="notification-dot" />}
            </button>

            {/* LIVE Pill */}
            <div
              className="live-pill cursor-pointer"
              onClick={() => addToast('Live Satellite Feed active: VIIRS NOAA-20/21 & MODIS', 'success')}
              title="Live Satellite Streaming"
            >
              <span className="live-dot" />
              LIVE NRT
            </div>
          </div>
        </header>

        {/* 3. DYNAMIC KPI STATS GRID */}
        <section className="stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article
                key={stat.label}
                onClick={stat.action}
                className={`stat-card glass-card cursor-pointer ${stat.isActive ? 'active-filter' : ''}`}
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

        {/* 4. COMMAND GRID: HERO MAP */}
        <section className="command-grid !grid-cols-1 flex-1">
          {/* MAP CARD */}
          <article className="map-card glass-card h-[600px] min-h-[500px]">
            <div className="section-heading">
              <div>
                <span className="eyebrow">GEOSPATIAL INFRASTRUCTURE CORRIDORS</span>
                <h2>Pan-India Thermal Heat &amp; Anomaly Map</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openDrawer('datasources')}
                  className="secondary-button !text-[11px]"
                >
                  Data Sources
                </button>
                <button
                  type="button"
                  onClick={resetMapView}
                  className="secondary-button"
                  title="Reset Camera View to Full India Extent"
                >
                  Full Map
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </div>

            <div className="map-area">
              <FlareXMap />
            </div>
          </article>
        </section>
      </section>

      {/* 5. RIGHT EVENT INVESTIGATION PANEL (SHOWCASE SCREEN) */}
      <RightIncidentPanel />

      {/* 6. INTERACTIVE DRAWERS, MODALS & TOAST OVERLAYS */}
      <IncidentListDrawer />
      <PersistentSourcesDrawer />
      <AlertCenterDrawer />
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

export default FlareXDashboard;
