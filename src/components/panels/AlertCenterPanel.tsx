'use client';

import React from 'react';
import { AlertOctagon, Flame, ShieldAlert, TrendingUp, CheckCircle, Crosshair, Trees } from 'lucide-react';
import { useIntelligence, isActionableAlert } from '@/context/IntelligenceContext';

export default function AlertCenterPanel() {
  const { hotspots, selectHotspot, addToast, formatTemp, openDispatchModal, theme } = useIntelligence();

  const isDark = theme === 'dark';
  const actionableAlerts = hotspots.filter(isActionableAlert);

  const handleAcknowledge = (id: string, name: string) => {
    addToast(`Alert acknowledged for ${name}. Incident logged to audit trail.`, 'success');
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Top Banner */}
      <div className={`p-3 rounded-2xl border flex items-center justify-between ${
        isDark ? 'bg-red-500/15 border-red-500/30' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
            isDark ? 'text-red-400 bg-red-500/20 border-red-500/40' : 'text-red-600 bg-red-100 border-red-200'
          }`}>
            <ShieldAlert size={18} />
          </div>
          <div>
            <h4 className={`text-[12.5px] font-extrabold leading-tight ${
              isDark ? 'text-white' : 'text-red-950'
            }`}>
              Action Required ({actionableAlerts.length} Active Alerts)
            </h4>
            <p className={`text-[10px] mt-0.5 font-medium ${
              isDark ? 'text-red-300' : 'text-red-800'
            }`}>
              High-priority anomalies exceeding safe operational baseline
            </p>
          </div>
        </div>
      </div>

      {/* Alert Feed */}
      <div className="flarex-status-list">
        {actionableAlerts.map((spot) => {
          const isCritical = spot.severity === 'critical' || spot.status === 'CRITICAL_FIRE';
          const isWildfire = spot.classification === 'Wildfire';

          return (
            <div
              key={spot.id}
              className={`p-3 rounded-2xl border flex flex-col gap-2.5 transition-all ${
                isCritical
                  ? isDark
                    ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                    : 'bg-red-50/70 border-red-200'
                  : isDark
                  ? 'bg-white/[0.04] border-white/10'
                  : 'bg-[#f8fbfe] border-[#cfe0f0]'
              }`}
            >
              {/* Alert Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase border ${
                      isCritical
                        ? isDark ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-red-100 border-red-300 text-red-700'
                        : isDark ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' : 'bg-orange-100 border-orange-300 text-orange-800'
                    }`}
                  >
                    {isCritical ? 'CRITICAL' : 'HIGH PRIORITY'}
                  </span>
                  <span className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                    isDark ? 'text-slate-300 bg-black/40 border-white/10' : 'text-[#0c2340] bg-white border-[#cfe0f0]'
                  }`}>
                    {spot.eventId}
                  </span>
                </div>

                <span className={`font-mono text-[9.5px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {spot.timestamp.includes(' ') ? spot.timestamp.split(' ')[1] : spot.timestamp} IST
                </span>
              </div>

              {/* Facility & Anomaly Multiple */}
              <div>
                <h3 className={`text-[13px] font-extrabold leading-snug flex items-center gap-1.5 ${
                  isDark ? 'text-white' : 'text-[#0c2340]'
                }`}>
                  {isWildfire ? <Trees size={15} className="text-amber-400" /> : <Flame size={15} className="text-red-400" />}
                  <span>{spot.name}</span>
                </h3>
                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {isWildfire
                    ? 'Confirmed Wildfire Thermal Anomaly'
                    : isCritical
                    ? 'Confirmed Industrial Fire Anomaly'
                    : 'Abnormal Thermal Radiance Surge'}
                </p>
              </div>

              {/* Radiative Stats Box */}
              <div className={`flex items-center justify-between p-2 rounded-xl border text-[11px] ${
                isDark ? 'bg-black/40 border-white/10' : 'bg-white border-[#cfe0f0]'
              }`}>
                <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Radiative Multiple:</span>
                <span className="font-mono font-black text-red-400 flex items-center gap-1">
                  <TrendingUp size={13} />
                  {spot.baselineRatio}× BASELINE ({spot.frp} MW vs {spot.baselineFrp} MW)
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => selectHotspot(spot, true)}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl text-[10.5px] font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                      : 'bg-white hover:bg-slate-50 text-[#0c2340] border-[#cfe0f0]'
                  }`}
                >
                  <Crosshair size={13} />
                  <span>Investigate</span>
                </button>

                <button
                  type="button"
                  onClick={() => openDispatchModal(spot)}
                  className="py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                >
                  <AlertOctagon size={13} />
                  <span>Dispatch</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAcknowledge(spot.id, spot.name)}
                  className={`py-1.5 px-2.5 rounded-xl border text-[10.5px] font-medium transition-all cursor-pointer ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                      : 'bg-white border-[#cfe0f0] text-slate-600 hover:text-[#0c2340] hover:bg-slate-50'
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
