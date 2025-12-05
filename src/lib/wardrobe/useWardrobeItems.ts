import { useState, useEffect, useCallback, useRef } from 'react';
import { wardrobeService } from './wardrobeService';
import { WardrobeItem } from './types';

const POLLING_INTERVAL = 5000; // 5 seconds
const PAGE_SIZE = 100; // Fetch more items at once since we're polling less frequently

interface UseWardrobeItemsResult {
  items: WardrobeItem[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  removeItem: (itemId: string) => void;
}

export function useWardrobeItems(): UseWardrobeItemsResult {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isLoadingMore = useRef(false);
  const isMounted = useRef(true);

  // Fetch all items (no server-side filtering - filtering done client-side)
  const fetchItems = useCallback(async (pageNum: number, append: boolean) => {
    try {
      setError(null);

      const response = await wardrobeService.getItems({
        page: pageNum,
        limit: PAGE_SIZE,
      });

      if (!isMounted.current) return;

      if (append) {
        setItems((prev) => {
          // Deduplicate items by ID when appending
          const existingIds = new Set(prev.map((item) => item.id));
          const newItems = response.items.filter((item) => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
      } else {
        setItems(response.items);
      }

      setHasMore(pageNum < response.pages);
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to load items');
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    isMounted.current = true;
    setLoading(true);
    fetchItems(1, false).finally(() => {
      if (isMounted.current) {
        setLoading(false);
      }
    });

    return () => {
      isMounted.current = false;
    };
  }, [fetchItems]);

  // Polling every 5 seconds (silent refresh - no loading state)
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Silent refresh - don't show loading indicator
      fetchItems(1, false);
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchItems]);

  // Manual pull to refresh
  const refresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchItems(1, false);
    setRefreshing(false);
  }, [fetchItems]);

  // Load more (infinite scroll)
  const loadMore = useCallback(async () => {
    if (!hasMore || loading || isLoadingMore.current) return;

    isLoadingMore.current = true;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchItems(nextPage, true);
    isLoadingMore.current = false;
  }, [hasMore, loading, page, fetchItems]);

  // Optimistic remove
  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  return {
    items,
    loading,
    refreshing,
    hasMore,
    error,
    refresh,
    loadMore,
    removeItem,
  };
}
