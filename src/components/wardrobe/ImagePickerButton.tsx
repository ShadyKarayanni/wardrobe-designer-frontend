import { Pressable, StyleSheet, View, Image } from 'react-native';
import { Text } from 'tamagui';
import { Camera, X } from '@tamagui/lucide-icons';
import { SelectedImage } from '@/hooks/useImagePicker';

interface ImagePickerButtonProps {
  image: SelectedImage | null;
  onPress: () => void;
  onClear: () => void;
  label?: string;
}

export function ImagePickerButton({ image, onPress, onClear, label = 'Add photo' }: ImagePickerButtonProps) {
  if (image) {
    return (
      <View style={styles.previewContainer}>
        <Image
          source={{ uri: image.uri }}
          style={styles.preview}
          resizeMode="cover"
        />
        <Pressable style={styles.clearButton} onPress={onClear} hitSlop={10}>
          <X size={16} color="#FFFFFF" />
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Camera size={32} color="#6A6A6A" />
      <Text fontSize={14} color="$textSecondary" marginTop="$2">
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 120,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  previewContainer: {
    width: 120,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  clearButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
