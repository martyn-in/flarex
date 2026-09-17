/**
 * FLAREX COMPLETE TWO-STAGE INTELLIGENCE PIPELINE
 * Problem Statement ID: 26162 (NTRO)
 * 
 * Pipeline:
 *   1. Raw Hotspot Ingestion (FIRMS VIIRS/MODIS)
 *   2. Geospatial + Temporal Enrichment (OSM, Land Cover, Vegetation/NDVI, Weather, History)
 *   3. Stage A: Spatiotemporal Persistence Analysis
 *   4. If Persistent Source -> Flagged as Persistent Industrial Thermal Source (Gas flare, furnace, kiln, stack)
 *      If Candidate Event   -> Evaluated by Stage B ML Fire-Type Classifier (Industrial Fire / Wildfire / Agri / Mining / Other)
 *   5. Operational Risk Score calculation (strictly distinct from ML class probability)
 *   6. Synthesis of explainability checklist & evidence
 */

import {
  evaluateStageAPersistence,
  computePersistenceRollingFeatures,
  HistoricalObservation,
  SpatialContextInput,
  StageAPersistenceResult,
} from './persistenceEngine';
import {
  predictFireType,
  StageBFeatureInput,
  StageBPredictionOutput,
} from './fireClassifier';

export interface RawHotspotInput {
  id: string;
  latitude: number;
  longitude: number;
  frp: number;
  brightnessT4: number; // in Kelvin
  brightnessT5?: number; // in Kelvin
  confidence: number;
  satellite: string;
  instrument?: string;
  daynight: string;
  scan?: number;
  track?: number;
  timestamp: string;
  acqDate?: string;
  acqTime?: string;
}

export interface EnrichedContextInput {
  // Industrial / OSM
  nearestFacilityName: string;
  nearestFacilityType: string;
  nearestFacilityDistanceKm: number;
  refineryDistanceKm: number;
  oilGasDistanceKm: number;
  powerPlantDistanceKm: number;
  steelPlantDistanceKm: number;
  cementPlantDistanceKm?: number;
  mineDistanceKm: number;
  withinIndustrialArea: boolean;

  // Land Cover & Vegetation
  landCover: string;
  forestDistanceKm: number;
  urbanDistanceKm: number;
  ndvi: number;
  fuelMoisturePct?: number;

  // Weather / Environment
  temperatureC?: number;
  humidityPct?: number;
  windSpeedKmh?: number;
  rainfall24hMm?: number;
  populationDistanceMeters?: number;

  // Historical observations for the site (strictly pre-event)
  historicalObservations: HistoricalObservation[];
}

export interface PipelineClassificationResult {
  hotspotId: string;
  finalClassification:
    | 'Industrial Fire'
    | 'Persistent Industrial Thermal Source'
    | 'Wildfire'
    | 'Agricultural Burning'
    | 'Mining / Colliery Fire'
    | 'Other / Unknown Thermal Anomaly';
  isPersistentSource: boolean;
  persistenceScore: number;
  stageAPersistence: StageAPersistenceResult;
  stageBClassification?: StageBPredictionOutput;
  primaryConfidence: number; // 0.0 to 1.0
  classProbabilities: {
    industrialFire: number;
    persistentSource: number;
    wildfire: number;
    agriculturalBurn: number;
    mining: number;
    otherUnknown: number;
  };
  operationalRiskScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  baselineRatio: number;
  evidence: Array<{
    category: 'persistence' | 'ml_classifier' | 'facility' | 'landcover' | 'intensity' | 'risk';
    text: string;
    verified: boolean;
  }>;
  explanationSummary: string;
  modelVersion: string;
}

/**
 * Calculates operational risk score (0 to 100).
 * IMPORTANT: Operational risk is strictly distinguished from ML class probability.
 * Risk fuses ML industrial fire probability, radiative energy intensity, baseline surge ratio,
 * facility hazard rating, and human settlement proximity.
 */
