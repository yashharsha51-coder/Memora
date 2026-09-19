import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { Memory, ImportantDate, SourceFile } from '@/types/memory';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Initial seed data mirroring the Google Stitch exact design
const INITIAL_SEED_DATA: {
  files: SourceFile[];
  memories: Memory[];
  important_dates: ImportantDate[];
  tags: { id: string; memory_id: string; tag: string }[];
  entities: { id: string; memory_id: string; entity_type: string; entity_value: string }[];
} = {
  files: [
    {
      id: 'file-1',
      filename: 'Laptop Invoice.pdf',
      storage_path: 'files/laptop-invoice.pdf',
      mime_type: 'application/pdf',
      size: 142850,
      created_at: '2026-02-12T10:30:00Z',
    },
    {
      id: 'file-2',
      filename: 'Internship_Agreement_Stripe.pdf',
      storage_path: 'files/internship.pdf',
      mime_type: 'application/pdf',
      size: 320140,
      created_at: '2026-03-04T14:15:00Z',
    },
    {
      id: 'file-3',
      filename: 'Lease_Agreement_Indiranagar.pdf',
      storage_path: 'files/lease.pdf',
      mime_type: 'application/pdf',
      size: 512900,
      created_at: '2026-01-15T09:00:00Z',
    },
    {
      id: 'file-4',
      filename: 'AI175_BLR_SFO_Ticket.pdf',
      storage_path: 'files/ticket.pdf',
      mime_type: 'application/pdf',
      size: 89200,
      created_at: '2026-04-18T16:45:00Z',
    },
  ],
  memories: [
    {
      id: 'mem-1',
      title: 'Laptop Purchase',
      type: 'Purchase',
      summary: 'Purchased from Croma with AppleCare+ 3-year extended protection protocol. Primary coverage spans 36 calendar months from delivery confirmation.',
      source_file_id: 'file-1',
      date: 'February 12, 2026',
      amount: 84990,
      currency: 'INR',
      created_at: '2026-02-12T10:30:00Z',
      tags: ['Hardware', 'Electronics'],
      important_dates: [
        {
          id: 'date-1',
          memory_id: 'mem-1',
          label: 'Laptop warranty',
          date: '2027-02-12',
          sourceContext: 'Hardware · Croma invoice',
          relativeDays: 28,
          relativeFormatted: '28 days',
        },
      ],
    },
    {
      id: 'mem-2',
      title: 'Summer Internship Agreement',
      type: 'Employment',
      summary: 'Stripe Inc · Fixed 3-month stipend & IP assignment clause · Direct deposit documentation finalized',
      source_file_id: 'file-2',
      date: 'March 04, 2026',
      amount: null,
      currency: null,
      created_at: '2026-03-04T14:15:00Z',
      tags: ['Career', 'Legal'],
      important_dates: [
        {
          id: 'date-intern-1',
          memory_id: 'mem-2',
          label: 'Internship start date',
          date: '2026-06-01',
          sourceContext: 'Stripe · San Francisco HQ',
          relativeDays: 73,
          relativeFormatted: '2 months',
        },
      ],
    },
    {
      id: 'mem-3',
      title: 'Apartment Lease Agreement',
      type: 'Housing',
      summary: '11-month term · Security deposit ₹60,000 · Landlord: S. Narayanan · Key handover verified',
      source_file_id: 'file-3',
      date: 'January 15, 2026',
      amount: 60000,
      currency: 'INR',
      created_at: '2026-01-15T09:00:00Z',
      tags: ['Residence', 'Contracts'],
      important_dates: [
        {
          id: 'date-2',
          memory_id: 'mem-3',
          label: 'Insurance renewal',
          date: '2026-11-01',
          sourceContext: 'Policy #4092 · HDFC Ergo',
          relativeDays: 43,
          relativeFormatted: '43 days',
        },
      ],
    },
    {
      id: 'mem-4',
      title: 'Flight Confirmation — BLR to SFO',
      type: 'Travel',
      summary: 'Air India AI 175 · Seat 14A · Electronic boarding token issued · Departure terminal 2',
      source_file_id: 'file-4',
      date: 'April 18, 2026',
      amount: null,
      currency: null,
      created_at: '2026-04-18T16:45:00Z',
      tags: ['Itinerary', 'International'],
      important_dates: [
        {
          id: 'date-3',
          memory_id: 'mem-4',
          label: 'Passport renewal',
          date: '2028-09-15',
          sourceContext: 'Republic of India · Travel doc',
          relativeDays: 730,
          relativeFormatted: '2 years',
        },
      ],
    },
  ],
  important_dates: [
    {
      id: 'date-1',
      memory_id: 'mem-1',
      label: 'Laptop warranty',
      date: '2027-02-12',
      sourceContext: 'Hardware · Croma invoice',
      relativeDays: 28,
      relativeFormatted: '28 days',
    },
    {
      id: 'date-2',
      memory_id: 'mem-3',
      label: 'Insurance renewal',
      date: '2026-11-01',
      sourceContext: 'Policy #4092 · HDFC Ergo',
      relativeDays: 43,
      relativeFormatted: '43 days',
    },
    {
      id: 'date-3',
      memory_id: 'mem-4',
      label: 'Passport renewal',
      date: '2028-09-15',
      sourceContext: 'Republic of India · Travel doc',
      relativeDays: 730,
      relativeFormatted: '2 years',
    },
  ],
  tags: [
    { id: 't-1', memory_id: 'mem-1', tag: 'Hardware' },
    { id: 't-2', memory_id: 'mem-1', tag: 'Electronics' },
    { id: 't-3', memory_id: 'mem-2', tag: 'Career' },
    { id: 't-4', memory_id: 'mem-2', tag: 'Legal' },
    { id: 't-5', memory_id: 'mem-3', tag: 'Residence' },
    { id: 't-6', memory_id: 'mem-3', tag: 'Contracts' },
    { id: 't-7', memory_id: 'mem-4', tag: 'Itinerary' },
    { id: 't-8', memory_id: 'mem-4', tag: 'International' },
  ],
  entities: [
    { id: 'e-1', memory_id: 'mem-1', entity_type: 'organization', entity_value: 'Croma' },
    { id: 'e-2', memory_id: 'mem-1', entity_type: 'organization', entity_value: 'Apple' },
    { id: 'e-3', memory_id: 'mem-2', entity_type: 'organization', entity_value: 'Stripe Inc' },
    { id: 'e-4', memory_id: 'mem-3', entity_type: 'person', entity_value: 'S. Narayanan' },
    { id: 'e-5', memory_id: 'mem-4', entity_type: 'organization', entity_value: 'Air India' },
  ],
};

