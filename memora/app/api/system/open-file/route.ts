import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { filePath, action = 'reveal' } = body;

    if (!filePath || typeof filePath !== 'string') {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }

    const normalizedPath = path.resolve(filePath);

    if (!fs.existsSync(normalizedPath)) {
      return NextResponse.json(
        { error: `File not found on disk: ${normalizedPath}` },
        { status: 404 }
      );
    }

    const isWindows = process.platform === 'win32';
    const isMac = process.platform === 'darwin';

    if (action === 'reveal') {
      // Reveal in Explorer / Finder
      let cmd = '';
      if (isWindows) {
        cmd = `explorer.exe /select,"${normalizedPath}"`;
      } else if (isMac) {
        cmd = `open -R "${normalizedPath}"`;
      } else {
        cmd = `xdg-open "${path.dirname(normalizedPath)}"`;
      }

      exec(cmd, (err) => {
        if (err) {
          console.warn('Reveal command warning:', err.message);
        }
      });
    } else {
      // Open file directly in default system app
      let cmd = '';
      if (isWindows) {
        cmd = `cmd.exe /c start "" "${normalizedPath}"`;
      } else if (isMac) {
        cmd = `open "${normalizedPath}"`;
      } else {
        cmd = `xdg-open "${normalizedPath}"`;
      }

      exec(cmd, (err) => {
        if (err) {
          console.warn('Open command warning:', err.message);
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: action === 'reveal' ? 'Revealed in File Explorer' : 'Opened in default viewer',
      filePath: normalizedPath,
      action,
    });
  } catch (err: any) {
    console.error('System file action error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to open file' },
      { status: 500 }
    );
  }
}
