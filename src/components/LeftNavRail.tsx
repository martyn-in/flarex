'use client';

import React from 'react';
import {
  LayoutDashboard,
  Map as MapIcon,
  Flame,
  LineChart,
  Database,
  FileText,
  Cpu,
  Settings,
} from 'lucide-react';
import { useIntelligence, ActiveDrawerType } from '../context/IntelligenceContext';

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  drawer: ActiveDrawerType;
  action?: () => void;
  badge?: number;
  badgeColor?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const LeftNavRail: React.FC = () => {
  const {
    activeDrawer,
    openDrawer,
    closeDrawer,
    isSettingsOpen,
    setIsSettingsOpen,
    resetMapView,
    setFilter,
    isPresentationMode,
  } = useIntelligence();

  if (isPresentationMode) {
    return null;
  }

  const navGroups: NavGroup[] = [
    {
      title: 'MONITORING',
      items: [
        {
          id: 'overview',
          icon: LayoutDashboard,
          label: 'Overview',
          drawer: null,
          action: () => {
            closeDrawer();
            setIsSettingsOpen(false);
            setFilter(null);
            resetMapView();
          },
        },
        {
          id: 'map',
          icon: MapIcon,
          label: 'Map View',
          drawer: null,
          action: () => {
            closeDrawer();
            setIsSettingsOpen(false);
          },
        },
        {
          id: 'incidents',
          icon: Flame,
          label: 'Incidents',
          drawer: 'incidents',
          badge: 12,
          badgeColor: 'bg-red-500',
        },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        {
          id: 'analytics',
          icon: LineChart,
          label: 'Analytics',
          drawer: 'analytics',
        },
        {
          id: 'datasources',
          icon: Database,
          label: 'Data Sources',
          drawer: 'datasources',
        },
        {
          id: 'ai',
          icon: Cpu,
          label: 'AI Model',
          drawer: 'ai',
        },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          id: 'reports',
          icon: FileText,
          label: 'Reports',
          drawer: 'reports',
        },
      ],
    },
  ];

  const handleItemClick = (item: NavItem) => {
    if (item.action) {
      item.action();
    } else if (item.drawer) {
      if (activeDrawer === item.drawer) {
        closeDrawer();
      } else {
        openDrawer(item.drawer);
      }
    }
  };

  return (
    <aside className="w-[68px] h-full py-3 glass-panel border-r border-white/[0.08] flex flex-col items-center justify-between z-20 shrink-0 select-none relative">
      {/* Nav Groups Container */}
      <div className="flex flex-col items-center gap-4 w-full px-2">
        {navGroups.map((group, groupIndex) => (
          <div key={group.title} className="w-full flex flex-col items-center gap-1.5">
            {/* Section Divider & Label */}
            {groupIndex > 0 && <div className="w-6 h-[1px] bg-white/[0.08] my-1" />}
            <span className="text-[8px] font-bold text-slate-500 tracking-wider text-center scale-90 mb-0.5">
              {group.title}
            </span>

            {/* Group Items */}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                (!activeDrawer && !isSettingsOpen && item.id === 'overview') ||
                activeDrawer === item.drawer;

              return (
                <div key={item.id} className="relative group flex items-center justify-center w-full">
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-br from-blue-600/80 to-cyan-600/80 text-white shadow-[0_0_16px_rgba(56,189,248,0.4)] border border-cyan-400/40'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] border border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.8} />

                    {/* Badge Alert */}
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[9px] font-bold shadow-[0_0_8px_rgba(255,77,79,0.7)]">
                        {item.badge}
                      </span>
                    )}

                    {/* Active Left Indicator Bar */}
                    {isActive && (
                      <span className="absolute -left-2 top-2.5 bottom-2.5 w-1 rounded-r-full bg-cyan-400 shadow-[0_0_8px_#38BDF8]" />
                    )}
                  </button>

                  {/* Hover Glass Tooltip */}
                  <div className="absolute left-[62px] px-3 py-1.5 rounded-lg glass-panel-elevated text-slate-100 text-[11.5px] font-medium whitespace-nowrap pointer-events-none opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50 shadow-2xl border border-white/[0.12] flex items-center gap-1.5">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold text-red-400 bg-red-950/60 px-1.5 py-0.2 rounded">
                        {item.badge} Alert{item.badge > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Settings Button */}
      <div className="w-full px-2 flex flex-col items-center gap-1 pt-2 border-t border-white/[0.08]">
        <div className="relative group flex items-center justify-center w-full">
          <button
            type="button"
            onClick={() => {
              closeDrawer();
              setIsSettingsOpen(!isSettingsOpen);
            }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isSettingsOpen
                ? 'bg-gradient-to-br from-blue-600/80 to-cyan-600/80 text-white shadow-[0_0_16px_rgba(56,189,248,0.4)] border border-cyan-400/40'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] border border-transparent'
            }`}
          >
            <Settings className="w-5 h-5" strokeWidth={isSettingsOpen ? 2.2 : 1.8} />
          </button>

          {/* Tooltip */}
          <div className="absolute left-[62px] px-3 py-1.5 rounded-lg glass-panel-elevated text-slate-100 text-[11.5px] font-medium whitespace-nowrap pointer-events-none opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50 shadow-2xl border border-white/[0.12]">
            Platform Settings
          </div>
        </div>
      </div>
    </aside>
  );
};
