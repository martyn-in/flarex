import { getDb } from '@/lib/db';
import { classifyThermalAnomaly } from '@/services/intelligence/classifier';
import { LandCoverType } from '@/types';

export interface FirmsDetection {
  latitude: number;
  longitude: number;
  bright_ti4: number;
  bright_ti5?: number;
  scan?: number;
  track?: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  instrument: string;
  confidence: number;
  version?: string;
  bright_t31?: number;
  frp: number;
  daynight: string;
}

export interface ThermalEventRecord {
  id: string;
  event_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  satellite: string;
  instrument: string;
  brightness_t4: number;
  brightness_t5: number;
  frp: number;
  baseline_frp: number;
  baseline_ratio: number;
  confidence: number;
  daynight: string;
  classification: string;
  classification_confidence: number;
  risk_score: number;
  risk_level: string;
  abnormality_status: string;
  persistence_score: number;
  persistence_days_ratio: string;
  land_cover: string;
  distance_to_forest_m: number;
  distance_to_agri_m: number;
  location_name: string;
  state: string;
  district: string;
  nearest_facility_name: string;
  nearest_facility_type: string;
  nearest_facility_distance_m: number;
  class_probabilities: string;
  explainability_reasons: string;
  created_at: string;
  updated_at: string;
}

// Bounding box for India
const INDIA_BBOX = {
  minLon: 68.0,
  minLat: 6.5,
  maxLon: 97.5,
  maxLat: 37.5,
};

const KNOWN_CLUSTERS = [
  { name: 'Dahej SEZ Petrochemical Complex', type: 'Petrochemical & Chemical Refinery', state: 'Gujarat', district: 'Bharuch', lat: 21.7125, lon: 72.5842, baseline: 105.0, landCover: 'Industrial / Built-up' as LandCoverType },
  { name: 'Hazira LNG & Manufacturing Hub', type: 'LNG Terminal & Gas Chemical Zone', state: 'Gujarat', district: 'Surat', lat: 21.1147, lon: 72.6514, baseline: 32.0, landCover: 'Industrial / Built-up' as LandCoverType },
  { name: 'Jamnagar Mega Refinery Complex', type: 'Mega Oil Refinery & Petrochemical', state: 'Gujarat', district: 'Jamnagar', lat: 22.3789, lon: 69.8654, baseline: 108.0, landCover: 'Industrial / Built-up' as LandCoverType },
  { name: 'Korba Super Thermal Power Basin', type: 'Thermal Power Generation Station', state: 'Chhattisgarh', district: 'Korba', lat: 22.3595, lon: 82.7501, baseline: 45.0, landCover: 'Industrial / Built-up' as LandCoverType },
  { name: 'Jharia Coalfield Pit #7', type: 'Open-Cast Coal Mining & Colliery', state: 'Jharkhand', district: 'Dhanbad', lat: 23.7503, lon: 86.4172, baseline: 60.0, landCover: 'Mining / Bare Soil' as LandCoverType },
  { name: 'Bokaro Integrated Steel Plant', type: 'Integrated Steel Plant & Blast Furnace', state: 'Jharkhand', district: 'Bokaro', lat: 23.6693, lon: 86.1511, baseline: 38.0, landCover: 'Industrial / Built-up' as LandCoverType },
  { name: 'Digboi Oil Field & Flare Unit', type: 'Oil & Gas Production Flare', state: 'Assam', district: 'Tinsukia', lat: 27.3821, lon: 95.6284, baseline: 48.0, landCover: 'Industrial / Built-up' as LandCoverType },
  { name: 'Singrauli Thermal Power Belt', type: 'Thermal Power Station', state: 'Madhya Pradesh', district: 'Singrauli', lat: 24.2012, lon: 82.6841, baseline: 40.0, landCover: 'Industrial / Built-up' as LandCoverType },
  { name: 'Paradeep Refinery & Port Terminal', type: 'Oil Refinery & Petrochemical', state: 'Odisha', district: 'Jagatsinghpur', lat: 20.2642, lon: 86.6715, baseline: 28.0, landCover: 'Industrial / Built-up' as LandCoverType },
  { name: 'Simlipal Biosphere Reserve', type: 'Reserve Forest', state: 'Odisha', district: 'Mayurbhanj', lat: 21.6842, lon: 86.3214, baseline: 12.0, landCover: 'Dense Forest / Woodland' as LandCoverType },
  { name: 'Sangrur Agricultural Fringe', type: 'Agricultural Parcel', state: 'Punjab', district: 'Sangrur', lat: 30.3398, lon: 75.8452, baseline: 14.0, landCover: 'Cropland / Agriculture' as LandCoverType },
];

