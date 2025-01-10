import { NextRequest, NextResponse } from 'next/server';
import WebTorrent from 'webtorrent';
import path from 'path';
import { settings } from '@/app/config/settings';

// 存储当前下载任务
const downloadTasks = new Map();

interface Task {
  id: string;
  status: string;
  progress: number;
  client: WebTorrent.Instance;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const torrentUrl = formData.get('torrentUrl') as string;
    const torrentFile = formData.get('torrentFile') as File;

    if (!torrentUrl && !torrentFile) {
      return new NextResponse(
        JSON.stringify({ error: '请提供BT链接或Torrent文件' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const taskId = Date.now().toString();
    const client = new WebTorrent();

    // 创建下载任务
    const task: Task = {
      id: taskId,
      progress: 0,
      status: '初始化',
      client,
    };
    downloadTasks.set(taskId, task);

    // 开始下载
    if (torrentFile) {
      const buffer = Buffer.from(await torrentFile.arrayBuffer());
      client.add(buffer, { path: path.join(settings.mediaRoot, 'downloads') }, handleTorrent(task, client));
    } else {
      client.add(torrentUrl, { path: path.join(settings.mediaRoot, 'downloads') }, handleTorrent(task, client));
    }

    return new NextResponse(
      JSON.stringify({ taskId }), 
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('BT下载错误:', error);
    return new NextResponse(
      JSON.stringify({ error: '下载失败' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

function handleTorrent(task: Task, client: WebTorrent.Instance) {
  return (torrent: WebTorrent.Torrent) => {
    task.status = '下载中';

    torrent.on('download', () => {
      task.progress = Number((torrent.progress * 100).toFixed(1));
    });

    torrent.on('done', () => {
      task.status = '完成';
      task.progress = 100;
      client.destroy();
      downloadTasks.delete(task.id);
    });

    torrent.on('error', (err) => {
      task.status = `下载错误`;
      client.destroy();
      downloadTasks.delete(task.id);
    });
  };
}

export async function GET(request: NextRequest) {
  try {
    const taskId = request.nextUrl.searchParams.get('taskId');
    if (!taskId) {
      return new NextResponse(
        JSON.stringify({ error: '请提供任务ID' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const task = downloadTasks.get(taskId);
    if (!task) {
      return new NextResponse(
        JSON.stringify({ error: '任务不存在' }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new NextResponse(
      JSON.stringify({
        progress: task.progress,
        status: task.status,
      }), 
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('获取下载状态错误:', error);
    return new NextResponse(
      JSON.stringify({ error: '获取状态失败' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}