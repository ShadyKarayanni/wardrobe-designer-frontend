import { Calendar, Shirt, Plus } from '@tamagui/lucide-icons';
import { XStack, YStack, Text, styled, View } from 'tamagui';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

// Page indices: Schedule (0) - Wardrobe (1)
const SCHEDULE_PAGE = 0;
const WARDROBE_PAGE = 1;

interface TabItem {
  name: string;
  icon: typeof Calendar;
  page: number;
}

const tabs: TabItem[] = [
  { name: 'Schedule', icon: Calendar, page: SCHEDULE_PAGE },
  { name: 'Wardrobe', icon: Shirt, page: WARDROBE_PAGE },
];

const FooterContainer = styled(XStack, {
  paddingVertical: '$3',
  borderTopWidth: 1,
  borderTopColor: '$border',
  backgroundColor: '$background',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  paddingHorizontal: '$2',
  position: 'relative',
});

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TabLabel = styled(Text, {
  fontSize: '$3',
  marginTop: '$1',
  fontFamily: '$body',
  variants: {
    active: {
      true: {
        color: '$text',
        fontWeight: '600',
      },
      false: {
        color: '$textSecondary',
        fontWeight: '400',
      },
    },
  } as const,
});

interface TabButtonProps {
  tab: TabItem;
  isActive: boolean;
  onPress: () => void;
}

function TabButton({ tab, isActive, onPress }: TabButtonProps) {
  const scale = useSharedValue(1);
  const Icon = tab.icon;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 25, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 25, stiffness: 200 });
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={animatedStyle}>
        <YStack alignItems="center" paddingVertical="$2" paddingHorizontal="$5">
          <Icon size={28} color={isActive ? '#1A1A1A' : '#4A4A4A'} strokeWidth={isActive ? 2.5 : 2} />
          {/* Ghost text technique: bold text reserves width, prevents layout shift */}
          <View style={styles.labelContainer}>
            <TabLabel active={true} style={styles.ghostLabel}>{tab.name}</TabLabel>
            <TabLabel active={isActive} style={styles.visibleLabel}>{tab.name}</TabLabel>
          </View>
        </YStack>
      </Animated.View>
    </Pressable>
  );
}

interface FooterProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  onFABPress?: () => void;
}

function FABButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.fab, animatedStyle]}
    >
      <Plus size={32} color="#FAFAFA" strokeWidth={2.5} />
    </AnimatedPressable>
  );
}

export function Footer({ currentPage, onPageChange, onFABPress }: FooterProps) {
  return (
    <FooterContainer>
      <TabButton
        tab={tabs[0]}
        isActive={currentPage === tabs[0].page}
        onPress={() => onPageChange(tabs[0].page)}
      />
      {onFABPress && (
        <View style={styles.fabContainer}>
          <FABButton onPress={onFABPress} />
        </View>
      )}
      <TabButton
        tab={tabs[1]}
        isActive={currentPage === tabs[1].page}
        onPress={() => onPageChange(tabs[1].page)}
      />
    </FooterContainer>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 6,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  labelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostLabel: {
    opacity: 0,
  },
  visibleLabel: {
    position: 'absolute',
  },
});
