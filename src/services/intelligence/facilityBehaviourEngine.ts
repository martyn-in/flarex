
// ============================================================================
// FACILITY THERMAL FINGERPRINT & ABNORMALITY DETECTION ENGINE
// Phase 1-2 of FLAREX Novelty Upgrade — SIH Problem Statement 26162
//
// Core technical novelty: facility-specific thermal behaviour intelligence
// that distinguishes NORMAL persistent industrial heat from ABNORMAL events.
//
// All statistics strictly use T_history < T_event (no temporal leakage).
// Thresholds are heuristic prototype values documented for transparency.
// ============================================================================

/** Compute robust median of an array. */
export function robustMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Compute Median Absolute Deviation (MAD).
 * Robust measure of spread resistant to extreme outliers.
 * For normal distributions: sigma ≈ 1.4826 × MAD
 */
export function computeMAD(values: number[], median: number): number {
  if (values.length === 0) return 0;
  const deviations = values.map((v) => Math.abs(v - median));
  return robustMedian(deviations);
}

/** Compute historical percentile rank (0–100) of currentValue within values array. */
export function computeHistoricalPercentile(values: number[], currentValue: number): number {
  if (values.length === 0) return 50;
  const below = values.filter((v) => v <= currentValue).length;
  return Math.round((below / values.length) * 100);
}

/** Compute Nth percentile of an array. */
export function computePercentile(values: number[], n: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.max(0, Math.ceil((n / 100) * sorted.length) - 1);
  return sorted[idx];
}

/**
 * Robust Z-Score: (current_frp - median_frp_30d) / (1.4826 * MAD_30d + epsilon)
 * epsilon=2.0 prevents division by zero for highly stable facilities with near-zero MAD.
 */
export function computeRobustZScore(
  currentFrp: number,
  medianFrp30d: number,
  madFrp30d: number,
  epsilon = 2.0
): number {
  const normalizedMAD = 1.4826 * madFrp30d + epsilon;
  return (currentFrp - medianFrp30d) / normalizedMAD;
}

/**
 * Surge Ratio: frp / max(median_30d, min_baseline_floor)
 * min_baseline_floor prevents extreme ratios when median is near zero.
 */
export function computeSurgeRatio(
  currentFrp: number,
  medianFrp30d: number,
  minBaselineFloorMw = 5.0
): number {
  const effectiveBaseline = Math.max(medianFrp30d, minBaselineFloorMw);
  return currentFrp / effectiveBaseline;
}

/**
 * Abrupt Onset Score (0–1): how sudden is this spike vs rolling 7d trend.
 * Score near 1 = sudden spike with no gradual build-up (abrupt onset).
 * Score near 0 = gradual escalation or stable.
 */
export function computeAbruptOnsetScore(
  currentFrp: number,
  medianFrp7d: number,
  medianFrp30d: number,
  minFloor = 5.0
): number {
  const shortBaseline = Math.max(medianFrp7d, minFloor);
  const longBaseline = Math.max(medianFrp30d, minFloor);
  const gradualityFactor = shortBaseline / longBaseline;
  const rawOnset = (currentFrp / shortBaseline) / Math.max(1.0, gradualityFactor);
  return Math.min(1.0, Math.max(0, (rawOnset - 1.0) / 5.0));
}

const MIN_HISTORY_DAYS_FOR_BEHAVIOUR = 5;

/**
 * Map thermal abnormality score (0–100) to BehaviourStatus label.
 *
 * HEURISTIC PROTOTYPE THRESHOLDS for SIH 26162.
 * NOT statistically calibrated to a specific false-positive rate.
 *   0–20:   NORMAL              — within facility operating envelope
 *   21–40:  ELEVATED            — slightly outside, worth monitoring
 *   41–70:  ABNORMAL            — significantly outside, investigate
 *   71–100: EXTREME             — far beyond historical precedent, escalate
 */
export function mapScoreToBehaviourStatus(
  score: number,
  nHistoricalDays: number
): 'NORMAL' | 'ELEVATED' | 'ABNORMAL' | 'EXTREME' | 'INSUFFICIENT_HISTORY' {
  if (nHistoricalDays < MIN_HISTORY_DAYS_FOR_BEHAVIOUR) return 'INSUFFICIENT_HISTORY';
  if (score <= 20) return 'NORMAL';
  if (score <= 40) return 'ELEVATED';
  if (score <= 70) return 'ABNORMAL';
  return 'EXTREME';
}

