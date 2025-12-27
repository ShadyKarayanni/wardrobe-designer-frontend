import { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, Alert } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Text, YStack, XStack, Button, Spinner } from 'tamagui';
import { X } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';

import { useImagePicker } from '@/hooks/useImagePicker';
import { wardrobeService } from '@/lib/wardrobe/wardrobeService';
import { ImagePickerButton } from './ImagePickerButton';

interface AddItemSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddItemSheet({ isOpen, onClose, onSuccess }: AddItemSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [loading, setLoading] = useState(false);

  const { image, showImagePicker, clearImage } = useImagePicker();

  // Reset form when closing
  const resetForm = useCallback(() => {
    clearImage();
  }, [clearImage]);

  // Handle sheet open/close
  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(async () => {
    // Validation - only image is required, AI generates name/category/color
    if (!image) {
      Alert.alert('Error', 'Please add a photo');
      return;
    }

    setLoading(true);
    try {
      await wardrobeService.createItem({ image });
      resetForm();
      onSuccess();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add item');
    } finally {
      setLoading(false);
    }
  }, [image, resetForm, onSuccess]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  if (!isOpen) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={['85%']}
      enablePanDownToClose
      onClose={handleClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.indicator}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
          <Text fontSize={20} fontWeight="600" color="$text">
            Add Item
          </Text>
          <Pressable onPress={handleClose} hitSlop={10}>
            <X size={24} color="#4A4A4A" />
          </Pressable>
        </XStack>

        {/* Form */}
        <YStack gap="$4">
          {/* Image */}
          <YStack gap="$2">
            <Text fontSize={14} fontWeight="500" color="$text">
              Photo
            </Text>
            <ImagePickerButton
              image={image}
              onPress={showImagePicker}
              onClear={clearImage}
            />
            <Text fontSize={12} color="$textMuted" marginTop="$1">
              AI will automatically detect item details
            </Text>
          </YStack>

          {/* Submit Button */}
          <Button
            onPress={handleSubmit}
            disabled={loading}
            backgroundColor="$accent"
            paddingVertical="$3"
            borderRadius={8}
            marginTop="$4"
            pressStyle={{ opacity: 0.9 }}
          >
            {loading ? (
              <Spinner color="$background" />
            ) : (
              <Text color="$background" fontSize={16} fontWeight="600">
                Add Item
              </Text>
            )}
          </Button>
        </YStack>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  indicator: {
    backgroundColor: '#E5E5E5',
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});
