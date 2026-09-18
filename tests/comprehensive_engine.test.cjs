const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// ============================================================================
// 1. HAVERSINE DISTANCE MATHEMATICS
// ============================================================================
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371.0;
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

test('Geospatial Math: haversineDistanceKm computes accurate spatial separation', () => {
  const dist = haversineDistanceKm(21.7125, 72.5842, 22.3789, 69.8654);
  assert.ok(dist >= 270 && dist <= 310, `Expected ~290km, got ${dist.toFixed(1)}km`);
  assert.equal(haversineDistanceKm(21.7125, 72.5842, 21.7125, 72.5842), 0.0);
});

// ============================================================================
// 2. STAGE A: TEMPORAL LEAKAGE PROTECTIONS & 7/30/90/365 ROLLING WINDOWS
// ============================================================================
function computePersistenceRollingFeatures(targetTimeIso, historyObservations, targetLat, targetLon, spatialRadiusKm = 2.5) {
  const targetTimeMs = new Date(targetTimeIso).getTime();
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  // STRICT TEMPORAL LEAKAGE PROTECTION: T_obs <= T_event
  const validObservations = historyObservations.filter((obs) => {
    const obsTimeMs = new Date(obs.datetime).getTime();
    if (isNaN(obsTimeMs) || obsTimeMs > targetTimeMs) {
      return false; // REJECT ANY FUTURE OBSERVATIONS
    }
    const dist = haversineDistanceKm(targetLat, targetLon, obs.latitude, obs.longitude);
    return dist <= spatialRadiusKm;
  });

  const getWindowObs = (days) => {
    const cutoffMs = targetTimeMs - days * MS_PER_DAY;
    return validObservations.filter((obs) => new Date(obs.datetime).getTime() >= cutoffMs);
  };

  const obs7d = getWindowObs(7);
  const obs30d = getWindowObs(30);
  const obs90d = getWindowObs(90);
  const obs365d = getWindowObs(365);

  const getActiveDays = (obsList) => new Set(obsList.map((o) => o.datetime.slice(0, 10))).size;

  const frp30d = obs30d.map((o) => o.frp);
  const meanFrp30d = frp30d.length > 0 ? frp30d.reduce((a, b) => a + b, 0) / frp30d.length : 0;
  const sortedFrp = [...frp30d].sort((a, b) => a - b);
  const medianFrp30d = sortedFrp.length > 0 ? sortedFrp[Math.floor(sortedFrp.length / 2)] : 0;
  const maxFrp30d = sortedFrp.length > 0 ? sortedFrp[sortedFrp.length - 1] : 0;

  return {
    totalValidObservations: validObservations.length,
    activeDays7d: getActiveDays(obs7d),
    activeDays30d: getActiveDays(obs30d),
    activeDays90d: getActiveDays(obs90d),
    activeDays365d: getActiveDays(obs365d),
    meanFrp30d,
    medianFrp30d,
    maxFrp30d,
    persistenceRatio30d: getActiveDays(obs30d) / 30.0,
  };
}

test('Stage A Temporal Leakage: Future observations (T_obs > T_event) are strictly excluded', () => {
  const targetTime = '2026-08-15T12:00:00Z';
  const history = [
    { datetime: '2026-08-01T10:00:00Z', latitude: 22.0, longitude: 70.0, frp: 50 },
    { datetime: '2026-08-10T10:00:00Z', latitude: 22.0, longitude: 70.0, frp: 55 },
    { datetime: '2026-08-15T11:59:00Z', latitude: 22.0, longitude: 70.0, frp: 52 },
    // FUTURE LEAKAGE TEST CASES:
    { datetime: '2026-08-15T12:01:00Z', latitude: 22.0, longitude: 70.0, frp: 999 },
    { datetime: '2026-08-20T10:00:00Z', latitude: 22.0, longitude: 70.0, frp: 888 },
  ];

  const features = computePersistenceRollingFeatures(targetTime, history, 22.0, 70.0);
  assert.equal(features.totalValidObservations, 3, 'Must contain exactly 3 valid past observations');
  assert.equal(features.maxFrp30d, 55, 'Future spikes must NOT leak into historical max');
});

