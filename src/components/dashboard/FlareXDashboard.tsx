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
  Sun,
  Moon,
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
    theme,
    toggleTheme,
  } = useIntelligence();

  const isDark = theme === 'dark';
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
    <>
      <main className="app-shell">
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

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => {
                toggleTheme();
                addToast(
                  theme === 'dark'
                    ? 'Switched to Arctic Light Mode'
                    : 'Switched to Dark Flame Theme',
                  'info'
                );
              }}
              className="icon-button cursor-pointer"
              title={
                theme === 'dark'
                  ? 'Switch to Arctic Light Mode'
                  : 'Switch to Dark Flame Theme'
              }
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun size={18} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              ) : (
                <Moon size={18} className="text-[#0284c7]" />
              )}
            </button>

            {/* Real Search Box */}
            <form onSubmit={handleSearchSubmit} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors w-[250px] ${
              isDark
                ? 'bg-black/40 border-[rgba(255,106,61,0.2)] focus-within:border-[#ff5533]'
                : 'bg-white border-[#cfe0f0] focus-within:border-[#0284c7]'
            }`}>
              <Search size={15} className={`shrink-0 ${isDark ? 'text-[#a3928c]' : 'text-[#627d9c]'}`} />
              <input
                type="text"
                placeholder="Search facility, SEZ, or Event ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-transparent border-0 outline-none text-[11.5px] font-medium ${
                  isDark ? 'text-white placeholder-[#7d6e68]' : 'text-[#0c2340] placeholder-slate-400'
                }`}
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
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : dataSourceMode === 'CACHED'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-orange-500/15 text-orange-300 border-orange-500/30'
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
                    ? 'bg-emerald-400 animate-ping'
                    : dataSourceMode === 'CACHED'
                    ? 'bg-amber-400'
                    : 'bg-orange-400'
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
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group shadow-xs select-none ${
                  isDark
                    ? 'bg-[rgba(20,10,7,0.85)] border-[rgba(255,106,61,0.18)] hover:border-[#ff5533] hover:bg-[rgba(28,14,10,0.95)]'
                    : 'bg-white border-[#cfe0f0] hover:border-[#0284c7] hover:bg-[#f8fbfe]'
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider truncate ${
                    isDark ? 'text-[#d1b8af]' : 'text-[#4e6b8c]'
                  }`}>
                    {stat.label}
                  </span>
                  <div className="flex items-baseline gap-1 my-0.5">
                    <span
                      className={`text-[26px] font-black font-mono leading-tight ${
                        isAlert
                          ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.35)]'
                          : isFire
                          ? 'text-[#ff5533] drop-shadow-[0_0_8px_rgba(255,85,45,0.35)]'
                          : isPersistent
                          ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.35)]'
                          : isDark
                          ? 'text-white'
                          : 'text-[#0c2340]'
                      }`}
                    >
                      {stat.value}
                    </span>
                  </div>
                  <span className={`text-[10px] font-semibold truncate ${
                    isDark ? 'text-[#a3928c]' : 'text-[#627d9c]'
                  }`}>
                    {stat.change}
                  </span>
                </div>

                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    isAlert
                      ? isDark ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
                      : isFire
                      ? isDark ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' : 'bg-orange-50 border-orange-200 text-[#ea580c]'
                      : isPersistent
                      ? isDark ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'
                      : isDark ? 'bg-white/5 border-white/10 text-[#d1b8af]' : 'bg-[#e8f0f8] border-[#cfe0f0] text-[#0c2340]'
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
          <article className={`map-card flex-1 flex flex-col rounded-2xl p-3 border ${
            isDark
              ? 'bg-[rgba(14,7,5,0.92)] border-[rgba(255,106,61,0.2)]'
              : 'bg-white border-[#cfe0f0]'
          }`}>
            <div className={`map-header flex items-center justify-between pb-2 mb-2 border-b ${
              isDark ? 'border-[rgba(255,106,61,0.15)]' : 'border-[#cfe0f0]'
            }`}>
              <div>
                <span className={`section-kicker text-[9.5px] font-extrabold uppercase tracking-wider block ${
                  isDark ? 'text-[#ff7a45]' : 'text-[#0284c7]'
                }`}>
                  GEOSPATIAL INFRASTRUCTURE CORRIDORS
                </span>
                <h3 className={`text-[14px] font-extrabold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
                  Pan-India Thermal Heat &amp; Anomaly Map
                </h3>
              </div>
              <div className="map-header-actions flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openDrawer('datasources')}
                  className={`px-2.5 py-1.5 rounded-xl border font-bold text-[11px] transition-colors cursor-pointer ${
                    isDark
                      ? 'border-[rgba(255,106,61,0.25)] bg-[rgba(255,106,61,0.1)] text-[#ff9977] hover:bg-[rgba(255,106,61,0.2)]'
                      : 'border-[#cfe0f0] bg-[#e8f0f8] text-[#0c2340] hover:bg-[#d0e2f2]'
                  }`}
                >
                  Data Sources
                </button>
                <button
                  type="button"
                  onClick={resetMapView}
                  className={`px-2.5 py-1.5 rounded-xl border font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
                    isDark
                      ? 'border-[rgba(255,106,61,0.25)] bg-[rgba(255,106,61,0.1)] text-[#ff9977] hover:bg-[rgba(255,106,61,0.2)]'
                      : 'border-[#cfe0f0] bg-[#e8f0f8] text-[#0c2340] hover:bg-[#d0e2f2]'
                  }`}
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
    </main>

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
  </>
  );
}

export default FlareXDashboard;
