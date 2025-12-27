import { api } from '../api/client';
import {
  Event,
  CreateEventRequest,
  UpdateEventRequest,
} from '../wardrobe/types';

const EVENTS_ENDPOINT = '/events';

export const eventsService = {
  /**
   * Get all events for the current user
   * Optionally filter by date range
   */
  async getEvents(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<Event[]> {
    const queryParams: Record<string, string> = {};
    if (params?.start_date) queryParams.start_date = params.start_date;
    if (params?.end_date) queryParams.end_date = params.end_date;

    const response = await api.get<Event[]>(EVENTS_ENDPOINT, {
      params: queryParams,
    });
    return response.data;
  },

  /**
   * Get a single event by ID
   */
  async getEvent(eventId: string): Promise<Event> {
    const response = await api.get<Event>(`${EVENTS_ENDPOINT}/${eventId}`);
    return response.data;
  },

  /**
   * Create a new event
   */
  async createEvent(data: CreateEventRequest): Promise<Event> {
    const response = await api.post<Event>(EVENTS_ENDPOINT, data);
    return response.data;
  },

  /**
   * Update an existing event
   */
  async updateEvent(eventId: string, data: UpdateEventRequest): Promise<Event> {
    const response = await api.put<Event>(`${EVENTS_ENDPOINT}/${eventId}`, data);
    return response.data;
  },

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<void> {
    await api.delete(`${EVENTS_ENDPOINT}/${eventId}`);
  },
};
