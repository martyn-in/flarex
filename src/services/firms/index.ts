import { getDb } from '@/lib/db';
import { processThermalAnomalyPipeline, RawHotspotInput, EnrichedContextInput } from '@/services/intelligence/pipeline';
import { HistoricalObservation } from '@/services/intelligence/persistenceEngine';
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

export interface IngestionResult {
  success: boolean;
  source: 'NASA_FIRMS_LIVE' | 'CACHED_DATABASE' | 'DEMO_DATASET' | 'OFFLINE';
  status: 'LIVE_NRT' | 'CACHED' | 'STALE' | 'DEGRADED' | 'OFFLINE';
  provider: string;
  dataAgeMinutes: number;
  acquisitionTime: string;
  ingestionTime: string;
  records: FirmsDetection[];
  ingestedCount: number;
  deduplicatedCount: number;
  error?: string;
}

// Bounding box for India
const INDIA_BBOX = {
  minLon: 68.0,
  minLat: 6.5,
  maxLon: 97.5,
  maxLat: 37.5,
};

// Supported NASA FIRMS satellite sensor endpoints
export type FirmsSourceSensor = 'VIIRS_NOAA20_NRT' | 'VIIRS_NOAA21_NRT' | 'VIIRS_SNPP_NRT' | 'MODIS_NRT';

interface FacilityRow {
  id: string;
  name: string;
  facility_type: string;
  sector: string;
  hazard_rating: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  typical_frp: number;
}

function resolveFacilityContext(lat: number, lon: number) {
  const db = getDb();
  const facilities = db.prepare(`SELECT * FROM industrial_facilities`).all() as FacilityRow[];

  let closest: FacilityRow | undefined = facilities[0];
  let minDistance = 999999;

  for (const fac of facilities) {
    const d = Math.hypot(fac.latitude - lat, fac.longitude - lon);
    if (d < minDistance) {
      minDistance = d;
      closest = fac;
    }
  }

  // Distance in meters (~111 km per degree approx)
  const distMeters = Math.round(minDistance * 111000);
  const distKm = distMeters / 1000;

  if (closest && distMeters <= 8000) {
    const facTypeLower = closest.facility_type.toLowerCase();
    const isForest = facTypeLower.includes('forest');
    const isAgri = facTypeLower.includes('agri') || facTypeLower.includes('farm');
    const isMining = facTypeLower.includes('mine') || facTypeLower.includes('coal');
    const isRefinery = facTypeLower.includes('refinery') || facTypeLower.includes('petro') || facTypeLower.includes('oil');
    const isPower = facTypeLower.includes('power') || facTypeLower.includes('thermal');
    const isSteel = facTypeLower.includes('steel') || facTypeLower.includes('metallurg');

    const landCover: LandCoverType = isForest
      ? 'Dense Forest / Woodland'
      : isAgri
      ? 'Cropland / Agriculture'
      : isMining
      ? 'Mining / Bare Soil'
      : 'Industrial / Built-up';

    return {
      location: `${closest.name}, ${closest.state}`,
      state: closest.state,
      district: closest.district || 'District',
      facilityName: closest.name,
      facilityType: closest.facility_type,
      facilityDistanceMeters: distMeters,
      facilityDistanceKm: distKm,
      refineryDistanceKm: isRefinery ? distKm : 45.0,
      oilGasDistanceKm: isRefinery ? distKm : 35.0,
      powerPlantDistanceKm: isPower ? distKm : 40.0,
      steelPlantDistanceKm: isSteel ? distKm : 60.0,
      mineDistanceKm: isMining ? distKm : 80.0,
      withinIndustrialArea: distKm <= 1.0,
      baselineFrp: closest.typical_frp || 25.0,
      landCover,
      forestDistanceKm: isForest ? 0 : 8.0,
      urbanDistanceKm: isForest ? 35.0 : 3.0,
      populationDistanceMeters: isForest ? 4500 : isAgri ? 2500 : 450,
      ndvi: isForest ? 0.72 : isAgri ? 0.38 : 0.12,
    };
  }

  return {
    location: `Thermal Anomaly ${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`,
    state: 'India',
    district: 'Industrial Fringe',
    facilityName: 'Regional Industrial Area',
    facilityType: 'General Industrial Facility',
    facilityDistanceMeters: distMeters,
    facilityDistanceKm: distKm,
    refineryDistanceKm: 50.0,
    oilGasDistanceKm: 40.0,
    powerPlantDistanceKm: 30.0,
    steelPlantDistanceKm: 50.0,
    mineDistanceKm: 60.0,
    withinIndustrialArea: distKm <= 1.0,
    baselineFrp: 20.0,
    landCover: 'Industrial / Built-up' as LandCoverType,
    forestDistanceKm: 6.0,
    urbanDistanceKm: 5.0,
    populationDistanceMeters: 850,
    ndvi: 0.14,
  };
}

