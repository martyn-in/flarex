import { NextRequest, NextResponse } from 'next/server';
import { getThermalEventById } from '@/services/firms';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = getThermalEventById(id);

    if (!data.event) {
      return NextResponse.json(
        { success: false, error: `Hotspot event '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error in /api/firms/hotspot/[id]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch hotspot details' },
      { status: 500 }
    );
  }
}
