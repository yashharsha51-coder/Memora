import { extractMemoryFromDocument } from './gemini';
import {
  insertFileRecord,
  insertMemoryRecord,
  uploadFileBuffer,
} from './supabase';
import { Memory } from '@/types/memory';

export async function processDocumentUpload(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{
  memory: Memory;
  extractedFacts: any;
}> {
  // 1. Upload file to Supabase Storage (or local storage fallback)
  const uploadRes = await uploadFileBuffer(filename, fileBuffer, mimeType);

  // 2. Insert record into files table
  const fileRecord = await insertFileRecord({
    filename,
    storage_path: uploadRes.storage_path,
    mime_type: mimeType,
    size: fileBuffer.length,
  });

  // 3. Extract structured JSON memory using Gemini
  const extracted = await extractMemoryFromDocument(fileBuffer, mimeType, filename);

  // 4. Save into memories, important_dates, memory_tags, memory_entities
  const entitiesToSave: { entity_type: string; entity_value: string }[] = [];
  if (extracted.people) {
    for (const p of extracted.people) {
      entitiesToSave.push({ entity_type: 'person', entity_value: p });
    }
  }
  if (extracted.organizations) {
    for (const o of extracted.organizations) {
      entitiesToSave.push({ entity_type: 'organization', entity_value: o });
    }
  }

  const savedMemory = await insertMemoryRecord({
    title: extracted.title,
    type: extracted.type.charAt(0).toUpperCase() + extracted.type.slice(1).toLowerCase(),
    summary: extracted.summary,
    date: extracted.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    amount: extracted.amount,
    currency: extracted.currency,
    source_file_id: fileRecord.id,
    important_dates: extracted.important_dates,
    tags: extracted.tags,
    entities: entitiesToSave,
  });

  return {
    memory: {
      ...savedMemory,
      source_file: fileRecord,
    },
    extractedFacts: extracted,
  };
}
