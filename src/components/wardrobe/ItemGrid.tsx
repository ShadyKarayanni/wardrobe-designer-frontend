import { ScrollView, RefreshControl, StyleSheet, View, ActivityIndicator, useWindowDimensions } from 'react-native';
import { WardrobeItemWithUrl } from '@/lib/wardrobe/types';
import { ItemCard } from './ItemCard';
import { EmptyState } from './EmptyState';

interface ItemGridProps {
  items: WardrobeItemWithUrl[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  category?: string;
  hasSearch?: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  onItemPress: (item: WardrobeItemWithUrl) => void;
  onItemLongPress: (item: WardrobeItemWithUrl) => void;
}

const CARD_GAP = 12;
const HORIZONTAL_PADDING = 16;

export function ItemGrid({
  items,
  loading,
  refreshing,
  category,
  hasSearch,
  onRefresh,
  onItemPress,
  onItemLongPress,
}: ItemGridProps) {
  const { width } = useWindowDimensions();
  const cardWidth = (width - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

  if (loading && items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333333" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#333333"
        />
      }
    >
      {items.length === 0 ? (
        <EmptyState category={category} hasSearch={hasSearch} />
      ) : (
        <View style={styles.grid}>
          {items.map((item) => (
            <View key={item.id} style={[styles.itemWrapper, { width: cardWidth }]}>
              <ItemCard
                item={item}
                onPress={() => onItemPress(item)}
                onLongPress={() => onItemLongPress(item)}
              />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 100,
    flexGrow: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  itemWrapper: {},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
