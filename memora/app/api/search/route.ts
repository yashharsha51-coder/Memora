import { NextRequest, NextResponse } from 'next/server';
import { searchVault } from '@/lib/search';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';

    const result = await searchVault(query);
    return NextResponse.json({ query, result });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Search execution failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body.query || body.q || '';

    const result = await searchVault(query);
    return NextResponse.json({ query, result });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Search execution failed' },
      { status: 500 }
    );
  }
}
