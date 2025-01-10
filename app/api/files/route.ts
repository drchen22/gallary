import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { settings } from '@/app/config/settings';

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const videoExtensions = ['.mp4', '.webm', '.mov'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dirPath = searchParams.get('path') || '';
    const fullPath = path.join(settings.mediaRoot, dirPath);
    
    const items = await readdir(fullPath, { withFileTypes: true });
    
    const filePromises = items.map(async (item) => {
      const ext = path.extname(item.name).toLowerCase();
      const relativePath = path.join(dirPath, item.name);
      const stats = await stat(path.join(fullPath, item.name));
      
      return {
        id: relativePath,
        name: item.name,
        type: item.isDirectory() ? 'directory' : 'file',
        path: relativePath,
        size: stats.size,
        modifiedAt: stats.mtime,
        isImage: item.isFile() && imageExtensions.includes(ext),
        isVideo: item.isFile() && videoExtensions.includes(ext),
      };
    });

    const fileItems = await Promise.all(filePromises);
    
    return NextResponse.json(fileItems);
  } catch (error) {
    console.error('Error listing directory:', error);
    return new NextResponse('Error reading directory', { status: 500 });
  }
}
