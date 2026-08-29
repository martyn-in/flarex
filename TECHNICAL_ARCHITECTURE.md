# 🔥 FlameX: Geospatial Thermal Intelligence Layer
## Complete Technical Stack, Architecture & Data Pipeline Blueprint

---

## 1. Executive Summary & Vision

**FlameX** is not another satellite map or FIRMS visualization clone. It is a **Geospatial & Historical Thermal Intelligence Layer** built on top of NASA FIRMS active fire satellite data.

```
NASA Satellite (VIIRS/MODIS)
         ↓
🔥 "Thermal Anomaly Detected"
         ↓
   ┌────────────────────────────────────────────────────────┐
   │                    FLAMEX PLATFORM                     │
   │  • Industrial Infrastructure Proximity (OpenStreetMap) │
   │  • 10m High-Resolution Land Cover (ESA WorldCover)     │
   │  • 30-Day Historical Baseline & Recurrence Engine      │
   │  • 10m Multispectral Optical Verification (Sentinel-2) │
   │  • Human Demographic Settlement Vulnerability Grids    │
   │  • Multi-Class Machine Learning Ensemble               │
   └────────────────────────────────────────────────────────┘
         ↓
  ✅ Actionable Intelligence:
  - Classification: Industrial Fire vs Normal Gas Flare vs Wildfire vs Agricultural Burn
  - Abnormality: 3.6× Above Historical Baseline (Severe Radiance Spike)
  - Explainability: Transparent, verifiable "Why?" checklist with 7 evidence points
```

---

## 2. The 5 Core Data Sources

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. 🔥 NASA FIRMS        → Active Fire Thermal Telemetry (VIIRS 375m / MODIS 1km)        │
│ 2. 🏭 OpenStreetMap     → Industrial Assets (Refineries, Power Plants, Steel, Mines)   │
│ 3. 🌍 ESA WorldCover    → 10m Land-Cover Context (Built-up, Forest, Cropland, Mining)   │
│ 4. 🛰️ Sentinel-2 Optical→ 10m Multispectral Verification (B04, B03, B02 & SWIR B12)    │
│ 5. 👥 Population Grids  → Human Settlement Proximity & Vulnerability Escalation         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

| Source | Resolution / Format | Latency | Role in FlameX |
| :--- | :--- | :--- | :--- |
| **NASA FIRMS** | 375m (VIIRS) / 1km (MODIS) | ~1.8s NRT Ingestion | Primary heat anomaly trigger. Delivers FRP (MW), skin temperature ($T_4, T_5$), confidence, day/night flags. |
| **OpenStreetMap (OSM)** | Vector Geofences & Nodes | Real-time Cache | Spatial distance ($\Delta d_{\text{facility}}$) to refineries, chemical SEZs, steel furnaces, power stations, and LNG hubs. |
| **ESA WorldCover** | 10m Pixel Grid | Instant Query | Contextual land classification: *Industrial/Built-up, Dense Forest, Cropland, Mining/Bare Soil, Water*. |
| **Sentinel-2 MSI** | 10m Multispectral Bands | On Demand | Post-detection optical verification of smoke plumes, flaring stacks, and structural damage. |
| **Global Population Grids** | High-Res Settlement Grids | Continuous | Measures distance to nearest residential communities to elevate emergency alert severity. |

---

## 3. Mathematical Formulation & Feature Extraction

For each thermal detection $i$, FlameX constructs a multi-dimensional feature vector $\mathbf{x}_i$:

$$\mathbf{x}_i = \begin{bmatrix} \text{FRP}_i \\ T_{4,i} \\ T_{5,i} \\ \Delta d_{\text{facility}, i} \\ \text{FacilityType}_i \\ \text{LandCover}_i \\ \mathcal{R}_{\text{baseline}, i} = \frac{\text{FRP}_i}{\mu_{\text{baseline}, i}} \\ \mathcal{P}_{\text{recurrence}, i} = \frac{D_{\text{recurrent}, i}}{30} \\ \Delta d_{\text{population}, i} \end{bmatrix}$$

