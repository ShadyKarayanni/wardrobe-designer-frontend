import { Pressable, StyleSheet, View, Image } from 'react-native';
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

export function ItemCard({ item, onPress, onLongPress }: ItemCardProps) {
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
      style={[styles.container, animatedStyle]}
    >
      <View style={styles.imageContainer}>
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
          fontWeight="600"
          color="$text"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
        {item.color && (
          <View style={styles.colorRow}>
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <Text fontSize={13} color="$textSecondary" numberOfLines={1}>
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
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EBEBEB',
  },
  info: {
    padding: 12,
    gap: 6,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});
