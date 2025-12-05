import { FlatList, RefreshControl, StyleSheet, View, ActivityIndicator } from 'react-native';
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

export function ItemGrid({
  items,
  loading,
  refreshing,
  hasMore,
  category,
  hasSearch,
  onRefresh,
  onLoadMore,
  onItemPress,
  onItemLongPress,
}: ItemGridProps) {
  const renderItem = ({ item }: { item: WardrobeItemWithUrl }) => (
    <ItemCard
      item={item}
      onPress={() => onItemPress(item)}
      onLongPress={() => onItemLongPress(item)}
    />
  );

  const renderFooter = () => {
    if (!hasMore || items.length === 0) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#333333" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return <EmptyState category={category} hasSearch={hasSearch} />;
  };

  if (loading && items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333333" />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#333333"
        />
      }
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  row: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
