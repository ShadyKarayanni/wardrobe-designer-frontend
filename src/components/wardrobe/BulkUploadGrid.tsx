import { StyleSheet, View, Image, Pressable, useWindowDimensions } from 'react-native';
import { Text, Spinner } from 'tamagui';
import { Check, X, RefreshCw, Clock } from '@tamagui/lucide-icons';
import { BulkUploadImage, UploadStatus } from '@/lib/wardrobe/types';

interface BulkUploadGridProps {
  items: BulkUploadImage[];
  onRetry?: (id: string) => void;
  onRemove?: (id: string) => void;
  showRemoveButton?: boolean;
}

const STATUS_COLORS: Record<UploadStatus, string> = {
  pending: 'rgba(100, 100, 100, 0.6)',
  uploading: 'rgba(59, 130, 246, 0.7)',
  success: 'rgba(46, 125, 50, 0.7)',
  error: 'rgba(211, 47, 47, 0.7)',
};

function StatusOverlay({ item, onRetry }: { item: BulkUploadImage; onRetry?: () => void }) {
  const renderIcon = () => {
    switch (item.status) {
      case 'pending':
        return <Clock size={24} color="#FFFFFF" />;
      case 'uploading':
        return <Spinner size="small" color="#FFFFFF" />;
      case 'success':
        return <Check size={24} color="#FFFFFF" />;
      case 'error':
        return (
          <Pressable onPress={onRetry} hitSlop={10}>
            <RefreshCw size={24} color="#FFFFFF" />
          </Pressable>
        );
    }
  };

  return (
    <View style={[styles.overlay, { backgroundColor: STATUS_COLORS[item.status] }]}>
      {renderIcon()}
      {item.status === 'error' && (
        <Text fontSize={10} color="#FFFFFF" marginTop="$1" textAlign="center">
          Tap to retry
        </Text>
      )}
    </View>
  );
}

export function BulkUploadGrid({ items, onRetry, onRemove, showRemoveButton = false }: BulkUploadGridProps) {
  const { width } = useWindowDimensions();
  const PADDING = 16;
  const GAP = 8;
  const COLUMNS = 3;
  const cardSize = (width - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.id} style={[styles.itemContainer, { width: cardSize, height: cardSize }]}>
          <Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
          <StatusOverlay item={item} onRetry={() => onRetry?.(item.id)} />
          {showRemoveButton && item.status === 'pending' && onRemove && (
            <Pressable style={styles.removeButton} onPress={() => onRemove(item.id)} hitSlop={10}>
              <X size={14} color="#FFFFFF" />
            </Pressable>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
  },
  itemContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
