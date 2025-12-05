import { forwardRef, useCallback, useMemo, ReactNode } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { Text } from 'tamagui';
import { X } from '@tamagui/lucide-icons';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  snapPoints?: (string | number)[];
  children: ReactNode;
  scrollable?: boolean;
}

export const Sheet = forwardRef<BottomSheet, SheetProps>(function Sheet(
  { isOpen, onClose, title, snapPoints: customSnapPoints, children, scrollable = false },
  ref
) {
  const snapPoints = useMemo(
    () => customSnapPoints || ['50%', '90%'],
    [customSnapPoints]
  );

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  if (!isOpen) return null;

  const ContentWrapper = scrollable ? BottomSheetScrollView : BottomSheetView;

  return (
    <BottomSheet
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.indicator}
    >
      <ContentWrapper style={styles.content}>
        {title && (
          <View style={styles.header}>
            <Text fontSize={18} fontWeight="600" color="$text">
              {title}
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={24} color="#4A4A4A" />
            </Pressable>
          </View>
        )}
        {children}
      </ContentWrapper>
    </BottomSheet>
  );
});

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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
});
