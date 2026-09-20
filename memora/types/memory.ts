export interface SourceFile {
  id: string;
  user_id?: string | null;
  filename: string;
  storage_path: string;
  absolute_path?: string;
  mime_type: string;
  size: number;
  created_at: string;
}

export interface ImportantDate {
  id: string;
  memory_id: string;
  label: string;
  date: string;
  // Computed helpers for UI
  relativeDays?: number;
  relativeFormatted?: string;
  sourceContext?: string;
}

export interface MemoryTag {
  id: string;
  memory_id: string;
  tag: string;
}

export interface MemoryEntity {
  id: string;
  memory_id: string;
  entity_type: string;
  entity_value: string;
}

export interface Memory {
  id: string;
  user_id?: string | null;
  title: string;
  type: string; // 'purchase' | 'employment' | 'housing' | 'travel' | 'document' | etc.
  summary?: string;
  source_file_id?: string | null;
  source_file?: SourceFile;
  absolute_path?: string;
  directory?: string;
  date?: string;
  amount?: number | null;
  currency?: string | null;
  important_dates?: ImportantDate[];
  tags?: string[];
  entities?: MemoryEntity[];
  breakdown?: Record<string, string>;
  created_at: string;
  updated_at?: string;
}

export interface ExtractionResult {
  type: string;
  title: string;
  summary: string;
  date?: string;
  amount?: number | null;
  currency?: string | null;
  people?: string[];
  organizations?: string[];
  important_dates?: {
    label: string;
    date: string;
  }[];
  breakdown?: Record<string, string>;
  tags?: string[];
}

export interface GroundedAnswer {
  headline: string;
  summary: string;
  highlightedDate?: string;
  source?: {
    filename: string;
    fileId?: string;
    url?: string;
    absolutePath?: string;
    directory?: string;
  };
  relatedMemories?: string[];
  latencyMs: number;
  isFound: boolean;
}

export type UploadStep =
  | 'idle'
  | 'uploading'
  | 'reading'
  | 'understanding'
  | 'extracting'
  | 'saved'
  | 'error';