/**
 * Parses raw CSV telemetry from NASA FIRMS API, handling both VIIRS (375m) and MODIS (1km) schemas.
 */
export function parseFirmsCsv(csvText: string, defaultSensor = 'VIIRS_NOAA20_NRT'): FirmsDetection[] {
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
  const scanIdx = headers.indexOf('scan');
  const trackIdx = headers.indexOf('track');

  if (latIdx === -1 || lonIdx === -1) return [];

  const detections: FirmsDetection[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((c) => c.trim());
    if (row.length <= Math.max(latIdx, lonIdx)) continue;

    const lat = parseFloat(row[latIdx]);
    const lon = parseFloat(row[lonIdx]);
    if (isNaN(lat) || isNaN(lon)) continue;

    // Filter within India bounding box
    if (
      lat < INDIA_BBOX.minLat ||
      lat > INDIA_BBOX.maxLat ||
      lon < INDIA_BBOX.minLon ||
      lon > INDIA_BBOX.maxLon
    ) {
      continue;
    }

    const bright4 = bright4Idx !== -1 ? parseFloat(row[bright4Idx]) : 350.0;
    const bright5 = bright5Idx !== -1 ? parseFloat(row[bright5Idx]) : 300.0;
    const frp = frpIdx !== -1 ? parseFloat(row[frpIdx]) : 15.0;
    const scan = scanIdx !== -1 ? parseFloat(row[scanIdx]) : 0.4;
    const track = trackIdx !== -1 ? parseFloat(row[trackIdx]) : 0.4;

    // Normalize sensor confidence differences
    // MODIS returns 0-100 numeric; VIIRS returns low ('l'), nominal ('n'), high ('h') or numeric
    let conf = 80;
    if (confIdx !== -1) {
      const cStr = row[confIdx].toLowerCase();
      if (cStr === 'l' || cStr === 'low') conf = 35;
      else if (cStr === 'n' || cStr === 'nominal') conf = 75;
      else if (cStr === 'h' || cStr === 'high') conf = 95;
      else {
        const parsedConf = parseFloat(cStr);
        if (!isNaN(parsedConf)) conf = Math.max(0, Math.min(100, parsedConf));
      }
    }

    const satName = satIdx !== -1 && row[satIdx] ? row[satIdx] : defaultSensor.includes('MODIS') ? 'Terra' : 'NOAA-20';
    const instName = instIdx !== -1 && row[instIdx] ? row[instIdx] : defaultSensor.includes('MODIS') ? 'MODIS' : 'VIIRS';

    detections.push({
      latitude: lat,
      longitude: lon,
      bright_ti4: isNaN(bright4) ? 350.0 : bright4,
      bright_ti5: isNaN(bright5) ? 300.0 : bright5,
      frp: isNaN(frp) || frp <= 0 ? 10.0 : frp,
      confidence: conf,
      scan: isNaN(scan) ? 0.4 : scan,
      track: isNaN(track) ? 0.4 : track,
      acq_date: dateIdx !== -1 ? row[dateIdx] : new Date().toISOString().slice(0, 10),
      acq_time: timeIdx !== -1 ? row[timeIdx] : '0930',
      satellite: satName,
      instrument: instName,
      daynight: daynightIdx !== -1 ? row[daynightIdx].toUpperCase() : 'D',
    });
  }

  return detections;
}

/**
 * Fetches active thermal anomalies from NASA FIRMS API supporting multi-satellite feeds:
 * VIIRS NOAA-20, VIIRS NOAA-21, VIIRS S-NPP, and MODIS.
 */
