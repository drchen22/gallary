'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

export default function BTDownload() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [torrentUrl, setTorrentUrl] = useState('');
  const [torrentFile, setTorrentFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!torrentUrl && !torrentFile) return;

    try {
      setIsDownloading(true);
      setStatus('初始化下载...');
      
      const formData = new FormData();
      if (torrentFile) {
        formData.append('torrentFile', torrentFile);
      } else {
        formData.append('torrentUrl', torrentUrl);
      }

      const response = await fetch('/api/bt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('下载失败');
      }

      const data = await response.json();
      setTaskId(data.taskId);
    } catch (error) {
      setStatus(`错误: ${error.message}`);
      setIsDownloading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.torrent')) {
      setTorrentFile(file);
      setTorrentUrl('');
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (taskId) {
      intervalId = setInterval(async () => {
        try {
          const response = await fetch(`/api/bt?taskId=${taskId}`);
          if (!response.ok) {
            throw new Error('获取状态失败');
          }

          const data = await response.json();
          setProgress(data.progress);
          setStatus(data.status);

          if (data.status === '完成' || data.status.startsWith('错误')) {
            setIsDownloading(false);
            setTaskId(null);
            clearInterval(intervalId);
          }
        } catch (error) {
          console.error('获取下载状态失败:', error);
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [taskId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="返回"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            BT下载
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              BT链接或磁力链接
            </label>
            <input
              type="text"
              value={torrentUrl}
              onChange={(e) => {
                setTorrentUrl(e.target.value);
                setTorrentFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="输入BT链接或磁力链接"
              disabled={isDownloading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              或上传Torrent文件
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".torrent"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={isDownloading}
            />
            {torrentFile && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                已选择: {torrentFile.name}
              </p>
            )}
          </div>

          <div className="flex flex-col space-y-4">
            <button
              onClick={handleDownload}
              disabled={isDownloading || (!torrentUrl && !torrentFile)}
              className={`px-4 py-2 text-white rounded-lg transition-colors ${
                isDownloading || (!torrentUrl && !torrentFile)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isDownloading ? '下载中...' : '开始下载'}
            </button>

            {status && (
              <div className="mt-4">
                <p className="text-gray-700 dark:text-gray-300">{status}</p>
                {isDownloading && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