export function calculateOperationalRiskScore(
  industrialFireProb: number,
  frpMw: number,
  baselineSurgeRatio: number,
  facilityDistanceKm: number,
  isPersistent: boolean,
  populationDistanceMeters?: number
): { score: number; level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' } {
  // If it's a verified persistent flare operating within normal baseline, operational risk is naturally low/medium
  if (isPersistent && baselineSurgeRatio < 1.8) {
    const score = Math.min(45, Math.round(frpMw * 0.25 + 10));
    return {
      score,
      level: score >= 40 ? 'MEDIUM' : 'LOW',
    };
  }

  let riskPoints = 0;

  // 1. Industrial Fire ML Probability (up to 40 pts)
  riskPoints += Math.round(industrialFireProb * 40);

  // 2. Radiative Energy Severity (up to 25 pts)
  if (frpMw >= 150) riskPoints += 25;
  else if (frpMw >= 80) riskPoints += 18;
  else if (frpMw >= 40) riskPoints += 12;
  else if (frpMw >= 15) riskPoints += 6;

  // 3. Baseline Surge Ratio (up to 20 pts)
  if (baselineSurgeRatio >= 3.0) riskPoints += 20;
  else if (baselineSurgeRatio >= 2.0) riskPoints += 14;
  else if (baselineSurgeRatio >= 1.5) riskPoints += 8;

  // 4. Critical Infrastructure Proximity (up to 10 pts)
  if (facilityDistanceKm <= 0.3) riskPoints += 10;
  else if (facilityDistanceKm <= 0.8) riskPoints += 6;
  else if (facilityDistanceKm <= 2.0) riskPoints += 3;

  // 5. Population Settlement Vulnerability (up to 15 pts)
  if (populationDistanceMeters !== undefined) {
    if (populationDistanceMeters <= 500) riskPoints += 15;
    else if (populationDistanceMeters <= 1200) riskPoints += 8;
  }

  const score = Math.min(100, Math.max(5, riskPoints));

  let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (score >= 80) level = 'CRITICAL';
  else if (score >= 60) level = 'HIGH';
  else if (score >= 35) level = 'MEDIUM';

  return { score, level };
}

/**
 * Runs the complete Stage A -> Stage B Intelligence Pipeline
 */