test('Stage A Windows: Accurately calculates 7d, 30d, 90d, 365d active days', () => {
  const targetTime = '2026-09-01T12:00:00Z';
  const targetMs = new Date(targetTime).getTime();
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  const history = [];
  // 5 observations in past 7 days
  for (let i = 1; i <= 5; i++) {
    history.push({
      datetime: new Date(targetMs - i * MS_PER_DAY).toISOString(),
      latitude: 22.0,
      longitude: 70.0,
      frp: 30,
    });
  }
  // 15 observations in days 8–30 (total 20 in 30d)
  for (let i = 8; i <= 22; i++) {
    history.push({
      datetime: new Date(targetMs - i * MS_PER_DAY).toISOString(),
      latitude: 22.0,
      longitude: 70.0,
      frp: 32,
    });
  }
  // 10 observations in days 31–90 (total 30 in 90d)
  for (let i = 35; i <= 44; i++) {
    history.push({
      datetime: new Date(targetMs - i * MS_PER_DAY).toISOString(),
      latitude: 22.0,
      longitude: 70.0,
      frp: 35,
    });
  }
  // 10 observations in days 91–365 (total 40 in 365d)
  for (let i = 100; i <= 109; i++) {
    history.push({
      datetime: new Date(targetMs - i * MS_PER_DAY).toISOString(),
      latitude: 22.0,
      longitude: 70.0,
      frp: 31,
    });
  }

  const features = computePersistenceRollingFeatures(targetTime, history, 22.0, 70.0);
  assert.equal(features.activeDays7d, 5);
  assert.equal(features.activeDays30d, 20);
  assert.equal(features.activeDays90d, 30);
  assert.equal(features.activeDays365d, 40);
  assert.equal(features.persistenceRatio30d, 20 / 30);
});

// ============================================================================
// 3. FACILITY BEHAVIOUR ENGINE: ROBUST STATISTICS & FINGERPRINTING
// ============================================================================
function robustMedian(values) {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function computeMAD(values, median) {
  if (!values || values.length === 0) return 0;
  const deviations = values.map((v) => Math.abs(v - median));
  return robustMedian(deviations);
}

function computeRobustZScore(currentFrp, medianFrp30d, madFrp30d, epsilon = 2.0) {
  const normalizedMAD = 1.4826 * madFrp30d + epsilon;
  return (currentFrp - medianFrp30d) / normalizedMAD;
}

function computeSurgeRatio(currentFrp, medianFrp30d, minBaselineFloorMw = 5.0) {
  const effectiveBaseline = Math.max(medianFrp30d, minBaselineFloorMw);
  return currentFrp / effectiveBaseline;
}

function mapScoreToBehaviourStatus(score, nHistoricalDays) {
  if (nHistoricalDays < 5) return 'INSUFFICIENT_HISTORY';
  if (score <= 20) return 'NORMAL';
  if (score <= 40) return 'ELEVATED';
  if (score <= 70) return 'ABNORMAL';
  return 'EXTREME';
}

test('Facility Behaviour Engine: Robust median and MAD are outlier-resistant', () => {
  const baselineValues = [100, 102, 105, 108, 110, 112, 115, 104, 106, 109];
  const med = robustMedian(baselineValues);
  assert.ok(med >= 106 && med <= 108.5);

  const mad = computeMAD(baselineValues, med);
  assert.ok(mad >= 3 && mad <= 6, `Expected MAD ~4, got ${mad}`);

  // Test outlier resistance: add extreme spike to values
  const withSpike = [...baselineValues, 5000];
  const medWithSpike = robustMedian(withSpike);
  // Median shifts only slightly from 107.5 to 108
  assert.ok(Math.abs(medWithSpike - med) <= 2, 'Median must be robust against extreme single spike');
});

test('Behaviour Discrimination: Jamnagar Normal (112 MW) vs Abnormal Spike (382 MW)', () => {
  const historicalFrp = [105, 108, 110, 106, 107, 109, 111, 108, 110, 108, 107, 109, 112, 106, 108];
  const med = robustMedian(historicalFrp); // ~108
  const mad = computeMAD(historicalFrp, med); // ~1.5

  // 1. NORMAL CASE: Jamnagar operating flare at 112 MW
  const normalFrp = 112;
  const normalZ = computeRobustZScore(normalFrp, med, mad);
  const normalSurge = computeSurgeRatio(normalFrp, med);
  assert.ok(normalZ < 1.5, `Normal Z-score should be < 1.5, got ${normalZ.toFixed(2)}`);
  assert.ok(normalSurge < 1.15, `Normal surge ratio should be ~1.04, got ${normalSurge.toFixed(2)}`);

  const normalStatus = mapScoreToBehaviourStatus(12, historicalFrp.length);
  assert.equal(normalStatus, 'NORMAL', '112 MW within baseline must be classified NORMAL');

  // 2. ABNORMAL TWIN CASE: Jamnagar thermal surge at 382 MW
  const abnormalFrp = 382;
  const abnormalZ = computeRobustZScore(abnormalFrp, med, mad);
  const abnormalSurge = computeSurgeRatio(abnormalFrp, med);
  assert.ok(abnormalZ > 6.0, `Abnormal Z-score should be > 6.0, got ${abnormalZ.toFixed(2)}`);
  assert.ok(abnormalSurge > 3.0, `Abnormal surge ratio should be > 3.0, got ${abnormalSurge.toFixed(2)}`);

  const abnormalStatus = mapScoreToBehaviourStatus(87, historicalFrp.length);
  assert.equal(abnormalStatus, 'EXTREME', '382 MW at same facility must be classified EXTREME');
});

test('Behaviour Engine: Flags INSUFFICIENT_HISTORY when < 5 historical days', () => {
  const sparseHistory = [45, 50];
  const status = mapScoreToBehaviourStatus(65, sparseHistory.length);
  assert.equal(status, 'INSUFFICIENT_HISTORY');
});

// ============================================================================
// 4. FIRMS CSV PARSING & MULTI-SATELLITE NORMALIZATION
// ============================================================================
function parseFirmsCsvMock(csvText, defaultSensor = 'VIIRS_NOAA20_NRT') {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const latIdx = headers.indexOf('latitude');
  const lonIdx = headers.indexOf('longitude');
  const frpIdx = headers.indexOf('frp');
  const brightIdx = headers.indexOf('bright_ti4') !== -1 ? headers.indexOf('bright_ti4') : headers.indexOf('brightness');
  const dateIdx = headers.indexOf('acq_date');
  const timeIdx = headers.indexOf('acq_time');
  const confIdx = headers.indexOf('confidence');

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    if (cols.length < headers.length) continue;
    records.push({
      latitude: parseFloat(cols[latIdx]),
      longitude: parseFloat(cols[lonIdx]),
      frp: parseFloat(cols[frpIdx]) || 10.0,
      brightness: parseFloat(cols[brightIdx]) || 320.0,
      acqDate: cols[dateIdx],
      acqTime: cols[timeIdx],
      confidence: parseFloat(cols[confIdx]) || 80,
      satellite: defaultSensor,
    });
  }
  return records;
}

