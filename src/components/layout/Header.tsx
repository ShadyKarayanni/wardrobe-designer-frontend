import { XStack, Text, styled, View } from 'tamagui';
import { Pressable } from 'react-native';
import { Settings } from '@tamagui/lucide-icons';

interface HeaderProps {
  title: string;
  onSettingsPress?: () => void;
}

const HeaderContainer = styled(XStack, {
  paddingVertical: '$3',
  paddingHorizontal: '$4',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottomWidth: 1,
  borderBottomColor: '$border',
  backgroundColor: '$background',

  // Subtle fade-in animation
  animation: 'subtle',
  enterStyle: {
    opacity: 0,
  },
});

const HeaderTitle = styled(Text, {
  fontSize: '$6',
  fontWeight: '600',
  color: '$text',
  fontFamily: '$heading',
});

const IconPlaceholder = styled(View, {
  width: 24,
});

export function Header({ title, onSettingsPress }: HeaderProps) {
  return (
    <HeaderContainer>
      {onSettingsPress ? (
        <Pressable onPress={onSettingsPress} hitSlop={10}>
          <Settings size={24} color="#4A4A4A" />
        </Pressable>
      ) : (
        <IconPlaceholder />
      )}
      <HeaderTitle>{title}</HeaderTitle>
      <IconPlaceholder />
    </HeaderContainer>
  );
}
