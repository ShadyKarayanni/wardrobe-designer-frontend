import { useCallback, useMemo, useRef, useEffect } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { YStack, XStack, Text } from 'tamagui';
import { Calendar, Shirt, ChevronRight, Images } from '@tamagui/lucide-icons';

interface FABMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: () => void;
  onAddItem: () => void;
  onBulkUpload: () => void;
}

interface MenuOptionProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

function MenuOption({ icon, label, onPress }: MenuOptionProps) {
  return (
    <Pressable onPress={onPress} style={styles.option}>
      <XStack alignItems="center" gap="$3" flex={1}>
        {icon}
        <Text fontSize={16} fontWeight="500" color="$text">
          {label}
        </Text>
      </XStack>
      <ChevronRight size={20} color="#4A4A4A" />
    </Pressable>
  );
}

export function FABMenuSheet({ isOpen, onClose, onAddEvent, onAddItem, onBulkUpload }: FABMenuSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['35%'], []);

  // Handle sheet open/close via ref
  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  const handleAddEvent = () => {
    onClose();
    setTimeout(() => onAddEvent(), 100);
  };

  const handleAddItem = () => {
    onClose();
    setTimeout(() => onAddItem(), 100);
  };

  const handleBulkUpload = () => {
    onClose();
    setTimeout(() => onBulkUpload(), 100);
  };

  if (!isOpen) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onClose={onClose}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetView style={styles.content}>
        <Text fontSize={18} fontWeight="600" color="$text" marginBottom="$4">
          What would you like to add?
        </Text>
        <YStack gap="$2">
          <MenuOption
            icon={<Calendar size={24} color="#333333" />}
            label="Add Event"
            onPress={handleAddEvent}
          />
          <MenuOption
            icon={<Shirt size={24} color="#333333" />}
            label="Add Wardrobe Item"
            onPress={handleAddItem}
          />
          <MenuOption
            icon={<Images size={24} color="#333333" />}
            label="Add Multiple Items"
            onPress={handleBulkUpload}
          />
        </YStack>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  indicator: {
    backgroundColor: '#E5E5E5',
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
});