export async function fetchLiveFirmsData(sensor: FirmsSourceSensor = 'VIIRS_NOAA20_NRT'): Promise<IngestionResult> {
  const mapKey = process.env.NASA_FIRMS_MAP_KEY;
  const startTime = Date.now();

  // If no NASA FIRMS map key provided, query local durable database
  if (!mapKey || mapKey.trim() === '') {
    const db = getDb();
    const rows = db.prepare(`SELECT * FROM thermal_events ORDER BY timestamp DESC LIMIT 50`).all() as Array<Record<string, unknown>>;

    const latestTimestamp = (rows[0]?.timestamp as string) || new Date().toISOString();
    const dataAgeMs = Date.now() - new Date(latestTimestamp.replace(' ', 'T')).getTime();
    const dataAgeMinutes = Math.max(0, Math.round(dataAgeMs / (1000 * 60)));

    return {
      success: true,
      source: 'CACHED_DATABASE',
      status: 'CACHED',
      provider: `NASA FIRMS ${sensor} (Durable Storage Cache)`,
      dataAgeMinutes,
      acquisitionTime: latestTimestamp,
      ingestionTime: new Date().toISOString(),
      records: [],
      ingestedCount: rows.length,
      deduplicatedCount: 0,
    };
  }

  // Attempt real query to NASA FIRMS API
  try {
    const url = `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${mapKey}/${sensor}/IND/1`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'FlareX-Geospatial-Intelligence/1.0',
      },
    });
    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      logIngestionRun('NASA_FIRMS_API', sensor, 0, 0, 'FAILED', latencyMs, `HTTP ${response.status}: ${response.statusText}`);
      return {
        success: false,
        source: 'OFFLINE',
        status: 'DEGRADED',
        provider: `NASA FIRMS API (${sensor} Degraded)`,
        dataAgeMinutes: 999,
        acquisitionTime: new Date().toISOString(),
        ingestionTime: new Date().toISOString(),
        records: [],
        ingestedCount: 0,
        deduplicatedCount: 0,
        error: `NASA FIRMS returned status ${response.status}`,
      };
    }

    const csvText = await response.text();
    const detections = parseFirmsCsv(csvText, sensor);

    const { ingestedCount, deduplicatedCount } = await ingestFirmsDetections(detections);
    logIngestionRun('NASA_FIRMS_API', sensor, ingestedCount, deduplicatedCount, 'SUCCESS', latencyMs);

    return {
      success: true,
      source: 'NASA_FIRMS_LIVE',
      status: 'LIVE_NRT',
      provider: `NASA FIRMS ${sensor} (Live Stream)`,
      dataAgeMinutes: 45,
      acquisitionTime: new Date().toISOString(),
      ingestionTime: new Date().toISOString(),
      records: detections,
      ingestedCount,
      deduplicatedCount,
    };
  } catch (error: unknown) {
    const latencyMs = Date.now() - startTime;
    const errMsg = error instanceof Error ? error.message : 'Connection to NASA FIRMS timed out';
    logIngestionRun('NASA_FIRMS_API', sensor, 0, 0, 'ERROR', latencyMs, errMsg);

    return {
      success: false,
      source: 'OFFLINE',
      status: 'OFFLINE',
      provider: 'NASA FIRMS API',
      dataAgeMinutes: 999,
      acquisitionTime: new Date().toISOString(),
      ingestionTime: new Date().toISOString(),
      records: [],
      ingestedCount: 0,
      deduplicatedCount: 0,
      error: errMsg,
    };
  }
}

/**
 * Ingests and classifies FIRMS detections using the two-stage intelligence pipeline.
 * Employs deterministic IDs to prevent duplicate ingestion.
 */
