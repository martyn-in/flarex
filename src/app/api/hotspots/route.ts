import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Bounding box filter: minLon,minLat,maxLon,maxLat
    const bboxParam = searchParams.get('bbox');
    const format = searchParams.get('format') || 'json'; // 'json' or 'geojson'
    const classification = searchParams.get('classification');
    const industrialOnly = searchParams.get('industrial_only') === 'true' || searchParams.get('industrialOnly') === 'true';
    const persistentOnly = searchParams.get('persistent_only') === 'true' || searchParams.get('persistentOnly') === 'true';
    const minConfidence = parseFloat(searchParams.get('min_confidence') || searchParams.get('minConfidence') || '0');
    const satellite = searchParams.get('satellite');
    const minFrp = parseFloat(searchParams.get('min_frp') || searchParams.get('minFrp') || '0');
    const maxFrp = parseFloat(searchParams.get('max_frp') || searchParams.get('maxFrp') || '999999');
    const startDate = searchParams.get('start_date') || searchParams.get('startDate');
    const endDate = searchParams.get('end_date') || searchParams.get('endDate');

    // Pagination (prevent unbounded database queries)
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '100', 10)));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const offset = (page - 1) * limit;

    const db = getDb();

    // Build dynamic query
    let query = `SELECT * FROM thermal_events WHERE 1=1`;
    const params: (string | number)[] = [];

    // Bounding Box
    if (bboxParam) {
      const parts = bboxParam.split(',').map((p) => parseFloat(p.trim()));
      if (parts.length === 4 && parts.every((p) => !isNaN(p))) {
        const [minLon, minLat, maxLon, maxLat] = parts;
        query += ` AND longitude >= ? AND longitude <= ? AND latitude >= ? AND latitude <= ?`;
        params.push(minLon, maxLon, minLat, maxLat);
      }
    }

    // FRP Bounds
    if (minFrp > 0) {
      query += ` AND frp >= ?`;
      params.push(minFrp);
    }
    if (maxFrp < 999999) {
      query += ` AND frp <= ?`;
      params.push(maxFrp);
    }

    // Confidence
    if (minConfidence > 0) {
      query += ` AND confidence >= ?`;
      params.push(minConfidence);
    }

    // Satellite
    if (satellite) {
      query += ` AND satellite LIKE ?`;
      params.push(`%${satellite}%`);
    }

    // Date Range
    if (startDate) {
      query += ` AND timestamp >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND timestamp <= ?`;
      params.push(endDate);
    }

    // Classification filter
    if (classification) {
      query += ` AND classification = ?`;
      params.push(classification);
    }

    // Industrial Only
    if (industrialOnly) {
      query += ` AND (classification = 'Industrial Fire' OR classification = 'Persistent Industrial Thermal Source' OR land_cover LIKE '%Industrial%')`;
    }

    // Persistent Only
    if (persistentOnly) {
      query += ` AND (classification = 'Persistent Industrial Thermal Source' OR persistence_score >= 60)`;
    }

    // Count query for pagination meta
    const countQuery = query.replace('SELECT *', 'SELECT count(*) as total');
    const totalCount = (db.prepare(countQuery).get(...params) as { total: number })?.total || 0;

    // Order and limit
    query += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const rows = db.prepare(query).all(...params) as any[];

    // Return GeoJSON format if requested
    if (format === 'geojson') {
      const geojson = {
        type: 'FeatureCollection',
        totalFeatures: totalCount,
        page,
        limit,
        features: rows.map((row) => ({
          type: 'Feature',
          id: row.id,
          geometry: {
            type: 'Point',
            coordinates: [row.longitude, row.latitude],
          },
          properties: {
            eventId: row.event_id,
            locationName: row.location_name,
            timestamp: row.timestamp,
            frp: row.frp,
            brightnessT4: row.brightness_t4,
            brightnessT5: row.brightness_t5,
            confidence: row.confidence,
            satellite: row.satellite,
            instrument: row.instrument,
            daynight: row.daynight,
            classification: row.classification,
            classificationConfidence: row.classification_confidence,
            riskScore: row.risk_score,
            riskLevel: row.risk_level,
            persistenceScore: row.persistence_score,
            persistenceDaysRatio: row.persistence_days_ratio,
            baselineRatio: row.baseline_ratio,
            landCover: row.land_cover,
            nearestFacilityName: row.nearest_facility_name,
            nearestFacilityType: row.nearest_facility_type,
            nearestFacilityDistanceM: row.nearest_facility_distance_m,
          },
        })),
      };

      return NextResponse.json(geojson);
    }

    return NextResponse.json({
      success: true,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hotspots: rows,
    });
  } catch (error: unknown) {
    console.error('Error in GET /api/hotspots:', error);
    return NextResponse.json(
      { success: false, error: 'Database error fetching geospatial hotspots.' },
      { status: 500 }
    );
  }
}
