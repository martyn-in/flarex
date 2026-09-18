'use client';

import React, { useState } from 'react';
import {
  Flame,
  Radio,
  Search,
  Bell,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Layers,
  FileText,
  Settings,
  ShieldAlert,
  ChartNoAxesCombined,
  Database,
  Globe,
  BrainCircuit,
} from 'lucide-react';

import { useIntelligence } from '@/context/IntelligenceContext';
import FlareXMap from '@/components/FlareXMap';
import RightIncidentPanel from '@/components/RightIncidentPanel';

// Drawers & Modals
import IncidentListDrawer from '@/components/drawers/IncidentListDrawer';
import PersistentSourcesDrawer from '@/components/drawers/PersistentSourcesDrawer';
import AlertCenterDrawer from '@/components/drawers/AlertCenterDrawer';
import AnalyticsDrawer from '@/components/drawers/AnalyticsDrawer';
import DataSourcesDrawer from '@/components/drawers/DataSourcesDrawer';
import ReportsDrawer from '@/components/drawers/ReportsDrawer';
import AIModelDrawer from '@/components/drawers/AIModelDrawer';
import SettingsModal from '@/components/modals/SettingsModal';
import NotificationsPopover from '@/components/modals/NotificationsPopover';
import DispatchModal from '@/components/modals/DispatchModal';
import { ToastContainer } from '@/components/ToastContainer';

interface FlareXDashboardProps {
  onReturnToLanding?: () => void;
}

