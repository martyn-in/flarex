# FLAREX: AI-Based Detection & Classification of Industrial Fires and Persistent Thermal Sources
### Problem Statement ID: 26162 | Organization: National Technical Research Organisation (NTRO) | Theme: Disaster Management

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![CatBoost](https://img.shields.io/badge/ML-CatBoost_v2.4-green)](https://catboost.ai/)
[![FIRMS](https://img.shields.io/badge/NASA-FIRMS_VIIRS-orange)](https://firms.modaps.eosdis.nasa.gov/)
[![Sentinel-2](https://img.shields.io/badge/Copernicus-Sentinel--2_MSI-red)](https://dataspace.copernicus.eu/)
[![Kaggle Dataset](https://img.shields.io/badge/Kaggle-Benchmark_Dataset-20BEFF?logo=kaggle)](https://www.kaggle.com/datasets/pulivarthimartyn/industrial-fire-thermal-source-benchmark)
[![Tests](https://img.shields.io/badge/Tests-13%2F13_Passing-brightgreen)]()

---

## 1. Overview

**FLAREX** is a mission-grade geospatial intelligence platform designed for the **National Technical Research Organisation (NTRO)** under **Problem Statement 26162**. The platform ingests real-time multi-satellite thermal radiance data, resolves persistent industrial thermal emitters from sudden catastrophic fires, classifies thermal anomalies across a 5-class multi-source taxonomy using trained tabular machine learning, and coordinates emergency response dispatches with strict data-leakage prevention and explainable AI.

---

## 2. Architecture & Pipeline Decoupling

FLAREX enforces a strict two-stage decoupling architecture to guarantee technical defensibility and prevent false alarm floods:

```
                            NASA FIRMS SATELLITE FEEDS
                   (VIIRS NOAA-20, NOAA-21, Suomi-NPP, MODIS)
                                      │
                                      ▼
    ┌───────────────────────────────────────────────────────────────────┐
    │ STAGE A: SPATIOTEMPORAL PERSISTENCE & RADIANCE SURGE ENGINE       │
    │ ───────────────────────────────────────────────────────────────── │
    │ • 7d / 30d / 90d / 365d rolling historical observation windows    │
    │ • Causality isolation: T_observation <= T_event (Zero Leakage)    │
    │ • Active Detection Ratio (ADR), Persistence Score (0-100)         │
    │ • Baseline FRP multiple (Current FRP / Median FRP)                │
    │ • Radiance stability & day/night detection ratio                  │
    └─────────────────────────────────┬─────────────────────────────────┘
                                      │
                                      ▼
    ┌───────────────────────────────────────────────────────────────────┐
    │ HIGH-RESOLUTION ENRICHMENT & GEOSPATIAL CONTEXT                   │
    │ ───────────────────────────────────────────────────────────────── │
    │ • OpenStreetMap (OSM) Overpass: Distance to nearest industrial    │
    │ • ESA WorldCover 10m Land Cover: 6 discrete land-use classes      │
    │ • Sentinel-2 MSI: 10m multispectral cross-verification (NDVI, NBR)│
    │ • Buffer proximities: Forest (m), Agriculture (m), Urban (m)      │
    └─────────────────────────────────┬─────────────────────────────────┘
                                      │
                         47 LEAKAGE-FREE FEATURES
                                      │
                                      ▼
    ┌───────────────────────────────────────────────────────────────────┐
    │ STAGE B: MULTI-CLASS MACHINE LEARNING CLASSIFIER                  │
    │ ───────────────────────────────────────────────────────────────── │
    │ • Primary Model: CatBoost Tabular Classifier (v2.4)               │
    │ • Benchmarked: HistGradientBoosting, Random Forest, Logistic Reg  │
    │ • 5-Class Target Taxonomy:                                        │
    │     1. Industrial Fire (Catastrophic structural / tank fire)      │
    │     2. Gas Flare (Operational petrochemical production flare)     │
    │     3. Wildfire (Forest / brush vegetation fire)                  │
    │     4. Agricultural Burn (Crop stubble residue burning)           │
    │     5. Mining / Furnace (Coal seam fire, blast furnace)           │
    │ • Calibrated Probabilities: P(class | features), sum = 1.0        │
    └─────────────────────────────────┬─────────────────────────────────┘
                                      │
                                      ▼
    ┌───────────────────────────────────────────────────────────────────┐
    │ DUAL-METRIC DISPATCH & EXPLAINABILITY ENGINE                      │
    │ ───────────────────────────────────────────────────────────────── │
    │ • Machine Learning Probability: Physical phenomenon class         │
    │ • Operational Risk Score (0-100): Composite emergency consequence │
    │ • Risk Tiers: LOW (<40) | MODERATE (40-69) | HIGH | CRITICAL      │
    │ • Explainability: Multi-factor ground-truth evidence cards        │
    └───────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Differentiators & Technical Defensibility

1. **Zero Data Leakage:**
   - Strict exclusion of auditing/provenance columns (`firms_deep_*`, `incident_name`, `event_id`).
   - Strict exclusion of post-event response metrics (`fire_duration_days`, `suppressed_water_volume`, `damage_cost`).
   - Temporal causality isolation: historical statistics only use observations prior to event time ($T_{\text{obs}} \le T_{\text{event}}$).
2. **Real Benchmark Dataset (520 Verified Incidents):**
   - 100% 1-to-1 join integrity between `data/incidents_500_features.csv` and `data/ground_truth_labels.csv`.
   - 0 orphan rows, 0 duplicate IDs, balanced class distribution.
3. **Multi-Model Empirical Comparison:**
   - Real 5-fold cross-validation and independent holdout testing comparing CatBoost, HistGradientBoosting, Random Forest, Gradient Boosting, and Logistic Regression.
4. **Dual-Metric Separation:**
   - ML Probability represents physical class classification.
   - Operational Risk Score represents emergency dispatch consequence (combining FRP, surge multiple, facility hazard rating, and population proximity).
5. **Multi-Satellite FIRMS Support:**
   - Native ingestion of VIIRS NOAA-20, NOAA-21, Suomi-NPP (375m GSD) and MODIS (1km GSD) with deterministic deduplication ($\Delta d \le 375\text{m}, \Delta t \le 15\text{min}$).
6. **Sentinel-2 MSI Optical Cross-Verification:**
   - 10m Ground Sample Distance (GSD) multispectral index calculations: NDVI (vegetation health) and NBR (burn scar severity).
7. **Honest Credential & Data Provenance:**
   - If NASA FIRMS or Copernicus credentials are not set, FLAREX operates with verified local durable caches and explicit UI provenance badges rather than faking live data.

---

## 4. API Reference

FLAREX exposes a fully map-friendly REST API:

| Method | Endpoint | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health, database status & ingestion metrics | None |
| `GET` | `/api/hotspots` | Spatial thermal hotspots list or GeoJSON `FeatureCollection` | `bbox`, `format=geojson`, `limit`, `confidence_min` |
| `GET` | `/api/sites` | Verified persistent industrial thermal sites catalog | `limit`, `format=geojson` |
| `GET` | `/api/sites/[id]` | Detailed persistence metrics and 90d history for site | None |
| `GET` | `/api/events` | Curated thermal events benchmark list | `limit`, `risk_level`, `classification` |
| `GET` | `/api/events/[id]` | Event detail with multi-satellite telemetry & audit trail | None |
| `POST` | `/api/predict` | Two-stage AI inference for arbitrary coordinate & FRP | JSON payload (`latitude`, `longitude`, `frp`, `brightness_temperature`) |
| `GET` | `/api/model/metrics` | Real evaluation benchmark metrics, confusion matrix, and model comparisons | None |

### Sample Prediction Request (`POST /api/predict`)

```bash
curl -X POST http://localhost:3000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 21.7125,
    "longitude": 72.5842,
    "frp": 380.0,
    "brightness_temperature": 412.5,
    "satellite": "VIIRS_NOAA20_NRT",
    "daynight": "D",
    "facility_distance_meters": 65.0,
    "facility_name": "ONGC Dahej Petrochemical Refinery",
    "facility_type": "Petrochemical & Chemical Refinery"
  }'
```

---

## 5. Getting Started

### Prerequisites
- Node.js >= 18.x
- Python 3.10+ (for ML model training scripts)

### Installation
```bash
# Clone the repository
git clone https://github.com/martyn-in/flarex.git
cd SIH

# Install Node dependencies
npm install

# (Optional) Re-train Stage B Machine Learning Models
python3 scripts/train_stage_b_models.py
```

### Environment Configuration
Create a `.env.local` file in the root directory:
```env
# NASA FIRMS MAP Key (Optional: system falls back to high-fidelity cache if omitted)
NASA_FIRMS_MAP_KEY=your_firms_map_key_here

# Copernicus Data Space Ecosystem (Optional for live Sentinel-2 queries)
COPERNICUS_CLIENT_ID=your_client_id
COPERNICUS_CLIENT_SECRET=your_client_secret
```

### Running the Application
```bash
# Start Next.js development server
npm run dev

# Open in browser:
# http://localhost:3000 (Cinematic Welcome Screen)
# http://localhost:3000?app=1 (Direct to Mission Dashboard)
```

### Running Test Suites
```bash
# Run unit verification tests (Geospatial math, Stage A leakage boundary, Stage B artifact integrity)
node --test tests/verification.test.cjs

# Run REST API integration test suite
node --test tests/api_endpoints.test.cjs
```

---

## 6. Project Structure

```
├── data/
│   ├── incidents_500_features.csv    # 520 verified incident records (47 leakage-free features)
│   ├── ground_truth_labels.csv       # Ground truth verified labels (5 classes)
│   ├── stage_b_model_artifact.json   # Trained CatBoost weights, scalers, taxonomy
│   ├── model_evaluation.json         # Real 5-fold CV & holdout benchmarks, confusion matrix
│   └── flarex.sqlite                 # Durable SQLite database (WAL mode)
├── scripts/
│   └── train_stage_b_models.py       # Python training pipeline (CatBoost, LightGBM, RF)
├── src/
│   ├── app/
│   │   ├── api/                      # REST API routes (/predict, /hotspots, /sites, /health, /model/metrics)
│   │   ├── layout.tsx                # Root layout with providers & fonts
│   │   └── page.tsx                  # Landing page and main mission dashboard
│   ├── components/
│   │   ├── dashboard/                # Main mission dashboard container
│   │   ├── map/                      # Leaflet / GIS multi-layer map viewer
│   │   ├── panels/                   # AIModelPanel, IncidentsPanel, PersistentSourcesPanel
│   │   └── RightIncidentPanel.tsx    # Multi-tab incident inspection with Sentinel-2 MSI indices
│   ├── lib/
│   │   └── db.ts                     # Database connection, dynamic migrations, seed data
│   └── services/
│       ├── firms/                    # Multi-satellite FIRMS ingestion & deduplication
│       ├── landcover/                # ESA WorldCover 10m classification & buffers
│       ├── osm/                      # OpenStreetMap Overpass infrastructure queries
│       ├── satellite/                # Sentinel-2 MSI multispectral cross-verification
│       └── intelligence/
│           ├── persistenceEngine.ts  # Stage A persistence & surge detection engine
│           ├── fireClassifier.ts     # Stage B tabular ML classifier (in-process Node inference)
│           └── pipeline.ts           # Chained Two-Stage pipeline & dual-metric risk scoring
└── tests/
    ├── api_endpoints.test.cjs        # REST API endpoint automated test suite (8 tests)
    └── verification.test.cjs         # Core geospatial & ML integrity test suite (5 tests)
```

---

## 7. License & Attribution
Developed for the **National Technical Research Organisation (NTRO)** Disaster Management Theme (Problem Statement ID: 26162). All satellite data products are subject to NASA FIRMS and ESA Copernicus data usage policies.
