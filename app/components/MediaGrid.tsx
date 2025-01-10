"use client";

import { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import type { FileItem } from '../lib/fs';
import { FolderIcon, DocumentIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface MediaGridProps {
  items: FileItem[];
  onNavigate?: (path: string) => void;
  onRename?: (oldPath: string, newName: string) => Promise<void>;
}

export default function MediaGrid({ items, onNavigate, onRename }: MediaGridProps) {
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: FileItem } | null>(null);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>('');

  const handleClose = () => {
    setSelectedItem(null);
    setSelectedIndex(-1);
  };

  const handleContextMenu = (e: React.MouseEvent, item: FileItem) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const startRename = (item: FileItem) => {
    setIsRenaming(item.id);
    setNewName(item.name);
    closeContextMenu();
  };

  const handleRename = async (item: FileItem) => {
    if (newName && newName !== item.name && onRename) {
      try {
        await onRename(item.path, newName);
      } catch (error) {
        console.error('重命名失败:', error);
      }
    }
    setIsRenaming(null);
    setNewName('');
  };

  useEffect(() => {
    const handleClickOutside = () => {
      closeContextMenu();
    };

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedItem) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem]);

  const handleItemClick = (item: FileItem) => {
    if (item.type === 'directory') {
      onNavigate?.(item.path);
    } else if (item.isImage || item.isVideo) {
      const index = items.findIndex(i => i.id === item.id);
      setSelectedIndex(index);
      setSelectedItem(item);
    }
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex > 0) {
      const prevItem = items[selectedIndex - 1];
      if (prevItem.isImage || prevItem.isVideo) {
        setSelectedIndex(selectedIndex - 1);
        setSelectedItem(prevItem);
      }
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex < items.length - 1) {
      const nextItem = items[selectedIndex + 1];
      if (nextItem.isImage || nextItem.isVideo) {
        setSelectedIndex(selectedIndex + 1);
        setSelectedItem(nextItem);
      }
    }
  };

  const renderItemIcon = (item: FileItem) => {
    if (item.type === 'directory') {
      return <FolderIcon className="w-12 h-12 text-blue-500" />;
    }
    if (item.isImage) {
      return (
        <div className="relative w-full h-full">
          <Image
            src={`/api/media?filePath=${encodeURIComponent(item.path)}`}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
          />
        </div>
      );
    }
    if (item.isVideo) {
      return (
        <>
          <DocumentIcon className="w-12 h-12 text-red-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 5v10l8-5-8-5z" />
            </svg>
          </div>
        </>
      );
    }
    return <DocumentIcon className="w-12 h-12 text-gray-500" />;
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square cursor-pointer group"
            onClick={() => handleItemClick(item)}
            onContextMenu={(e) => handleContextMenu(e, item)}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              {renderItemIcon(item)}
              {isRenaming === item.id ? (
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => handleRename(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRename(item);
                    } else if (e.key === 'Escape') {
                      setIsRenaming(null);
                      setNewName('');
                    }
                  }}
                  className="mt-2 px-2 py-1 text-sm w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="mt-2 text-sm text-center text-gray-700 dark:text-gray-300 truncate w-full">
                  {item.name}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => startRename(contextMenu.item)}
          >
            重命名
          </button>
        </div>
      )}

      {/* Preview Modal */}
      {selectedItem && (selectedItem.isImage || selectedItem.isVideo) && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
        >
          <div 
            className="relative w-screen h-screen flex flex-col" 
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 rounded-full p-2 z-20 transition-colors"
              aria-label="Close preview"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Previous Button */}
            {selectedIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-3 z-20 transition-colors"
                aria-label="Previous image"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Next Button */}
            {selectedIndex < items.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-3 z-20 transition-colors"
                aria-label="Next image"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            <div className="flex-1 flex items-center justify-center w-full h-full">
              {selectedItem.isImage ? (
                <Image
                  src={`/api/media?filePath=${encodeURIComponent(selectedItem.path)}`}
                  alt={selectedItem.name}
                  className="max-w-screen max-h-screen object-contain p-4"
                />
              ) : (
                <ReactPlayer
                  url={`/api/media?filePath=${encodeURIComponent(selectedItem.path)}`}
                  controls
                  width="100%"
                  height="100%"
                  className="aspect-video px-4"
                />
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 text-center text-white bg-black/70 py-3 z-10">
              <h3 className="text-lg font-medium">{selectedItem.name}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
