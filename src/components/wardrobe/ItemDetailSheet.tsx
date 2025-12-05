import { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, TextInput, Alert, Pressable, Image } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Text, YStack, XStack, Button, Spinner } from 'tamagui';
import { X, Pencil, Trash2 } from '@tamagui/lucide-icons';

import { useImagePicker } from '@/hooks/useImagePicker';
import { wardrobeService } from '@/lib/wardrobe/wardrobeService';
import { ItemCategory, WardrobeItemWithUrl, CATEGORIES } from '@/lib/wardrobe/types';
import { ImagePickerButton } from './ImagePickerButton';
import { CategoryPicker } from './CategoryPicker';

interface ItemDetailSheetProps {
  item: WardrobeItemWithUrl | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ItemDetailSheet({
  item,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: ItemDetailSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory | null>(null);
  const [color, setColor] = useState('');
  const { image, showImagePicker, clearImage } = useImagePicker();

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setColor(item.color || '');
      clearImage();
    }
  }, [item, clearImage]);

  // Handle sheet open/close
  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
      setIsEditing(false);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsEditing(false);
    onClose();
  }, [onClose]);

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setColor(item.color || '');
      clearImage();
    }
    setIsEditing(false);
  }, [item, clearImage]);

  const handleSaveEdit = useCallback(async () => {
    if (!item) return;

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setLoading(true);
    try {
      await wardrobeService.updateItem(item.id, {
        name: name.trim(),
        category,
        color: color.trim() || undefined,
        image: image || undefined,
      });
      setIsEditing(false);
      onEdit();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update item');
    } finally {
      setLoading(false);
    }
  }, [item, name, category, color, image, onEdit]);

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

  const getCategoryLabel = (cat: ItemCategory) => {
    return CATEGORIES.find((c) => c.key === cat)?.label || cat;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isOpen || !item) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={['90%']}
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
          <Text fontSize={20} fontWeight="600" color="$text" numberOfLines={1} flex={1}>
            {isEditing ? 'Edit Item' : item.name}
          </Text>
          <Pressable onPress={handleClose} hitSlop={10}>
            <X size={24} color="#4A4A4A" />
          </Pressable>
        </XStack>

        {isEditing ? (
          // Edit Mode
          <YStack gap="$4">
            {/* Image */}
            <YStack gap="$2">
              <Text fontSize={14} fontWeight="500" color="$text">
                Photo
              </Text>
              <XStack gap="$3" alignItems="center">
                {item.signedUrl && !image && (
                  <View style={styles.currentImage}>
                    <Image
                      source={{ uri: item.signedUrl }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                  </View>
                )}
                <ImagePickerButton
                  image={image}
                  onPress={showImagePicker}
                  onClear={clearImage}
                />
                {!image && (
                  <Text fontSize={12} color="$textMuted">
                    Tap to change photo
                  </Text>
                )}
              </XStack>
            </YStack>

            {/* Name */}
            <YStack gap="$2">
              <Text fontSize={14} fontWeight="500" color="$text">
                Name *
              </Text>
              <TextInput
                style={styles.input}
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
                Color (optional)
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

            {/* Edit Actions */}
            <XStack gap="$3" marginTop="$4">
              <Button
                flex={1}
                onPress={handleCancelEdit}
                backgroundColor="$background"
                borderColor="$border"
                borderWidth={1}
                height={48}
                borderRadius={8}
              >
                <Text color="$text" fontSize={16} fontWeight="500">
                  Cancel
                </Text>
              </Button>
              <Button
                flex={1}
                onPress={handleSaveEdit}
                disabled={loading}
                backgroundColor="$accent"
                height={48}
                borderRadius={8}
              >
                {loading ? (
                  <Spinner color="$background" />
                ) : (
                  <Text color="$background" fontSize={16} fontWeight="600">
                    Save
                  </Text>
                )}
              </Button>
            </XStack>
          </YStack>
        ) : (
          // View Mode
          <YStack gap="$4">
            {/* Image */}
            <View style={styles.imageContainer}>
              {item.signedUrl ? (
                <Image
                  source={{ uri: item.signedUrl }}
                  style={styles.fullImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder} />
              )}
            </View>

            {/* Details */}
            <YStack gap="$3" paddingHorizontal="$1">
              <XStack justifyContent="space-between">
                <Text fontSize={14} color="$textSecondary">
                  Category
                </Text>
                <Text fontSize={14} color="$text" fontWeight="500">
                  {getCategoryLabel(item.category)}
                </Text>
              </XStack>

              {item.color && (
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={14} color="$textSecondary">
                    Color
                  </Text>
                  <XStack alignItems="center" gap="$2">
                    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                    <Text fontSize={14} color="$text" fontWeight="500">
                      {item.color}
                    </Text>
                  </XStack>
                </XStack>
              )}

              <XStack justifyContent="space-between">
                <Text fontSize={14} color="$textSecondary">
                  Added
                </Text>
                <Text fontSize={14} color="$text" fontWeight="500">
                  {formatDate(item.created_at)}
                </Text>
              </XStack>

              {item.last_used && (
                <XStack justifyContent="space-between">
                  <Text fontSize={14} color="$textSecondary">
                    Last used
                  </Text>
                  <Text fontSize={14} color="$text" fontWeight="500">
                    {formatDate(item.last_used)}
                  </Text>
                </XStack>
              )}
            </YStack>

            {/* Actions */}
            <XStack gap="$3" marginTop="$4">
              <Button
                flex={1}
                onPress={handleStartEdit}
                backgroundColor="$background"
                borderColor="$border"
                borderWidth={1}
                height={48}
                borderRadius={8}
              >
                <XStack alignItems="center" gap="$2">
                  <Pencil size={18} color="#4A4A4A" />
                  <Text color="$text" fontSize={16} fontWeight="500">
                    Edit
                  </Text>
                </XStack>
              </Button>
              <Button
                flex={1}
                onPress={onDelete}
                backgroundColor="$error"
                height={48}
                borderRadius={8}
              >
                <XStack alignItems="center" gap="$2">
                  <Trash2 size={18} color="#FFFFFF" />
                  <Text color="white" fontSize={16} fontWeight="600">
                    Delete
                  </Text>
                </XStack>
              </Button>
            </XStack>
          </YStack>
        )}
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
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8E8E8',
  },
  currentImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
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
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
});
