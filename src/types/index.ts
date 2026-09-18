export type ThermalClassification =
  | 'Industrial Fire'
  | 'Gas Flare'
  | 'Wildfire'
  | 'Agricultural Burning'
  | 'Mining / Furnace Activity'
  | 'Persistent Industrial Thermal Source'
  | 'Unknown / Requires Verification'
  | 'Unknown / Ambiguous';

export type LandCoverType =
  | 'Industrial / Built-up'
  | 'Cropland / Agriculture'
  | 'Dense Forest / Woodland'
  | 'Grassland / Shrubland'
  | 'Shrubland / Grassland'
  | 'Mining / Bare Soil'
  | 'Water / Wetland';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';
export type AbnormalityStatus = 'NORMAL' | 'ABNORMAL' | 'CRITICAL_FIRE';

/**
 * BehaviourStatus — separate from physical classification.
 * Describes whether a facility's thermal output is within its known operating envelope.
 * 
 * NORMAL              — within historical operating envelope
 * ELEVATED            — slightly above envelope, worth monitoring
 * ABNORMAL            — significantly above envelope, investigate
 * EXTREME             — far beyond all historical precedent, escalate immediately
 * INSUFFICIENT_HISTORY — no baseline data available to assess
 * 
 * NOTE: These thresholds are heuristic prototype values documented for SIH 26162.
 * They are not calibrated to a specific false positive rate.
 */
export type BehaviourStatus =
  | 'NORMAL'
  | 'ELEVATED'
  | 'ABNORMAL'
  | 'EXTREME'
  | 'INSUFFICIENT_HISTORY';

/**
 * Facility Thermal Fingerprint — computed from pre-event historical observations only.
 * All statistics calculated strictly from T_history < T_event to prevent temporal leakage.
 */
export interface FacilityThermalFingerprint {
  facilityId: string;
  facilityName: string;
  facilityType: string;
  latitude: number;
  longitude: number;

  // Rolling window medians (robust, computed from pre-event history)
  medianFrp7d: number;
  medianFrp30d: number;
  medianFrp90d: number;
  medianFrp365d: number;

  // Robust spread — MAD (Median Absolute Deviation)
  madFrp30d: number;  // MAD × 1.4826 ≈ σ for normal distributions
  madFrp90d: number;

  // Distribution characteristics
  meanFrp: number;
  p90Frp: number;    // 90th historical percentile
  p95Frp: number;    // 95th historical percentile

  // Activity / recurrence
  activeDays7d: number;
  activeDays30d: number;
  activeDays90d: number;
  recurrenceRatio7d: number;   // activeDays7d / 7
  recurrenceRatio30d: number;  // activeDays30d / 30
  recurrenceRatio90d: number;  // activeDays90d / 90

  // Day/night pattern
  dayDetectionRatio: number;
  nightDetectionRatio: number;
  dayNightFrpRatio: number;

  // Overall persistence
  persistenceScore: number;    // 0–100

  // Seasonal context
  seasonalBaselineMonth: number;  // 1–12
  seasonalFrpMedian: number;

  // Current snapshot
  latestFrp: number;
  latestTimestamp: string;
}

/**
 * Thermal Abnormality Result — output of the facility-specific abnormality detector.
 * 
 * Thresholds (heuristic prototype values for SIH 26162):
 *   0–20:   NORMAL  
 *   21–40:  ELEVATED  
 *   41–60:  ABNORMAL  
 *   61–80:  highly abnormal (classified ABNORMAL)  
 *   81–100: EXTREME
 */
export interface ThermalAbnormalityResult {
  // Core abnormality metrics
  robustZScore: number;        // (frp - median_30d) / (1.4826 * MAD_30d + ε)
  surgeRatio: number;          // frp / max(median_30d, min_baseline_floor)
  thermalAbnormalityScore: number;  // 0–100 composite score
  historicalPercentile: number;    // what percentile is this observation in historical distribution

  // Behaviour status (separate from physical source classification)
  behaviourStatus: BehaviourStatus;

  // Contributing factors
  recurrenceDeviation: number;     // how different is recurrence from historical norm
  abruptOnsetScore: number;        // 0–1, how sudden is this spike vs rolling trend
  persistenceChange: number;       // positive = increasing persistence, negative = dropping
  
  // Operational guidance
  suppressAlert: boolean;          // true = this is expected behaviour, no escalation needed
  escalationRecommended: boolean;  // true = warrants investigation
  
  // Data provenance
  basedOnNDays: number;            // how many historical days the fingerprint is based on
  insufficientHistory: boolean;    // true if < 5 pre-event observations
}

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
  type: 'facility' | 'landcover' | 'intensity' | 'baseline' | 'recurrence' | 'exclusion' | 'behaviour' | 'fingerprint';
  verified: boolean;
}

