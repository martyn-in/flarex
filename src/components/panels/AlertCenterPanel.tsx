'use client';

import React from 'react';
import { AlertOctagon, Flame, ShieldAlert, TrendingUp, CheckCircle, Crosshair } from 'lucide-react';
import { useIntelligence } from '@/context/IntelligenceContext';

export default function AlertCenterPanel() {
  const { hotspots, selectHotspot, addToast } = useIntelligence();

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
      <div className="p-3 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h4 className="text-[12.5px] font-extrabold text-red-950 leading-tight">
              Action Required ({criticalAndAbnormal.length} Active Alerts)
            </h4>
            <p className="text-[10px] text-red-700/90 mt-0.5 font-medium">
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
                  ? 'bg-red-50/60 border-red-200'
                  : 'bg-orange-50/60 border-orange-200'
              }`}
            >
              {/* Alert Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase border ${
                      isCritical
                        ? 'bg-red-100 border-red-300 text-red-700'
                        : 'bg-orange-100 border-orange-300 text-orange-800'
                    }`}
                  >
                    {isCritical ? 'CRITICAL' : 'HIGH PRIORITY'}
                  </span>
                  <span className="font-mono text-[10px] text-slate-700 font-bold bg-white px-1.5 py-0.2 rounded border border-slate-200">
                    {spot.eventId}
                  </span>
                </div>

                <span className="font-mono text-[9.5px] text-slate-500 font-medium">
                  {spot.timestamp.split(' ')[1]} IST
                </span>
              </div>

              {/* Facility & Anomaly Multiple */}
              <div>
                <h3 className="text-[13px] font-extrabold text-slate-900 leading-snug">
                  {spot.name}
                </h3>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {isCritical ? 'Confirmed Industrial Fire Anomaly' : 'Abnormal Thermal Radiance Surge'}
                </p>
              </div>

              {/* Radiative Stats Box */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-[11px]">
                <span className="text-slate-500 font-medium">Radiative Multiple:</span>
                <span className="font-mono font-black text-red-600 flex items-center gap-1">
                  <TrendingUp size={13} />
                  {spot.baselineRatio}× BASELINE ({spot.frp} MW vs {spot.baselineFrp} MW)
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => selectHotspot(spot, true)}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-[10.5px] font-semibold flex items-center justify-center gap-1 border border-slate-200 shadow-xs transition-all cursor-pointer"
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
                  className="py-1.5 px-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-[10.5px] font-medium transition-all cursor-pointer shadow-xs"
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
