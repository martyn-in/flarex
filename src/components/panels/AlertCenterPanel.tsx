'use client';

import React from 'react';
import { AlertOctagon, Flame, ShieldAlert, TrendingUp, CheckCircle, Crosshair } from 'lucide-react';
import { useIntelligence } from '@/context/IntelligenceContext';

export default function AlertCenterPanel() {
  const { hotspots, selectHotspot, addToast, theme } = useIntelligence();

  // Filter alerts requiring attention
  const criticalAndAbnormal = hotspots.filter(
    (h) => h.severity === 'critical' || h.status === 'CRITICAL_FIRE' || h.status === 'ABNORMAL' || h.baselineRatio >= 2.0
  );

  const handleAcknowledge = (id: string, name: string) => {
    addToast(`Alert acknowledged for ${name}. Incident logged to audit trail.`, 'success');
  };

  const handleDispatch = (name: string) => {
    addToast(`Emergency Alert Dispatched: Local Fire & Industrial Safety notified for ${name}`, 'warning');
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Top Banner */}
      <div className={`p-3 rounded-2xl border flex items-center justify-between shadow-xs ${
        theme === 'dark'
          ? 'bg-[rgba(255,59,48,0.12)] border-red-500/30'
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center text-red-500 ${
            theme === 'dark' ? 'bg-red-950/50 border-red-500/40' : 'bg-red-100 border-red-200'
          }`}>
            <ShieldAlert size={18} />
          </div>
          <div>
            <h4 className={`text-[12.5px] font-extrabold leading-tight ${theme === 'dark' ? 'text-white' : 'text-red-950'}`}>
              Action Required ({criticalAndAbnormal.length} Active Alerts)
            </h4>
            <p className={`text-[10px] mt-0.5 font-medium ${theme === 'dark' ? 'text-[#d1b8af]' : 'text-red-700/90'}`}>
              Industrial facilities exceeding safe operational baseline
            </p>
          </div>
        </div>
      </div>

      {/* Alert Feed */}
      <div className="flarex-status-list">
        {criticalAndAbnormal.map((spot) => {
          const isCritical = spot.severity === 'critical' || spot.status === 'CRITICAL_FIRE';

          return (
            <div
              key={spot.id}
              className={`p-3 rounded-2xl border flex flex-col gap-2.5 transition-all shadow-xs ${
                isCritical
                  ? theme === 'dark'
                    ? 'bg-[rgba(255,59,48,0.1)] border-red-500/40'
                    : 'bg-red-50/60 border-red-200'
                  : theme === 'dark'
                  ? 'bg-[rgba(255,85,45,0.08)] border-[rgba(255,106,61,0.25)]'
                  : 'bg-orange-50/60 border-orange-200'
              }`}
            >
              {/* Alert Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase border ${
                      isCritical
                        ? theme === 'dark'
                          ? 'bg-red-950/60 border-red-500/40 text-red-400'
                          : 'bg-red-100 border-red-300 text-red-700'
                        : theme === 'dark'
                        ? 'bg-orange-950/60 border-orange-500/40 text-orange-400'
                        : 'bg-orange-100 border-orange-300 text-orange-800'
                    }`}
                  >
                    {isCritical ? 'CRITICAL' : 'HIGH PRIORITY'}
                  </span>
                  <span className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                    theme === 'dark' ? 'text-[#ffeedd] bg-[rgba(40,20,12,0.8)] border-[rgba(255,106,61,0.35)]' : 'text-[#7c2d12] bg-[#fff7ed] border-[#fed7aa]'
                  }`}>
                    {spot.eventId}
                  </span>
                </div>

                <span className={`font-mono text-[9.5px] font-medium ${theme === 'dark' ? 'text-[#ffcaa6]' : 'text-[#9a3412]'}`}>
                  {spot.timestamp.split(' ')[1]} IST
                </span>
              </div>

              {/* Facility & Anomaly Multiple */}
              <div>
                <h3 className={`text-[13px] font-extrabold leading-snug ${theme === 'dark' ? 'text-white' : 'text-[#261006]'}`}>
                  {spot.name}
                </h3>
                <p className={`text-[11px] mt-0.5 ${theme === 'dark' ? 'text-[#ffeedd]' : 'text-[#7c2d12]'}`}>
                  {isCritical ? 'Confirmed Industrial Fire Anomaly' : 'Abnormal Thermal Radiance Surge'}
                </p>
              </div>

              {/* Radiative Stats Box */}
              <div className={`flex items-center justify-between p-2 rounded-xl border text-[11px] ${
                theme === 'dark' ? 'bg-[rgba(34,16,10,0.85)] border-[rgba(255,106,61,0.3)]' : 'bg-[#fff7ed] border-[#fed7aa]'
              }`}>
                <span className={`font-medium ${theme === 'dark' ? 'text-[#ffcaa6]' : 'text-[#7c2d12]'}`}>Radiative Multiple:</span>
                <span className="font-mono font-black text-red-500 flex items-center gap-1">
                  <TrendingUp size={13} />
                  {spot.baselineRatio}× BASELINE ({spot.frp} MW vs {spot.baselineFrp} MW)
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => selectHotspot(spot, true)}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl text-[10.5px] font-semibold flex items-center justify-center gap-1 border shadow-xs transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                      : 'bg-[#ffedd5] hover:bg-[#fed7aa] text-[#c2410c] border-[#fed7aa]'
                  }`}
                >
                  <Crosshair size={13} />
                  <span>Investigate</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDispatch(spot.name)}
                  className="py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[10.5px] font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                >
                  <AlertOctagon size={13} />
                  <span>Dispatch</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAcknowledge(spot.id, spot.name)}
                  className={`py-1.5 px-2.5 rounded-xl border text-[10.5px] font-medium transition-all cursor-pointer shadow-xs ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 text-[#a3928c] hover:text-white hover:bg-white/10'
                      : 'bg-white border-[#fed7aa] text-[#7c2d12] hover:text-[#261006] hover:bg-[#ffedd5]'
                  }`}
                  title="Acknowledge Alert"
                >
                  <CheckCircle size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { AlertCenterPanel };
