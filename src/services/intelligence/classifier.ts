import {
  ThermalClassification,
  LandCoverType,
  ClassificationProbabilities,
  ExplainabilityReason,
  AbnormalityStatus,
  SeverityLevel,
} from '@/types';

export interface RawAnomalyFeatureInput {
  frp: number;
  brightnessT4: number; // in Kelvin
  brightnessT5?: number; // in Kelvin
  confidence: number;
  satellite: string;
  facilityDistanceMeters: number;
  facilityType: string;
  facilityName: string;
  landCover: LandCoverType;
  historicalBaselineFrp: number;
  persistenceDaysOutOf30: number;
  distanceToForestMeters: number;
  distanceToAgriMeters: number;
  populationDistanceMeters?: number;
}

export interface ClassificationResult {
  classification: ThermalClassification;
  confidence: number;
  probabilities: ClassificationProbabilities;
  status: AbnormalityStatus;
  severity: SeverityLevel;
  baselineRatio: number;
  anomalyScore: number;
  explainability: ExplainabilityReason[];
}

export function classifyThermalAnomaly(input: RawAnomalyFeatureInput): ClassificationResult {
  const {
    frp,
    brightnessT4,
    facilityDistanceMeters,
    facilityType,
    facilityName,
    landCover,
    historicalBaselineFrp,
    persistenceDaysOutOf30,
    distanceToForestMeters,
    distanceToAgriMeters,
  } = input;

  const baselineRatio =
    historicalBaselineFrp > 0
      ? Math.round((frp / historicalBaselineFrp) * 10) / 10
      : Math.round((frp / 20.0) * 10) / 10;

  const isNearFacility = facilityDistanceMeters <= 500;
  const isModerateDistance = facilityDistanceMeters > 500 && facilityDistanceMeters <= 2500;
  const isHighPersistence = persistenceDaysOutOf30 >= 18;
  const isSuddenSpike = baselineRatio >= 2.2 || (frp > 60 && persistenceDaysOutOf30 <= 8);
  const isIndustrialLand = landCover === 'Industrial / Built-up';
  const isForest = landCover === 'Dense Forest / Woodland' || distanceToForestMeters < 300;
  const isCropland = landCover === 'Cropland / Agriculture' || distanceToAgriMeters < 300;
  const isMiningLand = landCover === 'Mining / Bare Soil' || facilityType.toLowerCase().includes('mine');

  // Probability weight vector accumulator
  let pIndustrialFire = 5;
  let pGasFlare = 5;
  let pWildfire = 5;
  let pAgri = 5;
  let pMining = 5;
  let pUnknown = 5;

  // 1. Facility & Spatial Rules
  if (isNearFacility) {
    if (facilityType.toLowerCase().includes('refinery') || facilityType.toLowerCase().includes('petro') || facilityType.toLowerCase().includes('chemical')) {
      if (isSuddenSpike) {
        pIndustrialFire += 85;
        pGasFlare += 10;
      } else {
        pGasFlare += 80;
        pIndustrialFire += 10;
      }
    } else if (facilityType.toLowerCase().includes('steel') || facilityType.toLowerCase().includes('smelter') || facilityType.toLowerCase().includes('furnace')) {
      pMining += 75;
      if (isSuddenSpike) pIndustrialFire += 55;
    } else if (facilityType.toLowerCase().includes('power')) {
      if (isSuddenSpike) pIndustrialFire += 70;
      else pMining += 60;
    } else {
      if (isSuddenSpike) pIndustrialFire += 60;
      else pGasFlare += 50;
    }
  } else if (isModerateDistance && isIndustrialLand) {
    if (isSuddenSpike) pIndustrialFire += 65;
    else pGasFlare += 45;
  }

  // 2. Land-Cover Modifiers
  if (isForest) {
    pWildfire += 85;
    pIndustrialFire = Math.max(1, pIndustrialFire - 40);
    pGasFlare = Math.max(1, pGasFlare - 40);
  } else if (isCropland) {
    pAgri += 80;
    pIndustrialFire = Math.max(1, pIndustrialFire - 35);
    pGasFlare = Math.max(1, pGasFlare - 35);
  } else if (isMiningLand) {
    pMining += 75;
  }

  // 3. Historical Persistence & Baseline Modifiers
  if (isHighPersistence && !isSuddenSpike) {
    // Normal recurring source
    pGasFlare += 35;
    pIndustrialFire = Math.max(2, pIndustrialFire - 40);
    pWildfire = Math.max(1, pWildfire - 30);
    pAgri = Math.max(1, pAgri - 30);
  } else if (isSuddenSpike && (isNearFacility || isIndustrialLand)) {
    pIndustrialFire += 45;
    pGasFlare = Math.max(2, pGasFlare - 30);
  }

  // Normalize to 100%
  const totalScore = pIndustrialFire + pGasFlare + pWildfire + pAgri + pMining + pUnknown;
  const probs: ClassificationProbabilities = {
    industrialFire: Math.round((pIndustrialFire / totalScore) * 100),
    gasFlare: Math.round((pGasFlare / totalScore) * 100),
    wildfire: Math.round((pWildfire / totalScore) * 100),
    agriculturalBurn: Math.round((pAgri / totalScore) * 100),
    mining: Math.round((pMining / totalScore) * 100),
    unknown: Math.max(1, 100 - (
      Math.round((pIndustrialFire / totalScore) * 100) +
      Math.round((pGasFlare / totalScore) * 100) +
      Math.round((pWildfire / totalScore) * 100) +
      Math.round((pAgri / totalScore) * 100) +
      Math.round((pMining / totalScore) * 100)
    )),
  };

  // Determine top class
  const candidates: [ThermalClassification, number][] = [
    ['Industrial Fire', probs.industrialFire],
    ['Gas Flare', probs.gasFlare],
    ['Wildfire', probs.wildfire],
    ['Agricultural Burning', probs.agriculturalBurn],
    ['Mining / Furnace Activity', probs.mining],
  ];

  candidates.sort((a, b) => b[1] - a[1]);
  const primaryClass = candidates[0][1] >= 40 ? candidates[0][0] : 'Unknown / Ambiguous';
  const confidence = candidates[0][1];

  // Determine Abnormality Status & Severity
  let status: AbnormalityStatus = 'NORMAL';
  let severity: SeverityLevel = 'low';

  if (primaryClass === 'Industrial Fire') {
    status = 'CRITICAL_FIRE';
    severity = 'critical';
  } else if (baselineRatio >= 2.0 || (frp > 50 && persistenceDaysOutOf30 < 10)) {
    status = 'ABNORMAL';
    severity = 'high';
  } else if (frp >= 40) {
    status = 'NORMAL';
    severity = 'high';
  } else if (frp >= 20) {
    status = 'NORMAL';
    severity = 'medium';
  } else {
    status = 'NORMAL';
    severity = 'low';
  }

  // Anomaly Score (0 - 10)
  const anomalyScore = Math.min(
    9.9,
    Math.max(
      1.5,
      Math.round(
        (Math.min(baselineRatio, 4.5) * 1.6 + (frp / 60) * 2.0 + (brightnessT4 > 360 ? 1.5 : 0.5)) * 10
      ) / 10
    )
  );

  // Generate "Why?" Explainability Checklist
  const explainability: ExplainabilityReason[] = [];

  if (facilityDistanceMeters <= 800) {
    explainability.push({
      text: `${facilityDistanceMeters} m from ${facilityName} (${facilityType})`,
      type: 'facility',
      verified: true,
    });
  } else {
    explainability.push({
      text: `Isolated location (${(facilityDistanceMeters / 1000).toFixed(1)} km from industrial zones)`,
      type: 'facility',
      verified: true,
    });
  }

  explainability.push({
    text: `Land cover: ${landCover} (ESA WorldCover 10m)`,
    type: 'landcover',
    verified: true,
  });

  explainability.push({
    text: `Thermal Radiative Power: ${frp.toFixed(1)} MW (Skin Temp: ${Math.round(brightnessT4 - 273.15)}°C)`,
    type: 'intensity',
    verified: true,
  });

  if (baselineRatio >= 1.5) {
    explainability.push({
      text: `${baselineRatio.toFixed(1)}× above 30-day historical baseline (${historicalBaselineFrp.toFixed(1)} MW)`,
      type: 'baseline',
      verified: true,
    });
  } else {
    explainability.push({
      text: `Consistent with baseline (${baselineRatio.toFixed(1)}× historical mean)`,
      type: 'baseline',
      verified: true,
    });
  }

  if (persistenceDaysOutOf30 >= 15) {
    explainability.push({
      text: `High temporal persistence (${persistenceDaysOutOf30}/30 days detected)`,
      type: 'recurrence',
      verified: true,
    });
  } else {
    explainability.push({
      text: `Low historical recurrence (${persistenceDaysOutOf30}/30 days — sudden thermal event)`,
      type: 'recurrence',
      verified: true,
    });
  }

  if (!isForest && !isCropland) {
    explainability.push({
      text: 'No adjacent dense forest or agricultural burning footprint',
      type: 'exclusion',
      verified: true,
    });
  }

  if (input.populationDistanceMeters !== undefined && input.populationDistanceMeters <= 1200) {
    explainability.push({
      text: `Human population proximity: ${input.populationDistanceMeters} m from residential settlement zone`,
      type: 'facility',
      verified: true,
    });
  }

  return {
    classification: primaryClass,
    confidence,
    probabilities: probs,
    status,
    severity,
    baselineRatio,
    anomalyScore,
    explainability,
  };
}
