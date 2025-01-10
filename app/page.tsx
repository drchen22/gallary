"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MediaGrid from './components/MediaGrid';
import { listDirectory } from './lib/fs';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  const loadDirectory = async (path: string) => {
    try {
      setLoading(true);
      const files = await listDirectory(path);
      setItems(files);
    } catch (error) {
      console.error('Error loading directory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  // const handleBack = () => {
  //   const parentPath = currentPath.split('/').slice(0, -1).join('/');
  //   setCurrentPath(parentPath);
  // };

  const handleRename = async (oldPath: string, newName: string) => {
    try {
      const response = await fetch('/api/files/rename', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldPath, newName }),
      });

      if (!response.ok) {
        throw new Error('重命名失败');
      }

      // 重新加载当前目录
      await loadDirectory(currentPath);
    } catch (error) {
      console.error('重命名失败:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentPath || '媒体库'}
            </h1>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => router.push('/bt')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              BT下载
            </button>
            <button
              onClick={() => router.push('/settings')}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="设置"
            >
              <Cog6ToothIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <MediaGrid 
            items={items} 
            onNavigate={handleNavigate}
            onRename={handleRename}
          />
        )}
      </div>
    </div>
  );
}