// Local storage helpers
const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'memora_store.json');

function ensureLocalStore(): typeof INITIAL_SEED_DATA {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(INITIAL_SEED_DATA, null, 2), 'utf-8');
    return INITIAL_SEED_DATA;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return INITIAL_SEED_DATA;
  }
}

function saveLocalStore(data: typeof INITIAL_SEED_DATA) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Universal Data Access Methods
 */

export async function getAllMemories(): Promise<Memory[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select(`
          *,
          source_file:files(*),
          important_dates(*),
          tags:memory_tags(tag),
          entities:memory_entities(entity_type, entity_value)
        `)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((m: any) => ({
          ...m,
          tags: m.tags ? m.tags.map((t: any) => t.tag) : [],
        }));
      }
    } catch {
      // Fallback to local store
    }
  }

  const local = ensureLocalStore();
  return local.memories.map((m) => {
    const sourceFile = local.files.find((f) => f.id === m.source_file_id);
    const mDates = local.important_dates.filter((d) => d.memory_id === m.id);
    const mTags = local.tags.filter((t) => t.memory_id === m.id).map((t) => t.tag);
    return {
      ...m,
      source_file: sourceFile,
      important_dates: mDates,
      tags: mTags.length > 0 ? mTags : m.tags || [],
    };
  });
}

export async function getUpcomingDates(): Promise<ImportantDate[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('important_dates')
        .select(`
          *,
          memory:memories(title, type, summary, source_file:files(filename))
        `)
        .order('date', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          memory_id: d.memory_id,
          label: d.label,
          date: d.date,
          sourceContext: d.memory ? `${d.memory.type} · ${d.memory.source_file?.filename || d.memory.title}` : '',
          relativeFormatted: calculateRelative(d.date),
        }));
      }
    } catch {
      // Fallback
    }
  }

  const local = ensureLocalStore();
  return local.important_dates.map((d) => {
    const mem = local.memories.find((m) => m.id === d.memory_id);
    const file = mem ? local.files.find((f) => f.id === mem.source_file_id) : undefined;
    return {
      ...d,
      sourceContext: d.sourceContext || (mem ? `${mem.type} · ${file?.filename || mem.title}` : ''),
      relativeFormatted: d.relativeFormatted || calculateRelative(d.date),
    };
  });
}

function calculateRelative(targetDateStr: string): string {
  try {
    const target = new Date(targetDateStr);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Expired';
    if (diffDays === 1) return '1 day';
    if (diffDays < 60) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.round(diffDays / 30)} months`;
    const years = Math.round(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''}`;
  } catch {
    return 'Upcoming';
  }
}

