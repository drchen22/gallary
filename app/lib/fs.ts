import { settings } from '../config/settings';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  size: number;
  modifiedAt: string;
  isImage?: boolean;
  isVideo?: boolean;
}

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const videoExtensions = ['.mp4', '.webm', '.mov'];

export async function listDirectory(dirPath: string = ''): Promise<FileItem[]> {
  const response = await fetch(`/api/files?path=${encodeURIComponent(dirPath)}`);
  if (!response.ok) {
    throw new Error('Failed to list directory');
  }
  return response.json();
}
