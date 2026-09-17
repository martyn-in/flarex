/**
 * FLAREX STAGE A — SPATIOTEMPORAL PERSISTENCE ANALYSIS ENGINE
 * Problem Statement ID: 26162 (NTRO)
 * 
 * A persistent thermal source is fundamentally a SPATIOTEMPORAL SITE.
 * Stage A identifies or creates spatial thermal clusters and computes comprehensive
 * 7d / 30d / 90d / 365d rolling temporal features and FRP stability metrics.
 * 
 * NOTE: Stage A is explicitly implemented as a transparent, auditable geospatial &
 * temporal scoring/rule system (NOT an ML model), producing an interpretable persistence
 * score and evidence signals. It outputs either a Persistent Industrial Thermal Source
 * or a Candidate Thermal Event passed to Stage B.
 */

export interface HistoricalObservation {
  latitude: number;
  longitude: number;
  acqDate: string;
  acqTime: string;
  datetime: string;
  frp: number;
  brightness: number;
  satellite: string;
  confidence: number;
  daynight?: string;
}

export interface SpatialContextInput {
  nearestIndustrialDistanceKm: number;
  nearestOilGasDistanceKm: number;
  nearestRefineryDistanceKm: number;
  nearestPowerPlantDistanceKm: number;
  nearestSteelPlantDistanceKm: number;
  nearestMineDistanceKm: number;
  withinIndustrialArea: boolean;
  osmFacilityType: string;
  osmFacilityName?: string;
}

export interface PersistenceRollingFeatures {
  // Active Days
  activeDays7d: number;
  activeDays30d: number;
  activeDays90d: number;
  activeDays365d: number;

  // Detection Counts
  detectionCount7d: number;
  detectionCount30d: number;
  detectionCount90d: number;
  detectionCount365d: number;

  // Detection Frequencies (detections / days in window)
  detectionFrequency30d: number;
  detectionFrequency90d: number;
  detectionFrequency365d: number;

  // Temporal Extent
  daysSinceFirstDetection: number;
  daysSinceLastDetection: number;

  // Radiative Power Statistics
  currentFrp: number;
  meanFrp30d: number;
  medianFrp30d: number;
  meanFrp90d: number;
  medianFrp90d: number;
  maxFrp90d: number;
  frpStd90d: number;
  frpCoefficientOfVariation: number;

  // Brightness Temperature Statistics
  brightnessMean: number;
  brightnessStd: number;

  // Gap & Regularity Metrics
  meanGapBetweenDetectionsDays: number;
  gapStdDays: number;
  temporalRegularity: number; // 0 (erratic) to 1 (clockwork recurrence)
  consecutiveActiveDays: number;

  // Day/Night Observation Ratios
  nightDetectionRatio: number;
  dayDetectionRatio: number;

  // Spatial Variance
  hotspotClusterRadiusKm: number;
  spatialVarianceKm2: number;

  // Industrial Geospatial Context
  nearestIndustrialDistanceKm: number;
  nearestOilGasDistanceKm: number;
  nearestRefineryDistanceKm: number;
  nearestPowerPlantDistanceKm: number;
  nearestSteelPlantDistanceKm: number;
  nearestMineDistanceKm: number;
  osmIndustrialAreaIntersection: boolean;
  osmFacilityType: string;
}

export interface PersistenceEvidence {
  signal: string;
  weight: 'high' | 'medium' | 'low';
  favorableToPersistence: boolean;
  metricValue: string | number;
}

export interface StageAPersistenceResult {
  isPersistentSource: boolean;
  persistenceScore: number; // 0.0 to 1.0 (0% - 100%)
  classification: 'Persistent Industrial Thermal Source' | 'Candidate Thermal Event';
  baselineFrp: number;
  frpSurgeRatio: number; // currentFrp / baselineFrp
  rollingFeatures: PersistenceRollingFeatures;
  evidence: PersistenceEvidence[];
  explanationSummary: string;
}

