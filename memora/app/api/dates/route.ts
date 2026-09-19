import { NextResponse } from 'next/server';
import { getUpcomingDates } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dates = await getUpcomingDates();
    return NextResponse.json({
      success: true,
      dates,
    });
  } catch (error: any) {
    console.error('Fetch upcoming dates error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch upcoming dates' },
      { status: 500 }
    );
  }
}
