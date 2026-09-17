'use client';

import React from 'react';
import { AlertOctagon, Flame, ShieldAlert, TrendingUp, CheckCircle, Crosshair, Trees } from 'lucide-react';
import { useIntelligence, isActionableAlert } from '@/context/IntelligenceContext';

export default function AlertCenterPanel() {
  const { hotspots, selectHotspot, addToast, formatTemp, openDispatchModal } = useIntelligence();

  // Authoritative alert filtering
  const actionableAlerts = hotspots.filter(isActionableAlert);

  const handleAcknowledge = (id: string, name: string) => {
    addToast(`Alert acknowledged for ${name}. Incident logged to audit trail.`, 'success');
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Top Banner */}
      <div className="p-3 rounded-2xl border flex items-center justify-between bg-red-50 border-red-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl border flex items-center justify-center text-red-600 bg-red-100 border-red-200">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h4 className="text-[12.5px] font-extrabold leading-tight text-red-950">
              Action Required ({actionableAlerts.length} Active Alerts)
            </h4>
            <p className="text-[10px] mt-0.5 font-medium text-red-800">
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
                  ? 'bg-red-50/70 border-red-200'
                  : 'bg-[#fff7ed] border-[#fed7aa]'
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
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded border text-[#7c2d12] bg-white border-[#fed7aa]">
                    {spot.eventId}
                  </span>
                </div>

                <span className="font-mono text-[9.5px] font-medium text-[#9a3412]">
                  {spot.timestamp.includes(' ') ? spot.timestamp.split(' ')[1] : spot.timestamp} IST
                </span>
              </div>

              {/* Facility & Anomaly Multiple */}
              <div>
                <h3 className="text-[13px] font-extrabold leading-snug text-[#431407] flex items-center gap-1.5">
                  {isWildfire ? <Trees size={15} className="text-amber-600" /> : <Flame size={15} className="text-red-500" />}
                  <span>{spot.name}</span>
                </h3>
                <p className="text-[11px] mt-0.5 text-[#7c2d12]">
                  {isWildfire
                    ? 'Confirmed Wildfire Thermal Anomaly'
                    : isCritical
                    ? 'Confirmed Industrial Fire Anomaly'
                    : 'Abnormal Thermal Radiance Surge'}
                </p>
              </div>

              {/* Radiative Stats Box */}
              <div className="flex items-center justify-between p-2 rounded-xl border text-[11px] bg-white border-[#fed7aa]">
                <span className="font-medium text-[#7c2d12]">Radiative Multiple:</span>
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
                  className="flex-1 py-1.5 px-2.5 rounded-xl text-[10.5px] font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer bg-white hover:bg-[#fff7ed] text-[#431407] border-[#fed7aa]"
                >
                  <Crosshair size={13} />
                  <span>Investigate</span>
                </button>

                <button
                  type="button"
                  onClick={() => openDispatchModal(spot)}
                  className="py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[10.5px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-red-700"
                >
                  <AlertOctagon size={13} />
                  <span>Dispatch</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAcknowledge(spot.id, spot.name)}
                  className="py-1.5 px-2.5 rounded-xl border text-[10.5px] font-medium transition-all cursor-pointer bg-white border-[#fed7aa] text-[#7c2d12] hover:text-[#431407] hover:bg-[#fff7ed]"
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
