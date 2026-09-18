'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Send,
  X,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Flame,
  Radio,
  FileText,
  MapPin,
} from 'lucide-react';
import { useIntelligence } from '@/context/IntelligenceContext';

export const DispatchModal: React.FC = () => {
  const {
    isDispatchOpen,
    closeDispatchModal,
    dispatchTarget,
    addToast,
    formatTemp,
    theme,
  } = useIntelligence();

  const isDark = theme === 'dark';

  const [agency, setAgency] = useState<string>('State Pollution Control Board (SPCB) Rapid Response');
  const [method, setMethod] = useState<string>('Encrypted Telemetry Webhook & SMS');
  const [priorityNotes, setPriorityNotes] = useState<string>('Immediate containment protocol recommended. Elevated thermal radiance above nominal baseline.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [dispatchResult, setDispatchResult] = useState<any | null>(null);

  if (!isDispatchOpen || !dispatchTarget) return null;

  const handleConfirmDispatch = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        eventId: dispatchTarget.eventId,
        facilityName: dispatchTarget.nearestFacility.name,
        agency,
        method,
        notes: priorityNotes,
        payload: {
          id: dispatchTarget.id,
          eventId: dispatchTarget.eventId,
          facilityName: dispatchTarget.nearestFacility.name,
          classification: dispatchTarget.classification,
          frp: dispatchTarget.frp,
          baselineFrp: dispatchTarget.baselineFrp,
          baselineRatio: dispatchTarget.baselineRatio,
          coordinates: dispatchTarget.coordinates,
          state: dispatchTarget.state,
          timestamp: dispatchTarget.timestamp,
        },
      };

      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.status === 'OK') {
        setDispatchResult(data);
        addToast(`Emergency Dispatch recorded! Audit Ticket: ${data.ticketId}`, 'success');
      } else {
        addToast(data.message || 'Dispatch submission failed', 'warning');
      }
    } catch (err: any) {
      addToast(`Dispatch network error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setDispatchResult(null);
    closeDispatchModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className={`relative w-full max-w-lg rounded-3xl p-6 border flex flex-col gap-4 shadow-2xl ${
        isDark
          ? 'bg-[rgba(18,9,6,0.98)] border-[rgba(255,106,61,0.28)] text-[#fef8f6]'
          : 'bg-white border-[#cfe0f0] text-[#0c2340]'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between pb-3 border-b ${
          isDark ? 'border-white/10' : 'border-[#cfe0f0]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
              isDark ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-red-100 border-red-300 text-red-600'
            }`}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-[15px] font-extrabold leading-tight ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
                  Emergency Incident Dispatch Protocol
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Prototype Simulation
                </span>
              </div>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-[#d1b8af]' : 'text-[#4e6b8c]'}`}>
                Simulated agency routing &amp; audit-trail recording (SIH 26162)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
              isDark ? 'bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <X size={16} />
          </button>
        </div>

        {dispatchResult ? (
          /* Confirmation Screen */
          <div className="flex flex-col gap-4 py-2 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(32,201,151,0.3)]">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h4 className={`text-[16px] font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
                Dispatch Order Recorded in Audit Log
              </h4>
              <p className="text-[11px] font-mono text-[#ff7a45] font-bold mt-1">
                Simulation Ticket ID: {dispatchResult.ticketId}
              </p>
              <p className={`text-[11.5px] mt-2 max-w-md mx-auto ${isDark ? 'text-[#d1b8af]' : 'text-[#4e6b8c]'}`}>
                {dispatchResult.message}
              </p>
            </div>

            <div className={`p-3 rounded-2xl border text-left text-[11px] flex flex-col gap-1.5 ${
              isDark ? 'bg-black/40 border-white/10' : 'bg-[#f8fbfe] border-[#cfe0f0]'
            }`}>
              <div className="flex justify-between">
                <span className={isDark ? 'text-[#a3928c]' : 'text-[#4e6b8c]'}>Destination Agency:</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>{agency}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-[#a3928c]' : 'text-[#4e6b8c]'}>Incident Target:</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>{dispatchTarget.eventId} ({dispatchTarget.name})</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-[#a3928c]' : 'text-[#4e6b8c]'}>Audit Status:</span>
                <span className="font-mono font-bold text-emerald-400">{dispatchResult.status}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl bg-[#ff5533] hover:bg-[#ff7a45] text-white font-bold text-[12px] cursor-pointer shadow-[0_0_12px_rgba(255,85,45,0.4)] transition-all"
            >
              Close Dossier
            </button>
          </div>
        ) : (
          /* Dispatch Form */
          <>
            {/* Target Summary Card */}
            <div className={`p-3.5 rounded-2xl border flex flex-col gap-2 ${
              isDark ? 'bg-black/40 border-white/10' : 'bg-[#f8fbfe] border-[#cfe0f0]'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Flame size={15} className="text-red-400" />
                  <span className={`text-[12px] font-extrabold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
                    {dispatchTarget.name}
                  </span>
                </div>
                <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-full border bg-red-500/20 border-red-500/40 text-red-300">
                  {dispatchTarget.eventId}
                </span>
              </div>

              <div className={`grid grid-cols-3 gap-2 pt-2 border-t text-[10.5px] ${
                isDark ? 'border-white/10' : 'border-[#cfe0f0]'
              }`}>
                <div>
                  <span className={`block ${isDark ? 'text-[#a3928c]' : 'text-[#4e6b8c]'}`}>Radiance FRP</span>
                  <span className="font-mono font-bold text-red-400">{dispatchTarget.frp} MW</span>
                </div>
                <div>
                  <span className={`block ${isDark ? 'text-[#a3928c]' : 'text-[#4e6b8c]'}`}>Skin Temp</span>
                  <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>{formatTemp(dispatchTarget.temperature)}</span>
                </div>
                <div>
                  <span className={`block ${isDark ? 'text-[#a3928c]' : 'text-[#4e6b8c]'}`}>Baseline Multiplier</span>
                  <span className="font-mono font-bold text-red-400">{dispatchTarget.baselineRatio}× typical</span>
                </div>
              </div>

              <div className={`flex items-center gap-1 text-[10.5px] pt-1 ${isDark ? 'text-[#d1b8af]' : 'text-[#4e6b8c]'}`}>
                <MapPin size={11} className="text-[#ff5533]" />
                <span>{dispatchTarget.coordinates[1].toFixed(4)}°N, {dispatchTarget.coordinates[0].toFixed(4)}°E ({dispatchTarget.state})</span>
              </div>
            </div>

            {/* Destination Agency */}
            <div className="flex flex-col gap-1.5">
              <label className={`text-[11.5px] font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
                Destination Authority / Emergency Service:
              </label>
              <select
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                className={`w-full p-2.5 rounded-xl border text-[11.5px] font-semibold focus:outline-none cursor-pointer ${
                  isDark
                    ? 'bg-black/50 text-white border-white/15 focus:border-[#ff5533]'
                    : 'bg-white text-[#0c2340] border-[#cfe0f0] focus:border-[#0284c7]'
                }`}
              >
                <option value="National Disaster Response Force (NDRF) [Simulated API]">
                  National Disaster Response Force (NDRF) [Simulated API]
                </option>
                <option value="State Fire & Rescue Service [Simulated Webhook]">
                  State Fire &amp; Rescue Service [Simulated Webhook]
                </option>
                <option value="State Pollution Control Board (SPCB) Rapid Response [Simulated API]">
                  State Pollution Control Board (SPCB) Rapid Response [Simulated API]
                </option>
                <option value="Directorate of Industrial Safety & Health (DISH) [Simulated Webhook]">
                  Directorate of Industrial Safety &amp; Health (DISH) [Simulated Webhook]
                </option>
                <option value="Plant Operations Safety Control Room [Internal Audit]">
                  Plant Operations Safety Control Room [Internal Audit]
                </option>
              </select>
            </div>

            {/* Dispatch Method */}
            <div className="flex flex-col gap-1.5">
              <label className={`text-[11.5px] font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
                Dispatch Channel &amp; Delivery Protocol:
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className={`w-full p-2.5 rounded-xl border text-[11.5px] font-semibold focus:outline-none cursor-pointer ${
                  isDark
                    ? 'bg-black/50 text-white border-white/15 focus:border-[#ff5533]'
                    : 'bg-white text-[#0c2340] border-[#cfe0f0] focus:border-[#0284c7]'
                }`}
              >
                <option value="Encrypted Telemetry Webhook & SMS">
                  Encrypted Telemetry Webhook &amp; SMS Broadcast
                </option>
                <option value="Automated Email Dossier & PDF Export">
                  Automated Email Dossier &amp; PDF Export
                </option>
                <option value="Direct REST Emergency API Integration">
                  Direct REST Emergency API Integration
                </option>
              </select>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label className={`text-[11.5px] font-bold ${isDark ? 'text-white' : 'text-[#0c2340]'}`}>
                Operational Notes / Dispatch Context:
              </label>
              <textarea
                value={priorityNotes}
                onChange={(e) => setPriorityNotes(e.target.value)}
                rows={2}
                className={`w-full p-2.5 rounded-xl border text-[11px] focus:outline-none ${
                  isDark
                    ? 'bg-black/50 text-white border-white/15 focus:border-[#ff5533]'
                    : 'bg-white text-[#0c2340] border-[#cfe0f0] focus:border-[#0284c7]'
                }`}
              />
            </div>

            {/* Submit Action */}
            <div className={`flex items-center gap-2 pt-2 border-t ${isDark ? 'border-white/10' : 'border-[#cfe0f0]'}`}>
              <button
                type="button"
                onClick={handleClose}
                className={`py-2.5 px-4 rounded-xl border text-[11.5px] font-bold cursor-pointer transition-colors ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDispatch}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold flex items-center justify-center gap-2 border border-red-500 cursor-pointer disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                <Send size={14} className={isSubmitting ? 'animate-pulse' : ''} />
                <span>{isSubmitting ? 'Transmitting Dispatch Order...' : 'Confirm & Execute Protocol'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DispatchModal;