export interface HistoricalRecord {
  date: string;
  frp: number;
  baseline: number;
  isSpike?: boolean;
  isEnvelopeUpper?: number;  // median + 1.4826*MAD (normal operating envelope upper)
  isEnvelopeLower?: number;  // median - 1.4826*MAD (lower bound)
  p95?: number;              // 95th percentile threshold
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
  modelScore?: number; // same value as confidence but labelled as "Model Score" not calibrated probability
  probabilities: ClassificationProbabilities;
  frp: number; // Fire Radiative Power in MW
  baselineFrp: number; // Historical 30-day median FRP
  baselineFrp90d?: number; // 90-day historical median FRP
  baselineRatio: number; // e.g. 3.6 (current FRP / baseline)
  temperature: number; // in °C (from Brightness T4)
  brightnessT4: number; // in Kelvin
  brightnessT5?: number; // in Kelvin
  anomalyScore: number; // scale 0 - 10

  // Behaviour Intelligence Fields (Phase 1 new fields)
  behaviourStatus: BehaviourStatus;
  thermalAbnormalityScore: number;   // 0–100 composite
  robustZScore: number;              // MAD-based robust z-score
  surgeRatio: number;                // frp / max(median, floor)
  historicalPercentile: number;      // 0–100, what percentile is this in history
  madFrp30d: number;                 // Median Absolute Deviation (30d)
  suppressAlert: boolean;            // true = no emergency
  unknownFlag: boolean;              // true = max class prob < 0.55, requires verification

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

  // Judge Demo marker
  isJudgeDemoAbnormal?: boolean;  // true = the abnormal twin of a normal event
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
  // New behaviour intelligence stats
  abnormalIndustrialEvents: number;      // behaviour ABNORMAL|EXTREME at industrial sites
  persistentSourcesSuppressed: number;   // NORMAL persistent industrial sources (no alert)
  requiresVerification: number;          // unknownFlag=true OR low confidence
  averageAbnormalityScore: number;       // mean thermalAbnormalityScore across all events
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
  suggestedActions?: { label: string; actionKey: string; payload?: unknown }[];
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

// Judge Demo sequence — ordered steps for guided walkthrough
export interface JudgeDemoStep {
  stepNumber: number;
  title: string;
  description: string;
  hotspotId: string | null;
  panelModule: string | null;
  highlight: 'behaviour' | 'fingerprint' | 'why' | 'comparison' | 'benchmark' | 'whatif' | null;
}

export const JUDGE_DEMO_STEPS: JudgeDemoStep[] = [
  {
    stepNumber: 1,
    title: 'Normal Persistent Industrial Flare',
    description: 'Jamnagar Refinery: FRP 112 MW, operating within its 30-day baseline of 108 MW. Behaviour: NORMAL. No emergency. Alert suppressed.',
    hotspotId: 'FLX-JMN-004',
    panelModule: 'Why?',
    highlight: 'fingerprint',
  },
  {
    stepNumber: 2,
    title: 'Same Facility — Abnormal Thermal Spike',
    description: 'Same refinery, same coordinates, same land cover. FRP now 382 MW — 3.54× above baseline. Robust Z-score: 8.4. Behaviour: EXTREME. ESCALATE FOR VERIFICATION.',
    hotspotId: 'FLX-JMN-ABN',
    panelModule: 'Why?',
    highlight: 'behaviour',
  },
  {
    stepNumber: 3,
    title: 'Wildfire — Natural Origin Confirmed',
    description: 'Simlipal Biosphere Reserve: 140 MW, 18 km from any industrial structure, dense forest land cover, 1/30 days recurrence. Wildfire classification: 96% model score.',
    hotspotId: 'FLX-SMP-007',
    panelModule: 'Why?',
    highlight: 'why',
  },
  {
    stepNumber: 4,
    title: 'Agricultural Burning — Seasonal Pattern',
    description: 'Sangrur Punjab: 32 MW, cropland land cover, 2/30 days recurrence. Classic post-harvest stubble burn signature. Medium risk, low urgency.',
    hotspotId: 'FLX-PUN-008',
    panelModule: 'Why?',
    highlight: 'why',
  },
  {
    stepNumber: 5,
    title: 'Mining / Coal Fire — Persistent Source',
    description: 'Jharia Coalfield: 58 MW, 29/30 days recurrence, persistent sub-surface coal combustion within baseline. NORMAL behaviour for this known persistent thermal source.',
    hotspotId: 'FLX-JHR-005',
    panelModule: 'Why?',
    highlight: 'fingerprint',
  },
  {
    stepNumber: 6,
    title: 'Model Benchmark & Ablation Study',
    description: 'Benchmark comparison: Thermal-only vs +Geospatial vs +Temporal vs Full FLAREX. Key question: what does facility historical behaviour add?',
    hotspotId: null,
    panelModule: 'data_model',
    highlight: 'benchmark',
  },
  {
    stepNumber: 7,
    title: 'False-Alarm Suppression Proof',
    description: 'Persistent source suppression rate, industrial abnormal event recall, FP/FN/abstention rates on the curated SIH evaluation dataset.',
    hotspotId: null,
    panelModule: 'data_model',
    highlight: 'comparison',
  },
  {
    stepNumber: 8,
    title: 'What-If Sandbox',
    description: 'Change FRP from 112 → 382 MW on the same Jamnagar facility. Watch the system transition from NORMAL → EXTREME without changing any other parameter.',
    hotspotId: null,
    panelModule: 'whatif',
    highlight: 'whatif',
  },
];
