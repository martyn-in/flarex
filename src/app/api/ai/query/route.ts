import { NextRequest, NextResponse } from 'next/server';
import { getThermalEvents } from '@/services/firms';
import { mapThermalEventToHotspot } from '@/lib/adapters';
import { generateAssistantResponse } from '@/services/intelligence/assistant';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = body?.query || '';
    const selectedId = body?.selectedHotspotId || null;

    if (!query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const events = getThermalEvents({ limit: 60 });
    const hotspots = events.map(mapThermalEventToHotspot);
    const selectedHotspot = selectedId ? hotspots.find((h) => h.id === selectedId) || null : null;

    const response = generateAssistantResponse(query, {
      hotspots,
      selectedHotspot,
    });

    return NextResponse.json({
      success: true,
      query,
      response,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/query:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process AI query' },
      { status: 500 }
    );
  }
}
