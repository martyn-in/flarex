'use client';

import React, { useRef, useEffect } from 'react';
import { Bell, Flame, X, MapPin } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';

export const NotificationsPopover: React.FC = () => {
  const { isNotificationsOpen, setIsNotificationsOpen, selectHotspot, hotspots } = useIntelligence();
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

  const urgentAlerts = hotspots.filter(
    (h) => h.severity === 'critical' || h.severity === 'high' || h.status === 'CRITICAL_FIRE' || h.status === 'ABNORMAL'
  );

  return (
    <div
      ref={popoverRef}
      className="absolute top-[60px] right-4 w-[380px] bg-white rounded-2xl p-4 shadow-2xl border border-slate-200 z-50 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[12.5px] font-extrabold text-slate-900 tracking-wider uppercase block">
              Urgent Incident Alerts
            </span>
            <span className="text-[10px] text-red-600 font-bold block">
              {urgentAlerts.length} Active High-Priority Incidents
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsNotificationsOpen(false)}
          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
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
            className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 cursor-pointer hover:bg-orange-50/60 hover:border-orange-200 transition-all shadow-xs"
          >
            <div className="w-7 h-7 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0 mt-0.5 shadow-xs">
              <Flame className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-extrabold text-slate-900 truncate">{alert.name}</span>
                <span className="text-[10px] font-mono text-slate-500 font-bold shrink-0">
                  {alert.timestamp.includes(' ') ? alert.timestamp.split(' ')[1] : alert.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 truncate flex items-center gap-1 mt-0.5 font-medium">
                <MapPin className="w-3 h-3 text-orange-600 shrink-0" />
                {alert.location}
              </p>
              <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-slate-200/80 text-[10.5px]">
                <span className="font-bold text-red-600 font-mono">{alert.frp} MW</span>
                <span className="text-slate-400">•</span>
                <span className="font-bold text-orange-600 font-mono">{alert.confidence}% Conf.</span>
                <span className="text-slate-400">•</span>
                <span className="font-bold text-slate-800 font-mono">{alert.temperature}°C</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPopover;