export async function insertMemoryRecord(params: {
  title: string;
  type: string;
  summary: string;
  date?: string;
  amount?: number | null;
  currency?: string | null;
  source_file_id?: string | null;
  important_dates?: { label: string; date: string }[];
  tags?: string[];
  entities?: { entity_type: string; entity_value: string }[];
}): Promise<Memory> {
  const memoryId = 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const { data: memData, error: memErr } = await supabase
        .from('memories')
        .insert({
          title: params.title,
          type: params.type,
          summary: params.summary,
          date: params.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          amount: params.amount,
          currency: params.currency,
          source_file_id: params.source_file_id,
          created_at: now,
        })
        .select()
        .single();

      if (!memErr && memData) {
        const actualMemoryId = memData.id;

        if (params.important_dates && params.important_dates.length > 0) {
          await supabase.from('important_dates').insert(
            params.important_dates.map((d) => ({
              memory_id: actualMemoryId,
              label: d.label,
              date: d.date,
            }))
          );
        }

        if (params.tags && params.tags.length > 0) {
          await supabase.from('memory_tags').insert(
            params.tags.map((t) => ({
              memory_id: actualMemoryId,
              tag: t,
            }))
          );
        }

        if (params.entities && params.entities.length > 0) {
          await supabase.from('memory_entities').insert(
            params.entities.map((e) => ({
              memory_id: actualMemoryId,
              entity_type: e.entity_type,
              entity_value: e.entity_value,
            }))
          );
        }

        return memData;
      }
    } catch {
      // Fallback to local
    }
  }

  // Local Store Fallback
  const local = ensureLocalStore();
  const createdMemory: Memory = {
    id: memoryId,
    title: params.title,
    type: params.type,
    summary: params.summary,
    date: params.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    amount: params.amount,
    currency: params.currency,
    source_file_id: params.source_file_id,
    created_at: now,
    tags: params.tags || [],
  };

  local.memories.unshift(createdMemory);

  if (params.important_dates) {
    for (const d of params.important_dates) {
      local.important_dates.push({
        id: 'date_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        memory_id: memoryId,
        label: d.label,
        date: d.date,
        relativeFormatted: calculateRelative(d.date),
      });
    }
  }

  if (params.tags) {
    for (const t of params.tags) {
      local.tags.push({
        id: 'tag_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        memory_id: memoryId,
        tag: t,
      });
    }
  }

  if (params.entities) {
    for (const e of params.entities) {
      local.entities.push({
        id: 'ent_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        memory_id: memoryId,
        entity_type: e.entity_type,
        entity_value: e.entity_value,
      });
    }
  }

  saveLocalStore(local);
  return createdMemory;
}

export async function insertFileRecord(params: {
  filename: string;
  storage_path: string;
  mime_type: string;
  size: number;
}): Promise<SourceFile> {
  const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('files')
        .insert({
          filename: params.filename,
          storage_path: params.storage_path,
          mime_type: params.mime_type,
          size: params.size,
          created_at: now,
        })
        .select()
        .single();

      if (!error && data) return data;
    } catch {
      // Fallback
    }
  }

  const local = ensureLocalStore();
  const newFile: SourceFile = {
    id: fileId,
    filename: params.filename,
    storage_path: params.storage_path,
    mime_type: params.mime_type,
    size: params.size,
    created_at: now,
  };
  local.files.unshift(newFile);
  saveLocalStore(local);
  return newFile;
}

export async function uploadFileBuffer(
  filename: string,
  buffer: Buffer,
  mimeType: string
): Promise<{ storage_path: string; url?: string }> {
  const safeName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const storagePath = `memories/${safeName}`;

  if (supabase) {
    try {
      const { data, error } = await supabase.storage
        .from('memories')
        .upload(safeName, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!error && data) {
        const { data: publicData } = supabase.storage.from('memories').getPublicUrl(safeName);
        return { storage_path: data.path, url: publicData?.publicUrl };
      }
    } catch {
      // Local fallback
    }
  }

  // Save to local uploads folder
  const uploadsDir = path.join(DATA_DIR, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const localFilePath = path.join(uploadsDir, safeName);
  fs.writeFileSync(localFilePath, buffer);
  return { storage_path: `uploads/${safeName}`, url: `/api/files/${safeName}` };
}

export async function exportArchiveData() {
  const local = ensureLocalStore();
  return {
    app: 'MEMORA',
    version: '1.0.0',
    exported_at: new Date().toISOString(),
    memories: await getAllMemories(),
    dates: await getUpcomingDates(),
    total_memories: local.memories.length,
  };
}
