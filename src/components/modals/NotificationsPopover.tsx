'use client';

import React, { useRef, useEffect } from 'react';
import { Bell, Flame, X, MapPin } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';

export const NotificationsPopover: React.FC = () => {
  const { isNotificationsOpen, setIsNotificationsOpen, selectHotspot, hotspots, theme } = useIntelligence();
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
      className={`absolute top-[60px] right-4 w-[380px] rounded-2xl p-4 shadow-2xl z-50 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150 border ${
        theme === 'dark'
          ? 'bg-[rgba(18,9,6,0.96)] border-[rgba(255,106,61,0.3)] shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(255,85,45,0.2)]'
          : 'bg-white border-slate-200 shadow-2xl'
      }`}
    >
      <div className={`flex items-center justify-between pb-2.5 border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${
            theme === 'dark' ? 'bg-red-950/60 border-red-500/40 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <span className={`text-[12.5px] font-extrabold tracking-wider uppercase block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Urgent Incident Alerts
            </span>
            <span className="text-[10px] text-red-500 font-bold block">
              {urgentAlerts.length} Active High-Priority Incidents
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsNotificationsOpen(false)}
          className={`w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
            theme === 'dark'
              ? 'bg-white/5 hover:bg-white/10 text-[#a3928c] hover:text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900'
          }`}
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
            className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all shadow-xs ${
              theme === 'dark'
                ? 'bg-white/[0.03] border-white/10 hover:bg-[rgba(255,85,45,0.12)] hover:border-[#ff5a3c]'
                : 'bg-slate-50 border-slate-200 hover:bg-orange-50/60 hover:border-orange-200'
            }`}
          >
            <div className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
              theme === 'dark'
                ? 'bg-red-950/60 border-red-500/40 text-red-400'
                : 'bg-red-100 border-red-200 text-red-600'
            }`}>
              <Flame className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-[12px] font-extrabold truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{alert.name}</span>
                <span className={`text-[10px] font-mono font-bold shrink-0 ${theme === 'dark' ? 'text-[#a3928c]' : 'text-slate-500'}`}>
                  {alert.timestamp.includes(' ') ? alert.timestamp.split(' ')[1] : alert.timestamp}
                </span>
              </div>
              <p className={`text-[11px] truncate flex items-center gap-1 mt-0.5 font-medium ${theme === 'dark' ? 'text-[#d1b8af]' : 'text-slate-600'}`}>
                <MapPin className={`w-3 h-3 shrink-0 ${theme === 'dark' ? 'text-[#ff7a45]' : 'text-orange-600'}`} />
                {alert.location}
              </p>
              <div className={`flex items-center gap-3 mt-1.5 pt-1.5 border-t text-[10.5px] ${
                theme === 'dark' ? 'border-white/10' : 'border-slate-200/80'
              }`}>
                <span className="font-bold text-red-500 font-mono">{alert.frp} MW</span>
                <span className="text-slate-400">•</span>
                <span className="font-bold text-orange-500 font-mono">{alert.confidence}% Conf.</span>
                <span className="text-slate-400">•</span>
                <span className={`font-bold font-mono ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{alert.temperature}°C</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPopover;