// Haversine distance in kilometers
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371.0; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper: Calculate median of an array
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Helper: Calculate standard deviation
function calculateStd(values: number[], mean: number): number {
  if (values.length <= 1) return 0;
  const sumSquares = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
  return Math.sqrt(sumSquares / (values.length - 1));
}

/**
 * Computes comprehensive Stage A Rolling Persistence Features from historical observations
 * strictly respecting the detection timestamp (preventing temporal leakage).
 */
export function computePersistenceRollingFeatures(
  currentLat: number,
  currentLon: number,
  currentFrp: number,
  currentBrightness: number,
  currentTimestamp: string,
  history: HistoricalObservation[],
  spatialContext: SpatialContextInput,
  clusterRadiusKm = 0.8 // Standard 375m-800m sensor cluster window
): PersistenceRollingFeatures {
  const currentTimeMs = new Date(currentTimestamp).getTime();

  // 1. Filter observations: strictly BEFORE or AT current timestamp, and within cluster radius
  const clusterObs = history.filter((obs) => {
    const obsTimeMs = new Date(obs.datetime).getTime();
    if (isNaN(obsTimeMs) || obsTimeMs > currentTimeMs) {
      return false; // Temporal boundary: eliminate future records
    }
    const distKm = haversineDistanceKm(currentLat, currentLon, obs.latitude, obs.longitude);
    return distKm <= clusterRadiusKm;
  });

  // Unique active days in different windows (7d, 30d, 90d, 365d)
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const days7Limit = currentTimeMs - 7 * MS_PER_DAY;
  const days30Limit = currentTimeMs - 30 * MS_PER_DAY;
  const days90Limit = currentTimeMs - 90 * MS_PER_DAY;
  const days365Limit = currentTimeMs - 365 * MS_PER_DAY;

  const dates7d = new Set<string>();
  const dates30d = new Set<string>();
  const dates90d = new Set<string>();
  const dates365d = new Set<string>();

  const frp30d: number[] = [];
  const frp90d: number[] = [];
  const brightnessList: number[] = [currentBrightness];
  const timestampsMs: number[] = [];

  let nightCount = 0;
  let totalCount = 0;

  for (const obs of clusterObs) {
    const t = new Date(obs.datetime).getTime();
    const dateStr = obs.acqDate || obs.datetime.slice(0, 10);
    timestampsMs.push(t);
    totalCount++;

    if (obs.daynight === 'N') nightCount++;
    brightnessList.push(obs.brightness);

    if (t >= days7Limit) dates7d.add(dateStr);
    if (t >= days30Limit) {
      dates30d.add(dateStr);
      frp30d.push(obs.frp);
    }
    if (t >= days90Limit) {
      dates90d.add(dateStr);
      frp90d.push(obs.frp);
    }
    if (t >= days365Limit) {
      dates365d.add(dateStr);
    }
  }

  // Include current observation in current lists
  frp30d.push(currentFrp);
  frp90d.push(currentFrp);
  timestampsMs.push(currentTimeMs);
  dates30d.add(currentTimestamp.slice(0, 10));
  dates90d.add(currentTimestamp.slice(0, 10));
  dates365d.add(currentTimestamp.slice(0, 10));

  timestampsMs.sort((a, b) => a - b);

  // Time since first and last
  const daysSinceFirst = timestampsMs.length > 0
    ? Math.max(0, (currentTimeMs - timestampsMs[0]) / MS_PER_DAY)
    : 0;

  const daysSinceLast = timestampsMs.length > 1
    ? Math.max(0, (currentTimeMs - timestampsMs[timestampsMs.length - 2]) / MS_PER_DAY)
    : 0;

  // FRP Stats
  const meanFrp30 = frp30d.reduce((a, b) => a + b, 0) / (frp30d.length || 1);
  const medianFrp30 = calculateMedian(frp30d);

  const meanFrp90 = frp90d.reduce((a, b) => a + b, 0) / (frp90d.length || 1);
  const medianFrp90 = calculateMedian(frp90d);
  const maxFrp90 = Math.max(...frp90d);
  const frpStd90 = calculateStd(frp90d, meanFrp90);
  const frpCv = meanFrp90 > 0 ? frpStd90 / meanFrp90 : 0;

  // Brightness Stats
  const meanBright = brightnessList.reduce((a, b) => a + b, 0) / (brightnessList.length || 1);
  const stdBright = calculateStd(brightnessList, meanBright);

  // Gap between detections
  const gapsDays: number[] = [];
  for (let i = 1; i < timestampsMs.length; i++) {
    const gap = (timestampsMs[i] - timestampsMs[i - 1]) / MS_PER_DAY;
    if (gap > 0) gapsDays.push(gap);
  }
  const meanGap = gapsDays.length > 0
    ? gapsDays.reduce((a, b) => a + b, 0) / gapsDays.length
    : 30;
  const stdGap = calculateStd(gapsDays, meanGap);

  // Temporal regularity: coefficient of variation inverse on gaps
  const gapCv = meanGap > 0 ? stdGap / meanGap : 1.0;
  const temporalRegularity = Math.max(0, Math.min(1.0, 1.0 / (1.0 + gapCv)));

  // Consecutive active days
  let maxConsecutive = 1;
  let currentStreak = 1;
  const sortedDates = Array.from(dates90d).sort();
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]).getTime();
    const curr = new Date(sortedDates[i]).getTime();
    if (Math.round((curr - prev) / MS_PER_DAY) === 1) {
      currentStreak++;
      if (currentStreak > maxConsecutive) maxConsecutive = currentStreak;
    } else {
      currentStreak = 1;
    }
  }

  // Day/Night ratios
  const nightRatio = totalCount > 0 ? nightCount / totalCount : 0.5;
  const dayRatio = 1.0 - nightRatio;

  // Spatial spread
  let maxClusterDistKm = 0.05;
  let sumSqDist = 0;
  for (const obs of clusterObs) {
    const d = haversineDistanceKm(currentLat, currentLon, obs.latitude, obs.longitude);
    if (d > maxClusterDistKm) maxClusterDistKm = d;
    sumSqDist += d * d;
  }
  const spatialVariance = clusterObs.length > 0 ? sumSqDist / clusterObs.length : 0.001;

  return {
    activeDays7d: dates7d.size,
    activeDays30d: dates30d.size,
    activeDays90d: dates90d.size,
    activeDays365d: dates365d.size,
    detectionCount7d: clusterObs.filter((o) => new Date(o.datetime).getTime() >= days7Limit).length,
    detectionCount30d: frp30d.length,
    detectionCount90d: frp90d.length,
    detectionCount365d: totalCount + 1,
    detectionFrequency30d: Math.round((dates30d.size / 30) * 100) / 100,
    detectionFrequency90d: Math.round((dates90d.size / 90) * 100) / 100,
    detectionFrequency365d: Math.round((dates365d.size / 365) * 100) / 100,
    daysSinceFirstDetection: Math.round(daysSinceFirst * 10) / 10,
    daysSinceLastDetection: Math.round(daysSinceLast * 10) / 10,
    currentFrp: Math.round(currentFrp * 10) / 10,
    meanFrp30d: Math.round(meanFrp30 * 10) / 10,
    medianFrp30d: Math.round(medianFrp30 * 10) / 10,
    meanFrp90d: Math.round(meanFrp90 * 10) / 10,
    medianFrp90d: Math.round(medianFrp90 * 10) / 10,
    maxFrp90d: Math.round(maxFrp90 * 10) / 10,
    frpStd90d: Math.round(frpStd90 * 10) / 10,
    frpCoefficientOfVariation: Math.round(frpCv * 100) / 100,
    brightnessMean: Math.round(meanBright * 10) / 10,
    brightnessStd: Math.round(stdBright * 10) / 10,
    meanGapBetweenDetectionsDays: Math.round(meanGap * 10) / 10,
    gapStdDays: Math.round(stdGap * 10) / 10,
    temporalRegularity: Math.round(temporalRegularity * 100) / 100,
    consecutiveActiveDays: maxConsecutive,
    nightDetectionRatio: Math.round(nightRatio * 100) / 100,
    dayDetectionRatio: Math.round(dayRatio * 100) / 100,
    hotspotClusterRadiusKm: Math.round(maxClusterDistKm * 1000) / 1000,
    spatialVarianceKm2: Math.round(spatialVariance * 10000) / 10000,
    nearestIndustrialDistanceKm: spatialContext.nearestIndustrialDistanceKm,
    nearestOilGasDistanceKm: spatialContext.nearestOilGasDistanceKm,
    nearestRefineryDistanceKm: spatialContext.nearestRefineryDistanceKm,
    nearestPowerPlantDistanceKm: spatialContext.nearestPowerPlantDistanceKm,
    nearestSteelPlantDistanceKm: spatialContext.nearestSteelPlantDistanceKm,
    nearestMineDistanceKm: spatialContext.nearestMineDistanceKm,
    osmIndustrialAreaIntersection: spatialContext.withinIndustrialArea,
    osmFacilityType: spatialContext.osmFacilityType,
  };
}

