'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { settings } from '../config/settings';

export default function Settings() {
  const router = useRouter();
  const [mediaRoot, setMediaRoot] = useState(settings.mediaRoot);
  const [message, setMessage] = useState({ type: '', content: '' });

  const handleSave = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mediaRoot }),
      });

      if (!response.ok) {
        throw new Error('保存失败');
      }

      setMessage({ type: 'success', content: '设置已保存' });
      setTimeout(() => setMessage({ type: '', content: '' }), 3000);
    } catch (error) {
      console.error('保存失败:', error);
      setMessage({ type: 'error', content: '保存失败' });
    }
  };

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
            设置
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              媒体文件根目录
            </label>
            <input
              type="text"
              value={mediaRoot}
              onChange={(e) => setMediaRoot(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="输入媒体文件根目录路径"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              保存设置
            </button>
            {message.content && (
              <span className={`text-${message.type === 'success' ? 'green' : 'red'}-500`}>
                {message.content}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
