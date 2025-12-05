import { Pressable, StyleSheet, View, useWindowDimensions, Image } from 'react-native';
import { Text } from 'tamagui';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { WardrobeItemWithUrl } from '@/lib/wardrobe/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ItemCardProps {
  item: WardrobeItemWithUrl;
  onPress: () => void;
  onLongPress: () => void;
}

const CARD_GAP = 12;
const HORIZONTAL_PADDING = 16;

export function ItemCard({ item, onPress, onLongPress }: ItemCardProps) {
  const { width } = useWindowDimensions();
  const cardWidth = (width - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      delayLongPress={500}
      style={[styles.container, { width: cardWidth }, animatedStyle]}
    >
      <View style={[styles.imageContainer, { height: cardWidth }]}>
        {item.signedUrl ? (
          <Image
            source={{ uri: item.signedUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      <View style={styles.info}>
        <Text
          fontSize={14}
          fontWeight="500"
          color="$text"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
        {item.color && (
          <View style={styles.colorRow}>
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <Text fontSize={12} color="$textSecondary" numberOfLines={1}>
              {item.color}
            </Text>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    backgroundColor: '#F0F0F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8E8E8',
  },
  info: {
    padding: 10,
    gap: 4,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
});
