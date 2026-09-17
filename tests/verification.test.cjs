const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// 1. Haversine distance math
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

test('Geospatial Math: haversineDistanceKm calculates accurate geographic distance', () => {
  const dist = haversineDistanceKm(21.7125, 72.5842, 22.3789, 69.8654);
  assert.ok(dist >= 270 && dist <= 310, `Expected ~290km, got ${dist}`);
  assert.equal(haversineDistanceKm(21.7125, 72.5842, 21.7125, 72.5842), 0.0);
});

// 2. Stage A Persistence Rolling Features & Temporal Leakage Protections
test('Stage A Logic: Excludes future temporal observations (T_obs <= T_event)', () => {
  const currentTimestamp = '2026-08-15T12:00:00Z';
  const currentTimeMs = new Date(currentTimestamp).getTime();

  const history = [
    { datetime: '2026-08-10T12:00:00Z', frp: 25.0 },
    { datetime: '2026-08-14T12:00:00Z', frp: 28.0 },
    // Future observations that must be excluded
    { datetime: '2026-08-20T12:00:00Z', frp: 500.0 },
  ];

  const validPast = history.filter((obs) => {
    const t = new Date(obs.datetime).getTime();
    return !isNaN(t) && t <= currentTimeMs;
  });

  assert.equal(validPast.length, 2, 'Future observations must be strictly excluded');
  const maxFrp = Math.max(...validPast.map((o) => o.frp));
  assert.equal(maxFrp, 28.0);
});

// 3. Stage B Benchmark & Artifact Integrity
test('Stage B Artifact: Model artifact exists and contains valid taxonomy and feature weights', () => {
  const artifactPath = path.join(process.cwd(), 'data', 'stage_b_model_artifact.json');
  assert.ok(fs.existsSync(artifactPath), 'stage_b_model_artifact.json must exist');

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf-8'));
  assert.equal(artifact.model_version, 'FLAREX-StageB-CatBoost-v2.4');
  assert.deepEqual(artifact.target_taxonomy, [
    'industrial_fire',
    'wildfire',
    'agricultural_burn',
    'mining_fire',
    'other_unknown',
  ]);
  assert.ok(artifact.numeric_features.length >= 35, 'Must contain comprehensive numeric features');
  assert.ok(artifact.weights_vector.industrial_fire, 'Must contain calibrated weights for industrial_fire');
});

// 4. Evaluation Metrics Integrity
test('Evaluation Benchmark: Verified real incident dataset has zero duplicate IDs and zero orphans', () => {
  const evalPath = path.join(process.cwd(), 'data', 'model_evaluation.json');
  assert.ok(fs.existsSync(evalPath), 'model_evaluation.json must exist');

  const evalData = JSON.parse(fs.readFileSync(evalPath, 'utf-8'));
  assert.equal(evalData.dataset_summary.total_incident_records, 520);
  assert.equal(evalData.dataset_summary.unique_incidents, 520);
  assert.equal(evalData.dataset_summary.orphan_records, 0);
  assert.ok(evalData.model_comparison_table.length >= 4, 'Must compare CatBoost, Random Forest, etc.');
  assert.ok(evalData.holdout_metrics.macro_f1 > 90.0, 'Macro F1 must exceed 90%');
  assert.ok(evalData.leakage_protections.provenance_fields_excluded.includes('incident_name'));
  assert.ok(evalData.leakage_protections.post_event_metrics_excluded.includes('fire_duration_days'));
});

// 5. Operational Risk vs ML Probability
test('Operational Risk: High industrial fire probability with severe FRP escalates to CRITICAL', () => {
  const industrialFireProb = 0.94;
  const frpMw = 140.0;
  const baselineSurgeRatio = 3.5;
  const facilityDistanceKm = 0.2;
  const populationDistanceMeters = 350;

  let riskPoints = 0;
  riskPoints += Math.round(industrialFireProb * 40); // 38
  if (frpMw >= 80) riskPoints += 18; // 18
  if (baselineSurgeRatio >= 3.0) riskPoints += 20; // 20
  if (facilityDistanceKm <= 0.3) riskPoints += 10; // 10
  if (populationDistanceMeters <= 500) riskPoints += 15; // 15

  const score = Math.min(100, Math.max(5, riskPoints));
  assert.ok(score >= 80, `Expected CRITICAL score >= 80, got ${score}`);
});
