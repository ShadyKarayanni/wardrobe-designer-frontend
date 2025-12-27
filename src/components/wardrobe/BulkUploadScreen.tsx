import { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Modal, ScrollView, Pressable } from 'react-native';
import { Text, YStack, XStack, Button, Spinner } from 'tamagui';
import { X, Plus, Upload, Check, AlertCircle } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMultiImagePicker } from '@/hooks/useMultiImagePicker';
import { useBulkUpload } from '@/hooks/useBulkUpload';
import { BulkUploadGrid } from './BulkUploadGrid';

interface BulkUploadScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type ScreenState = 'selecting' | 'uploading' | 'complete';

export function BulkUploadScreen({ isOpen, onClose, onComplete }: BulkUploadScreenProps) {
  const insets = useSafeAreaInsets();
  const [screenState, setScreenState] = useState<ScreenState>('selecting');

  const {
    images,
    pickFromLibrary,
    removeImage,
    clearImages,
    canAddMore,
  } = useMultiImagePicker();

  const {
    uploadQueue,
    initializeQueue,
    startUploads,
    retryFailed,
    retryOne,
    clearQueue,
    isUploading,
    successCount,
    failureCount,
  } = useBulkUpload();

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setScreenState('selecting');
      clearImages();
      clearQueue();
    }
  }, [isOpen, clearImages, clearQueue]);

  const handleStartUpload = useCallback(async () => {
    if (images.length === 0) return;

    initializeQueue(images);
    setScreenState('uploading');

    // Small delay to ensure state updates before starting uploads
    setTimeout(async () => {
      await startUploads();
      setScreenState('complete');
    }, 100);
  }, [images, initializeQueue, startUploads]);

  const handleRetryFailed = useCallback(async () => {
    setScreenState('uploading');
    await retryFailed();
    setScreenState('complete');
  }, [retryFailed]);

  const handleDone = useCallback(() => {
    if (successCount > 0) {
      onComplete();
    }
    onClose();
  }, [successCount, onComplete, onClose]);

  const handleClose = useCallback(() => {
    if (isUploading) return;
    clearImages();
    clearQueue();
    onClose();
  }, [isUploading, clearImages, clearQueue, onClose]);

  const handleRemoveFromSelection = useCallback((id: string) => {
    const index = images.findIndex((_, i) => String(i) === id);
    if (index !== -1) {
      removeImage(index);
    }
  }, [images, removeImage]);

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
      <YStack flex={1} backgroundColor="#FAFAFA" paddingTop={insets.top}>
        {/* Header */}
        <XStack
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal="$4"
          paddingVertical="$3"
          borderBottomWidth={1}
          borderBottomColor="#E5E5E5"
        >
          <Pressable onPress={handleClose} disabled={isUploading} hitSlop={10}>
            <X size={24} color={isUploading ? '#CCCCCC' : '#4A4A4A'} />
          </Pressable>
          <Text fontSize={18} fontWeight="600" color="$text">
            {screenState === 'selecting' ? 'Add Multiple Items' :
             screenState === 'uploading' ? 'Uploading...' : 'Upload Complete'}
          </Text>
          <XStack width={24} />
        </XStack>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Selection State */}
          {screenState === 'selecting' && (
            <>
              <Text fontSize={14} color="$textSecondary" textAlign="center" marginBottom="$4">
                Select up to 10 images. AI will analyze each item.
              </Text>

              {images.length > 0 && (
                <BulkUploadGrid
                  items={images.map((img, index) => ({
                    id: String(index),
                    uri: img.uri,
                    type: img.type,
                    name: img.name,
                    status: 'pending' as const,
                  }))}
                  onRemove={handleRemoveFromSelection}
                  showRemoveButton
                />
              )}

              {canAddMore && (
                <Button
                  onPress={pickFromLibrary}
                  marginTop="$4"
                  marginHorizontal="$4"
                  backgroundColor="#FAFAFA"
                  borderColor="#E5E5E5"
                  borderWidth={1}
                  pressStyle={{ backgroundColor: '#F0F0F0' }}
                >
                  <XStack alignItems="center" gap="$2">
                    <Plus size={20} color="#4A4A4A" />
                    <Text color="$text">
                      {images.length === 0 ? 'Select Images' : `Add More (${images.length}/10)`}
                    </Text>
                  </XStack>
                </Button>
              )}
            </>
          )}

          {/* Uploading / Complete State */}
          {(screenState === 'uploading' || screenState === 'complete') && (
            <>
              <XStack justifyContent="center" gap="$4" marginBottom="$4">
                {successCount > 0 && (
                  <XStack alignItems="center" gap="$1">
                    <Check size={16} color="#2E7D32" />
                    <Text color="#2E7D32">{successCount} uploaded</Text>
                  </XStack>
                )}
                {failureCount > 0 && (
                  <XStack alignItems="center" gap="$1">
                    <AlertCircle size={16} color="#D32F2F" />
                    <Text color="#D32F2F">{failureCount} failed</Text>
                  </XStack>
                )}
                {isUploading && (
                  <XStack alignItems="center" gap="$2">
                    <Spinner size="small" color="#3B82F6" />
                    <Text color="$textSecondary">Processing...</Text>
                  </XStack>
                )}
              </XStack>

              <BulkUploadGrid
                items={uploadQueue}
                onRetry={retryOne}
              />
            </>
          )}
        </ScrollView>

        {/* Footer Actions */}
        <YStack
          paddingHorizontal="$4"
          paddingBottom={insets.bottom + 16}
          paddingTop="$3"
          gap="$2"
          borderTopWidth={1}
          borderTopColor="#E5E5E5"
          backgroundColor="#FAFAFA"
        >
          {screenState === 'selecting' && images.length > 0 && (
            <Button
              onPress={handleStartUpload}
              backgroundColor="#3B82F6"
              pressStyle={{ opacity: 0.9 }}
            >
              <XStack alignItems="center" gap="$2">
                <Upload size={18} color="#FFFFFF" />
                <Text color="#FFFFFF" fontSize={16} fontWeight="600">
                  Upload {images.length} {images.length === 1 ? 'Item' : 'Items'}
                </Text>
              </XStack>
            </Button>
          )}

          {screenState === 'complete' && (
            <>
              {failureCount > 0 && (
                <Button
                  onPress={handleRetryFailed}
                  backgroundColor="#FAFAFA"
                  borderColor="#E5E5E5"
                  borderWidth={1}
                  pressStyle={{ backgroundColor: '#F0F0F0' }}
                >
                  <Text color="$text">Retry Failed ({failureCount})</Text>
                </Button>
              )}
              <Button
                onPress={handleDone}
                backgroundColor="#3B82F6"
                pressStyle={{ opacity: 0.9 }}
              >
                <Text color="#FFFFFF" fontSize={16} fontWeight="600">
                  Done
                </Text>
              </Button>
            </>
          )}
        </YStack>
      </YStack>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 20,
    flexGrow: 1,
  },
});
