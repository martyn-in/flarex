'use client';

import React, { useRef, useEffect } from 'react';
import { Bell, Flame, X, MapPin, Trees } from 'lucide-react';
import { useIntelligence, isActionableAlert } from '../../context/IntelligenceContext';

export const NotificationsPopover: React.FC = () => {
  const { isNotificationsOpen, setIsNotificationsOpen, selectHotspot, hotspots, formatTemp, theme } = useIntelligence();
  const popoverRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

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

  const urgentAlerts = hotspots.filter(isActionableAlert);

  return (
    <div
      ref={popoverRef}
      className={`absolute top-[60px] right-4 w-[380px] rounded-2xl p-4 z-50 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150 border shadow-2xl ${
        isDark
          ? 'bg-[rgba(18,9,6,0.96)] border-[rgba(255,106,61,0.28)] text-white backdrop-blur-xl'
          : 'bg-white border-[#cfe0f0] text-[#0c2340]'
      }`}
    >
      <div className={`flex items-center justify-between pb-2.5 border-b ${
        isDark ? 'border-white/10' : 'border-[#cfe0f0]'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${
            isDark ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <span className={`text-[12.5px] font-extrabold tracking-wider uppercase block ${
              isDark ? 'text-white' : 'text-[#0c2340]'
            }`}>
              Urgent Incident Alerts
            </span>
            <span className="text-[10px] text-red-400 font-bold block">
              {urgentAlerts.length} Active High-Priority Incidents
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsNotificationsOpen(false)}
          className={`w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
            isDark ? 'bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="max-h-[320px] overflow-y-auto flex flex-col gap-2 pr-0.5">
        {urgentAlerts.map((alert) => {
          const isWildfire = alert.classification === 'Wildfire';
          return (
            <div
              key={alert.id}
              onClick={() => {
                selectHotspot(alert, true);
                setIsNotificationsOpen(false);
              }}
              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                isDark
                  ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-[#ff5533]/40'
                  : 'bg-[#f8fbfe] border-[#cfe0f0] hover:bg-[#f0f7fc] hover:border-[#0284c7]'
              }`}
            >
              <div className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                isDark ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-red-100 border-red-200 text-red-600'
              }`}>
                {isWildfire ? <Trees className="w-4 h-4 text-amber-400" /> : <Flame className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-[12px] font-extrabold truncate ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
                    {alert.name}
                  </span>
                  <span className={`text-[10px] font-mono font-bold shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {alert.timestamp.includes(' ') ? alert.timestamp.split(' ')[1] : alert.timestamp}
                  </span>
                </div>
                <p className={`text-[11px] mt-0.5 truncate ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {alert.location}
                </p>
                <div className={`flex items-center gap-3 mt-1.5 pt-1.5 border-t text-[10.5px] ${
                  isDark ? 'border-white/10' : 'border-slate-200'
                }`}>
                  <span className="font-mono font-bold text-red-400">
                    {alert.frp} MW
                  </span>
                  <span className={isDark ? 'text-white/20' : 'text-slate-300'}>•</span>
                  <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {formatTemp(alert.brightnessT4)}
                  </span>
                  <span className={isDark ? 'text-white/20' : 'text-slate-300'}>•</span>
                  <span className="font-mono text-amber-400 font-semibold">
                    {alert.baselineRatio}× baseline
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsPopover;
