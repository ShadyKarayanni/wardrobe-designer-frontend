import { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack, styled } from 'tamagui';

interface PageContainerProps {
  children: ReactNode;
}

const Container = styled(YStack, {
  flex: 1,
  backgroundColor: '$background',
});

export function PageContainer({ children }: PageContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <Container
      paddingTop={insets.top}
      paddingBottom={insets.bottom}
      paddingLeft={insets.left}
      paddingRight={insets.right}
    >
      {children}
    </Container>
  );
}
