import { StyleSheet, View } from 'react-native';
import { Text, YStack } from 'tamagui';
import { Shirt } from '@tamagui/lucide-icons';

interface EmptyStateProps {
  category?: string;
  hasSearch?: boolean;
}

export function EmptyState({ category, hasSearch }: EmptyStateProps) {
  const title = hasSearch
    ? 'No items found'
    : category && category !== 'all'
    ? `No ${category} yet`
    : 'Your wardrobe is empty';

  const description = hasSearch
    ? 'Try adjusting your search or filters'
    : 'Tap the + button to add your first item';

  return (
    <View style={styles.container}>
      <YStack alignItems="center" gap="$4">
        <View style={styles.iconContainer}>
          <Shirt size={48} color="#D5D5D5" strokeWidth={1.5} />
        </View>
        <YStack alignItems="center" gap="$2">
          <Text fontSize={18} fontWeight="600" color="$text">
            {title}
          </Text>
          <Text fontSize={14} color="$textSecondary" textAlign="center">
            {description}
          </Text>
        </YStack>
      </YStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
