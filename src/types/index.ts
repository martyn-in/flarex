export type ThermalClassification =
  | 'Industrial Fire'
  | 'Gas Flare'
  | 'Wildfire'
  | 'Agricultural Burning'
  | 'Mining / Furnace Activity'
  | 'Unknown / Ambiguous';

export type LandCoverType =
  | 'Industrial / Built-up'
  | 'Cropland / Agriculture'
  | 'Dense Forest / Woodland'
  | 'Grassland / Shrubland'
  | 'Mining / Bare Soil'
  | 'Water / Wetland';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';
export type AbnormalityStatus = 'NORMAL' | 'ABNORMAL' | 'CRITICAL_FIRE';

export interface ClassificationProbabilities {
  industrialFire: number;
  gasFlare: number;
  wildfire: number;
  agriculturalBurn: number;
  mining: number;
  unknown: number;
}

export interface ExplainabilityReason {
  text: string;
  type: 'facility' | 'landcover' | 'intensity' | 'baseline' | 'recurrence' | 'exclusion';
  verified: boolean;
}

export interface HistoricalRecord {
  date: string;
  frp: number;
  baseline: number;
  isSpike?: boolean;
}

export interface NearestFacilityInfo {
  name: string;
  category: string;
  type: string;
  distance: string; // e.g. "180 m" or "1.4 km"
  distanceMeters: number;
  hazardRating: 'Critical' | 'High' | 'Moderate';
  permitStatus?: string;
}

export interface PopulationContext {
  distanceMeters: number;
  densityCategory: 'Dense Urban' | 'Town / Settlement' | 'Rural Population' | 'Sparse / Industrial Buffer';
  populationExposedEstimate: number;
}

export interface SentinelImageryInfo {
  tileId: string;
  cloudCoverPct: number;
  acquisitionDate: string;
  visualAvailable: boolean;
}

export interface Hotspot {
  id: string;
  eventId: string;
  name: string;
  location: string;
  state: string;
  district?: string;
  coordinates: [number, number]; // [lng, lat]
  severity: SeverityLevel;
  status: AbnormalityStatus;
  classification: ThermalClassification;
  confidence: number; // percentage 0 - 100
  probabilities: ClassificationProbabilities;
  frp: number; // Fire Radiative Power in MW
  baselineFrp: number; // Historical typical FRP
  baselineRatio: number; // e.g. 3.6 (current FRP / baseline)
  temperature: number; // in °C (from Brightness T4)
  brightnessT4: number; // in Kelvin
  brightnessT5?: number; // in Kelvin
  anomalyScore: number; // scale 0 - 10
  persistenceScore: number; // 0 - 100
  persistenceDays: string; // e.g. "27 / 30 days"
  landCover: LandCoverType;
  distanceToForestMeters: number;
  distanceToAgriMeters: number;
  populationContext: PopulationContext;
  sentinelImagery: SentinelImageryInfo;
  history: HistoricalRecord[];
  nearestFacility: NearestFacilityInfo;
  aiReasons: ExplainabilityReason[];
  timestamp: string;
  satellite: string;
  instrument: string;
  daynight: 'D' | 'N';
}

export interface IndustrialFacility {
  id: string;
  name: string;
  type: string;
  location: string;
  state: string;
  coordinates: [number, number]; // [lng, lat]
  hazardRating: 'Critical' | 'High' | 'Moderate';
  sector: string;
  activePermits: number;
  typicalFRP: number;
}

export interface SystemOperationalStats {
  activeHotspots: number;
  industrialFires: number;
  persistentSources: number;
  criticalAlerts: number;
  abnormalSources: number;
  averageConfidence: number;
  totalFrp: number;
  systemHealth: number;
  lastSync: string;
  latency: string;
}

export interface AIAssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  highlightFacilities?: string[];
  suggestedActions?: { label: string; actionKey: string; payload?: any }[];
}

export interface DataSourceStatus {
  name: string;
  type: 'Satellite Constellation' | 'GIS Context' | 'Land Cover' | 'Optical Verification' | 'AI Inference';
  status: 'Online' | 'Synchronized' | 'Ready' | 'Available';
  latency: string;
  description: string;
  recordsCount?: number;
  lastSync: string;
}
