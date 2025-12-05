import { Select } from '@/components/common/Select';
import { ItemCategory, CATEGORIES } from '@/lib/wardrobe/types';

interface CategoryPickerProps {
  value: ItemCategory | null;
  onChange: (value: ItemCategory) => void;
}

// Filter out 'all' option for the picker (only used in tabs)
const CATEGORY_OPTIONS = CATEGORIES
  .filter((c) => c.key !== 'all')
  .map((c) => ({ key: c.key as ItemCategory, label: c.label }));

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <Select
      value={value || ('' as ItemCategory)}
      options={CATEGORY_OPTIONS}
      onChange={onChange}
      placeholder="Select category"
    />
  );
}
