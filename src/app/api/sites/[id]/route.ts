import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { computePersistenceRollingFeatures, evaluateStageAPersistence } from '@/services/intelligence/persistenceEngine';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    // Query site or hotspot
    const site = db.prepare(`SELECT * FROM persistent_sources WHERE id = ?`).get(id) as any;
    const event = db.prepare(`SELECT * FROM thermal_events WHERE id = ? OR event_id = ?`).get(id, id) as any;

    if (!site && !event) {
      return NextResponse.json(
        { success: false, error: `Site or thermal cluster '${id}' not found.` },
        { status: 404 }
      );
    }

    const lat = site ? site.cluster_latitude : event.latitude;
    const lon = site ? site.cluster_longitude : event.longitude;

    // Fetch historical observations in this spatial neighborhood
    const historyRows = db.prepare(`
      SELECT * FROM historical_observations
      ORDER BY datetime DESC
      LIMIT 100
    `).all() as any[];

    const historyObs = historyRows.map((r) => ({
      latitude: r.latitude,
      longitude: r.longitude,
      acqDate: r.acq_date,
      acqTime: r.acq_time,
      datetime: r.datetime,
      frp: r.frp,
      brightness: r.brightness,
      satellite: r.satellite,
      confidence: r.confidence,
    }));

    const rolling = computePersistenceRollingFeatures(
      lat,
      lon,
      site ? site.current_frp : event.frp,
      event ? event.brightness_t4 : 340.0,
      event ? event.timestamp : new Date().toISOString(),
      historyObs,
      {
        nearestIndustrialDistanceKm: 0.42,
        nearestOilGasDistanceKm: 0.85,
        nearestRefineryDistanceKm: 0.42,
        nearestPowerPlantDistanceKm: 15.0,
        nearestSteelPlantDistanceKm: 20.0,
        nearestMineDistanceKm: 100.0,
        withinIndustrialArea: true,
        osmFacilityType: 'Refinery / Chemical Complex',
      }
    );

    const stageA = evaluateStageAPersistence(rolling);

    return NextResponse.json({
      success: true,
      siteId: id,
      siteDetails: site || event,
      persistenceAnalysis: stageA,
      historyCount: historyRows.length,
      history: historyRows.slice(0, 30),
    });
  } catch (error: unknown) {
    console.error('Error in GET /api/sites/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Database error fetching site details.' },
      { status: 500 }
    );
  }
}
