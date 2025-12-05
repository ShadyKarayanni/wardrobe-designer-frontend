import { useState, useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { useDebounce } from '@/hooks/useDebounce';
import { useWardrobeItems } from '@/lib/wardrobe/useWardrobeItems';
import { useSignedUrls } from '@/lib/wardrobe/useSignedUrls';
import { wardrobeService } from '@/lib/wardrobe/wardrobeService';
import {
  ItemCategory,
  SortOption,
  WardrobeItemWithUrl,
} from '@/lib/wardrobe/types';
import { CategoryTabs } from './CategoryTabs';
import { SearchSortBar } from './SearchSortBar';
import { ItemGrid } from './ItemGrid';
import { ItemDetailSheet } from './ItemDetailSheet';

interface WardrobeContentProps {
  onRefreshReady?: (refresh: () => void) => void;
}

export function WardrobeContent({ onRefreshReady }: WardrobeContentProps) {
  // Filter state
  const [category, setCategory] = useState<ItemCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');

  // Debounced search for client-side filtering
  const debouncedSearch = useDebounce(search, 300);

  // Sheet visibility
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WardrobeItemWithUrl | null>(null);

  // Fetch items (polling every 5 seconds, no server-side filtering)
  const {
    items,
    loading,
    refreshing,
    hasMore,
    refresh,
    loadMore,
    removeItem,
  } = useWardrobeItems();

  // Get signed URLs
  const { itemsWithUrls } = useSignedUrls(items);

  // Client-side filtering for search (name & color) and sorting
  const filteredItems = useMemo(() => {
    let result = itemsWithUrls;

    // Filter by search term (matches name or color)
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase().trim();
      result = result.filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(searchLower);
        const colorMatch = item.color?.toLowerCase().includes(searchLower);
        return nameMatch || colorMatch;
      });
    }

    // Filter by category (in case server didn't filter)
    if (category !== 'all') {
      result = result.filter((item) => item.category === category);
    }

    // Sort items
    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'last_used':
          // Items never used go to the end
          if (!a.last_used && !b.last_used) return 0;
          if (!a.last_used) return 1;
          if (!b.last_used) return -1;
          return new Date(b.last_used).getTime() - new Date(a.last_used).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [itemsWithUrls, debouncedSearch, category, sort]);

  // Handlers
  const handleItemPress = useCallback((item: WardrobeItemWithUrl) => {
    setSelectedItem(item);
    setDetailSheetOpen(true);
  }, []);

  const handleItemLongPress = useCallback((item: WardrobeItemWithUrl) => {
    Alert.alert(
      item.name,
      'What would you like to do?',
      [
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeleteItem(item),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  }, []);

  const handleDeleteItem = useCallback(async (item: WardrobeItemWithUrl) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Optimistic remove
              removeItem(item.id);
              await wardrobeService.deleteItem(item.id);
            } catch (error) {
              // Revert on error
              refresh();
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  }, [removeItem, refresh]);

  // Expose refresh function to parent
  useEffect(() => {
    onRefreshReady?.(refresh);
  }, [onRefreshReady, refresh]);

  const handleEditSuccess = useCallback(() => {
    setDetailSheetOpen(false);
    setSelectedItem(null);
    refresh();
  }, [refresh]);

  const handleDeleteFromDetail = useCallback(() => {
    if (selectedItem) {
      handleDeleteItem(selectedItem);
      setDetailSheetOpen(false);
      setSelectedItem(null);
    }
  }, [selectedItem, handleDeleteItem]);

  return (
    <View style={styles.container}>
      <CategoryTabs selected={category} onSelect={setCategory} />
      <SearchSortBar
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
      />
      <ItemGrid
        items={filteredItems}
        loading={loading}
        refreshing={refreshing}
        hasMore={hasMore}
        category={category}
        hasSearch={!!debouncedSearch}
        onRefresh={refresh}
        onLoadMore={loadMore}
        onItemPress={handleItemPress}
        onItemLongPress={handleItemLongPress}
      />

      <ItemDetailSheet
        item={selectedItem}
        isOpen={detailSheetOpen}
        onClose={() => {
          setDetailSheetOpen(false);
          setSelectedItem(null);
        }}
        onEdit={handleEditSuccess}
        onDelete={handleDeleteFromDetail}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
