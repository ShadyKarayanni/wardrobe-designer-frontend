import { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Text, YStack, XStack, Button } from 'tamagui';
import { X, RefreshCw } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';

interface RegenerateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: (feedback?: string) => Promise<void>;
  regenerating: boolean;
}

export function RegenerateSheet({ isOpen, onClose, onRegenerate, regenerating }: RegenerateSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setFeedback('');
    onClose();
  }, [onClose]);

  const handleRegenerate = useCallback(async () => {
    await onRegenerate(feedback.trim() || undefined);
    setFeedback('');
  }, [feedback, onRegenerate]);

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

  if (!isOpen) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={['40%']}
      enablePanDownToClose
      onClose={handleClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.indicator}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
          <Text fontSize={18} fontWeight="600" color="$text">
            Regenerate Outfit
          </Text>
          <Pressable onPress={handleClose} hitSlop={10}>
            <X size={24} color="#4A4A4A" />
          </Pressable>
        </XStack>

        {/* Feedback Input */}
        <YStack gap="$2" marginBottom="$4">
          <Text fontSize={14} fontWeight="500" color="$text">
            Feedback (optional)
          </Text>
          <BottomSheetTextInput
            style={styles.input}
            placeholder="e.g. make it more casual, something warmer..."
            placeholderTextColor="#6A6A6A"
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={2}
          />
        </YStack>

        {/* Regenerate Button */}
        <Button
          onPress={handleRegenerate}
          disabled={regenerating}
          backgroundColor="#3B82F6"
          paddingVertical="$3"
          borderRadius={8}
          pressStyle={{ opacity: 0.9 }}
        >
          <XStack alignItems="center" gap="$2">
            {regenerating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <RefreshCw size={18} color="#FFFFFF" />
            )}
            <Text color="#FFFFFF" fontSize={16} fontWeight="600">
              {regenerating ? 'Regenerating...' : 'Regenerate Outfit'}
            </Text>
          </XStack>
        </Button>
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
    minHeight: 60,
    textAlignVertical: 'top',
  },
});
