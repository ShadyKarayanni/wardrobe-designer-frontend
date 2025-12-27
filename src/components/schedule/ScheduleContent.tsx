import { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { YStack, XStack, Text, Button, Input } from 'tamagui';
import { ChevronLeft, ChevronRight, MapPin, Sparkles, AlertCircle, Lock, Shirt } from '@tamagui/lucide-icons';
import { useFocusEffect } from 'expo-router';
import { scheduleService } from '@/lib/schedule/scheduleService';
import { profileService } from '@/lib/profile/profileService';
import { userPreferences } from '@/lib/preferences/userPreferences';
import { useEvents } from '@/lib/events/useEvents';
import { WeeklyScheduleResponse, UserProfile, DailySchedule, RegenerateOutfitRequest, Event } from '@/lib/wardrobe/types';
import { DayCard } from './DayCard';
import { RegenerateSheet } from './RegenerateSheet';
import { EventDetailSheet } from '@/components/events/EventDetailSheet';

// Simple in-memory cache (survives page switches, cleared on logout/reload)
let scheduleCache: Map<string, WeeklyScheduleResponse> = new Map();
let profileCache: UserProfile | null = null;

interface ScheduleContentProps {
  onRefreshReady?: (refresh: () => void) => void;
  wardrobeItemCount: number;
  minItemsRequired: number;
}

function getWeekStartDate(offset: number = 0): Date {
  const today = new Date();
  today.setDate(today.getDate() + offset * 7);
  return today;
}

function formatWeekRange(startDate: Date): string {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });

  if (startMonth === endMonth) {
    return `${startMonth} ${startDate.getDate()} - ${endDate.getDate()}`;
  }
  return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}`;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function ScheduleContent({ onRefreshReady, wardrobeItemCount, minItemsRequired }: ScheduleContentProps) {
  const isLocked = wardrobeItemCount < minItemsRequired;
  const itemsNeeded = minItemsRequired - wardrobeItemCount;
  const [weekOffset, setWeekOffset] = useState(0);
  const [schedule, setSchedule] = useState<WeeklyScheduleResponse | null>(null);
  const [fetching, setFetching] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);

  // Regenerate sheet state
  const [showRegenerateSheet, setShowRegenerateSheet] = useState(false);
  const [regenerateDate, setRegenerateDate] = useState<string | null>(null);
  const [regenerateLockedSlots, setRegenerateLockedSlots] = useState<string[]>([]);
  const [regenerating, setRegenerating] = useState(false);

  // Event detail sheet state
  const [showEventDetailSheet, setShowEventDetailSheet] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { events, updateEvent, deleteEvent, refresh: refreshEvents } = useEvents();

  const weekStartDate = useMemo(() => getWeekStartDate(weekOffset), [weekOffset]);
  const today = new Date();

  // Fetch schedule and update cache
  const fetchSchedule = useCallback(async () => {
    const cacheKey = getWeekStartDate(weekOffset).toISOString().split('T')[0];
    setError(null);

    try {
      const result = await scheduleService.getWeeklySchedule(cacheKey);
      // Always update cache and state with fresh data
      if (result) {
        scheduleCache.set(cacheKey, result);
      }
      setSchedule(result);
    } catch {
      setSchedule(null);
    } finally {
      setFetching(false);
    }
  }, [weekOffset]);

  // Load profile (for default city/country)
  const loadProfile = useCallback(async () => {
    // Use cache if available
    if (profileCache) {
      if (profileCache.default_city) setCity(profileCache.default_city);
      if (profileCache.default_country) setCountry(profileCache.default_country);
      return;
    }

    try {
      const profileData = await profileService.getProfile();
      profileCache = profileData;
      if (profileData.default_city) setCity(profileData.default_city);
      if (profileData.default_country) setCountry(profileData.default_country);
    } catch {
      // Profile might not exist yet
    }
  }, []);

  // Fetch on focus - shows cached data instantly, then fetches fresh
  useFocusEffect(
    useCallback(() => {
      const cacheKey = getWeekStartDate(weekOffset).toISOString().split('T')[0];
      const cached = scheduleCache.get(cacheKey);

      // Show cached data immediately (no loading spinner)
      if (cached) {
        setSchedule(cached);
        setFetching(false);
      } else {
        setFetching(true);
      }

      // Always fetch fresh data
      fetchSchedule();
      loadProfile();
    }, [weekOffset, fetchSchedule, loadProfile])
  );

  // Generate new schedule
  const generateSchedule = useCallback(async () => {
    if (!city.trim()) {
      setShowLocationInput(true);
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const startDate = getWeekStartDate(weekOffset).toISOString().split('T')[0];
      const prefs = await userPreferences.get();

      const result = await scheduleService.generateWeeklySchedule({
        city: city.trim(),
        country: country.trim() || undefined,
        start_date: startDate,
        style_preferences: prefs.stylePreferences || undefined,
      });

      // Update cache and state
      scheduleCache.set(startDate, result);
      setSchedule(result);
      setShowLocationInput(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate schedule';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setGenerating(false);
    }
  }, [city, country, weekOffset]);

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSchedule();
    setRefreshing(false);
  }, [fetchSchedule]);

  const saveLocation = async () => {
    if (!city.trim()) return;
    try {
      const updated = await profileService.updateProfile({
        default_city: city.trim(),
        default_country: country.trim() || undefined,
      });
      // Update cache with new profile data
      profileCache = updated;
    } catch {
      // Failed to save
    }
  };

  // Open regenerate sheet for a specific day
  const handleRequestRegenerate = useCallback((date: string, lockedSlots: string[]) => {
    setRegenerateDate(date);
    setRegenerateLockedSlots(lockedSlots);
    setShowRegenerateSheet(true);
  }, []);

  // Close regenerate sheet
  const handleCloseRegenerateSheet = useCallback(() => {
    setShowRegenerateSheet(false);
    setRegenerateDate(null);
    setRegenerateLockedSlots([]);
  }, []);

  // Regenerate a single day's outfit
  const handleRegenerateDay = useCallback(async (feedback?: string) => {
    if (!regenerateDate) return;

    setRegenerating(true);
    try {
      const params: RegenerateOutfitRequest = {};
      if (feedback) {
        params.feedback = feedback;
      }
      if (regenerateLockedSlots.length > 0) {
        params.locked_slots = regenerateLockedSlots;
      }

      const updatedDay = await scheduleService.regenerateDay(regenerateDate, params);

      // Update schedule state with new day
      setSchedule(prev => {
        if (!prev) return prev;
        const updatedSchedule = prev.schedule.map((day: DailySchedule) =>
          day.date === regenerateDate ? updatedDay : day
        );
        const newSchedule = { ...prev, schedule: updatedSchedule };

        // Update cache
        const cacheKey = getWeekStartDate(weekOffset).toISOString().split('T')[0];
        scheduleCache.set(cacheKey, newSchedule);

        return newSchedule;
      });

      // Close sheet on success
      handleCloseRegenerateSheet();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to regenerate outfit';
      Alert.alert('Error', message);
    } finally {
      setRegenerating(false);
    }
  }, [regenerateDate, regenerateLockedSlots, weekOffset, handleCloseRegenerateSheet]);

  // Handle event press - find full event data and show detail sheet
  const handleEventPress = useCallback((eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setShowEventDetailSheet(true);
    }
  }, [events]);

  // Handle event update
  const handleUpdateEvent = useCallback(async (eventId: string, data: any) => {
    await updateEvent(eventId, data);
    await fetchSchedule(); // Refresh schedule to show updated event
  }, [updateEvent, fetchSchedule]);

  // Handle event delete
  const handleDeleteEvent = useCallback(async (eventId: string) => {
    await deleteEvent(eventId);
    await fetchSchedule(); // Refresh schedule to remove deleted event
  }, [deleteEvent, fetchSchedule]);

  const handlePrevWeek = () => setWeekOffset(prev => prev - 1);
  const handleNextWeek = () => setWeekOffset(prev => prev + 1);
  const handleThisWeek = () => setWeekOffset(0);

  // Expose refresh function
  useFocusEffect(
    useCallback(() => {
      if (onRefreshReady) {
        onRefreshReady(handleRefresh);
      }
    }, [onRefreshReady, handleRefresh])
  );

  // Locked state - not enough wardrobe items
  if (isLocked) {
    return (
      <YStack flex={1}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.lockedState}>
            <View style={styles.lockedIconContainer}>
              <Lock size={32} color="#9CA3AF" />
            </View>
            <Text fontSize={20} fontWeight="600" color="$text" marginTop="$4" textAlign="center">
              Schedule Locked
            </Text>
            <Text
              fontSize={14}
              color="$textSecondary"
              textAlign="center"
              marginTop="$2"
              marginBottom="$4"
              paddingHorizontal="$4"
            >
              Add at least {minItemsRequired} items to your wardrobe to unlock AI outfit scheduling.
            </Text>
            <XStack
              backgroundColor="$backgroundHover"
              paddingHorizontal="$4"
              paddingVertical="$3"
              borderRadius="$3"
              alignItems="center"
              gap="$3"
            >
              <Shirt size={20} color="#3B82F6" />
              <YStack>
                <Text fontSize={14} fontWeight="500" color="$text">
                  {wardrobeItemCount} / {minItemsRequired} items
                </Text>
                <Text fontSize={12} color="$textSecondary">
                  {itemsNeeded} more {itemsNeeded === 1 ? 'item' : 'items'} needed
                </Text>
              </YStack>
            </XStack>
            <Text
              fontSize={13}
              color="$textMuted"
              textAlign="center"
              marginTop="$6"
              paddingHorizontal="$6"
            >
              Go to your Wardrobe and tap the + button to add clothing items
            </Text>
          </View>
        </ScrollView>
      </YStack>
    );
  }

  return (
    <YStack flex={1}>
      {/* Week Navigation */}
      <View style={styles.weekNav}>
        <XStack alignItems="center" justifyContent="space-between">
          <Button
            size="$2"
            circular
            backgroundColor="transparent"
            onPress={handlePrevWeek}
            pressStyle={{ backgroundColor: '$backgroundPress' }}
          >
            <ChevronLeft size={20} color="#4A4A4A" />
          </Button>

          <YStack alignItems="center">
            <Text fontSize={16} fontWeight="600" color="$text">
              {formatWeekRange(weekStartDate)}
            </Text>
            {weekOffset !== 0 && (
              <Button
                size="$1"
                backgroundColor="transparent"
                onPress={handleThisWeek}
                pressStyle={{ opacity: 0.7 }}
              >
                <Text fontSize={12} color="#3B82F6">
                  Back to this week
                </Text>
              </Button>
            )}
          </YStack>

          <Button
            size="$2"
            circular
            backgroundColor="transparent"
            onPress={handleNextWeek}
            pressStyle={{ backgroundColor: '$backgroundPress' }}
          >
            <ChevronRight size={20} color="#4A4A4A" />
          </Button>
        </XStack>
      </View>

      {/* Location Input */}
      {(showLocationInput || !schedule) && !fetching && (
        <View style={styles.locationSection}>
          <XStack alignItems="center" gap="$2" marginBottom="$3">
            <MapPin size={18} color="#666666" />
            <Text fontSize={14} fontWeight="500" color="$text">
              Your Location
            </Text>
          </XStack>
          <XStack gap="$2" marginBottom="$3">
            <Input
              flex={2}
              size="$3"
              placeholder="City"
              value={city}
              onChangeText={setCity}
              backgroundColor="$background"
              borderColor="$border"
            />
            <Input
              flex={1}
              size="$3"
              placeholder="Country"
              value={country}
              onChangeText={setCountry}
              backgroundColor="$background"
              borderColor="$border"
            />
          </XStack>
          {city.trim() && (
            <Button
              size="$2"
              backgroundColor="transparent"
              onPress={saveLocation}
              alignSelf="flex-start"
              pressStyle={{ opacity: 0.7 }}
            >
              <Text fontSize={12} color="#3B82F6">
                Save as default location
              </Text>
            </Button>
          )}
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Loading */}
        {fetching && !generating && (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text fontSize={14} color="$textSecondary" marginTop="$3">
              Loading schedule...
            </Text>
          </View>
        )}

        {/* Empty state */}
        {!fetching && !schedule && !generating && (
          <View style={styles.emptyState}>
            <Sparkles size={48} color="#3B82F6" />
            <Text fontSize={18} fontWeight="600" color="$text" marginTop="$4">
              Generate Your Weekly Outfits
            </Text>
            <Text
              fontSize={14}
              color="$textSecondary"
              textAlign="center"
              marginTop="$2"
              marginBottom="$4"
            >
              AI will create a 7-day outfit plan based on your wardrobe, weather, and events.
            </Text>
            <Button
              size="$4"
              backgroundColor="#3B82F6"
              onPress={generateSchedule}
              disabled={generating}
              pressStyle={{ backgroundColor: '#2563EB' }}
            >
              <XStack alignItems="center" gap="$2">
                <Sparkles size={18} color="#FFFFFF" />
                <Text color="#FFFFFF" fontWeight="600">
                  Generate Schedule
                </Text>
              </XStack>
            </Button>
          </View>
        )}

        {/* Generating */}
        {generating && (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text fontSize={14} color="$textSecondary" marginTop="$3">
              Generating your outfits...
            </Text>
            <Text fontSize={12} color="$textMuted" marginTop="$1">
              This may take a moment
            </Text>
          </View>
        )}

        {/* Error */}
        {error && !fetching && !generating && (
          <View style={styles.errorState}>
            <AlertCircle size={40} color="#EF4444" />
            <Text fontSize={14} color="$text" marginTop="$3" textAlign="center">
              {error}
            </Text>
            <Button
              size="$3"
              marginTop="$4"
              backgroundColor="#3B82F6"
              onPress={generateSchedule}
              pressStyle={{ backgroundColor: '#2563EB' }}
            >
              <Text color="#FFFFFF">Try Again</Text>
            </Button>
          </View>
        )}

        {/* Schedule */}
        {schedule && !fetching && !generating && (
          <YStack gap="$3">
            <XStack alignItems="center" gap="$2" paddingHorizontal="$2">
              <MapPin size={14} color="#666666" />
              <Text fontSize={12} color="$textSecondary">
                {schedule.location}
              </Text>
              <Button
                size="$1"
                backgroundColor="transparent"
                onPress={() => setShowLocationInput(true)}
                marginLeft="auto"
              >
                <Text fontSize={12} color="#3B82F6">
                  Change
                </Text>
              </Button>
            </XStack>
            {schedule.schedule.map((day) => (
              <DayCard
                key={day.date}
                schedule={day}
                isToday={isSameDay(new Date(day.date), today)}
                onRequestRegenerate={handleRequestRegenerate}
                onEventPress={handleEventPress}
              />
            ))}
            <Button
              size="$4"
              marginTop="$2"
              backgroundColor="$background"
              borderColor="#3B82F6"
              borderWidth={1}
              onPress={generateSchedule}
              pressStyle={{ backgroundColor: '$backgroundPress' }}
            >
              <XStack alignItems="center" gap="$2">
                <Sparkles size={16} color="#3B82F6" />
                <Text color="#3B82F6" fontWeight="600">
                  Regenerate Schedule
                </Text>
              </XStack>
            </Button>
          </YStack>
        )}
      </ScrollView>

      {/* Regenerate Bottom Sheet */}
      <RegenerateSheet
        isOpen={showRegenerateSheet}
        onClose={handleCloseRegenerateSheet}
        onRegenerate={handleRegenerateDay}
        regenerating={regenerating}
      />

      {/* Event Detail Sheet */}
      <EventDetailSheet
        isOpen={showEventDetailSheet}
        event={selectedEvent}
        onClose={() => {
          setShowEventDetailSheet(false);
          setSelectedEvent(null);
        }}
        onUpdate={handleUpdateEvent}
        onDelete={handleDeleteEvent}
      />
    </YStack>
  );
}

const styles = StyleSheet.create({
  weekNav: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  locationSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  errorState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  lockedState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  lockedIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Clear cache on logout
export function clearScheduleCache(): void {
  scheduleCache.clear();
  profileCache = null;
}
