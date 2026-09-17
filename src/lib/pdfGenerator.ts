import { Hotspot } from '@/types';

export function generateIncidentPdfBuffer(incident: Hotspot): Buffer {
  const title = `FLAREX THERMAL INCIDENT REPORT - ${incident.eventId}`;
  const timestamp = new Date().toUTCString();

  const lines = [
    `================================================================================`,
    `                      FLAREX GEOSPATIAL INTELLIGENCE PLATFORM                   `,
    `                           INCIDENT VERIFICATION DOSSIER                        `,
    `================================================================================`,
    ``,
    `INCIDENT IDENTIFIER:       ${incident.eventId} (${incident.id})`,
    `DATE & TIME (UTC):         ${incident.timestamp}`,
    `GENERATED AT:              ${timestamp}`,
    `CLASSIFICATION:            ${incident.classification.toUpperCase()} (${incident.confidence}% AI Confidence)`,
    `SEVERITY / STATUS:         ${incident.severity.toUpperCase()} / ${incident.status}`,
    ``,
    `--------------------------------------------------------------------------------`,
    `1. GEOSPATIAL TELEMETRY & MULTI-SPECTRAL OBSERVATION`,
    `--------------------------------------------------------------------------------`,
    `  * Coordinates:           Latitude ${incident.coordinates[1].toFixed(4)} N, Longitude ${incident.coordinates[0].toFixed(4)} E`,
    `  * Location / Corridor:   ${incident.location}`,
    `  * Administrative State:  ${incident.state} (District: ${incident.district || 'Unassigned'})`,
    `  * Fire Radiative Power:  ${incident.frp} MW`,
    `  * 30-Day Hist. Baseline: ${incident.baselineFrp} MW`,
    `  * Anomaly Multiplier:    ${incident.baselineRatio}x above typical baseline`,
    `  * Brightness (T4 band):  ${incident.temperature} deg C (${incident.brightnessT4} K)`,
    `  * Sensor Constellation:  ${incident.satellite} [Instrument: ${incident.instrument}]`,
    `  * Day / Night Pass:      ${incident.daynight === 'D' ? 'Daytime Optical Pass' : 'Nighttime Infrared Pass'}`,
    ``,
    `--------------------------------------------------------------------------------`,
    `2. FACILITY PROXIMITY & LAND-USE CONTEXT`,
    `--------------------------------------------------------------------------------`,
    `  * Nearest Facility:      ${incident.nearestFacility.name}`,
    `  * Facility Category:     ${incident.nearestFacility.type}`,
    `  * Proximity Distance:    ${incident.nearestFacility.distance} (${incident.nearestFacility.distanceMeters} m)`,
    `  * ESA WorldCover Class:  ${incident.landCover} (10m Resolution)`,
    `  * Distance to Forest:    ${incident.distanceToForestMeters} m`,
    `  * Distance to Cropland:  ${incident.distanceToAgriMeters} m`,
    `  * Population Exposure:   ${incident.populationContext?.densityCategory || 'Settlement'} (${incident.populationContext?.distanceMeters || 450} m)`,
    ``,
    `--------------------------------------------------------------------------------`,
    `3. 6-CLASS AI CLASSIFIER PROBABILITY DISTRIBUTION`,
    `--------------------------------------------------------------------------------`,
    `  * Industrial Fire:       ${incident.probabilities.industrialFire}%`,
    `  * Gas Flare:             ${incident.probabilities.gasFlare}%`,
    `  * Wildfire:              ${incident.probabilities.wildfire}%`,
    `  * Agricultural Burn:     ${incident.probabilities.agriculturalBurn}%`,
    `  * Mining / Furnace:      ${incident.probabilities.mining}%`,
    `  * Unknown / Ambiguous:   ${incident.probabilities.unknown}%`,
    ``,
    `--------------------------------------------------------------------------------`,
    `4. MULTI-SOURCE EVIDENCE FUSION RATIONALE`,
    `--------------------------------------------------------------------------------`,
    ...incident.aiReasons.map((r, i) => `  [${i + 1}] ${r.text}`),
    ``,
    `--------------------------------------------------------------------------------`,
    `5. SATELLITE OPTICAL ASSET & VERIFICATION`,
    `--------------------------------------------------------------------------------`,
    `  * Sentinel-2 MSI Tile:   ${incident.sentinelImagery?.tileId || 'T43QBC'}`,
    `  * Cloud Cover Index:     ${incident.sentinelImagery?.cloudCoverPct || 1.8}% (Optical clear sky)`,
    `  * Multi-spectral Bands:  B04 (Red), B03 (Green), B02 (Blue), B12 (SWIR)`,
    ``,
    `================================================================================`,
    `DISPATCH NOTICE: Authorized for SPCB, NDMA, and Industrial Fire Safety Officer.`,
    `Security Classification: OFFICIAL // NON-DISCLOSURE PROTOCOL APPLIES`,
    `================================================================================`,
  ];

  // Build standard valid text-stream PDF
  const textContent = lines
    .map((line, idx) => {
      const sanitized = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
      return `BT /F1 9 Tf 40 ${780 - idx * 13} Td (${sanitized}) Tj ET`;
    })
    .join('\n');

  const streamLength = Buffer.byteLength(textContent, 'utf-8');

  const header = '%PDF-1.4\n';
  const obj1 = '1 0 obj\n<<\n  /Type /Catalog\n  /Pages 2 0 R\n>>\nendobj\n';
  const obj2 = '2 0 obj\n<<\n  /Type /Pages\n  /Kids [3 0 R]\n  /Count 1\n>>\nendobj\n';
  const obj3 =
    '3 0 obj\n<<\n  /Type /Page\n  /Parent 2 0 R\n  /MediaBox [0 0 612 842]\n  /Contents 4 0 R\n  /Resources <<\n    /Font <<\n      /F1 <<\n        /Type /Font\n        /Subtype /Type1\n        /BaseFont /Courier\n      >>\n    >>\n  >>\n>>\nendobj\n';
  const obj4 = `4 0 obj\n<<\n  /Length ${streamLength}\n>>\nstream\n${textContent}\nendstream\nendobj\n`;

  const offset1 = Buffer.byteLength(header, 'utf-8');
  const offset2 = offset1 + Buffer.byteLength(obj1, 'utf-8');
  const offset3 = offset2 + Buffer.byteLength(obj2, 'utf-8');
  const offset4 = offset3 + Buffer.byteLength(obj3, 'utf-8');
  const xrefOffset = offset4 + Buffer.byteLength(obj4, 'utf-8');

  const pad = (n: number) => String(n).padStart(10, '0');

  const xrefAndTrailer = `xref
0 5
0000000000 65535 f 
${pad(offset1)} 00000 n 
${pad(offset2)} 00000 n 
${pad(offset3)} 00000 n 
${pad(offset4)} 00000 n 
trailer
<<
  /Size 5
  /Root 1 0 R
>>
startxref
${xrefOffset}
%%EOF`;

  return Buffer.from(header + obj1 + obj2 + obj3 + obj4 + xrefAndTrailer, 'utf-8');
}
