import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveFirmsData, ingestFirmsDetections } from '@/services/firms';

export async function POST(request: NextRequest) {
  try {
    const liveData = await fetchLiveFirmsData();

    if (!liveData.success && liveData.status === 'OFFLINE') {
      return NextResponse.json(
        { success: false, error: liveData.error || 'Failed to connect to FIRMS upstream provider' },
        { status: 502 }
      );
    }

    let ingestedCount = liveData.ingestedCount;
    let deduplicatedCount = liveData.deduplicatedCount;

    if (liveData.records && liveData.records.length > 0) {
      const res = await ingestFirmsDetections(liveData.records);
      ingestedCount = res.ingestedCount;
      deduplicatedCount = res.deduplicatedCount;
    }

    return NextResponse.json({
      success: true,
      source: liveData.source,
      status: liveData.status,
      provider: liveData.provider,
      ingested: ingestedCount,
      deduplicated: deduplicatedCount,
      dataAgeMinutes: liveData.dataAgeMinutes,
      totalReceived: liveData.records ? liveData.records.length : ingestedCount,
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
