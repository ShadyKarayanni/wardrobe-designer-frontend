import { createAnimations } from '@tamagui/animations-react-native';
import { createInterFont } from '@tamagui/font-inter';
import { shorthands } from '@tamagui/shorthands';
import { themes, tokens as defaultTokens } from '@tamagui/themes';
import { createTamagui, createTokens } from 'tamagui';

// Custom animations - subtle and gentle
const animations = createAnimations({
  subtle: {
    type: 'timing',
    duration: 200,
  },
  gentle: {
    type: 'spring',
    damping: 20,
    stiffness: 150,
  },
  quick: {
    type: 'spring',
    damping: 25,
    stiffness: 200,
  },
  bouncy: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  lazy: {
    type: 'spring',
    damping: 20,
    stiffness: 60,
  },
});

// Inter font
const headingFont = createInterFont({
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 40,
    10: 48,
  },
  weight: {
    4: '400',
    5: '500',
    6: '600',
    7: '700',
  },
  face: {
    400: { normal: 'Inter' },
    500: { normal: 'InterMedium' },
    600: { normal: 'InterSemiBold' },
    700: { normal: 'InterBold' },
  },
});

const bodyFont = createInterFont(
  {
    size: {
      1: 12,
      2: 14,
      3: 16,
      4: 18,
      5: 20,
      6: 24,
    },
    weight: {
      4: '400',
      5: '500',
      6: '600',
    },
  },
  {
    sizeLineHeight: (size) => Math.round(size * 1.5),
  }
);

// Custom tokens - eye-safe black & white palette
const customTokens = createTokens({
  ...defaultTokens,
  color: {
    ...defaultTokens.color,
    // Eye-safe palette
    background: '#FAFAFA',
    backgroundHover: '#F5F5F5',
    backgroundPress: '#EEEEEE',
    backgroundFocus: '#F0F0F0',
    text: '#1A1A1A',
    textSecondary: '#4A4A4A',
    textMuted: '#6A6A6A',
    border: '#E5E5E5',
    borderHover: '#D5D5D5',
    highlight: '#E8E8E8',
    // Accent colors (subtle)
    accent: '#333333',
    accentHover: '#1A1A1A',
    // Semantic
    success: '#2E7D32',
    warning: '#ED6C02',
    error: '#D32F2F',
    info: '#0288D1',
  },
});

// Custom themes
const customThemes = {
  ...themes,
  light: {
    ...themes.light,
    background: customTokens.color.background,
    backgroundHover: customTokens.color.backgroundHover,
    backgroundPress: customTokens.color.backgroundPress,
    backgroundFocus: customTokens.color.backgroundFocus,
    color: customTokens.color.text,
    colorHover: customTokens.color.text,
    colorPress: customTokens.color.textSecondary,
    colorFocus: customTokens.color.text,
    borderColor: customTokens.color.border,
    borderColorHover: customTokens.color.borderHover,
  },
};

const config = createTamagui({
  animations,
  defaultTheme: 'light',
  shouldAddPrefersColorThemes: false,
  themeClassNameOnRoot: true,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  themes: customThemes,
  tokens: customTokens,
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
