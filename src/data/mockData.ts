export interface Hotspot {
  id: string;
  name: string;
  location: string;
  state: string;
  coordinates: [number, number]; // [lng, lat]
  severity: 'critical' | 'high' | 'medium' | 'low';
  classification:
    | 'Potential Industrial Fire'
    | 'Persistent Thermal Source'
    | 'Industrial Flare Emission'
    | 'Agricultural / Crop Fire'
    | 'Refinery / Chemical Anomaly'
    | 'Mining Thermal Hotspot'
    | 'Uncertain Thermal Cluster';
  confidence: number; // percentage 0 - 100
  frp: number; // Fire Radiative Power in MW
  temperature: number; // in °C
  anomalyScore: number; // scale 0 - 10
  persistenceScore: number; // 0 - 100
  persistence: string; // formatted e.g. "2 / 100"
  history: { date: string; frp: number; baseline: number }[];
  nearestFacility: {
    name: string;
    category: string;
    distance: string;
    hazardRating: 'Critical' | 'High' | 'Moderate';
  };
  aiReasons: string[];
  timestamp: string;
  satellite: string;
}

export interface IndustrialFacility {
  id: string;
  name: string;
  type: string;
  location: string;
  state: string;
  coordinates: [number, number]; // [lng, lat]
  hazardRating: 'High' | 'Moderate' | 'Critical';
  sector: string;
  activePermits: number;
}

export const INDUSTRIAL_FACILITIES: IndustrialFacility[] = [
  {
    id: 'FAC-GJ-01',
    name: 'Dahej Petrochemical & Chemical SEZ',
    type: 'Petrochemical & Chemical Complex',
    location: 'Dahej, Bharuch',
    state: 'Gujarat',
    coordinates: [72.58, 21.70],
    hazardRating: 'Critical',
    sector: 'Chemical & Petrochemical',
    activePermits: 48,
  },
  {
    id: 'FAC-GJ-02',
    name: 'Reliance Jamnagar Refining Complex',
    type: 'Mega Oil Refinery & Polypropylene',
    location: 'Motikhavdi, Jamnagar',
    state: 'Gujarat',
    coordinates: [70.02, 22.42],
    hazardRating: 'High',
    sector: 'Refinery',
    activePermits: 64,
  },
  {
    id: 'FAC-GJ-03',
    name: 'Hazira Petrochemicals & LNG Hub',
    type: 'LNG Terminal & Gas Chemical Zone',
    location: 'Hazira, Surat',
    state: 'Gujarat',
    coordinates: [72.65, 21.12],
    hazardRating: 'High',
    sector: 'Oil & Gas',
    activePermits: 36,
  },
  {
    id: 'FAC-JH-01',
    name: 'Bokaro Steel Plant & Coking Ovens',
    type: 'Integrated Steel Plant',
    location: 'Bokaro Steel City',
    state: 'Jharkhand',
    coordinates: [85.98, 23.67],
    hazardRating: 'High',
    sector: 'Steel & Metallurgy',
    activePermits: 28,
  },
  {
    id: 'FAC-JH-02',
    name: 'Jharia Coalfield Thermal Zone',
    type: 'Open-Cast Coal Mining & Colliery',
    location: 'Dhanbad',
    state: 'Jharkhand',
    coordinates: [86.42, 23.75],
    hazardRating: 'Critical',
    sector: 'Mining',
    activePermits: 19,
  },
  {
    id: 'FAC-CG-01',
    name: 'Korba Super Thermal Power Complex',
    type: '2600MW Coal Thermal Power Plant',
    location: 'Korba Industrial Belt',
    state: 'Chhattisgarh',
    coordinates: [82.68, 22.36],
    hazardRating: 'High',
    sector: 'Thermal Power',
    activePermits: 32,
  },
  {
    id: 'FAC-AS-01',
    name: 'Digboi & Assam Oil Field',
    type: 'Crude Oil Processing & Gas Unit',
    location: 'Digboi, Tinsukia',
    state: 'Assam',
    coordinates: [94.55, 26.60],
    hazardRating: 'Moderate',
    sector: 'Oil & Gas',
    activePermits: 14,
  },
  {
    id: 'FAC-MH-01',
    name: 'Chandrapur Super Thermal Station',
    type: '3340MW Thermal Station & Coalfield',
    location: 'Chandrapur',
    state: 'Maharashtra',
    coordinates: [79.30, 19.98],
    hazardRating: 'Moderate',
    sector: 'Thermal Power',
    activePermits: 30,
  },
];

