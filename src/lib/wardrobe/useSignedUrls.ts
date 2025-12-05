import { useState, useEffect, useMemo, useRef } from 'react';
import { wardrobeService } from './wardrobeService';
import { WardrobeItem, WardrobeItemWithUrl } from './types';

interface CachedUrl {
  url: string;
  expiresAt: number;
}

// In-memory cache (survives re-renders, cleared on app restart)
const urlCache = new Map<string, CachedUrl>();

// Buffer before expiration to refresh proactively (5 minutes)
const EXPIRATION_BUFFER_MS = 5 * 60 * 1000;

// Default expiration time for signed URLs (1 hour)
const DEFAULT_EXPIRES_IN = 3600;

interface UseSignedUrlsResult {
  itemsWithUrls: WardrobeItemWithUrl[];
  loading: boolean;
}

export function useSignedUrls(items: WardrobeItem[]): UseSignedUrlsResult {
  const [urlMap, setUrlMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false);

  useEffect(() => {
    async function fetchUrls() {
      if (items.length === 0 || fetchingRef.current) return;

      const now = Date.now();
      const itemsNeedingUrls: string[] = [];

      // Check which items need fresh URLs
      for (const item of items) {
        const cached = urlCache.get(item.id);
        if (!cached || cached.expiresAt - EXPIRATION_BUFFER_MS < now) {
          itemsNeedingUrls.push(item.id);
        }
      }

      // Build initial map from cache
      const initialMap: Record<string, string> = {};
      for (const item of items) {
        const cached = urlCache.get(item.id);
        if (cached && cached.expiresAt > now) {
          initialMap[item.id] = cached.url;
        }
      }
      setUrlMap(initialMap);

      // Fetch missing/expired URLs
      if (itemsNeedingUrls.length > 0) {
        fetchingRef.current = true;
        setLoading(true);

        try {
          const response = await wardrobeService.getSignedUrls(
            itemsNeedingUrls,
            DEFAULT_EXPIRES_IN
          );

          const expiresAt = now + DEFAULT_EXPIRES_IN * 1000;

          // Update cache and build new URL map
          const newUrls: Record<string, string> = {};
          for (const urlItem of response.urls) {
            urlCache.set(urlItem.item_id, {
              url: urlItem.signed_url,
              expiresAt,
            });
            newUrls[urlItem.item_id] = urlItem.signed_url;
          }

          // Update state
          setUrlMap((prev) => ({ ...prev, ...newUrls }));
        } catch (error) {
          console.error('Failed to fetch signed URLs:', error);
        } finally {
          setLoading(false);
          fetchingRef.current = false;
        }
      }
    }

    fetchUrls();
  }, [items]);

  // Combine items with URLs
  const itemsWithUrls: WardrobeItemWithUrl[] = useMemo(() => {
    return items.map((item) => ({
      ...item,
      signedUrl: urlMap[item.id] || null,
    }));
  }, [items, urlMap]);

  return { itemsWithUrls, loading };
}

// Utility to clear cache (e.g., on logout)
export function clearSignedUrlCache(): void {
  urlCache.clear();
}
