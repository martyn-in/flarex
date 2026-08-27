'use client';

import React, { useRef, useEffect } from 'react';
import { Bell, Flame, X, Crosshair, MapPin } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { HOTSPOTS_DATA } from '../../data/mockData';

export const NotificationsPopover: React.FC = () => {
  const { isNotificationsOpen, setIsNotificationsOpen, selectHotspot } = useIntelligence();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) {
      window.addEventListener('mousedown', handleOutsideClick);
    }
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [isNotificationsOpen, setIsNotificationsOpen]);

  if (!isNotificationsOpen) return null;

  const urgentAlerts = HOTSPOTS_DATA.filter((h) => h.severity === 'critical' || h.severity === 'high');

  return (
    <div
      ref={popoverRef}
      className="absolute top-[66px] right-4 w-[370px] glass-panel-elevated rounded-3xl p-4 shadow-2xl border border-white/[0.14] z-50 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[12.5px] font-bold text-white tracking-wider uppercase">
              Urgent Incident Alerts
            </span>
            <span className="text-[10px] text-red-400 font-semibold block">{urgentAlerts.length} Confirmed Thermal Corridors</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsNotificationsOpen(false)}
          className="w-6 h-6 rounded-lg glass-pill flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="max-h-[320px] overflow-y-auto flex flex-col gap-2 pr-0.5">
        {urgentAlerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => {
              selectHotspot(alert, true);
              setIsNotificationsOpen(false);
            }}
            className="glass-card-critical p-3 rounded-2xl flex items-start gap-3 cursor-pointer hover:scale-[1.01] transition-all"
          >
            <div className="w-7 h-7 rounded-xl bg-red-500/25 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 mt-0.5 shadow-[0_0_8px_rgba(255,77,79,0.3)]">
              <Flame className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-white truncate">{alert.name}</span>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{alert.timestamp.split(' ')[1]}</span>
              </div>
              <p className="text-[11px] text-slate-300 truncate flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-cyan-400" />
                {alert.location}
              </p>
              <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-white/[0.06] text-[10.5px]">
                <span className="font-bold text-red-400 font-mono">{alert.frp} MW</span>
                <span className="text-slate-500">•</span>
                <span className="font-semibold text-emerald-400 font-mono">{alert.confidence}% Conf.</span>
                <span className="text-slate-500">•</span>
                <span className="font-semibold text-white font-mono">{alert.temperature}°C</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
