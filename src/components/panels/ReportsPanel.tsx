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
          className="flarex-action-btn flex items-center justify-center gap-1.5 h-9"
        >
          <Map size={13} />
          <span>Export GeoJSON</span>
        </button>

        <button
          type="button"
          onClick={handleExportCSV}
          className="flarex-action-btn flex items-center justify-center gap-1.5 h-9"
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
                <div className="w-7 h-7 rounded-lg bg-[rgba(255,90,45,0.12)] border border-[rgba(255,106,61,0.28)] flex items-center justify-center text-[#ff7a45] shrink-0 mt-0.5">
                  <FileText size={14} />
                </div>
                <div className="min-w-0">
                  <span className="flarex-status-name block">{rep.name}</span>
                  <span className="flarex-status-meta block">
                    {rep.type} • {rep.date} ({rep.size})
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDownload(rep)}
                className="w-7 h-7 rounded-lg bg-[rgba(255,90,45,0.06)] border border-[rgba(255,106,61,0.2)] flex items-center justify-center text-[#d1b8af] hover:text-white hover:border-[#ff5a3c] hover:bg-[rgba(255,90,45,0.15)] shrink-0 transition-colors cursor-pointer"
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