export async function ingestFirmsDetections(detections: FirmsDetection[]): Promise<{ ingestedCount: number; deduplicatedCount: number }> {
  if (!detections || detections.length === 0) {
    return { ingestedCount: 0, deduplicatedCount: 0 };
  }

  const db = getDb();
  let ingested = 0;
  let deduplicated = 0;

  const insertEventStmt = db.prepare(`
    INSERT OR REPLACE INTO thermal_events (
      id, event_id, latitude, longitude, timestamp, acquisition_time, satellite, instrument,
      brightness_t4, brightness_t5, frp, baseline_frp, baseline_ratio, confidence,
      daynight, classification, classification_confidence, risk_score, risk_level,
      abnormality_status, persistence_score, persistence_days_ratio, land_cover,
      distance_to_forest_m, distance_to_agri_m, location_name, state, district,
      nearest_facility_name, nearest_facility_type, nearest_facility_distance_m,
      class_probabilities, explainability_reasons, source_provider
    ) VALUES (
      @id, @event_id, @latitude, @longitude, @timestamp, @acquisition_time, @satellite, @instrument,
      @brightness_t4, @brightness_t5, @frp, @baseline_frp, @baseline_ratio, @confidence,
      @daynight, @classification, @classification_confidence, @risk_score, @risk_level,
      @abnormality_status, @persistence_score, @persistence_days_ratio, @land_cover,
      @distance_to_forest_m, @distance_to_agri_m, @location_name, @state, @district,
      @nearest_facility_name, @nearest_facility_type, @nearest_facility_distance_m,
      @class_probabilities, @explainability_reasons, @source_provider
    )
  `);

  const checkDuplicateStmt = db.prepare(`
    SELECT id FROM thermal_events WHERE id = ? OR event_id = ?
  `);

  const insertAlertStmt = db.prepare(`
    INSERT OR REPLACE INTO alerts (
      id, thermal_event_id, event_id, location_name, classification, severity, alert_type, status,
      frp, baseline_multiple, created_at, message, explanation_summary, latitude, longitude
    ) VALUES (
      @id, @thermal_event_id, @event_id, @location_name, @classification, @severity, @alert_type, @status,
      @frp, @baseline_multiple, @created_at, @message, @explanation_summary, @latitude, @longitude
    )
  `);

  // Load historical observations from DB for rolling Stage A persistence calculations
  const historyRows = db.prepare(`SELECT * FROM historical_observations ORDER BY datetime DESC LIMIT 200`).all() as Array<Record<string, unknown>>;
  const historyObs: HistoricalObservation[] = historyRows.map((r) => ({
    latitude: Number(r.latitude),
    longitude: Number(r.longitude),
    acqDate: String(r.acq_date || ''),
    acqTime: String(r.acq_time || ''),
    datetime: String(r.datetime || ''),
    frp: Number(r.frp || 0),
    brightness: Number(r.brightness || 0),
    satellite: String(r.satellite || ''),
    confidence: Number(r.confidence || 0),
    daynight: (r.daynight === 'N' ? 'N' : 'D') as 'D' | 'N',
  }));

  const transaction = db.transaction((dets: FirmsDetection[]) => {
    for (const det of dets) {
      // Deterministic unique ID to prevent duplicate ingestion
      const cleanDate = det.acq_date.replace(/-/g, '');
      const cleanTime = det.acq_time.padStart(4, '0');
      const detId = `FIRMS-${det.satellite.replace(/[^a-zA-Z0-9]/g, '')}-${cleanDate}-${cleanTime}-${Math.round(det.latitude * 1000)}-${Math.round(det.longitude * 1000)}`;
      const eventCode = `FL-${Math.abs(Math.round(det.latitude * 100 + det.longitude * 100)) % 900 + 100}`;

      const existing = checkDuplicateStmt.get(detId, eventCode);
      if (existing) {
        deduplicated++;
        continue;
      }

      const geo = resolveFacilityContext(det.latitude, det.longitude);

      const timestamp = `${det.acq_date}T${cleanTime.slice(0, 2)}:${cleanTime.slice(2, 4)}:00Z`;

      // 1. Prepare inputs for Two-Stage Intelligence Pipeline
      const rawHotspot: RawHotspotInput = {
        id: detId,
        latitude: det.latitude,
        longitude: det.longitude,
        frp: det.frp,
        brightnessT4: det.bright_ti4,
        brightnessT5: det.bright_ti5,
        confidence: det.confidence,
        satellite: det.satellite,
        instrument: det.instrument,
        daynight: det.daynight,
        scan: det.scan,
        track: det.track,
        timestamp,
        acqDate: det.acq_date,
        acqTime: det.acq_time,
      };

      const enrichedContext: EnrichedContextInput = {
        nearestFacilityName: geo.facilityName,
        nearestFacilityType: geo.facilityType,
        nearestFacilityDistanceKm: geo.facilityDistanceKm,
        refineryDistanceKm: geo.refineryDistanceKm,
        oilGasDistanceKm: geo.oilGasDistanceKm,
        powerPlantDistanceKm: geo.powerPlantDistanceKm,
        steelPlantDistanceKm: geo.steelPlantDistanceKm,
        mineDistanceKm: geo.mineDistanceKm,
        withinIndustrialArea: geo.withinIndustrialArea,
        landCover: geo.landCover,
        forestDistanceKm: geo.forestDistanceKm,
        urbanDistanceKm: geo.urbanDistanceKm,
        ndvi: geo.ndvi,
        populationDistanceMeters: geo.populationDistanceMeters,
        historicalObservations: historyObs,
      };

      // 2. Execute Stage A Persistence Analysis & Stage B ML Fire-Type Classifier
      const pipelineResult = processThermalAnomalyPipeline(rawHotspot, enrichedContext);

      // 3. Persist enriched event
      insertEventStmt.run({
        id: detId,
        event_id: eventCode,
        latitude: det.latitude,
        longitude: det.longitude,
        timestamp,
        acquisition_time: `${det.acq_date} ${cleanTime.slice(0, 2)}:${cleanTime.slice(2, 4)} UTC`,
        satellite: det.satellite,
        instrument: det.instrument,
        brightness_t4: det.bright_ti4,
        brightness_t5: det.bright_ti5 || 300.0,
        frp: det.frp,
        baseline_frp: pipelineResult.stageAPersistence.baselineFrp,
        baseline_ratio: pipelineResult.baselineRatio,
        confidence: det.confidence,
        daynight: det.daynight,
        classification: pipelineResult.finalClassification,
        classification_confidence: Math.round(pipelineResult.primaryConfidence * 100),
        risk_score: pipelineResult.operationalRiskScore,
        risk_level: pipelineResult.riskLevel,
        abnormality_status: pipelineResult.finalClassification === 'Industrial Fire' ? 'CRITICAL_FIRE' : pipelineResult.isPersistentSource ? 'NORMAL' : 'ABNORMAL',
        persistence_score: Math.round(pipelineResult.persistenceScore * 100),
        persistence_days_ratio: `${pipelineResult.stageAPersistence.rollingFeatures.activeDays30d} / 30 days`,
        land_cover: geo.landCover,
        distance_to_forest_m: geo.forestDistanceKm * 1000,
        distance_to_agri_m: 5000,
        location_name: geo.location,
        state: geo.state,
        district: geo.district,
        nearest_facility_name: geo.facilityName,
        nearest_facility_type: geo.facilityType,
        nearest_facility_distance_m: geo.facilityDistanceMeters,
        class_probabilities: JSON.stringify(pipelineResult.classProbabilities),
        explainability_reasons: JSON.stringify(pipelineResult.evidence.map((e) => e.text)),
        source_provider: `NASA_FIRMS_${det.satellite}`,
      });

      // 4. Create emergency alert for high-risk or industrial fire events
      if (pipelineResult.riskLevel === 'CRITICAL' || pipelineResult.riskLevel === 'HIGH' || pipelineResult.finalClassification === 'Industrial Fire') {
        insertAlertStmt.run({
          id: `ALT-${cleanDate}-${eventCode}`,
          thermal_event_id: detId,
          event_id: eventCode,
          location_name: geo.location,
          classification: pipelineResult.finalClassification,
          severity: pipelineResult.riskLevel,
          alert_type: pipelineResult.finalClassification === 'Industrial Fire' ? 'CRITICAL_INDUSTRIAL_FIRE' : 'THERMAL_SURGE',
          status: 'ACTIVE',
          frp: det.frp,
          baseline_multiple: pipelineResult.baselineRatio,
          created_at: timestamp,
          message: `${pipelineResult.finalClassification.toUpperCase()} DETECTED: Radiance ${det.frp.toFixed(1)} MW (${pipelineResult.baselineRatio.toFixed(1)}× baseline) at ${geo.location}`,
          explanation_summary: pipelineResult.explanationSummary,
          latitude: det.latitude,
          longitude: det.longitude,
        });
      }

      ingested++;
    }
  });

  transaction(detections);
  return { ingestedCount: ingested, deduplicatedCount: deduplicated };
}

