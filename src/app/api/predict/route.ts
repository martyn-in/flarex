import { NextRequest, NextResponse } from 'next/server';
import {
  processThermalAnomalyPipeline,
  RawHotspotInput,
  EnrichedContextInput,
} from '@/services/intelligence/pipeline';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate payload requirements
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload. Body must be an object.' },
        { status: 400 }
      );
    }

    const { latitude, longitude, frp, brightness_temperature } = body;

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      typeof frp !== 'number' ||
      typeof brightness_temperature !== 'number'
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required numerical parameters: latitude, longitude, frp, brightness_temperature.',
        },
        { status: 422 }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { success: false, error: 'Geographical coordinates out of valid range (-90..90, -180..180).' },
        { status: 422 }
      );
    }

    if (frp < 0 || brightness_temperature <= 100) {
      return NextResponse.json(
        { success: false, error: 'Physical values out of bounds (frp must be >= 0, brightness > 100K).' },
        { status: 422 }
      );
    }

    // 2. Assemble inputs with robust defaults
    const hotspot: RawHotspotInput = {
      id: body.id || `HOTSPOT-${Date.now()}`,
      latitude,
      longitude,
      frp,
      brightnessT4: brightness_temperature,
      brightnessT5: body.brightness_ti5 || 300.0,
      confidence: body.confidence ?? 85,
      satellite: body.satellite || 'VIIRS_NOAA20',
      instrument: body.instrument || 'VIIRS',
      daynight: body.daynight || (body.hour >= 6 && body.hour <= 18 ? 'D' : 'N'),
      scan: body.scan || 0.4,
      track: body.track || 0.4,
      timestamp: body.timestamp || new Date().toISOString(),
    };

    const context: EnrichedContextInput = {
      nearestFacilityName: body.nearest_facility_name || 'Industrial Facility',
      nearestFacilityType: body.nearby_facility_type || 'Industrial Complex',
      nearestFacilityDistanceKm: body.industrial_distance_km ?? 1.2,
      refineryDistanceKm: body.refinery_distance_km ?? 15.0,
      oilGasDistanceKm: body.oil_gas_facility_distance_km ?? 15.0,
      powerPlantDistanceKm: body.power_plant_distance_km ?? 25.0,
      steelPlantDistanceKm: body.steel_plant_distance_km ?? 30.0,
      mineDistanceKm: body.mine_distance_km ?? 50.0,
      withinIndustrialArea: Boolean(body.within_industrial_area),
      landCover: body.land_cover_type || 'Industrial / Built-up',
      forestDistanceKm: body.forest_distance_km ?? 10.0,
      urbanDistanceKm: body.urban_distance_km ?? 2.5,
      ndvi: body.ndvi ?? 0.15,
      fuelMoisturePct: body.fuel_moisture_pct ?? 20.0,
      temperatureC: body.temperature_c ?? 32.0,
      humidityPct: body.humidity_pct ?? 50.0,
      windSpeedKmh: body.wind_speed_kmh ?? 10.0,
      populationDistanceMeters: body.population_distance_meters ?? 1000,
      historicalObservations: Array.isArray(body.historical_observations)
        ? body.historical_observations
        : [],
    };

    // 3. Execute Stage A -> Stage B Intelligence Pipeline
    const result = processThermalAnomalyPipeline(hotspot, context);

    // 4. Return standard contract specified in Section 9
    return NextResponse.json({
      success: true,
      classification: result.stageBClassification
        ? result.stageBClassification.classification
        : result.isPersistentSource
        ? 'persistent_industrial_thermal_source'
        : 'other_unknown',
      display_classification: result.finalClassification,
      confidence: result.primaryConfidence,
      class_probabilities: {
        industrial_fire: result.classProbabilities.industrialFire,
        wildfire: result.classProbabilities.wildfire,
        agricultural_burn: result.classProbabilities.agriculturalBurn,
        mining_fire: result.classProbabilities.mining,
        other_unknown: result.classProbabilities.otherUnknown,
      },
      persistence: {
        is_persistent: result.isPersistentSource,
        score: result.persistenceScore,
        active_days_30d: result.stageAPersistence.rollingFeatures.activeDays30d,
        active_days_90d: result.stageAPersistence.rollingFeatures.activeDays90d,
        median_frp: result.stageAPersistence.rollingFeatures.medianFrp90d,
        frp_cv: result.stageAPersistence.rollingFeatures.frpCoefficientOfVariation,
      },
      operational_risk: {
        score: result.operationalRiskScore,
        level: result.riskLevel,
      },
      model_version: result.modelVersion,
      evidence: result.evidence.map((e) => e.text),
      explanation_summary: result.explanationSummary,
    });
  } catch (error: unknown) {
    console.error('Error in /api/predict:', error);
    // Never leak internal stack traces to clients
    return NextResponse.json(
      {
        success: false,
        error: 'Inference pipeline encountered an internal error processing the detection payload.',
      },
      { status: 500 }
    );
  }
}
