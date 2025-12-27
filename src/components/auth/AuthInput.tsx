import { Input, styled } from 'tamagui';

export const AuthInput = styled(Input, {
  backgroundColor: '$background',
  borderColor: '$border',
  borderWidth: 1,
  borderRadius: 10,
  paddingVertical: 12,
  paddingHorizontal: 16,
  fontSize: 16,
  fontFamily: '$body',
  color: '$text',

  focusStyle: {
    borderColor: '$accent',
  },
});
