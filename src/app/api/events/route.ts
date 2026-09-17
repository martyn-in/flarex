import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const classification = searchParams.get('classification');
    const severity = searchParams.get('severity');
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    const db = getDb();
    let query = `SELECT * FROM thermal_events WHERE 1=1`;
    const params: (string | number)[] = [];

    if (classification) {
      query += ` AND classification = ?`;
      params.push(classification);
    }
    if (severity) {
      query += ` AND risk_level = ?`;
      params.push(severity.toUpperCase());
    }

    query += ` ORDER BY timestamp DESC LIMIT ?`;
    params.push(limit);

    const rows = db.prepare(query).all(...params) as any[];

    if (format === 'geojson') {
      const geojson = {
        type: 'FeatureCollection',
        features: rows.map((r) => ({
          type: 'Feature',
          id: r.id,
          geometry: {
            type: 'Point',
            coordinates: [r.longitude, r.latitude],
          },
          properties: {
            eventId: r.event_id,
            locationName: r.location_name,
            timestamp: r.timestamp,
            frp: r.frp,
            classification: r.classification,
            confidence: r.classification_confidence,
            riskScore: r.risk_score,
            riskLevel: r.risk_level,
            nearestFacility: r.nearest_facility_name,
            nearestFacilityType: r.nearest_facility_type,
            distanceMeters: r.nearest_facility_distance_m,
          },
        })),
      };
      return NextResponse.json(geojson);
    }

    return NextResponse.json({
      success: true,
      totalEvents: rows.length,
      events: rows,
    });
  } catch (error: unknown) {
    console.error('Error in GET /api/events:', error);
    return NextResponse.json(
      { success: false, error: 'Database error fetching thermal events.' },
      { status: 500 }
    );
  }
}
