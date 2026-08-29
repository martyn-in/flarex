import { NextRequest, NextResponse } from 'next/server';
import { getThermalEvents, fetchLiveFirmsData, ingestFirmsDetections } from '@/services/firms';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const confidenceMin = searchParams.get('confidence') ? parseFloat(searchParams.get('confidence')!) : undefined;
    const riskLevel = searchParams.get('risk_level') || undefined;
    const classification = searchParams.get('classification') || undefined;
    const status = searchParams.get('status') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const autoSync = searchParams.get('sync') === 'true';

    if (autoSync) {
      const liveData = await fetchLiveFirmsData();
      if (liveData.success && liveData.records.length > 0) {
        await ingestFirmsDetections(liveData.records);
      }
    }

    const events = getThermalEvents({
      confidenceMin,
      riskLevel,
      classification,
      status,
      limit,
    });

    return NextResponse.json({
      success: true,
      source: process.env.NASA_FIRMS_MAP_KEY ? 'NASA_FIRMS_LIVE' : 'CACHED_REAL_DATASET',
      count: events.length,
      timestamp: new Date().toISOString(),
      events,
    });
  } catch (error: any) {
    console.error('Error in /api/firms/latest:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to retrieve thermal detections',
      },
      { status: 500 }
    );
  }
}
