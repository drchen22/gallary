import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { mediaRoot } = await request.json();
    
    // 验证目录是否存在
    try {
      await fs.access(mediaRoot);
    } catch {
      return new NextResponse(
        JSON.stringify({ error: '目录不存在' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 更新settings文件
    const settingsPath = path.join(process.cwd(), 'app/config/settings.ts');
    const settingsContent = `export const settings = {
  mediaRoot: '${mediaRoot}',
};
`;

    await fs.writeFile(settingsPath, settingsContent, 'utf-8');
    
    return new NextResponse(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('保存设置失败:', error);
    return new NextResponse(
      JSON.stringify({ error: '保存设置失败' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
