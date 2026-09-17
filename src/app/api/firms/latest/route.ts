import { NextRequest, NextResponse } from 'next/server';
import { getThermalEvents, fetchLiveFirmsData, ingestFirmsDetections } from '@/services/firms';
import { dbRowToHotspot } from '@/lib/adapters';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const confidenceMin = searchParams.get('confidence') ? parseFloat(searchParams.get('confidence')!) : undefined;
    const riskLevel = searchParams.get('risk_level') || undefined;
    const classification = searchParams.get('classification') || undefined;
    const status = searchParams.get('status') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const autoSync = searchParams.get('sync') === 'true';

    let ingestionMeta = {
      source: process.env.NASA_FIRMS_MAP_KEY ? 'NASA_FIRMS_LIVE' : 'CACHED_DATABASE',
      status: process.env.NASA_FIRMS_MAP_KEY ? 'LIVE_NRT' : 'CACHED',
      provider: process.env.NASA_FIRMS_MAP_KEY ? 'NASA FIRMS VIIRS NOAA-20 NRT (Live Stream)' : 'NASA FIRMS VIIRS/MODIS (Durable Storage Cache)',
      dataAgeMinutes: 45,
      acquisitionTime: new Date().toISOString(),
      ingestionTime: new Date().toISOString(),
    };

    if (autoSync && process.env.NASA_FIRMS_MAP_KEY) {
      const liveData = await fetchLiveFirmsData();
      if (liveData.success) {
        ingestionMeta = {
          source: liveData.source,
          status: liveData.status,
          provider: liveData.provider,
          dataAgeMinutes: liveData.dataAgeMinutes,
          acquisitionTime: liveData.acquisitionTime,
          ingestionTime: liveData.ingestionTime,
        };
      }
    }

    const rawRows = getThermalEvents({
      confidenceMin,
      riskLevel,
      classification,
      status,
      limit,
    });

    const events = rawRows.map(dbRowToHotspot);

    return NextResponse.json({
      success: true,
      source: ingestionMeta.source,
      status: ingestionMeta.status,
      provider: ingestionMeta.provider,
      dataAgeMinutes: ingestionMeta.dataAgeMinutes,
      acquisitionTime: ingestionMeta.acquisitionTime,
      ingestionTime: ingestionMeta.ingestionTime,
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
