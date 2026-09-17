const test = require('node:test');
const assert = require('node:assert/strict');

const BASE_URL = 'http://localhost:3000';

test('E2E: GET / serves cinematic landing page HTML', async () => {
  const res = await fetch(`${BASE_URL}/`);
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.ok(text.includes('FLARE') || text.includes('FlareX'));
});

test('E2E: GET /?app=1 serves tactical mission dashboard', async () => {
  const res = await fetch(`${BASE_URL}/?app=1`);
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.ok(text.length > 500);
});

test('E2E: GET /api/health returns operational services', async () => {
  const res = await fetch(`${BASE_URL}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.status === 'operational' || data.status === 'healthy');
  assert.equal(data.services.database, 'online');
});

test('E2E: GET /api/model/metrics returns authentic CatBoost benchmarks', async () => {
  const res = await fetch(`${BASE_URL}/api/model/metrics`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.metrics.modelName, 'CatBoost');
  assert.equal(data.metrics.dataset.totalSamples, 520);
  assert.equal(data.metrics.dataset.uniqueIncidents, 520);
  assert.ok(data.metrics.overallMetrics.accuracy >= 90);
  assert.equal(data.metrics.confusionMatrix.matrix.length, 5);
  assert.ok(Array.isArray(data.metrics.topFeatures));
});

test('E2E: GET /api/events returns verified benchmark incident records', async () => {
  const res = await fetch(`${BASE_URL}/api/events?limit=25`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.events.length > 0);
  assert.ok(data.events[0].event_id || data.events[0].id);
  assert.ok(typeof data.events[0].frp === 'number');
});

test('E2E: GET /api/sites returns persistent industrial sources catalog', async () => {
  const res = await fetch(`${BASE_URL}/api/sites`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.sites.length >= 5);
  const jamnagar = data.sites.find((s) => (s.source_name || s.name || '').includes('Jamnagar'));
  assert.ok(jamnagar);
  assert.equal(jamnagar.classification, 'Gas Flare');
});

test('E2E: POST /api/predict classifies high-FRP industrial fire accurately', async () => {
  const res = await fetch(`${BASE_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      latitude: 21.7125,
      longitude: 72.5842,
      frp: 380.0,
      brightness_temperature: 412.5,
      satellite: 'VIIRS_NOAA20_NRT',
      daynight: 'D',
      nearest_facility_name: 'ONGC Dahej Petrochemical Refinery',
      nearby_facility_type: 'Petrochemical & Chemical Refinery',
      industrial_distance_km: 0.065,
    }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.class_probabilities);
  assert.ok(data.operational_risk.score >= 70);
  assert.ok(data.evidence.length >= 3);
});

test('E2E: POST /api/predict handles zero FRP gracefully', async () => {
  const res = await fetch(`${BASE_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      latitude: 22.3789,
      longitude: 69.8654,
      frp: 0,
      brightness_temperature: 310.0,
    }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
});

test('E2E: POST /api/predict rejects negative FRP with 422', async () => {
  const res = await fetch(`${BASE_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      latitude: 22.3789,
      longitude: 69.8654,
      frp: -25.0,
      brightness_temperature: 350.0,
    }),
  });

  assert.equal(res.status, 422);
});

test('E2E: POST /api/predict rejects out-of-bounds coordinates with 422', async () => {
  const res = await fetch(`${BASE_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      latitude: 145.0,
      longitude: 75.0,
      frp: 50.0,
      brightness_temperature: 350.0,
    }),
  });

  assert.equal(res.status, 422);
});

test('E2E: POST /api/dispatch records simulated emergency response', async () => {
  const res = await fetch(`${BASE_URL}/api/dispatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventId: 'FL-102',
      facilityName: 'ONGC Dahej Petrochemical Refinery',
      agency: 'National Disaster Response Force (NDRF) [Simulated API]',
      method: 'Encrypted Telemetry Webhook',
      payload: { frp: 380.0, coordinates: [72.5842, 21.7125] },
    }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.ticketId);
  assert.equal(data.status, 'SIMULATED_LOGGED');
});

test('E2E: GET /api/reports/download produces compliant non-empty PDF dossier', async () => {
  const res = await fetch(`${BASE_URL}/api/reports/download?type=pdf&eventId=FL-102`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'application/pdf');
  const buffer = await res.arrayBuffer();
  assert.ok(buffer.byteLength > 500, `PDF size too small: ${buffer.byteLength} bytes`);
  
  // Verify PDF header bytes '%PDF'
  const header = Buffer.from(buffer.slice(0, 5)).toString('utf-8');
  assert.ok(header.startsWith('%PDF'), `Invalid PDF header: ${header}`);
});

test('E2E: GET /api/reports/download produces valid GeoJSON export', async () => {
  const res = await fetch(`${BASE_URL}/api/reports/download?type=geojson`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.type, 'FeatureCollection');
  assert.ok(data.features.length > 0);
});

test('E2E: GET /api/reports/download produces valid CSV telemetry', async () => {
  const res = await fetch(`${BASE_URL}/api/reports/download?type=csv`);
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.ok(text.startsWith('ID,Event_ID,Name'));
  assert.ok(text.split('\n').length >= 5);
});