function resolveGeospatialContext(lat: number, lon: number) {
  let closest = KNOWN_CLUSTERS[0];
  let minDistance = 999999;

  for (const cluster of KNOWN_CLUSTERS) {
    const d = Math.hypot(cluster.lat - lat, cluster.lon - lon);
    if (d < minDistance) {
      minDistance = d;
      closest = cluster;
    }
  }

  // Distance in meters (~111km per degree approx)
  const distMeters = Math.round(minDistance * 111000);

  if (distMeters <= 5000) {
    return {
      location: `${closest.name}, ${closest.state}`,
      state: closest.state,
      district: closest.district,
      facilityName: closest.name,
      facilityType: closest.type,
      facilityDistanceMeters: distMeters,
      baselineFrp: closest.baseline,
      landCover: closest.landCover,
      distanceToForestMeters: closest.landCover === 'Dense Forest / Woodland' ? 0 : 8000,
      distanceToAgriMeters: closest.landCover === 'Cropland / Agriculture' ? 0 : 6000,
    };
  }

  // Fallback for general coordinates
  return {
    location: `Thermal Anomaly ${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`,
    state: 'India',
    district: 'Industrial Fringe',
    facilityName: 'Regional Industrial Area',
    facilityType: 'General Industrial Facility',
    facilityDistanceMeters: distMeters,
    baselineFrp: 20.0,
    landCover: 'Industrial / Built-up' as LandCoverType,
    distanceToForestMeters: 6000,
    distanceToAgriMeters: 4000,
  };
}

export function parseFirmsCsv(csvText: string): FirmsDetection[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const latIdx = headers.indexOf('latitude');
  const lonIdx = headers.indexOf('longitude');
  const bright4Idx = headers.findIndex((h) => h.includes('bright_ti4') || h.includes('brightness'));
  const bright5Idx = headers.findIndex((h) => h.includes('bright_ti5') || h.includes('bright_t31'));
  const frpIdx = headers.indexOf('frp');
  const confIdx = headers.indexOf('confidence');
  const dateIdx = headers.indexOf('acq_date');
  const timeIdx = headers.indexOf('acq_time');
  const satIdx = headers.indexOf('satellite');
  const instIdx = headers.indexOf('instrument');
  const daynightIdx = headers.indexOf('daynight');

  if (latIdx === -1 || lonIdx === -1) return [];

  const detections: FirmsDetection[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((c) => c.trim());
    if (row.length <= Math.max(latIdx, lonIdx)) continue;

    const lat = parseFloat(row[latIdx]);
    const lon = parseFloat(row[lonIdx]);

    if (isNaN(lat) || isNaN(lon)) continue;
    if (lat < INDIA_BBOX.minLat || lat > INDIA_BBOX.maxLat || lon < INDIA_BBOX.minLon || lon > INDIA_BBOX.maxLon) {
      continue;
    }

    const bright_ti4 = bright4Idx !== -1 && !isNaN(parseFloat(row[bright4Idx])) ? parseFloat(row[bright4Idx]) : 330.0;
    const bright_ti5 = bright5Idx !== -1 && !isNaN(parseFloat(row[bright5Idx])) ? parseFloat(row[bright5Idx]) : 295.0;
    const frp = frpIdx !== -1 && !isNaN(parseFloat(row[frpIdx])) ? parseFloat(row[frpIdx]) : 12.0;

    let confidence = 85;
    if (confIdx !== -1) {
      const rawConf = row[confIdx]?.toLowerCase() || '';
      if (rawConf === 'h' || rawConf === 'high') confidence = 95;
      else if (rawConf === 'n' || rawConf === 'nominal') confidence = 80;
      else if (rawConf === 'l' || rawConf === 'low') confidence = 50;
      else if (!isNaN(parseFloat(rawConf))) confidence = Math.min(100, Math.max(10, parseFloat(rawConf)));
    }

    const acq_date = dateIdx !== -1 && row[dateIdx] ? row[dateIdx] : new Date().toISOString().slice(0, 10);
    const acq_time = timeIdx !== -1 && row[timeIdx] ? row[timeIdx] : '1200';
    const satellite = satIdx !== -1 && row[satIdx] ? row[satIdx] : 'VIIRS_NOAA20_NRT';
    const instrument = instIdx !== -1 && row[instIdx] ? row[instIdx] : 'VIIRS';
    const daynight = daynightIdx !== -1 && row[daynightIdx] ? (row[daynightIdx].toUpperCase() as 'D' | 'N') : 'D';

    detections.push({
      latitude: lat,
      longitude: lon,
      bright_ti4,
      bright_ti5,
      frp,
      confidence,
      acq_date,
      acq_time,
      satellite,
      instrument,
      daynight,
    });
  }

  return detections;
}

