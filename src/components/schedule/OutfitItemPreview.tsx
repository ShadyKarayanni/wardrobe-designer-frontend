import { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Pressable, ActivityIndicator } from 'react-native';
import { Text } from 'tamagui';
import { ImageOff, Lock } from '@tamagui/lucide-icons';
import { ScheduleOutfitItem } from '@/lib/wardrobe/types';
import { wardrobeService } from '@/lib/wardrobe/wardrobeService';

interface OutfitItemPreviewProps {
  item: ScheduleOutfitItem | null;
  label: string;
  onPress?: () => void;
  isLocked?: boolean;
  onToggleLock?: () => void;
}

export function OutfitItemPreview({ item, label, onPress, isLocked, onToggleLock }: OutfitItemPreviewProps) {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [hasTriedRefresh, setHasTriedRefresh] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Initialize URL from item
  useEffect(() => {
    if (item) {
      setCurrentUrl(item.signed_url || item.image_url || null);
      setHasTriedRefresh(false);
      setImageError(false);
    }
  }, [item?.id, item?.signed_url, item?.image_url]);

  const handleImageError = async () => {
    // If we haven't tried refreshing yet, get a fresh signed URL
    if (!hasTriedRefresh && item?.id) {
      setHasTriedRefresh(true);
      setIsRefreshing(true);
      try {
        const response = await wardrobeService.getSignedUrls([item.id]);
        const urlItem = response.urls.find(u => u.item_id === item.id);
        if (urlItem?.signed_url) {
          setCurrentUrl(urlItem.signed_url);
          setIsRefreshing(false);
          return; // Don't set error, try with new URL
        }
      } catch {
        // Failed to refresh, fall through to error state
      }
      setIsRefreshing(false);
    }
    setImageError(true);
  };

  if (!item) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyImage}>
          <Text fontSize={10} color="$textMuted">-</Text>
        </View>
        <Text fontSize={10} color="$textMuted" numberOfLines={1}>
          No {label.toLowerCase()}
        </Text>
      </View>
    );
  }

  const handlePress = () => {
    if (onToggleLock) {
      onToggleLock();
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
      disabled={!onPress && !onToggleLock}
    >
      <View style={styles.imageContainer}>
        {isRefreshing ? (
          <View style={styles.emptyImage}>
            <ActivityIndicator size="small" color="#999999" />
          </View>
        ) : currentUrl && !imageError ? (
          <Image
            source={{ uri: currentUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={handleImageError}
          />
        ) : (
          <View style={styles.emptyImage}>
            <ImageOff size={20} color="#999999" />
          </View>
        )}
        {/* Lock overlay */}
        {isLocked && (
          <View style={styles.lockOverlay}>
            <Lock size={14} color="#FFFFFF" />
          </View>
        )}
      </View>
      <Text
        fontSize={10}
        color="$textSecondary"
        numberOfLines={1}
        textAlign="center"
      >
        {item.name}
      </Text>
    </Pressable>
  );
}

const IMAGE_SIZE = 56;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 60,
    gap: 4,
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    minHeight: IMAGE_SIZE,
    maxHeight: IMAGE_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  emptyImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    backgroundColor: '#EBEBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