export function FlareXDashboard({ onReturnToLanding }: FlareXDashboardProps) {
  const {
    hotspots,
    selectedHotspot,
    selectHotspot,
    activeFilter,
    setFilter,
    activeDrawer,
    openDrawer,
    closeDrawer,
    isSettingsOpen,
    setIsSettingsOpen,
    isNotificationsOpen,
    setIsNotificationsOpen,
    resetMapView,
    addToast,
    calculatedStats,
    dataSourceMode,
    ingestionMeta,
  } = useIntelligence();

  const [searchQuery, setSearchQuery] = useState('');

  // 1. Sidebar Navigation Menu Items
  const menu = [
    {
      section: 'MONITORING',
      items: [
        {
          name: 'Dashboard',
          icon: Layers,
          action: () => {
            closeDrawer();
            setFilter(null);
            resetMapView();
          },
          active: activeDrawer === null && activeFilter === null,
        },
        {
          name: 'Active Incidents',
          icon: Radio,
          action: () => openDrawer('incidents'),
          badge: calculatedStats.totalEvents > 0 ? `${calculatedStats.totalEvents}` : undefined,
          badgeColor: 'bg-orange-500',
          active: activeDrawer === 'incidents',
        },
        {
          name: 'Industrial Fires',
          icon: Flame,
          action: () => {
            closeDrawer();
            setFilter('industrial_fires');
          },
          badge: calculatedStats.industrialFires > 0 ? `${calculatedStats.industrialFires}` : undefined,
          badgeColor: 'bg-red-500',
          active: activeFilter === 'industrial_fires',
        },
        {
          name: 'Persistent Sources',
          icon: Activity,
          action: () => openDrawer('persistents'),
          badge: calculatedStats.persistentSources > 0 ? `${calculatedStats.persistentSources}` : undefined,
          badgeColor: 'bg-orange-500',
          active: activeDrawer === 'persistents',
        },
        {
          name: 'Alert Center',
          icon: ShieldAlert,
          action: () => openDrawer('alerts'),
          badge: calculatedStats.criticalAlerts > 0 ? `${calculatedStats.criticalAlerts}` : undefined,
          badgeColor: 'bg-red-600',
          active: activeDrawer === 'alerts',
        },
      ],
    },
    {
      section: 'INTELLIGENCE',
      items: [
        {
          name: 'Analytics',
          icon: ChartNoAxesCombined,
          action: () => openDrawer('analytics'),
          active: activeDrawer === 'analytics',
        },
        {
          name: 'Data & Model',
          icon: Database,
          action: () => openDrawer('datasources'),
          active: activeDrawer === 'datasources',
        },
        {
          name: 'AI Assistant',
          icon: BrainCircuit,
          action: () => openDrawer('ai'),
          active: activeDrawer === 'ai',
        },
      ],
    },
    {
      section: 'OPERATIONS',
      items: [
        {
          name: 'Reports',
          icon: FileText,
          action: () => openDrawer('reports'),
          active: activeDrawer === 'reports',
        },
        {
          name: 'Settings',
          icon: Settings,
          action: () => setIsSettingsOpen(true),
          active: isSettingsOpen,
        },
      ],
    },
  ];

  // 2. High-Impact Stats Cards
  const stats = [
    {
      label: 'THERMAL EVENTS',
      value: `${calculatedStats.totalEvents}`,
      change: `${calculatedStats.totalEvents} Active Feeds`,
      changeType: 'neutral',
      icon: Radio,
      action: () => {
        setFilter(null);
        openDrawer('incidents');
      },
    },
    {
      label: 'INDUSTRIAL FIRES',
      value: `${calculatedStats.industrialFires}`,
      change: 'Severe Radiance Surge',
      changeType: 'increase',
      icon: Flame,
      action: () => setFilter('industrial_fires'),
    },
    {
      label: 'PERSISTENT SOURCES',
      value: `${calculatedStats.persistentSources}`,
      change: 'Recurring Operational Flares',
      changeType: 'neutral',
      icon: Activity,
      action: () => openDrawer('persistents'),
    },
    {
      label: 'CRITICAL ALERTS',
      value: `${calculatedStats.criticalAlerts}`,
      change: '> 2.0x Historical Baseline',
      changeType: 'decrease',
      icon: ShieldAlert,
      action: () => openDrawer('alerts'),
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
    <main className="app-shell flex h-screen w-full overflow-hidden bg-[#fff9f5] text-[#431407]">
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
            title="Return to Cinematic Landing"
          >
            <div className="brand-icon">
              <Flame size={22} />
            </div>
            <div>
              <h2>
                FLARE<span>X</span>
              </h2>
              <p>Thermal Intelligence Layer</p>
            </div>
          </div>

          {/* Grouped Navigation */}
          <nav className="navigation">
            {menu.map((group) => (
              <div className="nav-group" key={group.section}>
                <span className="section-title">{group.section}</span>
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
                      {item.badge && (
                        <span className={`badge ${item.badgeColor || 'bg-slate-700'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-status-card">
            <span className="status-badge-dot" />
            <div>
              <p className="status-title">INTELLIGENCE ACTIVE</p>
              <p className="status-desc">NASA FIRMS + OSM + ESA WorldCover</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT (MAP & COMMAND CENTER) */}
      <section className="main-content flex-1 flex flex-col min-w-0 overflow-y-auto p-4 gap-3">
        {/* TOP COMMAND BAR */}
        <header className="main-header flex items-center justify-between pb-1">
          <div className="header-title">
            <span className="header-kicker">GEOSPATIAL INTELLIGENCE PLATFORM</span>
            <h1>Thermal Anomaly Intelligence</h1>
          </div>

          <div className="header-actions">
            {/* Cinematic Landing Link */}
            {onReturnToLanding && (
              <button
                type="button"
                onClick={onReturnToLanding}
                className="icon-button hover:text-[#ea580c] transition-colors"
                title="Return to Cinematic Landing"
              >
                <Globe size={18} />
              </button>
            )}

            {/* Real Search Box */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-white border-[#fed7aa] focus-within:border-[#ea580c] transition-colors w-[260px]">
              <Search size={15} className="shrink-0 text-[#7c2d12]" />
              <input
                type="text"
                placeholder="Search facility, SEZ, or Event ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-[11.5px] font-medium text-[#431407] placeholder-[#9a3412]"
              />
            </form>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`icon-button ${isNotificationsOpen ? 'bg-white/10' : ''}`}
              title="Active Critical Alerts"
            >
              <Bell size={18} />
              {calculatedStats.criticalAlerts > 0 && <span className="notification-dot" />}
            </button>

            {/* Real Data Status Pill */}
            <div
              className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono font-extrabold border transition-all ${
                dataSourceMode === 'LIVE_NRT'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : dataSourceMode === 'CACHED'
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-orange-50 text-orange-900 border-orange-300'
              }`}
              onClick={() =>
                addToast(
                  `Provider: ${ingestionMeta.provider} | Status: ${dataSourceMode} | Acquired: ${ingestionMeta.acquisitionTime.replace('T', ' ').slice(0, 19)} UTC (Age: ${ingestionMeta.dataAgeMinutes}m)`,
                  dataSourceMode === 'LIVE_NRT' ? 'success' : 'info'
                )
              }
              title="Click for full satellite pipeline telemetry & latency"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  dataSourceMode === 'LIVE_NRT'
                    ? 'bg-emerald-500 animate-ping'
                    : dataSourceMode === 'CACHED'
                    ? 'bg-amber-500'
                    : 'bg-orange-500'
                }`}
              />
              {dataSourceMode === 'LIVE_NRT'
                ? 'LIVE NRT'
                : dataSourceMode === 'CACHED'
                ? `CACHED (${ingestionMeta.dataAgeMinutes}m)`
                : 'DEMO DATA'}
            </div>
          </div>
        </header>

        {/* 3. DYNAMIC KPI STATS GRID - EXECUTIVE ALIGNED */}
        <section className="grid grid-cols-4 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isAlert = stat.label === 'CRITICAL ALERTS';
            const isFire = stat.label === 'INDUSTRIAL FIRES';
            const isPersistent = stat.label === 'PERSISTENT SOURCES';

            return (
              <article
                key={stat.label}
                onClick={stat.action}
                className="p-3.5 rounded-2xl border bg-white border-[#fed7aa] hover:border-[#ea580c] hover:bg-[#fffbf8] transition-all cursor-pointer flex items-center justify-between group shadow-xs select-none"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7c2d12] truncate">
                    {stat.label}
                  </span>
                  <div className="flex items-baseline gap-1 my-0.5">
                    <span
                      className={`text-[26px] font-black font-mono leading-tight ${
                        isAlert ? 'text-red-600' : isFire ? 'text-[#ea580c]' : isPersistent ? 'text-purple-700' : 'text-[#431407]'
                      }`}
                    >
                      {stat.value}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold truncate text-[#9a3412]">
                    {stat.change}
                  </span>
                </div>

                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    isAlert
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : isFire
                      ? 'bg-orange-50 border-orange-200 text-[#ea580c]'
                      : isPersistent
                      ? 'bg-purple-50 border-purple-200 text-purple-700'
                      : 'bg-[#fff7ed] border-[#fed7aa] text-[#ea580c]'
                  }`}
                >
                  <Icon size={20} />
                </div>
              </article>
            );
          })}
        </section>

        {/* 4. GEOSPATIAL MAP SECTION */}
        <section className="map-wrapper flex-1 flex flex-col min-h-[480px]">
          <article className="map-card flex-1 flex flex-col bg-white border border-[#fed7aa] rounded-2xl p-3">
            <div className="map-header flex items-center justify-between pb-2 mb-2 border-b border-[#fed7aa]/60">
              <div>
                <span className="section-kicker text-[9.5px] font-extrabold text-[#ea580c] uppercase tracking-wider block">GEOSPATIAL INFRASTRUCTURE CORRIDORS</span>
                <h3 className="text-[14px] font-extrabold text-[#431407]">Pan-India Thermal Heat &amp; Anomaly Map</h3>
              </div>
              <div className="map-header-actions flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openDrawer('datasources')}
                  className="px-2.5 py-1.5 rounded-xl border border-[#fed7aa] bg-[#fff7ed] hover:bg-[#ffedd5] text-[#7c2d12] hover:text-[#431407] font-bold text-[11px] transition-colors cursor-pointer"
                >
                  Data Sources
                </button>
                <button
                  type="button"
                  onClick={resetMapView}
                  className="px-2.5 py-1.5 rounded-xl border border-[#fed7aa] bg-[#fff7ed] hover:bg-[#ffedd5] text-[#7c2d12] hover:text-[#431407] font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                  title="Reset Camera View to Full India Extent"
                >
                  <span>Full Map</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>

            <div className="map-area flex-1 relative min-h-[420px] rounded-xl overflow-hidden">
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
      <DispatchModal />
      <ToastContainer />
    </main>
  );
}

export default FlareXDashboard;