export type ThermalEventRecord = Record<string, any>;

export function getThermalEventById(id: string): { event: Record<string, any> | null } {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM thermal_events WHERE id = ? OR event_id = ?`).get(id, id) as Record<string, any> | undefined;
  return { event: row || null };
}

export function getThermalEvents(filter: {
  confidenceMin?: number;
  riskLevel?: string;
  classification?: string;
  status?: string;
  limit?: number;
} = {}): Record<string, unknown>[] {
  const db = getDb();
  let query = `SELECT * FROM thermal_events WHERE 1=1`;
  const params: (string | number)[] = [];

  if (filter.confidenceMin !== undefined) {
    query += ` AND confidence >= ?`;
    params.push(filter.confidenceMin);
  }
  if (filter.riskLevel) {
    query += ` AND risk_level = ?`;
    params.push(filter.riskLevel.toUpperCase());
  }
  if (filter.classification) {
    query += ` AND classification = ?`;
    params.push(filter.classification);
  }
  if (filter.status) {
    query += ` AND abnormality_status = ?`;
    params.push(filter.status);
  }

  query += ` ORDER BY timestamp DESC LIMIT ?`;
  params.push(filter.limit || 50);

  return db.prepare(query).all(...params) as Record<string, unknown>[];
}

function logIngestionRun(
  source: string,
  satellite: string,
  ingested: number,
  deduplicated: number,
  status: string,
  latencyMs: number,
  error?: string
) {
  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO ingestion_runs (
        id, source, satellite, records_ingested, records_deduplicated,
        status, latency_ms, sync_time, error_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `RUN-${Date.now()}`,
      source,
      satellite,
      ingested,
      deduplicated,
      status,
      latencyMs,
      new Date().toISOString(),
      error || null
    );
  } catch (e) {
    console.error('Failed to log ingestion run:', e);
  }
}
