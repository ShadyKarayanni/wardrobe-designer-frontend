import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SelectedImage } from './useImagePicker';

const MAX_IMAGES = 10;

interface UseMultiImagePickerResult {
  images: SelectedImage[];
  pickFromLibrary: () => Promise<void>;
  removeImage: (index: number) => void;
  clearImages: () => void;
  canAddMore: boolean;
}

export function useMultiImagePicker(): UseMultiImagePickerResult {
  const [images, setImages] = useState<SelectedImage[]>([]);

  const requestLibraryPermissions = useCallback(async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Photo library permission is needed to select images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  }, []);

  const pickFromLibrary = useCallback(async () => {
    const hasPermission = await requestLibraryPermissions();
    if (!hasPermission) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      Alert.alert('Limit Reached', `Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImages: SelectedImage[] = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.uri.split('/').pop() || 'photo.jpg',
      }));

      setImages((prev) => [...prev, ...newImages].slice(0, MAX_IMAGES));
    }
  }, [images.length, requestLibraryPermissions]);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearImages = useCallback(() => {
    setImages([]);
  }, []);

  return {
    images,
    pickFromLibrary,
    removeImage,
    clearImages,
    canAddMore: images.length < MAX_IMAGES,
  };
}
