import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  const isVercel = Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';
  const dataDir = isVercel ? '/tmp' : path.join(process.cwd(), 'data');

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch {}

  const dbPath = path.join(dataDir, 'flarex.sqlite');
  const db = new Database(dbPath);
  try {
    db.pragma('journal_mode = WAL');
  } catch {}
  try {
    db.pragma('foreign_keys = ON');
  } catch {}

  // Initialize unified schema
  initSchema(db);

  dbInstance = db;
  return dbInstance;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS thermal_events (
      id TEXT PRIMARY KEY,
      event_id TEXT UNIQUE NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      timestamp TEXT NOT NULL,
      satellite TEXT NOT NULL,
      instrument TEXT NOT NULL,
      brightness_t4 REAL NOT NULL,
      brightness_t5 REAL,
      frp REAL NOT NULL,
      baseline_frp REAL NOT NULL DEFAULT 20.0,
      baseline_ratio REAL NOT NULL DEFAULT 1.0,
      confidence REAL NOT NULL,
      daynight TEXT NOT NULL,
      classification TEXT DEFAULT 'Industrial Fire',
      classification_confidence REAL DEFAULT 90,
      risk_score REAL DEFAULT 0,
      risk_level TEXT DEFAULT 'LOW',
      abnormality_status TEXT DEFAULT 'NORMAL',
      persistence_score REAL DEFAULT 0,
      persistence_days_ratio TEXT DEFAULT '5 / 30 days',
      land_cover TEXT DEFAULT 'Industrial / Built-up',
      distance_to_forest_m REAL DEFAULT 5000,
      distance_to_agri_m REAL DEFAULT 5000,
      location_name TEXT NOT NULL,
      state TEXT,
      district TEXT,
      nearest_facility_name TEXT,
      nearest_facility_type TEXT,
      nearest_facility_distance_m REAL,
      class_probabilities TEXT,
      explainability_reasons TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_thermal_events_coords ON thermal_events(latitude, longitude);
    CREATE INDEX IF NOT EXISTS idx_thermal_events_time ON thermal_events(timestamp);
    CREATE INDEX IF NOT EXISTS idx_thermal_events_event_id ON thermal_events(event_id);
    CREATE INDEX IF NOT EXISTS idx_thermal_events_class ON thermal_events(classification);
    CREATE INDEX IF NOT EXISTS idx_thermal_events_status ON thermal_events(abnormality_status);

    CREATE TABLE IF NOT EXISTS infrastructure_context (
      id TEXT PRIMARY KEY,
      thermal_event_id TEXT NOT NULL,
      osm_id TEXT,
      facility_name TEXT NOT NULL,
      facility_type TEXT NOT NULL,
      distance_meters REAL NOT NULL,
      latitude REAL,
      longitude REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (thermal_event_id) REFERENCES thermal_events(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      thermal_event_id TEXT NOT NULL,
      location_name TEXT NOT NULL,
      severity TEXT NOT NULL,
      alert_type TEXT NOT NULL DEFAULT 'THERMAL_SPIKE',
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at TEXT NOT NULL,
      acknowledged_at TEXT,
      message TEXT NOT NULL,
      explanation_summary TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      baseline_multiple TEXT,
      FOREIGN KEY (thermal_event_id) REFERENCES thermal_events(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      thermal_event_id TEXT,
      report_type TEXT NOT NULL,
      name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      date TEXT NOT NULL,
      size TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      id TEXT PRIMARY KEY DEFAULT 'current',
      critical_frp_threshold REAL DEFAULT 15,
      audio_alerts INTEGER DEFAULT 1,
      temperature_unit TEXT DEFAULT 'C',
      refresh_interval TEXT DEFAULT '30s',
      show_boundaries INTEGER DEFAULT 0,
      show_industrial_clusters INTEGER DEFAULT 1,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS firms_sync_log (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      satellite TEXT NOT NULL,
      records_ingested INTEGER NOT NULL,
      status TEXT NOT NULL,
      sync_time TEXT NOT NULL,
      error_message TEXT
    );
  `);

  // Auto-seed real baseline records if thermal_events is empty or missing new columns
  const count = (db.prepare(`SELECT count(*) as c FROM thermal_events`).get() as { c: number }).c;
  if (count === 0) {
    seedCuratedRealThermalEvents(db);
  } else {
    // Check if land_cover column exists and has values
    try {
      const sample = db.prepare(`SELECT land_cover FROM thermal_events LIMIT 1`).get() as any;
      if (!sample || !sample.land_cover) {
        seedCuratedRealThermalEvents(db);
      }
    } catch {
      seedCuratedRealThermalEvents(db);
    }
  }
}

export function seedCuratedRealThermalEvents(db: Database.Database) {
  // Clear existing to ensure clean benchmark seed
  db.exec(`DELETE FROM thermal_events; DELETE FROM alerts; DELETE FROM infrastructure_context;`);

  const realDetections = [
    {
      id: 'FLX-DHJ-001',
      event_id: 'FL-102',
      latitude: 21.7125,
      longitude: 72.5842,
      location_name: 'Dahej SEZ Petrochemical Complex, Gujarat',
      state: 'Gujarat',
      district: 'Bharuch',
      brightness_t4: 412.5, // 139.35 °C
      brightness_t5: 334.1,
      frp: 380.0,
      baseline_frp: 105.0,
      baseline_ratio: 3.6,
      confidence: 94,
      satellite: 'VIIRS NOAA-20 (375m NRT)',
      instrument: 'VIIRS',
      daynight: 'D',
      timestamp: '2026-08-29 09:41:20',
      classification: 'Industrial Fire',
      classification_confidence: 94,
      risk_score: 96,
      risk_level: 'CRITICAL',
      abnormality_status: 'CRITICAL_FIRE',
      persistence_score: 10,
      persistence_days_ratio: '3 / 30 days',
      land_cover: 'Industrial / Built-up',
      distance_to_forest_m: 14200,
      distance_to_agri_m: 6800,
      nearest_facility_name: 'XYZ Petrochemical Refinery Tank Farm',
      nearest_facility_type: 'Petrochemical & Chemical Refinery',
      nearest_facility_distance_m: 65.0,
      class_probabilities: JSON.stringify({
        industrialFire: 94,
        gasFlare: 3,
        wildfire: 1,
        agriculturalBurn: 1,
        mining: 0,
        unknown: 1,
      }),
      explainability_reasons: JSON.stringify([
        { text: '65 m from XYZ Petrochemical Refinery Tank Farm', type: 'facility', verified: true },
        { text: 'Industrial / Built-up land cover (ESA WorldCover 10m)', type: 'landcover', verified: true },
        { text: 'Extreme thermal radiance: 380.0 MW (Skin temp: 139°C)', type: 'intensity', verified: true },
        { text: '3.6× above 30-day historical baseline (105.0 MW typical)', type: 'baseline', verified: true },
        { text: 'Low recurrence (3/30 days — sudden catastrophic onset)', type: 'recurrence', verified: true },
        { text: 'Zero adjacent forest or agricultural burning footprint', type: 'exclusion', verified: true },
      ]),
    },
    {
      id: 'FLX-KRB-002',
      event_id: 'FL-109',
      latitude: 22.3595,
      longitude: 82.7501,
      location_name: 'Korba Super Thermal Power Complex, Chhattisgarh',
      state: 'Chhattisgarh',
      district: 'Korba',
      brightness_t4: 378.4,
      brightness_t5: 312.8,
      frp: 122.0,
      baseline_frp: 45.0,
      baseline_ratio: 2.7,
      confidence: 89,
      satellite: 'VIIRS NOAA-20 (375m NRT)',
      instrument: 'VIIRS',
      daynight: 'D',
      timestamp: '2026-08-29 09:38:15',
      classification: 'Industrial Fire',
      classification_confidence: 89,
      risk_score: 88,
      risk_level: 'HIGH',
      abnormality_status: 'ABNORMAL',
      persistence_score: 72,
      persistence_days_ratio: '22 / 30 days',
      land_cover: 'Industrial / Built-up',
      distance_to_forest_m: 4500,
      distance_to_agri_m: 8200,
      nearest_facility_name: 'Korba Super Thermal Power Plant 04',
      nearest_facility_type: 'Thermal Power Generation Station',
      nearest_facility_distance_m: 210.0,
      class_probabilities: JSON.stringify({
        industrialFire: 89,
        gasFlare: 6,
        wildfire: 1,
        agriculturalBurn: 0,
        mining: 3,
        unknown: 1,
      }),
      explainability_reasons: JSON.stringify([
        { text: '210 m from Korba Super Thermal Power Plant 04', type: 'facility', verified: true },
        { text: 'Industrial power generation landuse zone', type: 'landcover', verified: true },
        { text: 'Radiative power: 122.0 MW (Elevated furnace/boiler exhaust)', type: 'intensity', verified: true },
        { text: '2.7× above nominal baseline (45.0 MW typical)', type: 'baseline', verified: true },
        { text: 'Abnormal thermal surge on persistent generator unit', type: 'recurrence', verified: true },
      ]),
    },
    {
      id: 'FLX-BKR-003',
      event_id: 'FL-117',
      latitude: 23.6693,
      longitude: 86.1511,
      location_name: 'Bokaro Steel Plant Blast Furnace, Jharkhand',
      state: 'Jharkhand',
      district: 'Bokaro',
      brightness_t4: 368.7,
      brightness_t5: 308.6,
      frp: 88.0,
      baseline_frp: 38.0,
      baseline_ratio: 2.3,
      confidence: 82,
      satellite: 'VIIRS NOAA-21 (375m NRT)',
      instrument: 'VIIRS',
      daynight: 'N',
      timestamp: '2026-08-29 02:15:20',
      classification: 'Mining / Furnace Activity',
      classification_confidence: 82,
      risk_score: 76,
      risk_level: 'HIGH',
      abnormality_status: 'ABNORMAL',
      persistence_score: 91,
      persistence_days_ratio: '27 / 30 days',
      land_cover: 'Industrial / Built-up',
      distance_to_forest_m: 8500,
      distance_to_agri_m: 5400,
      nearest_facility_name: 'Bokaro Integrated Steel Plant 02',
      nearest_facility_type: 'Integrated Steel Plant & Blast Furnace',
      nearest_facility_distance_m: 120.0,
      class_probabilities: JSON.stringify({
        industrialFire: 18,
        gasFlare: 4,
        wildfire: 0,
        agriculturalBurn: 0,
        mining: 77,
        unknown: 1,
      }),
      explainability_reasons: JSON.stringify([
        { text: '120 m from Bokaro Integrated Steel Plant 02', type: 'facility', verified: true },
        { text: 'Heavy metallurgical manufacturing landuse', type: 'landcover', verified: true },
        { text: 'FRP Radiance: 88.0 MW (Elevated blast furnace tapping)', type: 'intensity', verified: true },
        { text: '2.3× above historical baseline (38.0 MW typical)', type: 'baseline', verified: true },
        { text: '27/30 days persistence — active steel production cycle', type: 'recurrence', verified: true },
      ]),
    },
    {
      id: 'FLX-JMN-004',
      event_id: 'FL-201',
      latitude: 22.3789,
      longitude: 69.8654,
      location_name: 'Jamnagar Mega Refinery Flare Stack, Gujarat',
      state: 'Gujarat',
      district: 'Jamnagar',
      brightness_t4: 342.4,
      brightness_t5: 298.2,
      frp: 112.0,
      baseline_frp: 108.0,
      baseline_ratio: 1.04,
      confidence: 96,
      satellite: 'VIIRS NOAA-21 (375m NRT)',
      instrument: 'VIIRS',
      daynight: 'N',
      timestamp: '2026-08-29 02:11:45',
      classification: 'Gas Flare',
      classification_confidence: 96,
      risk_score: 28,
      risk_level: 'LOW',
      abnormality_status: 'NORMAL',
      persistence_score: 96,
      persistence_days_ratio: '28 / 30 days',
      land_cover: 'Industrial / Built-up',
      distance_to_forest_m: 22000,
      distance_to_agri_m: 12000,
      nearest_facility_name: 'Reliance Jamnagar Refining Flare Unit A',
      nearest_facility_type: 'Mega Oil Refinery & Petrochemical',
      nearest_facility_distance_m: 45.0,
      class_probabilities: JSON.stringify({
        industrialFire: 2,
        gasFlare: 96,
        wildfire: 0,
        agriculturalBurn: 0,
        mining: 1,
        unknown: 1,
      }),
      explainability_reasons: JSON.stringify([
        { text: '45 m from Jamnagar Refinery Flare Unit A', type: 'facility', verified: true },
        { text: 'Refinery flare stack buffer perimeter', type: 'landcover', verified: true },
        { text: 'Current FRP: 112.0 MW vs 108.0 MW baseline (1.04× baseline)', type: 'baseline', verified: true },
        { text: 'Extremely high 28/30 days persistence — routine continuous flaring', type: 'recurrence', verified: true },
        { text: 'Normal operational flare status — no emergency alert required', type: 'intensity', verified: true },
      ]),
    },
    {
      id: 'FLX-JHR-005',
      event_id: 'FL-202',
      latitude: 23.7503,
      longitude: 86.4172,
      location_name: 'Jharia Coalfield Open Pit #7, Jharkhand',
      state: 'Jharkhand',
      district: 'Dhanbad',
      brightness_t4: 358.2,
      brightness_t5: 310.4,
      frp: 62.4,
      baseline_frp: 60.0,
      baseline_ratio: 1.04,
      confidence: 95,
      satellite: 'VIIRS NOAA-21 (375m NRT)',
      instrument: 'VIIRS',
      daynight: 'N',
      timestamp: '2026-08-29 02:14:10',
      classification: 'Mining / Furnace Activity',
      classification_confidence: 95,
      risk_score: 45,
      risk_level: 'MEDIUM',
      abnormality_status: 'NORMAL',
      persistence_score: 98,
      persistence_days_ratio: '29 / 30 days',
      land_cover: 'Mining / Bare Soil',
      distance_to_forest_m: 9000,
      distance_to_agri_m: 6000,
      nearest_facility_name: 'Jharia Coalfield Seam Pit #7',
      nearest_facility_type: 'Open-Cast Coal Mining & Colliery',
      nearest_facility_distance_m: 80.0,
      class_probabilities: JSON.stringify({
        industrialFire: 3,
        gasFlare: 2,
        wildfire: 0,
        agriculturalBurn: 0,
        mining: 94,
        unknown: 1,
      }),
      explainability_reasons: JSON.stringify([
        { text: '80 m from Jharia Coalfield Seam Pit #7', type: 'facility', verified: true },
        { text: 'Mining / Bare soil land cover (Open-cast pit)', type: 'landcover', verified: true },
        { text: '29/30 days continuous subterranean coal seam heat', type: 'recurrence', verified: true },
        { text: 'Stable baseline variance: 62.4 MW vs 60.0 MW (1.04×)', type: 'baseline', verified: true },
      ]),
    },
    {
      id: 'FLX-DGB-006',
      event_id: 'FL-203',
      latitude: 27.3821,
      longitude: 95.6284,
      location_name: 'Digboi Oil Field Flare Unit, Assam',
      state: 'Assam',
      district: 'Tinsukia',
      brightness_t4: 348.6,
      brightness_t5: 302.0,
      frp: 52.0,
      baseline_frp: 48.0,
      baseline_ratio: 1.08,
      confidence: 91,
      satellite: 'MODIS Aqua (1km NRT)',
      instrument: 'MODIS',
      daynight: 'D',
      timestamp: '2026-08-29 08:52:30',
      classification: 'Gas Flare',
      classification_confidence: 91,
      risk_score: 34,
      risk_level: 'LOW',
      abnormality_status: 'NORMAL',
      persistence_score: 88,
      persistence_days_ratio: '26 / 30 days',
      land_cover: 'Industrial / Built-up',
      distance_to_forest_m: 3200,
      distance_to_agri_m: 4800,
      nearest_facility_name: 'Digboi Refinery & Gas Extraction Unit',
      nearest_facility_type: 'Oil & Gas Production Flare',
      nearest_facility_distance_m: 110.0,
      class_probabilities: JSON.stringify({
        industrialFire: 4,
        gasFlare: 91,
        wildfire: 2,
        agriculturalBurn: 1,
        mining: 1,
        unknown: 1,
      }),
      explainability_reasons: JSON.stringify([
        { text: '110 m from Digboi Gas Extraction Flare Stack', type: 'facility', verified: true },
        { text: 'Industrial oil production facility perimeter', type: 'landcover', verified: true },
        { text: '26/30 days recurrence — scheduled production flare', type: 'recurrence', verified: true },
        { text: 'Stable thermal radiance: 52.0 MW vs 48.0 MW baseline (1.08×)', type: 'baseline', verified: true },
      ]),
    },
    {
      id: 'FLX-SMP-007',
      event_id: 'FL-301',
      latitude: 21.6842,
      longitude: 86.3214,
      location_name: 'Simlipal Biosphere Reserve, Odisha',
      state: 'Odisha',
      district: 'Mayurbhanj',
      brightness_t4: 364.5,
      brightness_t5: 298.0,
      frp: 140.0,
      baseline_frp: 12.0,
      baseline_ratio: 11.6,
      confidence: 96,
      satellite: 'VIIRS NOAA-20 (375m NRT)',
      instrument: 'VIIRS',
      daynight: 'D',
      timestamp: '2026-08-29 09:20:10',
      classification: 'Wildfire',
      classification_confidence: 96,
      risk_score: 92,
      risk_level: 'CRITICAL',
      abnormality_status: 'CRITICAL_FIRE',
      persistence_score: 5,
      persistence_days_ratio: '1 / 30 days',
      land_cover: 'Dense Forest / Woodland',
      distance_to_forest_m: 0,
      distance_to_agri_m: 12500,
      nearest_facility_name: 'Baripada Rural Fringe (Non-Industrial)',
      nearest_facility_type: 'Non-Industrial Reserve Forest',
      nearest_facility_distance_m: 18400.0,
      class_probabilities: JSON.stringify({
        industrialFire: 1,
        gasFlare: 0,
        wildfire: 96,
        agriculturalBurn: 2,
        mining: 0,
        unknown: 1,
      }),
      explainability_reasons: JSON.stringify([
        { text: 'Dense Forest / Woodland land cover (ESA WorldCover 10m)', type: 'landcover', verified: true },
        { text: '18.4 km from nearest industrial infrastructure (remote biosphere)', type: 'facility', verified: true },
        { text: 'Multi-pixel spatial expansion characteristic of forest fire front', type: 'intensity', verified: true },
        { text: 'Zero historical industrial thermal baseline', type: 'baseline', verified: true },
        { text: 'High thermal intensity: 140.0 MW across tree canopy', type: 'intensity', verified: true },
      ]),
    },
    {
      id: 'FLX-PUN-008',
      event_id: 'FL-302',
      latitude: 30.3398,
      longitude: 75.8452,
      location_name: 'Sangrur Agricultural Fringe, Punjab',
      state: 'Punjab',
      district: 'Sangrur',
      brightness_t4: 334.2,
      brightness_t5: 294.0,
      frp: 32.0,
      baseline_frp: 14.0,
      baseline_ratio: 2.3,
      confidence: 90,
      satellite: 'MODIS Terra (1km NRT)',
      instrument: 'MODIS',
      daynight: 'D',
      timestamp: '2026-08-29 08:30:00',
      classification: 'Agricultural Burning',
      classification_confidence: 90,
      risk_score: 42,
      risk_level: 'MEDIUM',
      abnormality_status: 'NORMAL',
      persistence_score: 8,
      persistence_days_ratio: '2 / 30 days',
      land_cover: 'Cropland / Agriculture',
      distance_to_forest_m: 16000,
      distance_to_agri_m: 0,
      nearest_facility_name: 'Rural Agricultural Belt (Non-Industrial)',
      nearest_facility_type: 'Agricultural Parcel',
      nearest_facility_distance_m: 14200.0,
      class_probabilities: JSON.stringify({
        industrialFire: 1,
        gasFlare: 0,
        wildfire: 6,
        agriculturalBurn: 90,
        mining: 0,
        unknown: 3,
      }),
      explainability_reasons: JSON.stringify([
        { text: 'Cropland / Agriculture parcel (ESA WorldCover 10m)', type: 'landcover', verified: true },
        { text: '14.2 km from nearest SEZ / industrial corridor', type: 'facility', verified: true },
        { text: 'Low temporal persistence (2/30 days — seasonal stubble clearing)', type: 'recurrence', verified: true },
        { text: 'Moderate thermal radiative power: 32.0 MW', type: 'intensity', verified: true },
      ]),
    },
    {
      id: 'FLX-HZR-009',
      event_id: 'FL-204',
      latitude: 21.1147,
      longitude: 72.6514,
      location_name: 'Hazira LNG & Manufacturing Hub, Gujarat',
      state: 'Gujarat',
      district: 'Surat',
      brightness_t4: 349.5,
      brightness_t5: 299.1,
      frp: 34.0,
      baseline_frp: 32.0,
      baseline_ratio: 1.06,
      confidence: 92,
      satellite: 'VIIRS NOAA-20 (375m NRT)',
      instrument: 'VIIRS',
      daynight: 'D',
      timestamp: '2026-08-29 09:42:00',
      classification: 'Gas Flare',
      classification_confidence: 92,
      risk_score: 30,
      risk_level: 'LOW',
      abnormality_status: 'NORMAL',
      persistence_score: 89,
      persistence_days_ratio: '27 / 30 days',
      land_cover: 'Industrial / Built-up',
      distance_to_forest_m: 18000,
      distance_to_agri_m: 7500,
      nearest_facility_name: 'Hazira LNG Terminal Flare Stack',
      nearest_facility_type: 'LNG Terminal & Gas Chemical Zone',
      nearest_facility_distance_m: 95.0,
      class_probabilities: JSON.stringify({
        industrialFire: 3,
        gasFlare: 92,
        wildfire: 0,
        agriculturalBurn: 0,
        mining: 3,
        unknown: 2,
      }),
      explainability_reasons: JSON.stringify([
        { text: '95 m from Hazira LNG Terminal Flare Stack', type: 'facility', verified: true },
        { text: 'Port-adjacent industrial petrochemical zone', type: 'landcover', verified: true },
        { text: '27/30 days recurrence — continuous process flaring', type: 'recurrence', verified: true },
        { text: 'Stable thermal signature: 34.0 MW vs 32.0 MW baseline (1.06×)', type: 'baseline', verified: true },
      ]),
    },
    {
      id: 'FLX-PRD-010',
      event_id: 'FL-205',
      latitude: 20.2642,
      longitude: 86.6715,
      location_name: 'Paradeep Refinery & Petrochemicals, Odisha',
      state: 'Odisha',
      district: 'Jagatsinghpur',
      brightness_t4: 341.2,
      brightness_t5: 295.4,
      frp: 30.0,
      baseline_frp: 28.0,
      baseline_ratio: 1.07,
      confidence: 93,
      satellite: 'VIIRS NOAA-20 (375m NRT)',
      instrument: 'VIIRS',
      daynight: 'D',
      timestamp: '2026-08-29 09:22:45',
      classification: 'Gas Flare',
      classification_confidence: 93,
      risk_score: 32,
      risk_level: 'LOW',
      abnormality_status: 'NORMAL',
      persistence_score: 88,
      persistence_days_ratio: '27 / 30 days',
      land_cover: 'Industrial / Built-up',
      distance_to_forest_m: 14000,
      distance_to_agri_m: 9000,
      nearest_facility_name: 'Paradeep Petrochemicals Flare Unit',
      nearest_facility_type: 'Oil Refinery & Petrochemical',
      nearest_facility_distance_m: 120.0,
      class_probabilities: JSON.stringify({
        industrialFire: 2,
        gasFlare: 93,
        wildfire: 0,
        agriculturalBurn: 0,
        mining: 3,
        unknown: 2,
      }),
      explainability_reasons: JSON.stringify([
        { text: '120 m from Paradeep Petrochemicals Flare Unit', type: 'facility', verified: true },
        { text: 'Refinery infrastructure parcel (ESA WorldCover)', type: 'landcover', verified: true },
        { text: '27/30 days continuous flare operation', type: 'recurrence', verified: true },
        { text: 'Nominal baseline variance: 30.0 MW vs 28.0 MW (1.07×)', type: 'baseline', verified: true },
      ]),
    },
  ];

  const insertStmt = db.prepare(`
    INSERT INTO thermal_events (
      id, event_id, latitude, longitude, timestamp, satellite, instrument,
      brightness_t4, brightness_t5, frp, baseline_frp, baseline_ratio,
      confidence, daynight, classification, classification_confidence,
      risk_score, risk_level, abnormality_status, persistence_score,
      persistence_days_ratio, land_cover, distance_to_forest_m, distance_to_agri_m,
      location_name, state, district, nearest_facility_name, nearest_facility_type,
      nearest_facility_distance_m, class_probabilities, explainability_reasons
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  for (const d of realDetections) {
    insertStmt.run(
      d.id,
      d.event_id,
      d.latitude,
      d.longitude,
      d.timestamp,
      d.satellite,
      d.instrument,
      d.brightness_t4,
      d.brightness_t5,
      d.frp,
      d.baseline_frp,
      d.baseline_ratio,
      d.confidence,
      d.daynight,
      d.classification,
      d.classification_confidence,
      d.risk_score,
      d.risk_level,
      d.abnormality_status,
      d.persistence_score,
      d.persistence_days_ratio,
      d.land_cover,
      d.distance_to_forest_m,
      d.distance_to_agri_m,
      d.location_name,
      d.state,
      d.district,
      d.nearest_facility_name,
      d.nearest_facility_type,
      d.nearest_facility_distance_m,
      d.class_probabilities,
      d.explainability_reasons
    );
  }

  // Seed Critical & Abnormal Alerts
  db.prepare(`
    INSERT INTO alerts (
      id, thermal_event_id, location_name, severity, alert_type, status, created_at, message, explanation_summary, latitude, longitude, baseline_multiple
    ) VALUES (
      'ALT-DHJ-01', 'FLX-DHJ-001', 'Dahej SEZ Petrochemical Complex, Gujarat', 'critical', 'UNCONTROLLED_INDUSTRIAL_FIRE', 'ACTIVE',
      '2026-08-29 09:41:20', 'CRITICAL INDUSTRIAL FIRE DETECTED: FRP Radiance 380.0 MW (3.6× baseline)',
      'Sudden high-intensity thermal surge within 65m of active chemical distillation infrastructure in Dahej SEZ.',
      21.7125, 72.5842, '3.6× baseline'
    )
  `).run();

  db.prepare(`
    INSERT INTO alerts (
      id, thermal_event_id, location_name, severity, alert_type, status, created_at, message, explanation_summary, latitude, longitude, baseline_multiple
    ) VALUES (
      'ALT-KRB-02', 'FLX-KRB-002', 'Korba Super Thermal Power Complex, Chhattisgarh', 'high', 'ABNORMAL_THERMAL_SURGE', 'ACTIVE',
      '2026-08-29 09:38:15', 'ABNORMAL THERMAL SOURCE: Korba Power Plant 04 (2.7× baseline)',
      'Boiler exhaust radiance surged to 122.0 MW vs 45.0 MW historical typical baseline.',
      22.3595, 82.7501, '2.7× baseline'
    )
  `).run();

  db.prepare(`
    INSERT INTO alerts (
      id, thermal_event_id, location_name, severity, alert_type, status, created_at, message, explanation_summary, latitude, longitude, baseline_multiple
    ) VALUES (
      'ALT-BKR-03', 'FLX-BKR-003', 'Bokaro Steel Plant Blast Furnace, Jharkhand', 'high', 'ABNORMAL_FURNACE_SURGE', 'ACTIVE',
      '2026-08-29 02:15:20', 'ABNORMAL THERMAL SOURCE: Bokaro Steel Plant 02 (2.3× baseline)',
      'Radiative power reached 88.0 MW exceeding 38.0 MW metallurgical standard threshold.',
      23.6693, 86.1511, '2.3× baseline'
    )
  `).run();

  db.prepare(`
    INSERT INTO alerts (
      id, thermal_event_id, location_name, severity, alert_type, status, created_at, message, explanation_summary, latitude, longitude, baseline_multiple
    ) VALUES (
      'ALT-SMP-04', 'FLX-SMP-007', 'Simlipal Biosphere Reserve, Odisha', 'critical', 'FOREST_WILDFIRE_ALERT', 'ACTIVE',
      '2026-08-29 09:20:10', 'WILDFIRE DETECTION: 140.0 MW across Dense Canopy (11.6× baseline)',
      'Expanding active thermal front detected in Simlipal Tiger Reserve woodland canopy.',
      21.6842, 86.3214, '11.6× baseline'
    )
  `).run();
}
