import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  getConnectedFolders,
  saveConnectedFolders,
  isPathAlreadyIndexed,
  insertFileRecord,
  insertMemoryRecord,
  getAllMemories,
} from '@/lib/supabase';
import { extractMemoryFromDocument } from '@/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.data',
  'appdata',
  'windows',
  'program files',
  'program files (x86)',
  '$recycle.bin',
  'system volume information',
  'recovery',
  'perflogs',
  'dist',
  'build',
  '.gemini',
  'cache',
  'temp',
  'tmp',
]);

const SUPPORTED_EXTENSIONS = new Set([
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.docx',
  '.txt',
]);

interface DiscoveredFile {
  fullPath: string;
  filename: string;
  directory: string;
  size: number;
  mimeType: string;
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.pdf': return 'application/pdf';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.txt': return 'text/plain';
    default: return 'application/octet-stream';
  }
}

async function crawlDirectory(
  dirPath: string,
  currentDepth: number,
  maxDepth: number,
  results: DiscoveredFile[],
  maxFiles: number
) {
  if (currentDepth > maxDepth || results.length >= maxFiles) return;

  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (results.length >= maxFiles) break;

      const nameLower = entry.name.toLowerCase();
      if (nameLower.startsWith('.') || EXCLUDED_DIRS.has(nameLower)) {
        continue;
      }

      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        await crawlDirectory(fullPath, currentDepth + 1, maxDepth, results, maxFiles);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_EXTENSIONS.has(ext)) {
          try {
            const stat = await fs.promises.stat(fullPath);
            // Limit to files <= 20MB
            if (stat.size <= 20 * 1024 * 1024) {
              results.push({
                fullPath,
                filename: entry.name,
                directory: dirPath,
                size: stat.size,
                mimeType: getMimeType(entry.name),
              });
            }
          } catch {}
        }
      }
    }
  } catch (err) {
    // Skip permission errors or locked directories
  }
}

export async function GET() {
  try {
    const connectedFolders = getConnectedFolders();
    const allMemories = await getAllMemories();
    const localDiskMemories = allMemories.filter((m) => !!m.absolute_path);

    return NextResponse.json({
      success: true,
      connectedFolders,
      totalLocalIndexed: localDiskMemories.length,
      recentFiles: localDiskMemories.slice(0, 10).map((m) => ({
        id: m.id,
        title: m.title,
        absolute_path: m.absolute_path,
        directory: m.directory,
        date: m.date,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to get drive scan status' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const requestedPaths: string[] = Array.isArray(body.paths) && body.paths.length > 0
      ? body.paths
      : getConnectedFolders();

    const maxDepth = typeof body.depth === 'number' ? body.depth : 4;
    const maxFiles = typeof body.maxFiles === 'number' ? body.maxFiles : 40;

    // Save requested paths if provided
    if (Array.isArray(body.paths) && body.paths.length > 0) {
      saveConnectedFolders(body.paths);
    }

    const discovered: DiscoveredFile[] = [];

    // Crawl each configured directory
    for (const rootPath of requestedPaths) {
      if (fs.existsSync(rootPath)) {
        await crawlDirectory(rootPath, 0, maxDepth, discovered, maxFiles);
      }
    }

    const newlyIndexed: any[] = [];

    for (const item of discovered) {
      // Check if already indexed
      if (isPathAlreadyIndexed(item.fullPath)) {
        continue;
      }

      try {
        let extraction;
        // Read file content for intelligence extraction
        try {
          const buffer = await fs.promises.readFile(item.fullPath);
          extraction = await extractMemoryFromDocument(buffer, item.mimeType, item.filename);
        } catch {
          // Fallback extraction
          const cleanTitle = item.filename
            .replace(/\.[^/.]+$/, '')
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());

          extraction = {
            type: 'Document',
            title: cleanTitle,
            summary: `Discovered on local drive at ${item.directory}. Factual details indexed for fast retrieval.`,
            tags: ['Local Disk', 'Drive File'],
            important_dates: [],
            people: [],
            organizations: [],
          };
        }

        // 1. Create file record
        const fileRecord = await insertFileRecord({
          filename: item.filename,
          storage_path: item.fullPath,
          absolute_path: item.fullPath,
          mime_type: item.mimeType,
          size: item.size,
        });

        // 2. Create memory record with absolute disk path
        const memoryRecord = await insertMemoryRecord({
          title: extraction.title || item.filename,
          type: extraction.type || 'Document',
          summary: extraction.summary || `File found on local drive: ${item.fullPath}`,
          date: extraction.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          amount: extraction.amount,
          currency: extraction.currency,
          source_file_id: fileRecord.id,
          absolute_path: item.fullPath,
          directory: item.directory,
          tags: [...(extraction.tags || []), 'Local Disk'],
          important_dates: extraction.important_dates,
          entities: [
            ...(extraction.organizations || []).map((org) => ({ entity_type: 'organization', entity_value: org })),
            ...(extraction.people || []).map((p) => ({ entity_type: 'person', entity_value: p })),
          ],
        });

        newlyIndexed.push({
          id: memoryRecord.id,
          title: memoryRecord.title,
          filename: item.filename,
          absolute_path: item.fullPath,
          directory: item.directory,
        });
      } catch (itemErr) {
        console.error(`Error indexing file ${item.fullPath}:`, itemErr);
      }
    }

    return NextResponse.json({
      success: true,
      scannedFolders: requestedPaths,
      totalDiscovered: discovered.length,
      newlyIndexedCount: newlyIndexed.length,
      newlyIndexed,
    });
  } catch (err: any) {
    console.error('Scan drive error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to scan local drive' },
      { status: 500 }
    );
  }
}