/**
 * Transparent Stage A Persistence Scoring & Evaluation Rule System
 * Evaluates whether a thermal cluster represents a Persistent Industrial Thermal Source
 * (e.g. gas flare, steel furnace, refinery stack) OR a Candidate Event for Stage B.
 */
export function evaluateStageAPersistence(features: PersistenceRollingFeatures): StageAPersistenceResult {
  const evidence: PersistenceEvidence[] = [];
  let scorePoints = 0;
  const maxPoints = 100;

  const baselineFrp = features.medianFrp90d > 0 ? features.medianFrp90d : features.meanFrp30d || 20.0;
  const frpSurgeRatio = baselineFrp > 0 ? Math.round((features.currentFrp / baselineFrp) * 100) / 100 : 1.0;

  // 1. Multi-Window Temporal Recurrence (up to 40 pts)
  if (features.activeDays90d >= 45) {
    scorePoints += 40;
    evidence.push({
      signal: `Extremely high 90-day recurrence: detected on ${features.activeDays90d} of previous 90 days (${Math.round(features.detectionFrequency90d * 100)}% active)`,
      weight: 'high',
      favorableToPersistence: true,
      metricValue: `${features.activeDays90d} / 90d`,
    });
  } else if (features.activeDays30d >= 15) {
    scorePoints += 30;
    evidence.push({
      signal: `High 30-day recurrence: detected on ${features.activeDays30d} of previous 30 days`,
      weight: 'high',
      favorableToPersistence: true,
      metricValue: `${features.activeDays30d} / 30d`,
    });
  } else if (features.activeDays30d >= 6) {
    scorePoints += 15;
    evidence.push({
      signal: `Moderate temporal recurrence: detected on ${features.activeDays30d} of previous 30 days`,
      weight: 'medium',
      favorableToPersistence: true,
      metricValue: `${features.activeDays30d} / 30d`,
    });
  } else {
    // Low history -> Candidate event
    evidence.push({
      signal: `Low historical recurrence: only ${features.activeDays30d} active days in past 30 days (sudden/transient onset)`,
      weight: 'high',
      favorableToPersistence: false,
      metricValue: `${features.activeDays30d} / 30d`,
    });
  }

  // 2. FRP Thermal Stability vs Sudden Spike (up to 25 pts)
  if (frpSurgeRatio >= 2.2) {
    // Critical sudden surge -> NOT normal persistence!
    scorePoints = Math.max(0, scorePoints - 35);
    evidence.push({
      signal: `Critical thermal surge: current FRP (${features.currentFrp} MW) is ${frpSurgeRatio}× above baseline (${baselineFrp} MW typical)`,
      weight: 'high',
      favorableToPersistence: false,
      metricValue: `${frpSurgeRatio}× baseline`,
    });
  } else if (features.frpCoefficientOfVariation <= 0.35 && features.activeDays30d >= 5) {
    scorePoints += 25;
    evidence.push({
      signal: `FRP variability is low (CV: ${features.frpCoefficientOfVariation}): median FRP is stable around ${features.medianFrp90d} MW`,
      weight: 'high',
      favorableToPersistence: true,
      metricValue: `CV: ${features.frpCoefficientOfVariation}`,
    });
  } else if (features.frpCoefficientOfVariation <= 0.65 && features.activeDays30d >= 4) {
    scorePoints += 15;
    evidence.push({
      signal: `FRP variability moderate (CV: ${features.frpCoefficientOfVariation}) with recurring baseline`,
      weight: 'medium',
      favorableToPersistence: true,
      metricValue: `CV: ${features.frpCoefficientOfVariation}`,
    });
  }

  // 3. Industrial Infrastructure Context (up to 20 pts)
  // (NOTE: Proximity alone is never sufficient; combined with temporal recurrence)
  const isNearRefineryOrPetro =
    features.nearestRefineryDistanceKm <= 1.2 ||
    features.nearestOilGasDistanceKm <= 1.2 ||
    features.osmFacilityType.toLowerCase().includes('refinery') ||
    features.osmFacilityType.toLowerCase().includes('petro') ||
    features.osmFacilityType.toLowerCase().includes('flare');

  if (features.osmIndustrialAreaIntersection || features.nearestIndustrialDistanceKm <= 0.5) {
    if (isNearRefineryOrPetro) {
      scorePoints += 20;
      evidence.push({
        signal: `Industrial infrastructure overlap: ${Math.round(features.nearestRefineryDistanceKm * 1000)} m from ${features.osmFacilityType}`,
        weight: 'high',
        favorableToPersistence: true,
        metricValue: `${features.nearestRefineryDistanceKm} km`,
      });
    } else {
      scorePoints += 12;
      evidence.push({
        signal: `Located in industrial zone (${Math.round(features.nearestIndustrialDistanceKm * 1000)} m from nearest facility)`,
        weight: 'medium',
        favorableToPersistence: true,
        metricValue: `${features.nearestIndustrialDistanceKm} km`,
      });
    }
  } else if (features.nearestIndustrialDistanceKm > 3.0) {
    evidence.push({
      signal: `Isolated from industrial infrastructure (${features.nearestIndustrialDistanceKm.toFixed(1)} km to industrial assets)`,
      weight: 'high',
      favorableToPersistence: false,
      metricValue: `${features.nearestIndustrialDistanceKm} km`,
    });
  }

  // 4. Repeated Night-time Detection (up to 15 pts)
  // Industrial stacks & continuous flares operate around the clock, producing distinct night-time signatures
  if (features.nightDetectionRatio >= 0.35 && features.detectionCount30d >= 3) {
    scorePoints += 15;
    evidence.push({
      signal: `Repeated nocturnal detections: ${Math.round(features.nightDetectionRatio * 100)}% of detections observed at night (consistent with continuous 24/7 process heat)`,
      weight: 'medium',
      favorableToPersistence: true,
      metricValue: `${Math.round(features.nightDetectionRatio * 100)}% night`,
    });
  }

  const persistenceScore = Math.max(0.02, Math.min(0.98, Math.round((scorePoints / maxPoints) * 100) / 100));
  const isPersistentSource = persistenceScore >= 0.65 && frpSurgeRatio < 2.0;

  const classification = isPersistentSource
    ? 'Persistent Industrial Thermal Source'
    : 'Candidate Thermal Event';

  const explanationSummary = isPersistentSource
    ? `Persistent industrial thermal source verified: detected on ${features.activeDays90d} of previous 90 days with low FRP variability (CV: ${features.frpCoefficientOfVariation}) within ${Math.round(features.nearestIndustrialDistanceKm * 1000)} m of ${features.osmFacilityType}.`
    : frpSurgeRatio >= 2.0
    ? `Candidate event: sudden thermal surge (${frpSurgeRatio}× above baseline) detected near ${features.osmFacilityType}; routed to Stage B classifier.`
    : `Candidate event: thermal anomaly with low historical recurrence (${features.activeDays30d}/30 days); routed to Stage B ML classifier.`;

  return {
    isPersistentSource,
    persistenceScore,
    classification,
    baselineFrp,
    frpSurgeRatio,
    rollingFeatures: features,
    evidence,
    explanationSummary,
  };
}
