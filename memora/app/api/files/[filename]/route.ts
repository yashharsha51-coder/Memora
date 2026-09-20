import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
    case '.pdf':
      return 'application/pdf';
    case '.txt':
      return 'text/plain';
    case '.json':
      return 'application/json';
    default:
      return 'application/octet-stream';
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const decodedName = decodeURIComponent(filename);
    const safeFilename = path.basename(decodedName);

    // 1. Check if an explicit absolute disk path is passed via ?path= query param
    const explicitPath = req.nextUrl.searchParams.get('path');
    if (explicitPath && fs.existsSync(explicitPath)) {
      const fileBuffer = fs.readFileSync(explicitPath);
      const contentType = getContentType(explicitPath);
      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${path.basename(explicitPath)}"`,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // 2. Check local runtime upload directory (.data/uploads)
    const uploadsDir = path.join(process.cwd(), '.data', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const directUploadPath = path.join(uploadsDir, safeFilename);
      if (fs.existsSync(directUploadPath)) {
        const fileBuffer = fs.readFileSync(directUploadPath);
        const contentType = getContentType(directUploadPath);
        return new NextResponse(new Uint8Array(fileBuffer), {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `inline; filename="${safeFilename}"`,
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }

      // Check prefixed and sanitized files (e.g. 178989_WhatsApp_Image_..._1_.jpeg)
      const cleanTarget = safeFilename.toLowerCase().replace(/[^a-z0-9]/g, '');
      const filesInUploads = fs.readdirSync(uploadsDir);
      const matchedUpload = filesInUploads.find((f) => {
        const cleanFile = f.toLowerCase().replace(/[^a-z0-9]/g, '');
        return (
          f.toLowerCase() === safeFilename.toLowerCase() ||
          cleanFile === cleanTarget ||
          cleanFile.endsWith(cleanTarget) ||
          (cleanTarget.length > 5 && cleanFile.includes(cleanTarget))
        );
      });

      if (matchedUpload) {
        const fullUploadPath = path.join(uploadsDir, matchedUpload);
        const fileBuffer = fs.readFileSync(fullUploadPath);
        const contentType = getContentType(fullUploadPath);
        return new NextResponse(new Uint8Array(fileBuffer), {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `inline; filename="${safeFilename}"`,
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
    }

    // 3. Look up in memora_store.json to locate actual disk absolute path
    const storePath = path.join(process.cwd(), '.data', 'memora_store.json');
    if (fs.existsSync(storePath)) {
      try {
        const storeData = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
        const allMemories = storeData.memories || [];
        const allFiles = storeData.files || [];
        const cleanTarget = safeFilename.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Check in files list
        const matchedStoreFile = allFiles.find(
          (f: any) =>
            f.filename?.toLowerCase() === safeFilename.toLowerCase() ||
            f.id === safeFilename ||
            (f.filename && f.filename.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanTarget)) ||
            (f.storage_path && path.basename(f.storage_path).toLowerCase() === safeFilename.toLowerCase())
        );

        if (matchedStoreFile) {
          let targetDiskPath = matchedStoreFile.absolute_path;
          if (!targetDiskPath || !fs.existsSync(/*turbopackIgnore: true*/ targetDiskPath)) {
            if (matchedStoreFile.storage_path) {
              const candidate = path.join(process.cwd(), '.data', matchedStoreFile.storage_path);
              if (fs.existsSync(/*turbopackIgnore: true*/ candidate)) targetDiskPath = candidate;
            }
          }

          if (targetDiskPath && fs.existsSync(/*turbopackIgnore: true*/ targetDiskPath)) {
            const fileBuffer = fs.readFileSync(/*turbopackIgnore: true*/ targetDiskPath);
            const contentType = getContentType(targetDiskPath);
            return new NextResponse(new Uint8Array(fileBuffer), {
              status: 200,
              headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${path.basename(targetDiskPath)}"`,
                'Cache-Control': 'public, max-age=3600',
              },
            });
          }
        }

        // Check in memories list
        const matchedMemory = allMemories.find(
          (m: any) =>
            m.source_file?.filename?.toLowerCase() === safeFilename.toLowerCase() ||
            m.title?.toLowerCase() === safeFilename.toLowerCase() ||
            (m.source_file?.filename && m.source_file.filename.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanTarget)) ||
            (m.absolute_path && path.basename(m.absolute_path).toLowerCase() === safeFilename.toLowerCase())
        );

        if (matchedMemory) {
          let targetDiskPath =
            matchedMemory.absolute_path ||
            matchedMemory.source_file?.absolute_path ||
            matchedMemory.source_file?.storage_path;

          if (!targetDiskPath || !fs.existsSync(/*turbopackIgnore: true*/ targetDiskPath)) {
            if (matchedMemory.source_file?.storage_path) {
              const candidate = path.join(process.cwd(), '.data', matchedMemory.source_file.storage_path);
              if (fs.existsSync(/*turbopackIgnore: true*/ candidate)) targetDiskPath = candidate;
            }
          }

          if (targetDiskPath && fs.existsSync(/*turbopackIgnore: true*/ targetDiskPath)) {
            const fileBuffer = fs.readFileSync(/*turbopackIgnore: true*/ targetDiskPath);
            const contentType = getContentType(targetDiskPath);
            return new NextResponse(new Uint8Array(fileBuffer), {
              status: 200,
              headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${path.basename(targetDiskPath)}"`,
                'Cache-Control': 'public, max-age=3600',
              },
            });
          }
        }
      } catch (storeErr) {
        console.error('Store lookup error:', storeErr);
      }
    }

    return NextResponse.json({ error: 'File not found on local drives or vault' }, { status: 404 });
  } catch (err: any) {
    console.error('File retrieval error:', err);
    return NextResponse.json({ error: 'Failed to retrieve file' }, { status: 500 });
  }
}