export function processThermalAnomalyPipeline(
  hotspot: RawHotspotInput,
  context: EnrichedContextInput
): PipelineClassificationResult {
  // 1. Prepare Spatial Context
  const spatialContext: SpatialContextInput = {
    nearestIndustrialDistanceKm: context.nearestFacilityDistanceKm,
    nearestOilGasDistanceKm: context.oilGasDistanceKm,
    nearestRefineryDistanceKm: context.refineryDistanceKm,
    nearestPowerPlantDistanceKm: context.powerPlantDistanceKm,
    nearestSteelPlantDistanceKm: context.steelPlantDistanceKm,
    nearestMineDistanceKm: context.mineDistanceKm,
    withinIndustrialArea: context.withinIndustrialArea,
    osmFacilityType: context.nearestFacilityType,
    osmFacilityName: context.nearestFacilityName,
  };

  // 2. Stage A: Spatiotemporal Persistence Analysis
  const rollingFeatures = computePersistenceRollingFeatures(
    hotspot.latitude,
    hotspot.longitude,
    hotspot.frp,
    hotspot.brightnessT4,
    hotspot.timestamp,
    context.historicalObservations,
    spatialContext
  );

  const stageAResult = evaluateStageAPersistence(rollingFeatures);

  const evidenceList: Array<{
    category: 'persistence' | 'ml_classifier' | 'facility' | 'landcover' | 'intensity' | 'risk';
    text: string;
    verified: boolean;
  }> = [];

  // Add Stage A Evidence
  for (const ev of stageAResult.evidence) {
    evidenceList.push({
      category: 'persistence',
      text: ev.signal,
      verified: true,
    });
  }

  evidenceList.push({
    category: 'facility',
    text: `${Math.round(context.nearestFacilityDistanceKm * 1000)} m from ${context.nearestFacilityName} (${context.nearestFacilityType})`,
    verified: true,
  });

  evidenceList.push({
    category: 'landcover',
    text: `Land Cover: ${context.landCover} (10m High-Resolution Classification)`,
    verified: true,
  });

  evidenceList.push({
    category: 'intensity',
    text: `Radiative Radiance: ${hotspot.frp.toFixed(1)} MW | Skin Temp: ${Math.round(hotspot.brightnessT4 - 273.15)}°C (${hotspot.satellite})`,
    verified: true,
  });

  // Check if classified as Persistent Industrial Thermal Source
  if (stageAResult.isPersistentSource) {
    const risk = calculateOperationalRiskScore(
      0.05,
      hotspot.frp,
      stageAResult.frpSurgeRatio,
      context.nearestFacilityDistanceKm,
      true,
      context.populationDistanceMeters
    );

    return {
      hotspotId: hotspot.id,
      finalClassification: 'Persistent Industrial Thermal Source',
      isPersistentSource: true,
      persistenceScore: stageAResult.persistenceScore,
      stageAPersistence: stageAResult,
      primaryConfidence: stageAResult.persistenceScore,
      classProbabilities: {
        industrialFire: 0.05,
        persistentSource: stageAResult.persistenceScore,
        wildfire: 0.02,
        agriculturalBurn: 0.01,
        mining: context.nearestFacilityType.toLowerCase().includes('mine') ? 0.25 : 0.02,
        otherUnknown: 0.05,
      },
      operationalRiskScore: risk.score,
      riskLevel: risk.level,
      baselineRatio: stageAResult.frpSurgeRatio,
      evidence: evidenceList,
      explanationSummary: stageAResult.explanationSummary,
      modelVersion: 'FLAREX-StageA-Spatiotemporal-v2.1',
    };
  }

  // 3. Stage B: ML Fire-Type Classifier (Invoked for Candidate Events)
  const stageBInput: StageBFeatureInput = {
    frpMw: hotspot.frp,
    brightnessTemperature: hotspot.brightnessT4,
    brightnessTi5: hotspot.brightnessT5,
    scan: hotspot.scan,
    track: hotspot.track,
    satelliteSensor: hotspot.satellite,
    instrument: hotspot.instrument || 'VIIRS',
    daynight: hotspot.daynight,
    firmsConfidence: hotspot.confidence,
    latitude: hotspot.latitude,
    longitude: hotspot.longitude,
    landCoverType: context.landCover,
    forestDistanceKm: context.forestDistanceKm,
    urbanDistanceKm: context.urbanDistanceKm,
    industrialDistanceKm: context.nearestFacilityDistanceKm,
    oilGasFacilityDistanceKm: context.oilGasDistanceKm,
    chemicalFacilityDistanceKm: context.refineryDistanceKm,
    ndvi: context.ndvi,
    fuelMoisturePct: context.fuelMoisturePct,
    temperatureC: context.temperatureC,
    humidityPct: context.humidityPct,
    windSpeedKmh: context.windSpeedKmh,
    rainfall24hMm: context.rainfall24hMm,
    historicalFireCount7d: rollingFeatures.detectionCount7d,
    historicalFireCount30d: rollingFeatures.detectionCount30d,
    historicalFireCount90d: rollingFeatures.detectionCount90d,
    historicalFireCount365d: rollingFeatures.detectionCount365d,
    refineryDistanceKm: context.refineryDistanceKm,
    powerPlantDistanceKm: context.powerPlantDistanceKm,
    steelPlantDistanceKm: context.steelPlantDistanceKm,
    cementPlantDistanceKm: context.cementPlantDistanceKm,
    mineDistanceKm: context.mineDistanceKm,
    industrialLanduseDistanceKm: context.nearestFacilityDistanceKm,
    withinIndustrialArea: context.withinIndustrialArea ? 1 : 0,
    nearbyFacilityType: context.nearestFacilityType,
  };

  const stageBResult = predictFireType(stageBInput);

  // Add Stage B Evidence
  for (const exp of stageBResult.evidence) {
    evidenceList.push({
      category: 'ml_classifier',
      text: `${exp.factor}: ${exp.description}`,
      verified: true,
    });
  }

  // Map to human-readable taxonomy
  let finalClass:
    | 'Industrial Fire'
    | 'Persistent Industrial Thermal Source'
    | 'Wildfire'
    | 'Agricultural Burning'
    | 'Mining / Colliery Fire'
    | 'Other / Unknown Thermal Anomaly';

  switch (stageBResult.classification) {
    case 'industrial_fire':
      finalClass = 'Industrial Fire';
      break;
    case 'wildfire':
      finalClass = 'Wildfire';
      break;
    case 'agricultural_burn':
      finalClass = 'Agricultural Burning';
      break;
    case 'mining_fire':
      finalClass = 'Mining / Colliery Fire';
      break;
    default:
      finalClass = 'Other / Unknown Thermal Anomaly';
  }

  const risk = calculateOperationalRiskScore(
    stageBResult.classProbabilities.industrial_fire,
    hotspot.frp,
    stageAResult.frpSurgeRatio,
    context.nearestFacilityDistanceKm,
    false,
    context.populationDistanceMeters
  );

  return {
    hotspotId: hotspot.id,
    finalClassification: finalClass,
    isPersistentSource: false,
    persistenceScore: stageAResult.persistenceScore,
    stageAPersistence: stageAResult,
    stageBClassification: stageBResult,
    primaryConfidence: stageBResult.confidence,
    classProbabilities: {
      industrialFire: stageBResult.classProbabilities.industrial_fire,
      persistentSource: stageAResult.persistenceScore,
      wildfire: stageBResult.classProbabilities.wildfire,
      agriculturalBurn: stageBResult.classProbabilities.agricultural_burn,
      mining: stageBResult.classProbabilities.mining_fire,
      otherUnknown: stageBResult.classProbabilities.other_unknown,
    },
    operationalRiskScore: risk.score,
    riskLevel: risk.level,
    baselineRatio: stageAResult.frpSurgeRatio,
    evidence: evidenceList,
    explanationSummary:
      finalClass === 'Industrial Fire'
        ? `EMERGENCY: Confirmed industrial fire signature (${(stageBResult.confidence * 100).toFixed(0)}% model confidence) with ${stageAResult.frpSurgeRatio.toFixed(1)}× thermal surge within ${Math.round(context.nearestFacilityDistanceKm * 1000)} m of ${context.nearestFacilityName}.`
        : `Detected ${finalClass} (${(stageBResult.confidence * 100).toFixed(0)}% confidence). ${stageBResult.evidence[0]?.description || ''}`,
    modelVersion: stageBResult.modelVersion,
  };
}
