import { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Text, YStack, XStack, Button, Spinner } from 'tamagui';
import { X } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';

import { useImagePicker, SelectedImage } from '@/hooks/useImagePicker';
import { wardrobeService } from '@/lib/wardrobe/wardrobeService';
import { ItemCategory } from '@/lib/wardrobe/types';
import { ImagePickerButton } from './ImagePickerButton';
import { CategoryPicker } from './CategoryPicker';

interface AddItemSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddItemSheet({ isOpen, onClose, onSuccess }: AddItemSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory | null>(null);
  const [color, setColor] = useState('');
  const [loading, setLoading] = useState(false);

  const { image, showImagePicker, clearImage } = useImagePicker();

  // Reset form when closing
  const resetForm = useCallback(() => {
    setName('');
    setCategory(null);
    setColor('');
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
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!image) {
      Alert.alert('Error', 'Please add a photo');
      return;
    }
    if (!color.trim()) {
      Alert.alert('Error', 'Please enter a color');
      return;
    }

    setLoading(true);
    try {
      await wardrobeService.createItem({
        name: name.trim(),
        category,
        color: color.trim(),
        image,
      });
      resetForm();
      onSuccess();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add item');
    } finally {
      setLoading(false);
    }
  }, [name, category, color, image, resetForm, onSuccess]);

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
              Photo *
            </Text>
            <ImagePickerButton
              image={image}
              onPress={showImagePicker}
              onClear={clearImage}
            />
          </YStack>

          {/* Name */}
          <YStack gap="$2">
            <Text fontSize={14} fontWeight="500" color="$text">
              Name *
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Blue denim jacket"
              placeholderTextColor="#6A6A6A"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </YStack>

          {/* Category */}
          <YStack gap="$2">
            <Text fontSize={14} fontWeight="500" color="$text">
              Category *
            </Text>
            <CategoryPicker value={category} onChange={setCategory} />
          </YStack>

          {/* Color */}
          <YStack gap="$2">
            <Text fontSize={14} fontWeight="500" color="$text">
              Color *
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Navy blue"
              placeholderTextColor="#6A6A6A"
              value={color}
              onChangeText={setColor}
              autoCapitalize="words"
            />
          </YStack>

          {/* Submit Button */}
          <Button
            onPress={handleSubmit}
            disabled={loading}
            backgroundColor="$accent"
            height={52}
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
  input: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
  },
});