### Baseline & Abnormality Logic:
* **Historical Mean ($\mu_{\text{baseline}}$)**: 30-day average Fire Radiative Power for the spatial grid cell.
* **Radiance Ratio ($\mathcal{R}_{\text{baseline}}$)**:
  $$\mathcal{R}_{\text{baseline}} \ge 2.0 \implies \mathbf{ABNORMAL\ SURGE\ /\ CRITICAL\ FIRE}$$
  $$\mathcal{R}_{\text{baseline}} \approx 1.0 \text{ with } \mathcal{P}_{\text{recurrence}} \ge \frac{18}{30} \implies \mathbf{NORMAL\ OPERATIONAL\ RECURRING\ FLARE}$$

---

## 4. Multi-Class AI Classification & Explainability Engine

```
                                  [ Thermal Anomaly ]
                                           │
                ┌──────────────────────────┴──────────────────────────┐
      [ Industrial Land Cover? ]                             [ Non-Industrial Land Cover? ]
                │                                                         │
       ┌────────┴────────┐                                       ┌────────┴────────┐
[ High Recurrence? ]  [ Sudden Spike? ]                   [ Dense Forest? ]   [ Cropland? ]
       │                         │                               │                   │
  🟢 Gas Flare           🔴 Industrial Fire                  🌲 Wildfire       🌾 Crop Residue
 (Jamnagar 1.04×)        (Dahej SEZ 3.6×)                  (Simlipal 140MW)    (Sangrur 32MW)
```

### Deterministic "Why?" Explainability Generator
Instead of opaque black-box percentages, FlameX outputs verifiable evidence checkmarks:
1. `✓ 65 m from XYZ Petrochemical Refinery Tank Farm (OSM)`
2. `✓ Industrial / Built-up land cover (ESA WorldCover 10m)`
3. `✓ Extreme thermal radiance: 380.0 MW (Skin temp: 139°C) (NASA FIRMS)`
4. `✓ 3.6× above 30-day historical baseline (105.0 MW typical) (History Engine)`
5. `✓ Low recurrence (3/30 days — sudden catastrophic onset)`
6. `✓ Population proximity: 450 m from Dahej settlement (Population Data)`
7. `✓ Zero adjacent forest or agricultural burning footprint`

---

## 5. Technology Stack Breakdown

### Frontend & Visual Telemetry
* **Framework**: Next.js 16 (App Router + React 19 + Turbopack)
* **Interactive 2D Satellite GIS**: MapLibre GL JS with custom WebGL pulse animations & high-res Esri satellite imagery
* **Interactive 3D Earth Globe**: Three.js + React Three Fiber (`src/components/landing/CinematicEarth.tsx`)
* **Radiative Trajectory Charts**: Recharts (7-Day FRP curve with baseline reference line)
* **Styling**: Vanilla CSS Design Tokens + Custom Fire-Glassmorphism System + Tailwind CSS
* **Icons**: Lucide React

### Backend, Database & Serverless Architecture
* **Serverless Runtime**: Node.js 24 on Vercel Serverless Functions
* **Database**: SQLite (`better-sqlite3`) with Write-Ahead Logging (WAL) and automatic `/tmp` mounting for zero-latency serverless execution
* **State Management**: React Context (`IntelligenceContext`) computing all operational metrics dynamically with zero hardcoded values

---

## 6. Live API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | System health check (database, FIRMS ingestion, OSM, AI status). |
| `/api/firms/latest` | `GET` | Returns real-time enriched & classified thermal events with 6-class probability distribution and "Why?" explainability. |
| `/api/firms/sync` | `POST` | Triggers immediate synchronization with NASA FIRMS active satellite constellation. |
| `/api/firms/hotspot/[id]` | `GET` | Detailed telemetry, 7-day historical curve, and OSM geofence for a single event. |
| `/api/ai/query` | `POST` | Grounded AI Assistant engine querying active database records. |

---

## 7. Deployment & Source Repositories

* 🌐 **Live Web Application**: [https://flarex-gamma.vercel.app](https://flarex-gamma.vercel.app)
* 🐙 **GitHub Repository**: [https://github.com/martyn-in/flarex](https://github.com/martyn-in/flarex)
* 📦 **Local Machine Archive**: `/Users/apple/Desktop/flarex-flamex-project.zip`
