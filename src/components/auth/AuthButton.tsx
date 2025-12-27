import { Button, Spinner, styled } from 'tamagui';
import { ReactNode } from 'react';

const StyledButton = styled(Button, {
  backgroundColor: '$accent',
  paddingVertical: '$2',
  borderRadius: 8,

  pressStyle: {
    backgroundColor: '$accentHover',
    opacity: 0.9,
  },

  disabledStyle: {
    opacity: 0.5,
  },
});

interface AuthButtonProps {
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  children: ReactNode;
}

export function AuthButton({ loading, disabled, onPress, children }: AuthButtonProps) {
  return (
    <StyledButton onPress={onPress} disabled={loading || disabled}>
      {loading ? <Spinner color="$background" /> : children}
    </StyledButton>
  );
}
