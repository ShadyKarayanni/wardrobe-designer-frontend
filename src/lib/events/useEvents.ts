import { useState, useEffect, useCallback, useRef } from 'react';
import { eventsService } from './eventsService';
import { Event, CreateEventRequest, UpdateEventRequest } from '../wardrobe/types';

// In-memory cache for events
let eventsCache: Event[] = [];
let hasCachedData = false;

interface UseEventsResult {
  events: Event[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createEvent: (data: CreateEventRequest) => Promise<Event>;
  updateEvent: (eventId: string, data: UpdateEventRequest) => Promise<Event>;
  deleteEvent: (eventId: string) => Promise<void>;
}

export function useEvents(): UseEventsResult {
  const [events, setEvents] = useState<Event[]>(() => {
    return hasCachedData ? [...eventsCache] : [];
  });
  const [loading, setLoading] = useState(() => !hasCachedData);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      const data = await eventsService.getEvents();

      if (!isMounted.current) return;

      // Sort by date (newest first)
      const sorted = data.sort((a, b) =>
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      );

      setEvents(sorted);
      eventsCache = sorted;
      hasCachedData = true;
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    isMounted.current = true;

    if (!hasCachedData) {
      setLoading(true);
    }

    fetchEvents().finally(() => {
      if (isMounted.current) {
        setLoading(false);
      }
    });

    return () => {
      isMounted.current = false;
    };
  }, [fetchEvents]);

  const refresh = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  const createEvent = useCallback(async (data: CreateEventRequest): Promise<Event> => {
    const newEvent = await eventsService.createEvent(data);

    // Add to state and cache
    setEvents((prev) => {
      const updated = [...prev, newEvent].sort((a, b) =>
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      );
      eventsCache = updated;
      return updated;
    });

    return newEvent;
  }, []);

  const updateEvent = useCallback(async (eventId: string, data: UpdateEventRequest): Promise<Event> => {
    const updatedEvent = await eventsService.updateEvent(eventId, data);

    // Update in state and cache
    setEvents((prev) => {
      const updated = prev.map((e) => (e.id === eventId ? updatedEvent : e)).sort((a, b) =>
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      );
      eventsCache = updated;
      return updated;
    });

    return updatedEvent;
  }, []);

  const deleteEvent = useCallback(async (eventId: string): Promise<void> => {
    await eventsService.deleteEvent(eventId);

    // Remove from state and cache
    setEvents((prev) => {
      const updated = prev.filter((e) => e.id !== eventId);
      eventsCache = updated;
      return updated;
    });
  }, []);

  return {
    events,
    loading,
    error,
    refresh,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}

// Utility to clear cache (e.g., on logout)
export function clearEventsCache(): void {
  eventsCache = [];
  hasCachedData = false;
}
