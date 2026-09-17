import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const minPersistence = parseFloat(searchParams.get('min_persistence') || '0');
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    const db = getDb();

    // Query persistent sources table
    const sources = db.prepare(`
      SELECT ps.*, ifac.name as facility_name, ifac.sector, ifac.hazard_rating
      FROM persistent_sources ps
      LEFT JOIN industrial_facilities ifac ON ps.facility_id = ifac.id
      ORDER BY ps.mean_frp DESC
      LIMIT ?
    `).all(limit) as any[];

    // If format is geojson
    if (format === 'geojson') {
      const geojson = {
        type: 'FeatureCollection',
        features: sources.map((s) => ({
          type: 'Feature',
          id: s.id,
          geometry: {
            type: 'Point',
            coordinates: [s.cluster_longitude, s.cluster_latitude],
          },
          properties: {
            siteId: s.id,
            sourceName: s.source_name,
            classification: s.classification,
            operationalStatus: s.operational_status,
            meanFrp: s.mean_frp,
            peakFrp: s.peak_frp,
            currentFrp: s.current_frp,
            activeDays30d: s.active_days_30d,
            totalDetections: s.total_detections,
            facilityName: s.facility_name,
            sector: s.sector,
            firstSeen: s.first_seen,
            lastSeen: s.last_seen,
          },
        })),
      };
      return NextResponse.json(geojson);
    }

    return NextResponse.json({
      success: true,
      totalSites: sources.length,
      sites: sources,
    });
  } catch (error: unknown) {
    console.error('Error in GET /api/sites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve persistent thermal sites.' },
      { status: 500 }
    );
  }
}
