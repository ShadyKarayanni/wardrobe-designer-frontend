import { StyleSheet, TextInput, View } from 'react-native';
import { Search } from '@tamagui/lucide-icons';
import { Select } from '@/components/common/Select';
import { SortOption, SORT_OPTIONS } from '@/lib/wardrobe/types';

interface SearchSortBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
}

export function SearchSortBar({
  search,
  onSearchChange,
  sort,
  onSortChange,
}: SearchSortBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={18} color="#6A6A6A" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          placeholderTextColor="#6A6A6A"
          value={search}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <Select
        value={sort}
        options={SORT_OPTIONS}
        onChange={onSortChange}
        placeholder="Sort by"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    padding: 0,
  },
});