export const HOTSPOTS_DATA: Hotspot[] = [
  {
    id: 'INC-IND-2025-0524-0847',
    name: 'Potential Industrial Fire',
    location: 'Dahej SEZ, Gujarat',
    state: 'Gujarat',
    coordinates: [72.70, 21.68],
    severity: 'critical',
    classification: 'Potential Industrial Fire',
    confidence: 92,
    frp: 84.6,
    temperature: 51.2,
    anomalyScore: 9.2,
    persistenceScore: 2,
    persistence: '2 / 100',
    history: [
      { date: '18 May', frp: 18.2, baseline: 24.0 },
      { date: '19 May', frp: 22.4, baseline: 24.0 },
      { date: '20 May', frp: 21.0, baseline: 24.0 },
      { date: '21 May', frp: 25.5, baseline: 24.0 },
      { date: '22 May', frp: 28.1, baseline: 24.0 },
      { date: '23 May', frp: 31.4, baseline: 24.0 },
      { date: '24 May', frp: 84.6, baseline: 24.0 },
    ],
    nearestFacility: {
      name: 'Dahej Petrochemical & Chemical SEZ',
      category: 'Chemical & Petrochemical',
      distance: '1.4 km',
      hazardRating: 'Critical',
    },
    aiReasons: [
      'FRP significantly above baseline',
      'Low historical persistence',
      'Located near industrial infrastructure',
    ],
    timestamp: '2025-05-24 09:41:20 IST',
    satellite: 'VIIRS NOAA-20 (375m NRT)',
  },
  {
    id: 'INC-IND-2025-0524-0812',
    name: 'Thermal Anomaly (Slag / Furnace)',
    location: 'Jharia - Bokaro, Jharkhand',
    state: 'Jharkhand',
    coordinates: [85.98, 23.67],
    severity: 'critical',
    classification: 'Persistent Thermal Source',
    confidence: 88,
    frp: 62.4,
    temperature: 46.8,
    anomalyScore: 8.4,
    persistenceScore: 78,
    persistence: '78 / 100',
    history: [
      { date: '18 May', frp: 58.0, baseline: 60.0 },
      { date: '19 May', frp: 61.2, baseline: 60.0 },
      { date: '20 May', frp: 59.8, baseline: 60.0 },
      { date: '21 May', frp: 64.0, baseline: 60.0 },
      { date: '22 May', frp: 60.5, baseline: 60.0 },
      { date: '23 May', frp: 63.1, baseline: 60.0 },
      { date: '24 May', frp: 62.4, baseline: 60.0 },
    ],
    nearestFacility: {
      name: 'Bokaro Steel Plant & Coking Ovens',
      category: 'Steel & Metallurgy',
      distance: '0.8 km',
      hazardRating: 'High',
    },
    aiReasons: [
      'High multi-day persistence consistent with steel manufacturing',
      'Thermal output matches continuous blast furnace cycle',
      'Stable baseline variance over 30-day window',
    ],
    timestamp: '2025-05-24 09:35:10 IST',
    satellite: 'VIIRS Suomi-NPP (375m)',
  },
  {
    id: 'INC-IND-2025-0524-0790',
    name: 'Industrial Flare Emission',
    location: 'Assam Industrial Belt, Assam',
    state: 'Assam',
    coordinates: [94.55, 26.60],
    severity: 'high',
    classification: 'Industrial Flare Emission',
    confidence: 84,
    frp: 54.1,
    temperature: 44.5,
    anomalyScore: 7.9,
    persistenceScore: 65,
    persistence: '65 / 100',
    history: [
      { date: '18 May', frp: 42.0, baseline: 46.0 },
      { date: '19 May', frp: 45.3, baseline: 46.0 },
      { date: '20 May', frp: 48.0, baseline: 46.0 },
      { date: '21 May', frp: 46.5, baseline: 46.0 },
      { date: '22 May', frp: 50.1, baseline: 46.0 },
      { date: '23 May', frp: 52.8, baseline: 46.0 },
      { date: '24 May', frp: 54.1, baseline: 46.0 },
    ],
    nearestFacility: {
      name: 'Digboi & Assam Oil Field',
      category: 'Oil & Gas',
      distance: '2.1 km',
      hazardRating: 'Moderate',
    },
    aiReasons: [
      'Point source emission matching operational flare stack',
      'Elevated thermal radiance above seasonal background',
      'Coincident with known petrochemical processing permit',
    ],
    timestamp: '2025-05-24 09:20:44 IST',
    satellite: 'MODIS Aqua (1km)',
  },
  {
    id: 'INC-IND-2025-0524-0651',
    name: 'Agricultural / Crop Residue Fire',
    location: 'Punjab - Haryana Border',
    state: 'Punjab',
    coordinates: [76.50, 28.80],
    severity: 'high',
    classification: 'Agricultural / Crop Fire',
    confidence: 76,
    frp: 38.2,
    temperature: 39.8,
    anomalyScore: 6.8,
    persistenceScore: 12,
    persistence: '12 / 100',
    history: [
      { date: '18 May', frp: 12.0, baseline: 15.0 },
      { date: '19 May', frp: 18.5, baseline: 15.0 },
      { date: '20 May', frp: 32.0, baseline: 15.0 },
      { date: '21 May', frp: 28.4, baseline: 15.0 },
      { date: '22 May', frp: 35.1, baseline: 15.0 },
      { date: '23 May', frp: 36.9, baseline: 15.0 },
      { date: '24 May', frp: 38.2, baseline: 15.0 },
    ],
    nearestFacility: {
      name: 'Rural Agricultural Belt (Non-Industrial)',
      category: 'Agriculture',
      distance: '14.8 km',
      hazardRating: 'Moderate',
    },
    aiReasons: [
      'Transient spatial cluster on agricultural landuse parcel',
      'Low persistence index characteristic of biomass burn',
      'Zero proximity to SEZ or hazardous chemical corridors',
    ],
    timestamp: '2025-05-24 08:55:12 IST',
    satellite: 'MODIS Terra (1km)',
  },
  {
    id: 'INC-IND-2025-0524-0430',
    name: 'Thermal Power Plant Heat',
    location: 'Korba - Singrauli Basin',
    state: 'Chhattisgarh',
    coordinates: [82.68, 22.36],
    severity: 'high',
    classification: 'Persistent Thermal Source',
    confidence: 81,
    frp: 46.3,
    temperature: 42.0,
    anomalyScore: 7.4,
    persistenceScore: 91,
    persistence: '91 / 100',
    history: [
      { date: '18 May', frp: 44.0, baseline: 45.0 },
      { date: '19 May', frp: 45.2, baseline: 45.0 },
      { date: '20 May', frp: 46.0, baseline: 45.0 },
      { date: '21 May', frp: 44.8, baseline: 45.0 },
      { date: '22 May', frp: 45.5, baseline: 45.0 },
      { date: '23 May', frp: 47.0, baseline: 45.0 },
      { date: '24 May', frp: 46.3, baseline: 45.0 },
    ],
    nearestFacility: {
      name: 'Korba Super Thermal Power Complex',
      category: 'Thermal Power',
      distance: '0.6 km',
      hazardRating: 'High',
    },
    aiReasons: [
      'Continuous thermal cooling and boiler stack operation',
      'Extremely high 91% persistence score over 90 days',
      'Spatial match with licensed power generation block',
    ],
    timestamp: '2025-05-24 08:30:00 IST',
    satellite: 'VIIRS NOAA-20 (375m)',
  },
  {
    id: 'INC-IND-2025-0524-0088',
    name: 'Refinery Flare Anomaly',
    location: 'Jamnagar Coast, Gujarat',
    state: 'Gujarat',
    coordinates: [70.02, 22.42],
    severity: 'medium',
    classification: 'Refinery / Chemical Anomaly',
    confidence: 75,
    frp: 35.8,
    temperature: 40.1,
    anomalyScore: 6.4,
    persistenceScore: 82,
    persistence: '82 / 100',
    history: [
      { date: '18 May', frp: 32.0, baseline: 34.0 },
      { date: '19 May', frp: 33.5, baseline: 34.0 },
      { date: '20 May', frp: 35.0, baseline: 34.0 },
      { date: '21 May', frp: 34.2, baseline: 34.0 },
      { date: '22 May', frp: 36.1, baseline: 34.0 },
      { date: '23 May', frp: 37.0, baseline: 34.0 },
      { date: '24 May', frp: 35.8, baseline: 34.0 },
    ],
    nearestFacility: {
      name: 'Reliance Jamnagar Refining Complex',
      category: 'Refinery',
      distance: '1.1 km',
      hazardRating: 'High',
    },
    aiReasons: [
      'High-pressure flare stack thermal release',
      'Consistent with scheduled refinery operational venting',
      'Bounded inside industrial buffer perimeter',
    ],
    timestamp: '2025-05-24 06:44:19 IST',
    satellite: 'VIIRS Suomi-NPP (375m)',
  },
  {
    id: 'INC-IND-2025-0524-0044',
    name: 'Petrochemical Process Heat',
    location: 'Hazira, Surat, Gujarat',
    state: 'Gujarat',
    coordinates: [72.65, 21.12],
    severity: 'low',
    classification: 'Refinery / Chemical Anomaly',
    confidence: 68,
    frp: 19.4,
    temperature: 34.9,
    anomalyScore: 4.5,
    persistenceScore: 74,
    persistence: '74 / 100',
    history: [
      { date: '18 May', frp: 17.0, baseline: 19.0 },
      { date: '19 May', frp: 18.2, baseline: 19.0 },
      { date: '20 May', frp: 19.5, baseline: 19.0 },
      { date: '21 May', frp: 18.9, baseline: 19.0 },
      { date: '22 May', frp: 20.1, baseline: 19.0 },
      { date: '23 May', frp: 21.0, baseline: 19.0 },
      { date: '24 May', frp: 19.4, baseline: 19.0 },
    ],
    nearestFacility: {
      name: 'Hazira Petrochemicals & LNG Hub',
      category: 'Oil & Gas',
      distance: '1.8 km',
      hazardRating: 'High',
    },
    aiReasons: [
      'Low thermal radiance within routine operating tolerances',
      'Regular baseline pattern observed across recent weeks',
      'No secondary smoke plume or rapid thermal spike detected',
    ],
    timestamp: '2025-05-24 05:50:30 IST',
    satellite: 'MODIS Aqua (1km)',
  },
];

