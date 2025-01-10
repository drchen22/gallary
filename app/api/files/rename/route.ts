import { NextRequest, NextResponse } from 'next/server';
import { rename } from 'fs/promises';
import path from 'path';
import { settings } from '@/app/config/settings';

export async function POST(request: NextRequest) {
  try {
    const { oldPath, newName } = await request.json();
    
    const oldFullPath = path.join(settings.mediaRoot, oldPath);
    const newFullPath = path.join(
      path.dirname(oldFullPath),
      newName
    );

    await rename(oldFullPath, newFullPath);
    
    return new NextResponse(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('重命名失败:', error);
    return new NextResponse(
      JSON.stringify({ error: '重命名失败' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
