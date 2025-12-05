import { Calendar, Settings, Shirt } from '@tamagui/lucide-icons';
import { XStack, YStack, Text, styled } from 'tamagui';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

// Page indices: Settings (0) - Schedule (1) - Wardrobe (2)
const SETTINGS_PAGE = 0;
const SCHEDULE_PAGE = 1;
const WARDROBE_PAGE = 2;

interface TabItem {
  name: string;
  icon: typeof Calendar;
  page: number;
}

const tabs: TabItem[] = [
  { name: 'Settings', icon: Settings, page: SETTINGS_PAGE },
  { name: 'Schedule', icon: Calendar, page: SCHEDULE_PAGE },
  { name: 'Wardrobe', icon: Shirt, page: WARDROBE_PAGE },
];

const FooterContainer = styled(XStack, {
  height: 72,
  borderTopWidth: 1,
  borderTopColor: '$border',
  backgroundColor: '$background',
  justifyContent: 'space-around',
  alignItems: 'center',
  paddingHorizontal: '$4',
});

const TabLabel = styled(Text, {
  fontSize: '$1',
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
        <YStack alignItems="center" paddingVertical="$2" paddingHorizontal="$4">
          <Icon size={24} color={isActive ? '#1A1A1A' : '#4A4A4A'} strokeWidth={isActive ? 2.5 : 2} />
          <TabLabel active={isActive}>{tab.name}</TabLabel>
        </YStack>
      </Animated.View>
    </Pressable>
  );
}

interface FooterProps {
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function Footer({ currentPage, onPageChange }: FooterProps) {
  return (
    <FooterContainer>
      {tabs.map((tab) => (
        <TabButton
          key={tab.page}
          tab={tab}
          isActive={currentPage === tab.page}
          onPress={() => onPageChange(tab.page)}
        />
      ))}
    </FooterContainer>
  );
}
