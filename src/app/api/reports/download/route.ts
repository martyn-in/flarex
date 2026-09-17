import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { dbRowToHotspot } from '@/lib/adapters';
import { generateIncidentPdfBuffer } from '@/lib/pdfGenerator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'geojson';
    const eventId = searchParams.get('eventId');

    const db = getDb();
    const rows = db.prepare(`SELECT * FROM thermal_events ORDER BY timestamp DESC`).all() as any[];
    const hotspots = rows.map(dbRowToHotspot);

    if (type === 'geojson') {
      const geojson = {
        type: 'FeatureCollection',
        features: hotspots.map((h) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: h.coordinates,
          },
          properties: {
            id: h.id,
            eventId: h.eventId,
            name: h.name,
            location: h.location,
            state: h.state,
            severity: h.severity,
            status: h.status,
            classification: h.classification,
            confidence: h.confidence,
            frp: h.frp,
            baselineFrp: h.baselineFrp,
            baselineRatio: h.baselineRatio,
            temperature: h.temperature,
            landCover: h.landCover,
            satellite: h.satellite,
            timestamp: h.timestamp,
          },
        })),
      };

      return new NextResponse(JSON.stringify(geojson, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/geo+json',
          'Content-Disposition': `attachment; filename="flarex-hotspots-${new Date().toISOString().slice(0, 10)}.geojson"`,
        },
      });
    }

    if (type === 'csv') {
      const headers =
        'ID,Event_ID,Name,Location,State,Longitude,Latitude,Severity,Classification,Confidence,FRP_MW,Baseline_FRP,Baseline_Ratio,Temperature_C,Land_Cover,Satellite,Timestamp\n';
      const csvRows = hotspots
        .map(
          (h) =>
            `"${h.id}","${h.eventId}","${h.name}","${h.location}","${h.state}",${h.coordinates[0]},${h.coordinates[1]},"${h.severity}","${h.classification}",${h.confidence},${h.frp},${h.baselineFrp},${h.baselineRatio},${h.temperature},"${h.landCover}","${h.satellite}","${h.timestamp}"`
        )
        .join('\n');

      return new NextResponse(headers + csvRows, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="flarex-telemetry-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    if (type === 'pdf') {
      const target = eventId ? hotspots.find((h) => h.eventId === eventId || h.id === eventId) || hotspots[0] : hotspots[0];
      const pdfBuffer = generateIncidentPdfBuffer(target);

      return new NextResponse(pdfBuffer as any, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="flarex-incident-${target.eventId}.pdf"`,
        },
      });
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in /api/reports/download:', error);
    return NextResponse.json({ error: error?.message || 'Report generation failed' }, { status: 500 });
  }
}
