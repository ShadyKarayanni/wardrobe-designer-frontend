import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export interface SelectedImage {
  uri: string;
  type: string;
  name: string;
}

interface UseImagePickerResult {
  image: SelectedImage | null;
  pickFromLibrary: () => Promise<void>;
  takePhoto: () => Promise<void>;
  clearImage: () => void;
  showImagePicker: () => void;
}

export function useImagePicker(): UseImagePickerResult {
  const [image, setImage] = useState<SelectedImage | null>(null);

  const requestCameraPermissions = useCallback(async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is needed to take photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  }, []);

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

  const processResult = useCallback((result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;
      const fileName = uri.split('/').pop() || 'photo.jpg';
      const type = asset.mimeType || 'image/jpeg';

      setImage({
        uri,
        type,
        name: fileName,
      });
    }
  }, []);

  const pickFromLibrary = useCallback(async () => {
    const hasPermission = await requestLibraryPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      allowsMultipleSelection: false,
      selectionLimit: 1,
      aspect: [1, 1],
      quality: 0.8,
    });

    processResult(result);
  }, [requestLibraryPermissions, processResult]);

  const takePhoto = useCallback(async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    processResult(result);
  }, [requestCameraPermissions, processResult]);

  const clearImage = useCallback(() => {
    setImage(null);
  }, []);

  const showImagePicker = useCallback(() => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickFromLibrary },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [takePhoto, pickFromLibrary]);

  return {
    image,
    pickFromLibrary,
    takePhoto,
    clearImage,
    showImagePicker,
  };
}
