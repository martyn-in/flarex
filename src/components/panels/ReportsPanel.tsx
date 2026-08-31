'use client';

import React from 'react';
import { FileText, Download, FileSpreadsheet, Map } from 'lucide-react';
import { REPORTS_LIST } from '@/data/mockData';
import { useIntelligence } from '@/context/IntelligenceContext';

export default function ReportsPanel() {
  const { hotspots, addToast } = useIntelligence();

  const handleDownload = (report: (typeof REPORTS_LIST)[0]) => {
    addToast(`Generating and exporting ${report.name} (${report.type})...`, 'success');
  };

  const handleExportGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: hotspots.map((h) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: h.coordinates,
        },
        properties: {
          id: h.id,
          eventId: h.eventId,
          name: h.name,
          location: h.location,
          severity: h.severity,
          status: h.status,
          classification: h.classification,
          confidence: h.confidence,
          frp: h.frp,
          baselineFrp: h.baselineFrp,
          baselineRatio: h.baselineRatio,
          temperature: h.temperature,
          landCover: h.landCover,
          satellite: h.satellite,
          timestamp: h.timestamp,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flarex-hotspots-${new Date().toISOString().slice(0, 10)}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('GeoJSON export generated and downloaded successfully.', 'success');
  };

  const handleExportCSV = () => {
    const headers =
      'ID,Event_ID,Name,Location,State,Longitude,Latitude,Severity,Classification,Confidence,FRP_MW,Baseline_FRP,Baseline_Ratio,Temperature_C,Land_Cover,Satellite,Timestamp\n';
    const rows = hotspots
      .map(
        (h) =>
          `"${h.id}","${h.eventId}","${h.name}","${h.location}","${h.state}",${h.coordinates[0]},${h.coordinates[1]},"${h.severity}","${h.classification}",${h.confidence},${h.frp},${h.baselineFrp},${h.baselineRatio},${h.temperature},"${h.landCover}","${h.satellite}","${h.timestamp}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flarex-telemetry-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('CSV manifest exported successfully.', 'success');
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Quick Export Triggers */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleExportGeoJSON}
          className="flarex-action-btn flex items-center justify-center gap-1.5 h-9 bg-white border border-[#fed7aa] text-[#7c2d12] hover:bg-[#ffedd5] hover:text-[#ea580c] rounded-xl font-bold text-[11px]"
        >
          <Map size={13} />
          <span>Export GeoJSON</span>
        </button>

        <button
          type="button"
          onClick={handleExportCSV}
          className="flarex-action-btn flex items-center justify-center gap-1.5 h-9 bg-white border border-[#fed7aa] text-[#7c2d12] hover:bg-[#ffedd5] hover:text-[#ea580c] rounded-xl font-bold text-[11px]"
        >
          <FileSpreadsheet size={13} />
          <span>Export CSV Manifest</span>
        </button>
      </div>

      {/* Generated Reports List */}
      <section className="flarex-section">
        <h3 className="flarex-section-title">Automated Intelligence Briefings</h3>
        <div className="flarex-status-list">
          {REPORTS_LIST.map((rep) => (
            <div key={rep.id} className="flarex-status-row !items-start">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 bg-orange-50 border-orange-200 text-[#ea580c]">
                  <FileText size={14} />
                </div>
                <div className="min-w-0">
                  <span className="flarex-status-name block text-[#261006]">{rep.name}</span>
                  <span className="flarex-status-meta block text-[#7c2d12] text-[9.5px]">
                    {rep.type} • {rep.date} ({rep.size})
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDownload(rep)}
                className="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-colors cursor-pointer bg-[#ffedd5] border-[#fed7aa] text-[#7c2d12] hover:text-[#ea580c] hover:border-[#ea580c] hover:bg-[#fed7aa]"
                title={`Download ${rep.name}`}
              >
                <Download size={13} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export { ReportsPanel };
