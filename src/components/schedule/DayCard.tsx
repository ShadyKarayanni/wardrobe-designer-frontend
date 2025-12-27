import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { ChevronDown, ChevronUp, Sparkles, RefreshCw } from '@tamagui/lucide-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { DailySchedule } from '@/lib/wardrobe/types';
import { WeatherBadge } from './WeatherBadge';
import { EventBadge } from './EventBadge';
import { OutfitItemPreview } from './OutfitItemPreview';

interface DayCardProps {
  schedule: DailySchedule;
  isToday?: boolean;
  onRequestRegenerate?: (date: string, lockedSlots: string[]) => void;
  onEventPress?: (eventId: string) => void;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function DayCard({ schedule, isToday = false, onRequestRegenerate, onEventPress }: DayCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [lockedSlots, setLockedSlots] = useState<Set<string>>(new Set());
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const hasOutfit = schedule.top || schedule.bottom || schedule.shoes;

  const toggleLock = (slot: string) => {
    setLockedSlots(prev => {
      const next = new Set(prev);
      if (next.has(slot)) {
        next.delete(slot);
      } else {
        next.add(slot);
      }
      return next;
    });
  };

  const handleOpenRegenerate = () => {
    if (onRequestRegenerate) {
      onRequestRegenerate(schedule.date, Array.from(lockedSlots));
    }
  };

  return (
    <AnimatedView style={[styles.container, isToday && styles.todayContainer, animatedStyle]}>
      <Pressable
        onPress={() => setExpanded(!expanded)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <XStack alignItems="center" gap="$2">
              <Text fontSize={16} fontWeight="700" color="$text">
                {schedule.day_name}
              </Text>
              {isToday && (
                <View style={styles.todayBadge}>
                  <Text fontSize={10} color="#FFFFFF" fontWeight="600">
                    TODAY
                  </Text>
                </View>
              )}
            </XStack>
            <Text fontSize={12} color="$textSecondary">
              {formatDate(schedule.date)}
            </Text>
          </YStack>
          <XStack alignItems="center" gap="$3">
            <WeatherBadge weather={schedule.weather} compact />
            {expanded ? (
              <ChevronUp size={20} color="#999999" />
            ) : (
              <ChevronDown size={20} color="#999999" />
            )}
          </XStack>
        </XStack>

        {/* Event Badge */}
        {schedule.event && (
          <View style={{ marginTop: 12 }}>
            <EventBadge
              event={schedule.event}
              onPress={onEventPress ? () => onEventPress(schedule.event!.id) : undefined}
            />
          </View>
        )}

        {/* Outfit Preview Row with Lock + Regenerate Button */}
        {hasOutfit && (
          <XStack marginTop="$3" gap="$2" alignItems="center">
            <XStack gap="$3" flex={1}>
              <OutfitItemPreview
                item={schedule.top}
                label="Top"
                isLocked={lockedSlots.has('top')}
                onToggleLock={() => toggleLock('top')}
              />
              <OutfitItemPreview
                item={schedule.bottom}
                label="Bottom"
                isLocked={lockedSlots.has('bottom')}
                onToggleLock={() => toggleLock('bottom')}
              />
              <OutfitItemPreview
                item={schedule.shoes}
                label="Shoes"
                isLocked={lockedSlots.has('shoes')}
                onToggleLock={() => toggleLock('shoes')}
              />
              {schedule.outer_layer && (
                <OutfitItemPreview
                  item={schedule.outer_layer}
                  label="Layer"
                  isLocked={lockedSlots.has('outer_layer')}
                  onToggleLock={() => toggleLock('outer_layer')}
                />
              )}
            </XStack>
            {/* Small Regenerate Button */}
            {onRequestRegenerate && (
              <Pressable
                style={styles.regenerateButton}
                onPress={handleOpenRegenerate}
              >
                <RefreshCw size={16} color="#3B82F6" />
              </Pressable>
            )}
          </XStack>
        )}

        {!hasOutfit && (
          <View style={styles.noOutfit}>
            <Text fontSize={13} color="$textMuted">
              No outfit scheduled
            </Text>
          </View>
        )}
      </Pressable>

      {/* Expanded Content */}
      {expanded && (
        <YStack marginTop="$3" paddingTop="$3" borderTopWidth={1} borderTopColor="#EEEEEE">
          {/* Full Weather */}
          <WeatherBadge weather={schedule.weather} />

          {/* AI Reasoning */}
          {schedule.ai_reasoning && (
            <View style={styles.reasoningContainer}>
              <XStack alignItems="center" gap="$2" marginBottom="$2">
                <Sparkles size={14} color="#F59E0B" />
                <Text fontSize={12} fontWeight="600" color="$textSecondary">
                  Why this outfit?
                </Text>
              </XStack>
              <Text fontSize={13} color="$text" lineHeight={20}>
                {schedule.ai_reasoning}
              </Text>
            </View>
          )}
        </YStack>
      )}
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  todayContainer: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  todayBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  noOutfit: {
    marginTop: 16,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  reasoningContainer: {
    marginTop: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 12,
  },
  regenerateButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
