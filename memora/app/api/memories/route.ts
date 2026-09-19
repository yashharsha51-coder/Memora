import { NextRequest, NextResponse } from 'next/server';
import { getAllMemories } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const memories = await getAllMemories();
    return NextResponse.json({
      success: true,
      total: memories.length,
      memories,
    });
  } catch (error: any) {
    console.error('Fetch memories error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch memories' },
      { status: 500 }
    );
  }
}
