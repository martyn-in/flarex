import { getDb } from '@/lib/db';

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
  confidence: number;
  daynight: string;
  classification: string;
  classification_confidence: number;
  risk_score: number;
  risk_level: string;
  persistence_score: number;
  location_name: string;
  state: string;
  district: string;
  created_at: string;
  updated_at: string;
}

// Bounding box for India and surrounding industrial maritime zones: [min_lon, min_lat, max_lon, max_lat]
const INDIA_BBOX = {
  minLon: 68.0,
  minLat: 6.5,
  maxLon: 97.5,
  maxLat: 37.5,
};

// Known Indian Industrial Clusters for Geographic Enrichment
const KNOWN_CLUSTERS = [
  { name: 'Dahej SEZ Petrochemical Complex', state: 'Gujarat', district: 'Bharuch', lat: 21.7125, lon: 72.5842 },
  { name: 'Hazira LNG & Manufacturing Hub', state: 'Gujarat', district: 'Surat', lat: 21.1147, lon: 72.6514 },
  { name: 'Jamnagar Mega Refinery Complex', state: 'Gujarat', district: 'Jamnagar', lat: 22.3789, lon: 69.8654 },
  { name: 'Korba Super Thermal Power Basin', state: 'Chhattisgarh', district: 'Korba', lat: 22.3595, lon: 82.7501 },
  { name: 'Jharia Coalfield & Smelting Zone', state: 'Jharkhand', district: 'Dhanbad', lat: 23.7503, lon: 86.4172 },
  { name: 'Bokaro Steel Plant & Metallurgy', state: 'Jharkhand', district: 'Bokaro', lat: 23.6693, lon: 86.1511 },
  { name: 'Digboi Oil Field & Refinery', state: 'Assam', district: 'Tinsukia', lat: 27.3821, lon: 95.6284 },
  { name: 'Singrauli Thermal Power Belt', state: 'Madhya Pradesh', district: 'Singrauli', lat: 24.2012, lon: 82.6841 },
  { name: 'Paradeep Refinery & Port Terminal', state: 'Odisha', district: 'Jagatsinghpur', lat: 20.2642, lon: 86.6715 },
  { name: 'Angul Steel & Aluminium Corridor', state: 'Odisha', district: 'Angul', lat: 20.8421, lon: 85.1024 },
  { name: 'Visakhapatnam Steel & Petro Corridor', state: 'Andhra Pradesh', district: 'Visakhapatnam', lat: 17.6868, lon: 83.2185 },
  { name: 'Manali Industrial & Refinery Cluster', state: 'Tamil Nadu', district: 'Chennai', lat: 13.1672, lon: 80.2654 },
  { name: 'Nagothane Petrochemical Complex', state: 'Maharashtra', district: 'Raigad', lat: 18.5321, lon: 73.1284 },
  { name: 'Bathinda Oil Refinery Complex', state: 'Punjab', district: 'Bathinda', lat: 30.2110, lon: 74.9455 },
  { name: 'Sangrur Agricultural Fringe', state: 'Punjab', district: 'Sangrur', lat: 30.3398, lon: 75.8452 },
];

