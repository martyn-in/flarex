'use client';

import React, { useState, useEffect } from 'react';
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
import SettingsModal from '@/components/modals/SettingsModal';
import NotificationsPopover from '@/components/modals/NotificationsPopover';
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
    theme,
    toggleTheme,
  } = useIntelligence();

  const [searchQuery, setSearchQuery] = useState('');

  // Grouped Navigation Items (Clean Professional Taxonomy without AI Assistant)
  const menu = [
    {
      section: 'MONITORING',
      items: [
        {
          name: 'Dashboard',
          icon: Layers,
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
          badgeColor: 'bg-red-500',
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
          badgeColor: 'bg-orange-500',
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
      value: calculatedStats.totalEvents,
      desc: 'Pan-India Active Feeds',
      icon: Radio,
      className: 'radio-glow',
      isActive: activeFilter === null,
      action: () => {
        setFilter(null);
        closeDrawer();
        addToast('Showing all active thermal detections', 'info');
      },
    },
    {
      label: 'Industrial Fires',
      value: calculatedStats.industrialFires,
      desc: 'Severe Radiance Surge',
      icon: Flame,
      className: 'flame-glow',
      isActive: activeFilter === 'industrial_fires',
      action: () => {
        if (activeFilter === 'industrial_fires') {
          setFilter(null);
        } else {
          setFilter('industrial_fires');
          addToast(`Filtered to ${calculatedStats.industrialFires} Confirmed Industrial Fires`, 'error');
        }
      },
    },
    {
      label: 'Persistent Sources',
      value: calculatedStats.persistentSources,
      desc: 'Recurring Operational Flares',
      icon: Activity,
      className: 'activity-glow',
      isActive: activeFilter === 'persistent_sources',
      action: () => {
        if (activeFilter === 'persistent_sources') {
          setFilter(null);
        } else {
          setFilter('persistent_sources');
          addToast(`Filtered to ${calculatedStats.persistentSources} Persistent Sources`, 'info');
        }
      },
    },
    {
      label: 'Critical Alerts',
      value: calculatedStats.criticalAlerts,
      desc: '> 2.0x Historical Baseline',
      icon: ShieldAlert,
      className: 'alert-glow',
      isActive: activeFilter === 'critical',
      action: () => {
        if (activeFilter === 'critical') {
          setFilter(null);
        } else {
          setFilter('critical');
          addToast(`Filtered to ${calculatedStats.criticalAlerts} Critical Baseline Surges`, 'error');
        }
      },
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
    <main className="app-shell flex h-screen w-full overflow-hidden">
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
            title={onReturnToLanding ? "Return to Landing Intro" : "Reset to National Overview"}
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
          {onReturnToLanding && (
            <button
              type="button"
              onClick={onReturnToLanding}
              className="w-full mb-3 py-2 px-3 rounded-xl secondary-button text-[11px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Globe size={14} className={theme === 'dark' ? 'text-[#ff7a45]' : 'text-[#ea580c]'} />
              <span>3D Earth Globe Intro</span>
            </button>
          )}

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
      <section className="main-content flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* TOP COMMAND BAR */}
        <header className="main-header flex items-center justify-between">
          <div className="header-title">
            <span className="header-kicker">GEOSPATIAL INTELLIGENCE PLATFORM</span>
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

            {/* Theme Toggle (Dark Flame Mode vs Orange Light Mode) */}
            <button
              type="button"
              onClick={() => {
                toggleTheme();
                addToast(
                  theme === 'dark'
                    ? 'Switched to Orange Light Mode'
                    : 'Switched to Dark Flame Theme',
                  'info'
                );
              }}
              className="icon-button glass-card cursor-pointer"
              title={
                theme === 'dark'
                  ? 'Switch to Orange Light Mode'
                  : 'Switch to Dark Flame Theme'
              }
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun size={18} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              ) : (
                <Moon size={18} className="text-[#ea580c]" />
              )}
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
                  <small>{stat.desc}</small>
                </div>
              </article>
            );
          })}
        </section>

        {/* 4. MAP SECTION (PAN-INDIA SATELLITE ENGINE) */}
        <section className="flex-1 flex flex-col min-h-[420px] w-full">
          <article className="map-card glass-card flex-1 flex flex-col">
            <div className="map-header">
              <div>
                <span className="map-kicker">GEOSPATIAL INFRASTRUCTURE CORRIDORS</span>
                <h2>Pan-India Thermal Heat &amp; Anomaly Map</h2>
              </div>
              <div className="map-actions">
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
      <SettingsModal />
      <NotificationsPopover />
      <ToastContainer />
    </main>
  );
}

export default FlareXDashboard;
