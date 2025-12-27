import { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, TextInput, Alert, Pressable, Platform } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Text, YStack, XStack, Button, Spinner } from 'tamagui';
import { X, Calendar, Trash2 } from '@tamagui/lucide-icons';

import { Select } from '@/components/common/Select';
import { Event, DressCode, DRESS_CODES, UpdateEventRequest } from '@/lib/wardrobe/types';

interface EventDetailSheetProps {
  isOpen: boolean;
  event: Event | null;
  onClose: () => void;
  onUpdate: (eventId: string, data: UpdateEventRequest) => Promise<void>;
  onDelete: (eventId: string) => Promise<void>;
}

export function EventDetailSheet({ isOpen, event, onClose, onUpdate, onDelete }: EventDetailSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [dressCode, setDressCode] = useState<DressCode | ''>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Populate form when event changes
  useEffect(() => {
    if (event) {
      setEventName(event.event_name);
      setEventDate(new Date(event.event_date));
      setDressCode(event.dress_code);
      setNotes(event.notes || '');
    }
  }, [event]);

  // Handle sheet open/close
  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setShowDatePicker(false);
    onClose();
  }, [onClose]);

  const handleDateChange = (e: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = useCallback(async () => {
    if (!event) return;

    // Validation
    if (!eventName.trim()) {
      Alert.alert('Error', 'Please enter an event name');
      return;
    }
    if (!dressCode) {
      Alert.alert('Error', 'Please select a dress code');
      return;
    }

    setLoading(true);
    try {
      await onUpdate(event.id, {
        event_name: eventName.trim(),
        event_date: formatDateForAPI(eventDate),
        dress_code: dressCode,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update event');
    } finally {
      setLoading(false);
    }
  }, [event, eventName, eventDate, dressCode, notes, onClose, onUpdate]);

  const handleDelete = useCallback(() => {
    if (!event) return;

    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.event_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await onDelete(event.id);
              onClose();
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete event');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }, [event, onClose, onDelete]);

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

  if (!isOpen || !event) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={['80%']}
      enablePanDownToClose
      onClose={handleClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.indicator}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
          <Text fontSize={20} fontWeight="600" color="$text">
            Edit Event
          </Text>
          <Pressable onPress={handleClose} hitSlop={10}>
            <X size={24} color="#4A4A4A" />
          </Pressable>
        </XStack>

        {/* Form */}
        <YStack gap="$4">
          {/* Event Name */}
          <YStack gap="$2">
            <Text fontSize={14} fontWeight="500" color="$text">
              Event Name *
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Job Interview, Wedding"
              placeholderTextColor="#6A6A6A"
              value={eventName}
              onChangeText={setEventName}
              autoCapitalize="words"
            />
          </YStack>

          {/* Event Date */}
          <YStack gap="$2">
            <Text fontSize={14} fontWeight="500" color="$text">
              Date *
            </Text>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color="#4A4A4A" />
              <Text fontSize={16} color="$text" marginLeft="$2">
                {formatDate(eventDate)}
              </Text>
            </Pressable>
            {(showDatePicker || Platform.OS === 'ios') && (
              <DateTimePicker
                value={eventDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                style={Platform.OS === 'ios' ? styles.iosDatePicker : undefined}
              />
            )}
          </YStack>

          {/* Dress Code */}
          <YStack gap="$2">
            <Text fontSize={14} fontWeight="500" color="$text">
              Dress Code *
            </Text>
            <Select
              value={dressCode}
              options={DRESS_CODES}
              onChange={(value) => setDressCode(value as DressCode)}
              placeholder="Select dress code..."
            />
          </YStack>

          {/* Notes */}
          <YStack gap="$2">
            <Text fontSize={14} fontWeight="500" color="$text">
              Notes
            </Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Any additional details..."
              placeholderTextColor="#6A6A6A"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </YStack>

          {/* Action Buttons */}
          <YStack gap="$3" marginTop="$4">
            <Button
              onPress={handleSubmit}
              disabled={loading || deleting}
              backgroundColor="$accent"
              paddingVertical="$3"
              borderRadius={8}
              pressStyle={{ opacity: 0.9 }}
            >
              {loading ? (
                <Spinner color="$background" />
              ) : (
                <Text color="$background" fontSize={16} fontWeight="600">
                  Save Changes
                </Text>
              )}
            </Button>

            <Button
              onPress={handleDelete}
              disabled={loading || deleting}
              backgroundColor="transparent"
              borderColor="#EF4444"
              borderWidth={1}
              paddingVertical="$3"
              borderRadius={8}
              pressStyle={{ backgroundColor: '#FEF2F2' }}
            >
              {deleting ? (
                <Spinner color="#EF4444" />
              ) : (
                <XStack alignItems="center" gap="$2">
                  <Trash2 size={18} color="#EF4444" />
                  <Text color="#EF4444" fontSize={16} fontWeight="600">
                    Delete Event
                  </Text>
                </XStack>
              )}
            </Button>
          </YStack>
        </YStack>
      </BottomSheetScrollView>
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
    paddingBottom: 40,
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
  },
  notesInput: {
    minHeight: 80,
    paddingTop: 14,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iosDatePicker: {
    marginTop: 8,
  },
});
