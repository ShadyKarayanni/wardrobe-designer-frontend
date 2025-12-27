import { useState, useCallback, useRef } from 'react';
import { wardrobeService } from '@/lib/wardrobe/wardrobeService';
import { BulkUploadImage, UploadStatus } from '@/lib/wardrobe/types';
import { SelectedImage } from './useImagePicker';

const generateId = () => Math.random().toString(36).substring(2, 11);

interface UseBulkUploadResult {
  uploadQueue: BulkUploadImage[];
  initializeQueue: (images: SelectedImage[]) => void;
  startUploads: () => Promise<void>;
  retryFailed: () => Promise<void>;
  retryOne: (id: string) => Promise<void>;
  clearQueue: () => void;
  isUploading: boolean;
  successCount: number;
  failureCount: number;
  totalCount: number;
}

export function useBulkUpload(): UseBulkUploadResult {
  const [uploadQueue, setUploadQueue] = useState<BulkUploadImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const queueRef = useRef<BulkUploadImage[]>([]);

  const initializeQueue = useCallback((images: SelectedImage[]) => {
    const queue: BulkUploadImage[] = images.map((img) => ({
      id: generateId(),
      uri: img.uri,
      type: img.type,
      name: img.name,
      status: 'pending' as UploadStatus,
    }));
    setUploadQueue(queue);
    queueRef.current = queue;
  }, []);

  const updateItemStatus = useCallback((id: string, updates: Partial<BulkUploadImage>) => {
    setUploadQueue((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      queueRef.current = updated;
      return updated;
    });
  }, []);

  const uploadSingleItem = useCallback(async (item: BulkUploadImage): Promise<void> => {
    updateItemStatus(item.id, { status: 'uploading' });

    try {
      const result = await wardrobeService.createItem({
        image: {
          uri: item.uri,
          type: item.type,
          name: item.name,
        },
      });
      updateItemStatus(item.id, { status: 'success', result });
    } catch (error) {
      updateItemStatus(item.id, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed',
      });
    }
  }, [updateItemStatus]);

  const startUploads = useCallback(async () => {
    setIsUploading(true);

    const pendingItems = queueRef.current.filter((item) => item.status === 'pending');

    await Promise.allSettled(
      pendingItems.map((item) => uploadSingleItem(item))
    );

    setIsUploading(false);
  }, [uploadSingleItem]);

  const retryFailed = useCallback(async () => {
    const failedItems = queueRef.current.filter((item) => item.status === 'error');

    // Reset failed items to pending
    failedItems.forEach((item) => {
      updateItemStatus(item.id, { status: 'pending', error: undefined });
    });

    setIsUploading(true);

    await Promise.allSettled(
      failedItems.map((item) => uploadSingleItem({ ...item, status: 'pending' }))
    );

    setIsUploading(false);
  }, [uploadSingleItem, updateItemStatus]);

  const retryOne = useCallback(async (id: string) => {
    const item = queueRef.current.find((i) => i.id === id);
    if (!item || item.status !== 'error') return;

    await uploadSingleItem({ ...item, status: 'pending' });
  }, [uploadSingleItem]);

  const clearQueue = useCallback(() => {
    setUploadQueue([]);
    queueRef.current = [];
    setIsUploading(false);
  }, []);

  const successCount = uploadQueue.filter((i) => i.status === 'success').length;
  const failureCount = uploadQueue.filter((i) => i.status === 'error').length;

  return {
    uploadQueue,
    initializeQueue,
    startUploads,
    retryFailed,
    retryOne,
    clearQueue,
    isUploading,
    successCount,
    failureCount,
    totalCount: uploadQueue.length,
  };
}