export const SYSTEM_OPERATIONAL_STATS = {
  activeHotspots: 1247,
  criticalAlerts: 12,
  persistentSources: 892,
  averageConfidence: 92,
  systemHealth: 98.6,
  totalFrp: 464.3,
  avgAnomaly: 7.1,
  lastSync: '09:42:18 IST',
  latency: '2.3s',
};

export const DATA_SOURCES_LIST = [
  { name: 'NASA FIRMS Stream', status: 'Online', sensor: 'NRT Data Stream', latency: '2.3s' },
  { name: 'VIIRS NOAA-20', status: 'Online', sensor: '375m Active Fire Band', latency: '1.8s' },
  { name: 'VIIRS NOAA-21', status: 'Online', sensor: '375m Polar Constellation', latency: '2.1s' },
  { name: 'MODIS (Aqua & Terra)', status: 'Online', sensor: '1km Thermal Inversion', latency: '3.4s' },
  { name: 'OpenStreetMap', status: 'Ready', sensor: 'Industrial Boundaries Cache', latency: '42ms' },
  { name: 'Satellite Imagery', status: 'Available', sensor: 'High-Res Esri World Imagery', latency: '65ms' },
];

export const REPORTS_LIST = [
  {
    id: 'REP-2025-0524-A',
    name: 'Daily Intelligence Summary',
    date: '24 May 2025',
    type: 'Operational Briefing (PDF)',
    size: '1.4 MB',
  },
  {
    id: 'REP-2025-0524-B',
    name: 'Critical Incident Report — Dahej SEZ',
    date: '24 May 2025',
    type: 'Incident Assessment (PDF)',
    size: '2.1 MB',
  },
  {
    id: 'REP-2025-0523-C',
    name: 'Persistent Source Spatial Catalog',
    date: '23 May 2025',
    type: 'GIS Dataset (GeoJSON/CSV)',
    size: '4.8 MB',
  },
];
