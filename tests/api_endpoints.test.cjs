const test = require('node:test');
const assert = require('node:assert/strict');

const BASE_URL = 'http://localhost:3000';

test('API: GET /api/health returns healthy system state', async () => {
  const res = await fetch(`${BASE_URL}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.status === 'operational' || data.status === 'healthy');
  assert.equal(data.services.database, 'online');
});

test('API: GET /api/model/metrics returns real calculated evaluation benchmarks', async () => {
  const res = await fetch(`${BASE_URL}/api/model/metrics`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.metrics.modelName, 'CatBoost');
  assert.equal(data.metrics.dataset.totalSamples, 520);
  assert.equal(data.metrics.dataset.uniqueIncidents, 520);
  assert.ok(data.metrics.overallMetrics.macroF1 > 90);
  assert.ok(data.metrics.confusionMatrix.matrix.length === 5);
  assert.ok(data.metrics.modelComparison.length >= 4);
});

test('API: GET /api/hotspots returns paginated hotspots list', async () => {
  const res = await fetch(`${BASE_URL}/api/hotspots?limit=10`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.hotspots));
  assert.ok(data.total >= 0);
});

test('API: GET /api/hotspots?format=geojson returns valid GeoJSON FeatureCollection', async () => {
  const res = await fetch(`${BASE_URL}/api/hotspots?format=geojson&limit=10`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.type, 'FeatureCollection');
  assert.ok(Array.isArray(data.features));
  if (data.features.length > 0) {
    const f = data.features[0];
    assert.equal(f.type, 'Feature');
    assert.equal(f.geometry.type, 'Point');
    assert.equal(f.geometry.coordinates.length, 2);
    assert.ok(f.properties.eventId);
  }
});

test('API: GET /api/sites returns persistent thermal sites', async () => {
  const res = await fetch(`${BASE_URL}/api/sites`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.sites));
});

test('API: GET /api/events returns verified thermal events', async () => {
  const res = await fetch(`${BASE_URL}/api/events`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.events));
});

test('API: POST /api/predict validates payload and returns two-stage classification', async () => {
  const payload = {
    latitude: 21.7125,
    longitude: 72.5842,
    frp: 165.0,
    brightness_temperature: 425.0,
    confidence: 96,
    satellite: 'VIIRS_NOAA20',
    industrial_distance_km: 0.2,
    refinery_distance_km: 0.4,
    oil_gas_facility_distance_km: 0.5,
    within_industrial_area: 1,
    land_cover_type: 'Industrial / Built-up',
    forest_distance_km: 18.0,
    urban_distance_km: 2.0,
    ndvi: 0.11,
  };

  const res = await fetch(`${BASE_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.classification);
  assert.ok(typeof data.confidence === 'number');
  assert.ok(data.class_probabilities);
  assert.ok(data.persistence);
  assert.ok(data.operational_risk);
  assert.ok(Array.isArray(data.evidence));
});

test('API: POST /api/predict rejects invalid payload (missing coordinates / FRP)', async () => {
  const invalidPayload = {
    latitude: 'invalid_lat', // Not a number
  };

  const res = await fetch(`${BASE_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invalidPayload),
  });

  assert.equal(res.status, 422);
  const data = await res.json();
  assert.equal(data.success, false);
  assert.ok(data.error);
});
