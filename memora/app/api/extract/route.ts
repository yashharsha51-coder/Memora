import { NextRequest, NextResponse } from 'next/server';
import { extractMemoryFromDocument } from '@/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extraction = await extractMemoryFromDocument(buffer, file.type, file.name);

    return NextResponse.json({ success: true, extraction });
  } catch (error: any) {
    console.error('Extraction API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Document extraction failed' },
      { status: 500 }
    );
  }
}