export async function fetchLiveFirmsData(): Promise<{ success: boolean; source: string; records: FirmsDetection[]; error?: string }> {
  const mapKey = process.env.NASA_FIRMS_MAP_KEY;

  if (mapKey && mapKey.trim().length > 5) {
    try {
      const bboxStr = `${INDIA_BBOX.minLon},${INDIA_BBOX.minLat},${INDIA_BBOX.maxLon},${INDIA_BBOX.maxLat}`;
      const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/VIIRS_NOAA20_NRT/${bboxStr}/1`;

      const response = await fetch(url, {
        headers: { 'User-Agent': 'FlameX-Thermal-Intelligence/1.0' },
        next: { revalidate: 30 },
      });

      if (response.ok) {
        const text = await response.text();
        if (text && !text.toLowerCase().includes('invalid map_key') && !text.toLowerCase().includes('error')) {
          const parsed = parseFirmsCsv(text);
          if (parsed.length > 0) {
            return {
              success: true,
              source: 'NASA_FIRMS_API_LIVE',
              records: parsed,
            };
          }
        }
      }
    } catch (err: any) {
      console.warn('NASA FIRMS Live API request failed:', err?.message || err);
    }
  }

  // Fallback to SQLite Real Database Cache
  const db = getDb();
  const cachedRows = db.prepare(`SELECT * FROM thermal_events ORDER BY frp DESC LIMIT 100`).all() as any[];

  const cachedRecords: FirmsDetection[] = cachedRows.map((r) => ({
    latitude: r.latitude,
    longitude: r.longitude,
    bright_ti4: r.brightness_t4,
    bright_ti5: r.brightness_t5,
    frp: r.frp,
    confidence: r.confidence,
    acq_date: r.timestamp.split(' ')[0],
    acq_time: (r.timestamp.split(' ')[1] || '12:00').replace(/:/g, '').slice(0, 4),
    satellite: r.satellite,
    instrument: r.instrument,
    daynight: r.daynight,
  }));

  return {
    success: true,
    source: 'CACHED_REAL_DATASET',
    records: cachedRecords,
  };
}

export async function ingestFirmsDetections(detections: FirmsDetection[]): Promise<{ ingestedCount: number; updatedCount: number }> {
  const db = getDb();
  let ingested = 0;
  let updated = 0;

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO thermal_events (
      id, event_id, latitude, longitude, timestamp, satellite, instrument,
      brightness_t4, brightness_t5, frp, baseline_frp, baseline_ratio,
      confidence, daynight, classification, classification_confidence,
      risk_score, risk_level, abnormality_status, persistence_score,
      persistence_days_ratio, land_cover, distance_to_forest_m, distance_to_agri_m,
      location_name, state, district, nearest_facility_name, nearest_facility_type,
      nearest_facility_distance_m, class_probabilities, explainability_reasons, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, CURRENT_TIMESTAMP
    )
  `);

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  const transaction = db.transaction((items: FirmsDetection[]) => {
    let index = 1;
    for (const d of items) {
      const formattedTime = d.acq_time.length === 4 ? `${d.acq_time.slice(0, 2)}:${d.acq_time.slice(2)}:00` : '12:00:00';
      const timestamp = `${d.acq_date} ${formattedTime}`;
      const internalId = `FLX-${d.latitude.toFixed(3).replace('.', '')}-${d.longitude.toFixed(3).replace('.', '')}`;
      const eventId = `FL-${String(100 + index)}`;
      index++;

      const geo = resolveGeospatialContext(d.latitude, d.longitude);

      // AI Feature Classification
      const aiResult = classifyThermalAnomaly({
        frp: d.frp,
        brightnessT4: d.bright_ti4,
        brightnessT5: d.bright_ti5,
        confidence: d.confidence,
        satellite: d.satellite,
        facilityDistanceMeters: geo.facilityDistanceMeters,
        facilityType: geo.facilityType,
        facilityName: geo.facilityName,
        landCover: geo.landCover,
        historicalBaselineFrp: geo.baselineFrp,
        persistenceDaysOutOf30: geo.facilityDistanceMeters < 500 ? 27 : 3,
        distanceToForestMeters: geo.distanceToForestMeters,
        distanceToAgriMeters: geo.distanceToAgriMeters,
      });

      insertStmt.run(
        internalId,
        eventId,
        d.latitude,
        d.longitude,
        timestamp,
        d.satellite,
        d.instrument,
        d.bright_ti4,
        d.bright_ti5 || 295.0,
        d.frp,
        geo.baselineFrp,
        aiResult.baselineRatio,
        d.confidence,
        d.daynight,
        aiResult.classification,
        aiResult.confidence,
        aiResult.anomalyScore * 10,
        aiResult.severity.toUpperCase(),
        aiResult.status,
        geo.facilityDistanceMeters < 500 ? 90 : 15,
        geo.facilityDistanceMeters < 500 ? '27 / 30 days' : '3 / 30 days',
        geo.landCover,
        geo.distanceToForestMeters,
        geo.distanceToAgriMeters,
        geo.location,
        geo.state,
        geo.district,
        geo.facilityName,
        geo.facilityType,
        geo.facilityDistanceMeters,
        JSON.stringify(aiResult.probabilities),
        JSON.stringify(aiResult.explainability)
      );
      ingested++;
    }
  });

  transaction(detections);

  return { ingestedCount: ingested, updatedCount: updated };
}

export function getThermalEvents(filters: {
  region?: string;
  confidenceMin?: number;
  riskLevel?: string;
  classification?: string;
  status?: string;
  limit?: number;
}): ThermalEventRecord[] {
  const db = getDb();
  let query = `SELECT * FROM thermal_events WHERE 1=1`;
  const params: any[] = [];

  if (filters.confidenceMin !== undefined) {
    query += ` AND confidence >= ?`;
    params.push(filters.confidenceMin);
  }

  if (filters.riskLevel && filters.riskLevel.toUpperCase() !== 'ALL') {
    query += ` AND UPPER(risk_level) = ?`;
    params.push(filters.riskLevel.toUpperCase());
  }

  if (filters.classification && filters.classification.toUpperCase() !== 'ALL') {
    query += ` AND UPPER(classification) LIKE ?`;
    params.push(`%${filters.classification.toUpperCase()}%`);
  }

  if (filters.status && filters.status.toUpperCase() !== 'ALL') {
    query += ` AND UPPER(abnormality_status) = ?`;
    params.push(filters.status.toUpperCase());
  }

  query += ` ORDER BY frp DESC LIMIT ?`;
  params.push(filters.limit || 50);

  return db.prepare(query).all(...params) as ThermalEventRecord[];
}

export function getThermalEventById(id: string): { event: ThermalEventRecord | null; infrastructure: any[]; alerts: any[] } {
  const db = getDb();

  const event = db.prepare(`SELECT * FROM thermal_events WHERE id = ? OR event_id = ?`).get(id, id) as ThermalEventRecord | undefined;
  if (!event) {
    return { event: null, infrastructure: [], alerts: [] };
  }

  let infrastructure: any[] = [];
  try {
    infrastructure = db.prepare(`SELECT * FROM infrastructure_context WHERE thermal_event_id = ?`).all(event.id);
  } catch {}

  let alerts: any[] = [];
  try {
    alerts = db.prepare(`SELECT * FROM alerts WHERE thermal_event_id = ?`).all(event.id);
  } catch {}

  return {
    event,
    infrastructure,
    alerts,
  };
}
