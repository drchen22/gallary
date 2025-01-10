import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { settings } from '@/app/config/settings';

export async function GET(request: NextRequest) {
  // console.log('Serving media...');
  
  try {
    const filePath = decodeURIComponent(request.nextUrl.searchParams.get('filePath') || '');
    // console.log(`Received file path: ${filePath}`);
  
    const fullPath = path.join(settings.mediaRoot, filePath);
    // console.log(`Full path: ${fullPath}`);
    
    const stat = await fs.stat(fullPath);
    if (!stat.isFile()) {
      console.log(`Not a file: ${fullPath}`);
      return new NextResponse('Not found', { status: 404 });
    }

    const file = await fs.readFile(fullPath);
    const contentType = getContentType(path.extname(fullPath));
    
    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving media:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

function getContentType(ext: string): string {
  const types: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
  };
  return types[ext.toLowerCase()] || 'application/octet-stream';
}
