import { ScrollView, Pressable, StyleSheet } from 'react-native';
import { Text } from 'tamagui';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { ItemCategory, CATEGORIES } from '@/lib/wardrobe/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CategoryTabsProps {
  selected: ItemCategory | 'all';
  onSelect: (category: ItemCategory | 'all') => void;
}

interface TabItemProps {
  category: { key: ItemCategory | 'all'; label: string };
  isSelected: boolean;
  onPress: () => void;
}

function TabItem({ category, isSelected, onPress }: TabItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.tab,
        isSelected ? styles.tabSelected : styles.tabUnselected,
        animatedStyle,
      ]}
    >
      <Text
        fontSize={14}
        fontWeight={isSelected ? '600' : '400'}
        color={isSelected ? '#FAFAFA' : '$text'}
      >
        {category.label}
      </Text>
    </AnimatedPressable>
  );
}

export function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((category) => (
        <TabItem
          key={category.key}
          category={category}
          isSelected={selected === category.key}
          onPress={() => onSelect(category.key)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: 8,
  },
  tabSelected: {
    backgroundColor: '#333333',
  },
  tabUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});
