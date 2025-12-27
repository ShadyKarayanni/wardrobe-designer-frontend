import { api } from '../api/client';
import {
  WeeklyScheduleResponse,
  GenerateScheduleRequest,
  RegenerateOutfitRequest,
  DailySchedule,
} from '../wardrobe/types';

const SCHEDULE_ENDPOINT = '/schedule';

export const scheduleService = {
  /**
   * Get existing weekly schedule for a given start date
   * Returns null if no schedule exists for that week
   */
  async getWeeklySchedule(startDate: string): Promise<WeeklyScheduleResponse | null> {
    try {
      const response = await api.get<WeeklyScheduleResponse>(
        `${SCHEDULE_ENDPOINT}/weekly`,
        { params: { start_date: startDate } }
      );
      return response.data;
    } catch (error) {
      // No schedule found for this week
      return null;
    }
  },

  /**
   * Generate a weekly outfit schedule using AI
   * Takes into account weather, events, and user preferences
   */
  async generateWeeklySchedule(
    params: GenerateScheduleRequest
  ): Promise<WeeklyScheduleResponse> {
    const response = await api.post<WeeklyScheduleResponse>(
      `${SCHEDULE_ENDPOINT}/weekly`,
      params
    );
    return response.data;
  },

  /**
   * Regenerate outfit for a single day
   * Keeps existing schedule but generates new outfit for the specified date
   */
  async regenerateDay(
    date: string,
    params?: RegenerateOutfitRequest
  ): Promise<DailySchedule> {
    const response = await api.post<DailySchedule>(
      `${SCHEDULE_ENDPOINT}/${date}/regenerate`,
      params || {}
    );
    return response.data;
  },
};
