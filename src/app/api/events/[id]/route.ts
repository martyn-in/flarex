import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const event = db.prepare(`SELECT * FROM thermal_events WHERE id = ? OR event_id = ?`).get(id, id) as any;

    if (!event) {
      return NextResponse.json(
        { success: false, error: `Event '${id}' not found.` },
        { status: 404 }
      );
    }

    const alerts = db.prepare(`SELECT * FROM alerts WHERE thermal_event_id = ? OR event_id = ?`).all(event.id, event.event_id);

    return NextResponse.json({
      success: true,
      event,
      alerts,
    });
  } catch (error: unknown) {
    console.error('Error in GET /api/events/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Database error fetching event.' },
      { status: 500 }
    );
  }
}
