import { View, StyleSheet, Pressable } from 'react-native';
import { Text, XStack } from 'tamagui';
import { Calendar, ChevronRight } from '@tamagui/lucide-icons';
import { ScheduleEvent, DRESS_CODES } from '@/lib/wardrobe/types';

interface EventBadgeProps {
  event: ScheduleEvent;
  onPress?: () => void;
}

function getDressCodeLabel(code: string): string {
  const found = DRESS_CODES.find(dc => dc.key === code);
  return found?.label || code;
}

export function EventBadge({ event, onPress }: EventBadgeProps) {
  const content = (
    <XStack alignItems="center" gap="$2">
      <Calendar size={14} color="#7C3AED" />
      <View style={{ flex: 1 }}>
        <Text fontSize={12} fontWeight="600" color="#7C3AED" numberOfLines={1}>
          {event.event_name}
        </Text>
        <Text fontSize={10} color="#9F7AEA">
          {getDressCodeLabel(event.dress_code)}
        </Text>
      </View>
      {onPress && <ChevronRight size={16} color="#9F7AEA" />}
    </XStack>
  );

  if (onPress) {
    return (
      <Pressable style={styles.container} onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#7C3AED',
  },
});