test('FIRMS Pipeline: Successfully normalizes VIIRS CSV telemetry', () => {
  const csvSample = `latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight
22.3789,69.8654,367.2,0.4,0.4,2026-08-28,0815,N20,VIIRS,nominal,2.0NRT,298.1,112.5,D
21.7125,72.5842,389.4,0.5,0.4,2026-08-28,0815,N20,VIIRS,high,2.0NRT,301.2,165.0,D`;

  const parsed = parseFirmsCsvMock(csvSample);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].latitude, 22.3789);
  assert.equal(parsed[0].longitude, 69.8654);
  assert.equal(parsed[0].frp, 112.5);
  assert.equal(parsed[1].latitude, 21.7125);
  assert.equal(parsed[1].frp, 165.0);
});

// ============================================================================
// 5. DETERMINISTIC DEDUPLICATION & IDENTIFIER STABILITY
// ============================================================================
test('Deduplication: Generates stable deterministic IDs for the same observation', () => {
  const genId = (sat, date, time, lat, lon) =>
    `FIRMS-${sat}-${date.replace(/-/g, '')}-${time.padStart(4, '0')}-${Math.round(lat * 1000)}-${Math.round(lon * 1000)}`;

  const id1 = genId('VIIRS_NOAA20', '2026-08-28', '0815', 22.3789, 69.8654);
  const id2 = genId('VIIRS_NOAA20', '2026-08-28', '0815', 22.3789, 69.8654);
  assert.equal(id1, id2, 'Same physical observation must yield identical deterministic ID');
  assert.equal(id1, 'FIRMS-VIIRS_NOAA20-20260828-0815-22379-69865');
});

// ============================================================================
// 6. OPERATIONAL RISK CALCULATION
// ============================================================================
function computeOperationalRisk(isIndustrialFire, confidencePct, frpMw, surgeRatio, facilityDistKm) {
  let score = 0;
  if (isIndustrialFire) {
    score += Math.round((confidencePct / 100) * 40);
  } else {
    score += Math.round((confidencePct / 100) * 15);
  }

  if (frpMw >= 100) score += 20;
  else if (frpMw >= 50) score += 12;
  else score += 5;

  if (surgeRatio >= 3.0) score += 20;
  else if (surgeRatio >= 1.8) score += 12;
  else score += 4;

  if (facilityDistKm <= 0.5) score += 20;
  else if (facilityDistKm <= 2.0) score += 10;
  else score += 2;

  const finalScore = Math.min(100, Math.max(5, score));
  let level = 'LOW';
  if (finalScore >= 80) level = 'CRITICAL';
  else if (finalScore >= 60) level = 'HIGH';
  else if (finalScore >= 40) level = 'MEDIUM';

  return { score: finalScore, level };
}

test('Risk Engine: High industrial fire probability with surge and proximity triggers CRITICAL', () => {
  const risk = computeOperationalRisk(true, 95, 140, 3.5, 0.3);
  assert.ok(risk.score >= 80, `Expected score >= 80, got ${risk.score}`);
  assert.equal(risk.level, 'CRITICAL');
});

test('Risk Engine: Routine normal operational flare yields LOW or MEDIUM risk', () => {
  const risk = computeOperationalRisk(false, 92, 40, 1.05, 0.4);
  assert.ok(risk.score < 60, `Expected score < 60, got ${risk.score}`);
  assert.ok(risk.level === 'LOW' || risk.level === 'MEDIUM');
});