function resolveLocationName(lat: number, lon: number): { location: string; state: string; district: string } {
  let closest = KNOWN_CLUSTERS[0];
  let minDistance = 999999;

  for (const cluster of KNOWN_CLUSTERS) {
    const d = Math.hypot(cluster.lat - lat, cluster.lon - lon);
    if (d < minDistance) {
      minDistance = d;
      closest = cluster;
    }
  }

  // If within ~0.45 degrees (~50km)
  if (minDistance < 0.45) {
    return {
      location: `${closest.name}, ${closest.state}`,
      state: closest.state,
      district: closest.district,
    };
  }

  // Region estimation
  let state = 'India';
  let district = 'Industrial Corridor';

  if (lat >= 20 && lat <= 24.5 && lon >= 68.5 && lon <= 74.5) {
    state = 'Gujarat';
    district = 'Western Industrial Corridor';
  } else if (lat >= 21 && lat <= 24 && lon >= 80 && lon <= 84) {
    state = 'Chhattisgarh';
    district = 'Central Mineral Belt';
  } else if (lat >= 22 && lat <= 25 && lon >= 83 && lon <= 88) {
    state = 'Jharkhand';
    district = 'Eastern Metallurgical Zone';
  } else if (lat >= 19 && lat <= 22.5 && lon >= 81 && lon <= 87.5) {
    state = 'Odisha';
    district = 'Mahanadi Basin';
  } else if (lat >= 24 && lat <= 28 && lon >= 89 && lon <= 96) {
    state = 'Assam';
    district = 'Brahmaputra Valley';
  } else if (lat >= 29 && lat <= 32.5 && lon >= 74 && lon <= 77) {
    state = 'Punjab';
    district = 'Northern Agricultural Basin';
  } else if (lat >= 18 && lat <= 21 && lon >= 72 && lon <= 79) {
    state = 'Maharashtra';
    district = 'Konkan Industrial Hub';
  }

  return {
    location: `Thermal Anomaly ${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E, ${state}`,
    state,
    district,
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

    // Validate coordinate bounding box for India
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
    const daynight = daynightIdx !== -1 && row[daynightIdx] ? row[daynightIdx].toUpperCase() : 'D';

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
      // Area API query: min_lon,min_lat,max_lon,max_lat
      const bboxStr = `${INDIA_BBOX.minLon},${INDIA_BBOX.minLat},${INDIA_BBOX.maxLon},${INDIA_BBOX.maxLat}`;
      const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/VIIRS_NOAA20_NRT/${bboxStr}/1`;

      const response = await fetch(url, {
        headers: { 'User-Agent': 'FlareX-Thermal-Intelligence/1.0' },
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
      brightness_t4, brightness_t5, frp, confidence, daynight,
      classification, classification_confidence, risk_score, risk_level,
      persistence_score, location_name, state, district, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, CURRENT_TIMESTAMP
    )
  `);

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  const transaction = db.transaction((items: FirmsDetection[]) => {
    let index = 1;
    for (const d of items) {
      const formattedTime = d.acq_time.length === 4 ? `${d.acq_time.slice(0, 2)}:${d.acq_time.slice(2)}:00` : '12:00:00';
      const timestamp = `${d.acq_date} ${formattedTime}`;
      const internalId = `FLX-${d.latitude.toFixed(3).replace('.', '')}-${d.longitude.toFixed(3).replace('.', '')}`;
      const eventId = `FLX-${dateStr}-${String(index).padStart(6, '0')}`;
      index++;

      const { location, state, district } = resolveLocationName(d.latitude, d.longitude);

      // Baseline Classification & Risk Rules
      let classification = 'Persistent Industrial Heat';
      let riskLevel = 'LOW';
      let riskScore = 24;
      let persistence = 88;

      if (d.frp >= 60 || d.bright_ti4 > 390) {
        classification = 'Industrial Fire';
        riskLevel = 'CRITICAL';
        riskScore = 94;
        persistence = 12;
      } else if (d.frp >= 35) {
        classification = 'Gas Flare';
        riskLevel = 'HIGH';
        riskScore = 72;
        persistence = 82;
      } else if (state === 'Punjab' || state === 'Haryana') {
        classification = 'Agricultural Burning';
        riskLevel = 'MODERATE';
        riskScore = 42;
        persistence = 15;
      }

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
        d.confidence,
        d.daynight,
        classification,
        d.confidence,
        riskScore,
        riskLevel,
        persistence,
        location,
        state,
        district
      );
      ingested++;
    }
  });

  transaction(detections);

  // Log sync operation
  db.prepare(`
    INSERT INTO firms_sync_log (id, source, satellite, records_ingested, status, sync_time)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(
    `SYNC-${Date.now()}`,
    'NASA_VIIRS_NRT',
    'VIIRS_NOAA20_NRT',
    ingested,
    'SUCCESS'
  );

  return { ingestedCount: ingested, updatedCount: updated };
}

export function getThermalEvents(filters: {
  region?: string;
  confidenceMin?: number;
  riskLevel?: string;
  classification?: string;
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
    infrastructure = db.prepare(`SELECT * FROM infrastructure_context WHERE thermal_event_id = ? OR thermal_event_id = ?`).all(event.id, id);
  } catch {
    try {
      infrastructure = db.prepare(`SELECT * FROM industrial_context WHERE hotspot_id = ?`).all(event.id);
    } catch {}
  }

  let alerts: any[] = [];
  try {
    alerts = db.prepare(`SELECT * FROM alerts WHERE thermal_event_id = ? OR thermal_event_id = ?`).all(event.id, id);
  } catch {
    try {
      alerts = db.prepare(`SELECT * FROM alerts WHERE hotspot_id = ?`).all(event.id);
    } catch {}
  }

  return {
    event,
    infrastructure,
    alerts,
  };
}
