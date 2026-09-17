'use client';

import React, { useState } from 'react';
import {
  AlertOctagon,
  X,
  ShieldAlert,
  Building2,
  MapPin,
  Flame,
  Send,
  CheckCircle2,
  Radio,
  Clock,
} from 'lucide-react';
import { useIntelligence } from '@/context/IntelligenceContext';

export const DispatchModal: React.FC = () => {
  const { isDispatchOpen, closeDispatchModal, dispatchTarget, addToast, formatTemp } = useIntelligence();

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
          temperatureC: dispatchTarget.temperature,
          landCover: dispatchTarget.landCover,
          satellite: dispatchTarget.satellite,
          timestamp: dispatchTarget.timestamp,
        },
      };

      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setDispatchResult(data);
        addToast(
          `Emergency alert dispatched for ${dispatchTarget.name} (Ticket ${data.ticketId})`,
          'success'
        );
      } else {
        addToast(`Dispatch failed: ${data.error || 'Unknown error'}`, 'error');
      }
    } catch (err: any) {
      addToast(`Dispatch request error: ${err?.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setDispatchResult(null);
    closeDispatchModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 border border-[#fed7aa] flex flex-col gap-4 text-[#431407]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#fed7aa]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl border flex items-center justify-center bg-red-100 border-red-300 text-red-600">
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-extrabold text-[#431407] leading-tight">
                  Emergency Incident Dispatch Protocol
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  Prototype Simulation
                </span>
              </div>
              <p className="text-[11px] text-[#7c2d12] mt-0.5">
                Simulated agency routing &amp; audit-trail recording (SIH 26162)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#fff7ed] hover:bg-[#ffedd5] text-[#7c2d12] hover:text-[#431407] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {dispatchResult ? (
          /* Confirmation Screen */
          <div className="flex flex-col gap-4 py-2 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h4 className="text-[16px] font-bold text-[#431407]">
                Dispatch Order Recorded in Audit Log
              </h4>
              <p className="text-[11px] font-mono text-[#ea580c] font-bold mt-1">
                Simulation Ticket ID: {dispatchResult.ticketId}
              </p>
              <p className="text-[11.5px] text-[#7c2d12] mt-2 max-w-md mx-auto">
                {dispatchResult.message}
              </p>
            </div>

            <div className="p-3 rounded-2xl border bg-[#fff7ed] border-[#fed7aa] text-left text-[11px] flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-[#7c2d12]">Destination Agency:</span>
                <span className="font-bold text-[#431407]">{agency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7c2d12]">Incident Target:</span>
                <span className="font-bold text-[#431407]">{dispatchTarget.eventId} ({dispatchTarget.name})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7c2d12]">Audit Status:</span>
                <span className="font-mono font-bold text-emerald-700">{dispatchResult.status}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-[12px] cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        ) : (
          /* Dispatch Form */
          <>
            {/* Target Summary Card */}
            <div className="p-3.5 rounded-2xl border bg-[#fff7ed] border-[#fed7aa] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Flame size={15} className="text-red-500" />
                  <span className="text-[12px] font-extrabold text-[#431407]">
                    {dispatchTarget.name}
                  </span>
                </div>
                <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-full border bg-red-100 border-red-300 text-red-700">
                  {dispatchTarget.eventId}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#fed7aa]/60 text-[10.5px]">
                <div>
                  <span className="text-[#7c2d12] block">Radiance FRP</span>
                  <span className="font-mono font-bold text-red-600">{dispatchTarget.frp} MW</span>
                </div>
                <div>
                  <span className="text-[#7c2d12] block">Skin Temp</span>
                  <span className="font-mono font-bold text-[#431407]">{formatTemp(dispatchTarget.temperature)}</span>
                </div>
                <div>
                  <span className="text-[#7c2d12] block">Baseline Multiplier</span>
                  <span className="font-mono font-bold text-red-600">{dispatchTarget.baselineRatio}× typical</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10.5px] text-[#7c2d12] pt-1">
                <MapPin size={11} className="text-[#ea580c]" />
                <span>{dispatchTarget.coordinates[1].toFixed(4)}°N, {dispatchTarget.coordinates[0].toFixed(4)}°E ({dispatchTarget.state})</span>
              </div>
            </div>

            {/* Destination Agency */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-bold text-[#431407]">
                Destination Authority / Emergency Service:
              </label>
              <select
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                className="w-full p-2.5 rounded-xl border bg-white border-[#fed7aa] text-[11.5px] font-semibold text-[#431407] focus:outline-none focus:border-[#ea580c] cursor-pointer"
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
              <label className="text-[11.5px] font-bold text-[#431407]">
                Dispatch Channel &amp; Delivery Protocol:
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full p-2.5 rounded-xl border bg-white border-[#fed7aa] text-[11.5px] font-semibold text-[#431407] focus:outline-none focus:border-[#ea580c] cursor-pointer"
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
              <label className="text-[11.5px] font-bold text-[#431407]">
                Operational Notes / Dispatch Context:
              </label>
              <textarea
                value={priorityNotes}
                onChange={(e) => setPriorityNotes(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl border bg-white border-[#fed7aa] text-[11px] text-[#431407] focus:outline-none focus:border-[#ea580c]"
              />
            </div>

            {/* Submit Action */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#fed7aa]">
              <button
                type="button"
                onClick={handleClose}
                className="py-2.5 px-4 rounded-xl border bg-[#fff7ed] hover:bg-[#ffedd5] text-[#7c2d12] hover:text-[#431407] text-[11.5px] font-bold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDispatch}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold flex items-center justify-center gap-2 border border-red-700 cursor-pointer disabled:opacity-50 transition-all"
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
