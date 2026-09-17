import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const settings = db.prepare(`SELECT * FROM user_settings WHERE id = 'default_user'`).get();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      temperature_unit,
      critical_frp_threshold,
      refresh_interval,
      audio_alerts,
      show_boundaries,
      show_industrial_clusters,
      active_map_layers,
    } = body;

    const db = getDb();
    db.prepare(`
      INSERT OR REPLACE INTO user_settings (
        id, temperature_unit, critical_frp_threshold, refresh_interval, audio_alerts,
        show_boundaries, show_industrial_clusters, active_map_layers, updated_at
      ) VALUES (
        'default_user',
        COALESCE(?, (SELECT temperature_unit FROM user_settings WHERE id = 'default_user')),
        COALESCE(?, (SELECT critical_frp_threshold FROM user_settings WHERE id = 'default_user')),
        COALESCE(?, (SELECT refresh_interval FROM user_settings WHERE id = 'default_user')),
        COALESCE(?, (SELECT audio_alerts FROM user_settings WHERE id = 'default_user')),
        COALESCE(?, (SELECT show_boundaries FROM user_settings WHERE id = 'default_user')),
        COALESCE(?, (SELECT show_industrial_clusters FROM user_settings WHERE id = 'default_user')),
        COALESCE(?, (SELECT active_map_layers FROM user_settings WHERE id = 'default_user')),
        CURRENT_TIMESTAMP
      )
    `).run(
      temperature_unit !== undefined ? temperature_unit : null,
      critical_frp_threshold !== undefined ? critical_frp_threshold : null,
      refresh_interval !== undefined ? refresh_interval : null,
      audio_alerts !== undefined ? (audio_alerts ? 1 : 0) : null,
      show_boundaries !== undefined ? (show_boundaries ? 1 : 0) : null,
      show_industrial_clusters !== undefined ? (show_industrial_clusters ? 1 : 0) : null,
      active_map_layers !== undefined ? JSON.stringify(active_map_layers) : null
    );

    const updated = db.prepare(`SELECT * FROM user_settings WHERE id = 'default_user'`).get();
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    console.error('Error in /api/settings:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
