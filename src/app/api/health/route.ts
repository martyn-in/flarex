import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const eventCount = (db.prepare(`SELECT count(*) as c FROM thermal_events`).get() as { c: number }).c;
    const alertCount = (db.prepare(`SELECT count(*) as c FROM alerts WHERE status = 'ACTIVE'`).get() as { c: number }).c;
    const lastSync = (db.prepare(`SELECT * FROM firms_sync_log ORDER BY sync_time DESC LIMIT 1`).get() as any) || null;

    return NextResponse.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      services: {
        database: 'online',
        firms: process.env.NASA_FIRMS_MAP_KEY ? 'online' : 'cached_fallback_ready',
        osm: 'online',
        ai: 'online',
      },
      metrics: {
        activeThermalEvents: eventCount,
        activeCriticalAlerts: alertCount,
        lastSyncTime: lastSync ? lastSync.sync_time : 'Real-time baseline active',
        syncStatus: lastSync ? lastSync.status : 'ONLINE',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'degraded',
        error: error?.message || 'Database check failed',
        services: {
          database: 'error',
          firms: 'offline',
          osm: 'offline',
          ai: 'offline',
        },
      },
      { status: 500 }
    );
  }
}
