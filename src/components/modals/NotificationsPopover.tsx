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
      className="absolute top-[60px] right-4 w-[380px] rounded-2xl p-4 shadow-xl z-50 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150 border bg-white border-[#fed7aa]"
    >
      <div className="flex items-center justify-between pb-2.5 border-b border-[#fed7aa]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg border flex items-center justify-center bg-red-50 border-red-200 text-red-600">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[12.5px] font-extrabold tracking-wider uppercase block text-[#261006]">
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
          className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer transition-colors bg-[#ffedd5] hover:bg-[#fed7aa] text-[#7c2d12] hover:text-[#261006]"
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
            className="p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all shadow-xs bg-[#fff7ed] border-[#fed7aa] hover:bg-[#ffedd5] hover:border-[#ea580c]"
          >
            <div className="w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 shadow-xs bg-red-100 border-red-200 text-red-600">
              <Flame className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-extrabold truncate text-[#261006]">{alert.name}</span>
                <span className="text-[10px] font-mono font-bold shrink-0 text-[#9a3412]">
                  {alert.timestamp.includes(' ') ? alert.timestamp.split(' ')[1] : alert.timestamp}
                </span>
              </div>
              <p className="text-[11px] truncate flex items-center gap-1 mt-0.5 font-medium text-[#7c2d12]">
                <MapPin className="w-3 h-3 shrink-0 text-[#ea580c]" />
                {alert.location}
              </p>
              <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-[#fed7aa] text-[10.5px]">
                <span className="font-bold text-red-600 font-mono">{alert.frp} MW</span>
                <span className="text-[#fed7aa]">•</span>
                <span className="font-bold text-[#ea580c] font-mono">{alert.confidence}% Conf.</span>
                <span className="text-[#fed7aa]">•</span>
                <span className="font-bold font-mono text-[#261006]">{alert.temperature}°C</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPopover;
