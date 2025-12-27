import { useState } from 'react';
import { StyleSheet, Modal, Pressable, FlatList, View } from 'react-native';
import { Text } from 'tamagui';
import { ChevronDown, Check } from '@tamagui/lucide-icons';

interface SelectOption<T> {
  key: T;
  label: string;
}

interface SelectProps<T> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
}

export function Select<T extends string>({
  value,
  options,
  onChange,
  placeholder = 'Select...',
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.key === value);

  const handleSelect = (option: SelectOption<T>) => {
    onChange(option.key);
    setIsOpen(false);
  };

  return (
    <>
      <Pressable style={styles.trigger} onPress={() => setIsOpen(true)}>
        <Text color={selectedOption ? '$text' : '$textMuted'} fontSize={14}>
          {selectedOption?.label || placeholder}
        </Text>
        <ChevronDown size={18} color="#4A4A4A" />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <View style={styles.dropdown}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.key}
              renderItem={({ item, index }) => (
                <Pressable
                  style={[
                    styles.option,
                    item.key === value && styles.optionSelected,
                    index === options.length - 1 && styles.optionLast,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    color={item.key === value ? '$accent' : '$text'}
                    fontSize={14}
                    fontWeight={item.key === value ? '600' : '400'}
                  >
                    {item.label}
                  </Text>
                  {item.key === value && (
                    <Check size={18} color="#333333" />
                  )}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '100%',
    maxHeight: 300,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionSelected: {
    backgroundColor: '#F5F5F5',
  },
  optionLast: {
    borderBottomWidth: 0,
  },
});
