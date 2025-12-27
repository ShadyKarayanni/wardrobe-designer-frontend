import { useState, useEffect, useCallback, useRef } from 'react';
import { wardrobeService } from './wardrobeService';
import { WardrobeItem } from './types';

const POLLING_INTERVAL = 30000; // 30 seconds
const PAGE_SIZE = 100; // Fetch more items at once since we're polling less frequently
const MAX_CONSECUTIVE_FAILURES = 5; // Stop polling after 5 consecutive failures

// In-memory cache for items (survives navigation, cleared on app restart)
let itemsCache: WardrobeItem[] = [];
let hasCachedData = false;

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
  // Use lazy initializers to ensure cache is read at mount time
  const [items, setItems] = useState<WardrobeItem[]>(() => {
    // Return cached items if available
    return hasCachedData ? [...itemsCache] : [];
  });
  // Only show loading if we don't have cached data
  const [loading, setLoading] = useState(() => !hasCachedData);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isLoadingMore = useRef(false);
  const isMounted = useRef(true);
  const consecutiveFailures = useRef(0);
  const pollingEnabled = useRef(true);

  // Fetch all items (no server-side filtering - filtering done client-side)
  const fetchItems = useCallback(async (pageNum: number, append: boolean) => {
    try {
      setError(null);

      const response = await wardrobeService.getItems({
        page: pageNum,
        limit: PAGE_SIZE,
      });

      if (!isMounted.current) return;

      // Reset failure counter on success
      consecutiveFailures.current = 0;
      pollingEnabled.current = true;

      if (append) {
        setItems((prev) => {
          // Deduplicate items by ID when appending
          const existingIds = new Set(prev.map((item) => item.id));
          const newItems = response.items.filter((item) => !existingIds.has(item.id));
          const updated = [...prev, ...newItems];
          // Update cache
          itemsCache = updated;
          hasCachedData = true;
          return updated;
        });
      } else {
        setItems(response.items);
        // Update cache
        itemsCache = response.items;
        hasCachedData = true;
      }

      setHasMore(pageNum < response.pages);
    } catch (err) {
      if (isMounted.current) {
        consecutiveFailures.current += 1;

        // Stop polling after too many failures
        if (consecutiveFailures.current >= MAX_CONSECUTIVE_FAILURES) {
          pollingEnabled.current = false;
          setError('Connection failed. Pull down to retry.');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load items');
        }
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    isMounted.current = true;

    // If we already have cached data, just refresh in background (no loading state)
    // Otherwise show loading state for initial fetch
    const hadCache = hasCachedData;

    if (!hadCache) {
      setLoading(true);
    }

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
      // Skip polling if disabled due to too many failures
      if (!pollingEnabled.current) return;
      // Silent refresh - don't show loading indicator
      fetchItems(1, false);
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchItems]);

  // Manual pull to refresh
  const refresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    // Re-enable polling on manual refresh
    consecutiveFailures.current = 0;
    pollingEnabled.current = true;
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
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== itemId);
      // Update cache
      itemsCache = updated;
      return updated;
    });
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

// Utility to clear cache (e.g., on logout)
export function clearWardrobeItemsCache(): void {
  itemsCache = [];
  hasCachedData = false;
}