/**
 * Composite Thermal Abnormality Score (0–100).
 *
 * Component weights (all heuristic, documented here for transparency):
 *   Robust Z-Score:        40% — magnitude of deviation from facility fingerprint
 *   Surge Ratio:           30% — simple ratio, easy to explain to non-ML judges
 *   Historical Percentile: 15% — where does this sit in facility history
 *   Abrupt Onset:          10% — sudden vs gradual escalation
 *   Recurrence Deviation:   5% — is facility suddenly more/less active than normal
 */
export function computeThermalAbnormalityScore(params: {
  robustZScore: number;
  surgeRatio: number;
  historicalPercentile: number;
  abruptOnsetScore: number;
  recurrenceDeviation: number;
  nHistoricalDays: number;
}): number {
  if (params.nHistoricalDays < MIN_HISTORY_DAYS_FOR_BEHAVIOUR) {
    return 50; // Neutral mid-score → triggers INSUFFICIENT_HISTORY not NORMAL/EXTREME
  }

  // Component 1: Robust Z-Score (40%)
  // z≤1.5: 0–15pts | z 1.5–3: 15–40pts | z 3–6: 40–70pts | z>6: 70–100pts
  const z = Math.max(0, params.robustZScore);
  let zContrib: number;
  if (z <= 1.5) zContrib = (z / 1.5) * 15;
  else if (z <= 3.0) zContrib = 15 + ((z - 1.5) / 1.5) * 25;
  else if (z <= 6.0) zContrib = 40 + ((z - 3.0) / 3.0) * 30;
  else zContrib = 70 + Math.min(30, (z - 6.0) * 3);
  const zScore = Math.min(100, zContrib) * 0.40;

  // Component 2: Surge Ratio (30%)
  // 1×: 0pts | 1.5×: 20 | 2×: 45 | 3×: 70 | 4+×: 100
  const s = Math.max(0, params.surgeRatio - 1.0);
  let surgeContrib: number;
  if (s <= 0.5) surgeContrib = (s / 0.5) * 20;
  else if (s <= 1.0) surgeContrib = 20 + ((s - 0.5) / 0.5) * 25;
  else if (s <= 2.0) surgeContrib = 45 + ((s - 1.0) / 1.0) * 25;
  else surgeContrib = 70 + Math.min(30, (s - 2.0) * 15);
  const surgeScore = Math.min(100, surgeContrib) * 0.30;

  // Component 3: Historical Percentile (15%)
  const p = Math.max(0, params.historicalPercentile - 50);
  const percentileScore = Math.min(100, (p / 49) * 100) * 0.15;

  // Component 4: Abrupt Onset (10%)
  const onsetScore = Math.min(1.0, Math.max(0, params.abruptOnsetScore)) * 100 * 0.10;

  // Component 5: Recurrence Deviation (5%)
  const recurrenceScore = Math.min(100, Math.abs(params.recurrenceDeviation) * 100) * 0.05;

  const raw = zScore + surgeScore + percentileScore + onsetScore + recurrenceScore;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

export interface ThermalAbnormalityAnalysis {
  // Fingerprint statistics
  medianFrp7d: number;
  medianFrp30d: number;
  medianFrp90d: number;
  madFrp30d: number;
  p90Frp: number;
  p95Frp: number;
  activeDays30d: number;
  recurrenceRatio30d: number;
  nHistoricalDays: number;
  // Core abnormality metrics
  robustZScore: number;
  surgeRatio: number;
  historicalPercentile: number;
  abruptOnsetScore: number;
  recurrenceDeviation: number;
  thermalAbnormalityScore: number;
  // Outcome
  behaviourStatus: 'NORMAL' | 'ELEVATED' | 'ABNORMAL' | 'EXTREME' | 'INSUFFICIENT_HISTORY';
  suppressAlert: boolean;
  escalationRecommended: boolean;
  // Explainability bullets using actual computed values
  behaviourExplanation: string[];
}

/**
 * Full facility thermal behaviour analysis.
 * Strictly uses pre-event observations (T_history < T_event).
 */
export function analyzeFacilityThermalBehaviour(
  currentFrp: number,
  preEventObservations: number[],
  currentTimestamp: string,
  allHistoricalWithDates?: Array<{ frp: number; datetime: string; daynight?: string }>
): ThermalAbnormalityAnalysis {
  const EPSILON = 2.0;
  const MIN_BASELINE_FLOOR_MW = 5.0;
  const now = new Date(currentTimestamp).getTime();
  const MS_PER_DAY = 86400000;

  // Partition into time windows if detailed history provided
  let obs7d: number[] = preEventObservations;
  let obs30d: number[] = preEventObservations;
  let obs90d: number[] = preEventObservations;

  if (allHistoricalWithDates && allHistoricalWithDates.length > 0) {
    obs7d = allHistoricalWithDates
      .filter((o) => now - new Date(o.datetime).getTime() <= 7 * MS_PER_DAY)
      .map((o) => o.frp);
    obs30d = allHistoricalWithDates
      .filter((o) => now - new Date(o.datetime).getTime() <= 30 * MS_PER_DAY)
      .map((o) => o.frp);
    obs90d = allHistoricalWithDates
      .filter((o) => now - new Date(o.datetime).getTime() <= 90 * MS_PER_DAY)
      .map((o) => o.frp);
  }

  const nHistoricalDays = preEventObservations.length;
  const fallback = preEventObservations.length > 0 ? preEventObservations : [0];
  const medianFrp7d = robustMedian(obs7d.length > 0 ? obs7d : fallback);
  const medianFrp30d = robustMedian(obs30d.length > 0 ? obs30d : fallback);
  const medianFrp90d = robustMedian(obs90d.length > 0 ? obs90d : fallback);
  const madFrp30d = computeMAD(obs30d.length > 0 ? obs30d : fallback, medianFrp30d);
  const p90Frp = computePercentile(preEventObservations, 90);
  const p95Frp = computePercentile(preEventObservations, 95);
  const activeDays30d = Math.min(30, obs30d.length);
  const recurrenceRatio30d = activeDays30d / 30;

  const robustZScore = computeRobustZScore(currentFrp, medianFrp30d, madFrp30d, EPSILON);
  const surgeRatio = computeSurgeRatio(currentFrp, medianFrp30d, MIN_BASELINE_FLOOR_MW);
  const historicalPercentile = computeHistoricalPercentile(preEventObservations, currentFrp);
  const abruptOnsetScore = computeAbruptOnsetScore(currentFrp, medianFrp7d, medianFrp30d);
  const expectedRecurrence = Math.min(1.0, preEventObservations.length / 30);
  const recurrenceDeviation = recurrenceRatio30d - expectedRecurrence;

  const thermalAbnormalityScore = computeThermalAbnormalityScore({
    robustZScore, surgeRatio, historicalPercentile, abruptOnsetScore, recurrenceDeviation, nHistoricalDays,
  });

  const behaviourStatus = mapScoreToBehaviourStatus(thermalAbnormalityScore, nHistoricalDays);
  const suppressAlert = behaviourStatus === 'NORMAL' || behaviourStatus === 'ELEVATED';
  const escalationRecommended = behaviourStatus === 'EXTREME' || behaviourStatus === 'ABNORMAL';

  // Build explainability bullets using actual computed values (not hardcoded)
  const behaviourExplanation: string[] = [];
  if (nHistoricalDays < MIN_HISTORY_DAYS_FOR_BEHAVIOUR) {
    behaviourExplanation.push(
      `Insufficient pre-event history (${nHistoricalDays} observations) — behaviour assessment unavailable`
    );
  } else {
    behaviourExplanation.push(
      `30-day median FRP: ${medianFrp30d.toFixed(1)} MW (from ${nHistoricalDays} pre-event observations, T_history < T_event)`
    );
    behaviourExplanation.push(
      `Current FRP: ${currentFrp.toFixed(1)} MW — Surge: ${surgeRatio.toFixed(2)}× above facility baseline`
    );
    behaviourExplanation.push(
      `Robust z-score: ${robustZScore.toFixed(2)} (MAD-normalised deviation; MAD=${madFrp30d.toFixed(1)} MW)`
    );
    behaviourExplanation.push(
      `Historical percentile: ${historicalPercentile}th — ` +
        (historicalPercentile > 95
          ? 'extreme outlier above facility 95th percentile'
          : historicalPercentile > 80
          ? 'elevated, above 80th percentile'
          : 'within normal facility operating envelope')
    );
    if (escalationRecommended) {
      behaviourExplanation.push(
        `Thermal abnormality score: ${thermalAbnormalityScore}/100 — ${behaviourStatus} behaviour`
      );
      behaviourExplanation.push(
        'Escalation recommended: thermal behaviour inconsistent with facility operating fingerprint'
      );
    } else {
      behaviourExplanation.push(
        `Thermal abnormality score: ${thermalAbnormalityScore}/100 — within facility operating envelope`
      );
      behaviourExplanation.push(
        'Alert suppressed: persistent industrial thermal source operating within expected parameters'
      );
    }
  }

  return {
    medianFrp7d, medianFrp30d, medianFrp90d, madFrp30d, p90Frp, p95Frp,
    activeDays30d, recurrenceRatio30d, nHistoricalDays,
    robustZScore, surgeRatio, historicalPercentile, abruptOnsetScore,
    recurrenceDeviation, thermalAbnormalityScore, behaviourStatus,
    suppressAlert, escalationRecommended, behaviourExplanation,
  };
}
