import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveFirmsData, ingestFirmsDetections } from '@/services/firms';

export async function POST(request: NextRequest) {
  try {
    const liveData = await fetchLiveFirmsData();
    if (!liveData.success) {
      return NextResponse.json(
        { success: false, error: liveData.error || 'Failed to fetch FIRMS telemetry' },
        { status: 502 }
      );
    }

    const { ingestedCount, updatedCount } = await ingestFirmsDetections(liveData.records);

    return NextResponse.json({
      success: true,
      source: liveData.source,
      ingested: ingestedCount,
      updated: updatedCount,
      totalReceived: liveData.records.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/firms/sync:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Sync failed' },
      { status: 500 }
    );
  }
}
