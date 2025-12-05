import { XStack, Text, styled } from 'tamagui';

interface HeaderProps {
  title: string;
}

const HeaderContainer = styled(XStack, {
  height: 56,
  paddingHorizontal: '$4',
  alignItems: 'center',
  justifyContent: 'center',
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

export function Header({ title }: HeaderProps) {
  return (
    <HeaderContainer>
      <HeaderTitle>{title}</HeaderTitle>
    </HeaderContainer>
  );
}
