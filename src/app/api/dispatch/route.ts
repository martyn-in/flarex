import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, facilityName, agency, method, payload } = body;

    if (!eventId || !agency) {
      return NextResponse.json({ success: false, error: 'Missing required parameters (eventId, agency)' }, { status: 400 });
    }

    const db = getDb();
    const ticketId = `DSP-${Date.now().toString().slice(-6)}`;
    const idempotencyKey = `IDEMP-${eventId}-${Date.now()}`;
    const webhookUrl = process.env.DISPATCH_WEBHOOK_URL;

    let dispatchStatus = 'SIMULATED_LOGGED';
    let providerResponse = 'Logged to audit trail. No live emergency webhook configured.';
    let isSimulation = 1;

    if (webhookUrl && webhookUrl.startsWith('http')) {
      isSimulation = 0;
      try {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticketId, eventId, facilityName, agency, method, payload, timestamp: new Date().toISOString() }),
        });
        dispatchStatus = res.ok ? 'DELIVERED' : 'FAILED';
        providerResponse = `Webhook returned HTTP ${res.status}`;
      } catch (err: any) {
        dispatchStatus = 'FAILED';
        providerResponse = err?.message || 'Webhook network error';
      }
    }

    // Record into dispatch_requests
    db.prepare(`
      INSERT INTO dispatch_requests (id, event_id, facility_name, destination_agency, contact_method, status, is_simulation, idempotency_key, payload_json, provider_response)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      ticketId,
      eventId,
      facilityName || 'Industrial Asset',
      agency,
      method || 'API / Webhook',
      dispatchStatus,
      isSimulation,
      idempotencyKey,
      JSON.stringify(payload || body),
      providerResponse
    );

    // Record into audit_logs
    db.prepare(`
      INSERT INTO audit_logs (id, action, actor, resource_type, resource_id, details)
      VALUES (?, 'DISPATCH_ALERT', 'OPERATOR_CONSOLE', 'THERMAL_EVENT', ?, ?)
    `).run(
      `AUD-${Date.now()}`,
      eventId,
      `Dispatched alert to ${agency} via ${method || 'Webhook'}. Status: ${dispatchStatus} (Ticket: ${ticketId})`
    );

    return NextResponse.json({
      success: true,
      ticketId,
      status: dispatchStatus,
      isSimulation: Boolean(isSimulation),
      message: isSimulation
        ? `Simulation Mode: Alert dossier recorded in audit log with Ticket ${ticketId}. (Live webhook not configured)`
        : `Dispatch sent to ${agency}. Confirmation: ${providerResponse}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/dispatch:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Dispatch failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare(`SELECT * FROM dispatch_requests ORDER BY created_at DESC LIMIT 20`).all();
    return NextResponse.json({ success: true, dispatches: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
